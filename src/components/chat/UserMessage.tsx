//Path: src/components/chat/UserMessage.tsx
'use client';

import { useState } from 'react';
import { Message, Attachment } from '@/types';
import { User, FileText, Image as ImageIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { AttachmentPreview } from './AttachmentPreview';

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps) {
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <>
      <div className="flex gap-4 justify-end">
        <div className="flex-1 max-w-3xl">
          <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
            {/* REDUCED TEXT SIZE: from text-foreground to text-sm */}
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{message.content}</p>
            
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.attachments.map((attachment) => (
                  <button
                    key={attachment.id}
                    onClick={() => setPreviewAttachment(attachment)}
                    className="flex items-center gap-2 text-sm bg-background/80 hover:bg-background border border-border rounded-lg px-3 py-2 transition-colors group"
                  >
                    <span className="text-gold group-hover:text-gold/80 transition-colors">
                      {getFileIcon(attachment.type)}
                    </span>
                    {/* REDUCED TEXT SIZE */}
                    <span className="font-medium truncate max-w-50 text-xs">
                      {attachment.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground justify-end">
            <span>{formatDate(message.timestamp)}</span>
          </div>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-black" />
        </div>
      </div>

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <AttachmentPreview
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}
    </>
  );
}