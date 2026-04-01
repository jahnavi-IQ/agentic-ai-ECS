//Path: src/components/chat/Message.tsx
'use client';

import { Message as MessageType } from '@/types';
import { UserMessage } from './UserMessage';
import { AIMessage } from './AIMessage';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  if (message.role === 'user') {
    return <UserMessage message={message} />;
  }
  
  if (message.role === 'assistant') {
    return <AIMessage message={message} />;
  }

  // System message
  return (
    <div className="flex justify-center py-2">
      <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
        {message.content}
      </div>
    </div>
  );
}