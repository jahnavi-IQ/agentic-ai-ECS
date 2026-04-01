// File: \src\components\chat\InputArea.tsx
'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ConnectorBar } from './ConnectorBar';
import { Send, Paperclip, StopCircle } from 'lucide-react';
import { Message } from '@/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AttachmentCarousel } from './AttachmentCarousel';

const MAX_ATTACHMENTS_PER_CONVERSATION = 20;

interface InputAreaProps {
  conversationId: string;
  messages: Message[];
  initialPrompt?: string;
  onSendMessage: (message: string, attachments?: File[]) => Promise<void>;
  isStreaming: boolean;
  onStopStreaming: () => void;
}

export function InputArea({ 
  conversationId, 
  initialPrompt, 
  messages,
  onSendMessage,
  isStreaming,
  onStopStreaming,
}: InputAreaProps) {
  // ✅ FIX: Initialize state directly with initialPrompt (no useEffect needed)
  const [input, setInput] = useState(() => initialPrompt || '');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFocused = useRef(false); // ✅ Track if we've focused (not applied prompt)

  /* Calculate total attachments in conversation */
  const totalAttachmentsInConversation = messages.reduce(
    (sum, msg) => sum + (msg.attachments?.length || 0),
    0
  ) + attachments.length;

  /* ✅ FIX: Only handle focusing, NOT setting state */
  useEffect(() => {
    // Only focus if we have an initial prompt and haven't focused yet
    if (initialPrompt && !hasFocused.current && textareaRef.current) {
      console.log('📋 Focusing textarea with template prompt');
      hasFocused.current = true;
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Move cursor to end of text
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 100);
    }
  }, [initialPrompt]); // Only depend on initialPrompt

  /* Auto-resize textarea */
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      200
    )}px`;
  }, [input]);

  /* Handle sending message */
  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (isStreaming) return;

    const currentInput = input;
    const currentAttachments = [...attachments];

    // Clear input immediately for better UX
    setInput('');
    setAttachments([]);

    // Call the hook's sendMessage function
    await onSendMessage(currentInput, currentAttachments);
  };

  /* Handle keyboard shortcuts */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* Handle file selection */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => f.size <= 10 * 1024 * 1024);

    if (files.length !== validFiles.length) {
      toast.error('Some files were too large (max 10MB)');
    }

    if (totalAttachmentsInConversation + validFiles.length > MAX_ATTACHMENTS_PER_CONVERSATION) {
      toast.error(`Maximum ${MAX_ATTACHMENTS_PER_CONVERSATION} attachments per conversation`);
      return;
    }

    setAttachments((prev) => [...prev, ...validFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* Remove attachment */
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  /* Open preview at specific index */
  const openPreview = (index: number) => {
    setPreviewIndex(index);
  };

  /* Close preview */
  const closePreview = () => {
    setPreviewIndex(null);
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 space-y-3">
      <ConnectorBar />

      {/* Attachments Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-2"
          >
            {/* Attachment count */}
            <div className="text-xs text-muted-foreground">
              {totalAttachmentsInConversation} / {MAX_ATTACHMENTS_PER_CONVERSATION} attachments in conversation
            </div>
            
            {/* Attachment list - Clickable */}
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  onClick={() => openPreview(index)}
                  className="flex items-center gap-2 bg-muted hover:bg-muted/80 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer group"
                >
                  <span>📎</span>
                  <span className="max-w-50 truncate">{file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAttachment(index);
                    }}
                    className="text-muted-foreground hover:text-foreground ml-1"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            {/* Warning if at limit */}
            {totalAttachmentsInConversation >= MAX_ATTACHMENTS_PER_CONVERSATION && (
              <div className="text-xs text-destructive">
                Maximum attachment limit reached for this conversation
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="relative bg-muted/50 rounded-lg border border-border focus-within:border-gold transition-colors">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message IGPT... (Shift+Enter for new line)"
          className="w-full bg-transparent px-4 py-3 pr-24 resize-none outline-none min-h-15 max-h-50 overflow-y-auto"
          rows={1}
          disabled={isStreaming}
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.go,.rs,.php,.rb,.swift,.kt,.scala,.sql,.html,.css,.json,.xml,.yaml,.yml,.sh,.bash"
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={totalAttachmentsInConversation >= MAX_ATTACHMENTS_PER_CONVERSATION || isStreaming}
            title={
              totalAttachmentsInConversation >= MAX_ATTACHMENTS_PER_CONVERSATION
                ? 'Maximum attachments reached'
                : 'Attach file'
            }
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          {isStreaming ? (
            <Button
              size="icon"
              variant="destructive"
              onClick={onStopStreaming}
              title="Stop generating"
            >
              <StopCircle className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() && attachments.length === 0}
              className="bg-gold hover:bg-gold/90 text-black"
            >
              <Send className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        IGPT can make mistakes. Verify important information.
      </p>

      {/* Attachment Carousel Modal */}
      {previewIndex !== null && (
        <AttachmentCarousel
          files={attachments}
          initialIndex={previewIndex}
          onClose={closePreview}
        />
      )}
    </div>
  );
}