// file: \src\app\chat\[id]\page.tsx
'use client';

import { useEffect, useState } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { useAppStore } from '@/store/appStore';

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const setActiveConversation = useAppStore((state) => state.setActiveConversation);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<{
    prompt: string;
    attachmentCount: number;
    templateName: string;
  } | null>(null);

  // Unwrap params (Next.js 15+ async params)
  useEffect(() => {
    params.then((resolvedParams) => {
      const id = resolvedParams.id;
      setConversationId(id);
      setActiveConversation(id);
      
      // Check for template data in sessionStorage
      const templateDataKey = `template_${id}`;
      const storedData = sessionStorage.getItem(templateDataKey);
      
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          setTemplateData(parsed);
          console.log('📋 Template data loaded:', parsed);
          
          // Clear from sessionStorage after reading (one-time use)
          sessionStorage.removeItem(templateDataKey);
        } catch (error) {
          console.error('Failed to parse template data:', error);
        }
      }
    }).catch(console.error);
  }, [params, setActiveConversation]);

  // Loading state while params resolve
  if (!conversationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Pass template prompt to ChatContainer if available
  return (
    <ChatContainer 
      conversationId={conversationId}
      initialPrompt={templateData?.prompt}
    />
  );
}