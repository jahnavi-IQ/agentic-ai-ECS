// File: \src\components\chat\ChatContainer.tsx
'use client';

import { useEffect } from 'react';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { useAppStore } from '@/store/appStore';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

interface ChatContainerProps {
  conversationId: string;
  initialPrompt?: string; // ⭐ NEW: Optional initial prompt from templates
}

export function ChatContainer({ conversationId, initialPrompt }: ChatContainerProps) {
  const router = useRouter();
  const setActiveConversation = useAppStore((state) => state.setActiveConversation);
  
  // Use streaming hook - it manages messages internally via callback
  const { messages, sendMessage, isStreaming, cancelStream } = useStreamingChat(conversationId);

  useEffect(() => {
    setActiveConversation(conversationId);
  }, [conversationId, setActiveConversation]);

  const handleHeaderClick = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Clickable Header */}
      <header 
        className="flex items-center gap-2 px-6 py-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={handleHeaderClick}
      >
        <Sparkles className="w-5 h-5 text-gold" />
        <h1 className="text-lg font-semibold">IGPT</h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {/* Input - Pass initialPrompt to auto-populate from templates */}
      <InputArea
        conversationId={conversationId}
        messages={messages}
        onSendMessage={sendMessage}
        isStreaming={isStreaming}
        onStopStreaming={cancelStream}
        initialPrompt={initialPrompt} 
      />
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center px-4"
    >
      <div className="mb-6">
        <Sparkles className="w-16 h-16 text-gold mx-auto mb-4" />
      </div>
      <h3 className="text-2xl font-semibold text-gold mb-2">
        How Can I help you today?
      </h3>
      <p className="text-muted-foreground max-w-md">
        Ask questions, generate code, analyze data, or create comprehensive reports.
      </p>
    </motion.div>
  );
}