//Path: src/hooks/useFileUpload.ts
import { useState } from 'react';
import { Attachment } from '@/types';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File): Promise<Attachment | null> => {
    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setProgress(100);
      toast.success(`${file.name} uploaded successfully`);
      
      return data as Attachment;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${file.name}`);
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const uploadFiles = async (files: File[]): Promise<Attachment[]> => {
    const uploadPromises = files.map((file) => uploadFile(file));
    const results = await Promise.all(uploadPromises);
    return results.filter((result): result is Attachment => result !== null);
  };

  return {
    uploadFile,
    uploadFiles,
    isUploading,
    progress,
  };
}