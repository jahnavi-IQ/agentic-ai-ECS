//Path: src/components/chat/MessageList.tsx
'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Message as MessageType } from '@/types';
import { UserMessage } from './UserMessage';
import { AIMessage } from './AIMessage';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: MessageType[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="h-full">
      <div ref={scrollRef} className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {message.role === 'user' ? (
              <UserMessage message={message} />
            ) : (
              <AIMessage message={message} />
            )}
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
