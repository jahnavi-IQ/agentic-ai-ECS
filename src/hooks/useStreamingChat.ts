//Path: src/hooks/useStreamingChat.ts
import { useState, useCallback, useRef } from 'react';
import { Message, ThinkingStep } from '@/types';
import { generateId } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';

// ============================================
// Type Definitions
// ============================================

interface ProcessedFile {
  name: string;
  type: string;
  size: number;
  content: string;
  contentType: 'text' | 'base64';
}

// ============================================
// File Processing Functions
// ============================================

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function processFiles(files: File[]): Promise<ProcessedFile[]> {
  const processedFiles = await Promise.all(
    files.map(async (file): Promise<ProcessedFile> => {
      const fileData: ProcessedFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        content: '',
        contentType: 'base64',
      };

      // Handle images
      if (file.type.startsWith('image/')) {
        fileData.content = await fileToBase64(file);
        fileData.contentType = 'base64';
      }
      // Handle text files and CODE files
      else if (
        file.type === 'text/plain' ||
        file.type === 'text/csv' ||
        file.type.startsWith('text/') ||
        file.type === 'application/javascript' ||
        file.type === 'application/typescript' ||
        file.type === 'application/json' ||
        file.type === 'application/xml' ||
        file.name.match(/\.(js|ts|jsx|tsx|py|java|cpp|c|cs|go|rs|php|rb|swift|kt|scala|sql|html|css|json|xml|yaml|yml|sh|bash|txt|csv|md)$/i)
      ) {
        fileData.content = await fileToText(file);
        fileData.contentType = 'text';
      }
      // Handle PDFs
      else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        fileData.content = await fileToBase64(file);
        fileData.contentType = 'base64';
      }
      // Handle Word documents
      else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        fileData.content = await fileToBase64(file);
        fileData.contentType = 'base64';
      }
      else {
        fileData.content = await fileToBase64(file);
        fileData.contentType = 'base64';
      }

      return fileData;
    })
  );

  return processedFiles;
}

// ============================================
// Hook Implementation
// ============================================

export function useStreamingChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const selectedModel = useAppStore((state) => state.selectedModel);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (message: string, attachments?: File[]) => {
      if (!message.trim() && !attachments?.length) return;

      // Create user message
      const userMessage: Message = {
        id: generateId(),
        conversationId,
        role: 'user',
        content: message,
        timestamp: new Date(),
        attachments: attachments?.map((file) => ({
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
        })),
      };

      // Add user message to state
      setMessages((prev) => [...prev, userMessage]);

      setIsStreaming(true);
      setError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: generateId(),
        conversationId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        thinking: [],
      };

      // Add assistant message placeholder
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        // Process attachments if any
        let processedFiles: ProcessedFile[] = [];
        if (attachments && attachments.length > 0) {
          console.log(`Processing ${attachments.length} files...`);
          processedFiles = await processFiles(attachments);
          console.log(`Processed ${processedFiles.length} files`);
        }

        // Build conversation history
        const conversationHistory = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          attachments: msg.attachments || [],
        }));

        const response = await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message,
              conversationHistory,
              modelId: selectedModel.id,
              attachments: processedFiles,
            }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) throw new Error('No reader available');

        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);

                if (parsed.type === 'thinking_step') {
                  const thinkingStep: ThinkingStep = {
                    id: generateId(),
                    step: parsed.data.step,
                    timestamp: new Date(),
                    index: parsed.data.index,
                  };
                  
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? {
                            ...msg,
                            thinking: [...(msg.thinking || []), thinkingStep],
                          }
                        : msg
                    )
                  );
                  
                } else if (parsed.type === 'content_delta') {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: msg.content + parsed.data.delta }
                        : msg
                    )
                  );
                  
                } else if (parsed.type === 'content_end') {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: parsed.data.fullText }
                        : msg
                    )
                  );
                  
                } else if (parsed.type === 'error') {
                  const errorMsg =
                    parsed?.data?.error ||
                    parsed?.data?.message ||
                    'Unknown stream error';
                  setError(errorMsg);
                  console.error('Stream error:', parsed?.data ?? parsed);
                  break;
                }
              } catch (e) {
                console.error('Error parsing SSE:', e);
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Stream cancelled by user');
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMessage);
          console.error('Streaming error:', err);
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [conversationId, messages, selectedModel]
  );

  return { 
    messages, 
    sendMessage, 
    isStreaming, 
    error, 
    cancelStream 
  };
}
