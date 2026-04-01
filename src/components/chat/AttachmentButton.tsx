//Path: src/components/chat/AttachmentButton.tsx
'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip } from 'lucide-react';
import { toast } from 'sonner';

interface AttachmentButtonProps {
  onFilesSelected: (files: File[]) => void;
  maxSizeMB?: number;
  acceptedTypes?: string;
}

export function AttachmentButton({
  onFilesSelected,
  maxSizeMB = 10,
  acceptedTypes = 'image/*,.pdf,.doc,.docx,.txt,.csv',
}: AttachmentButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxBytes = maxSizeMB * 1024 * 1024;
    
    const validFiles = files.filter((file) => {
      if (file.size > maxBytes) {
        toast.error(`${file.name} is too large (max ${maxSizeMB}MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept={acceptedTypes}
      />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        className="text-muted-foreground hover:text-foreground"
      >
        <Paperclip className="w-5 h-5" />
      </Button>
    </>
  );
}