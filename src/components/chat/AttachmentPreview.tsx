//Path: src/components/chat/AttachmentPreview.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image'; 

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onClose: () => void;
}

export function AttachmentPreview({ attachment, onClose }: AttachmentPreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 800, height: 600 });

  // Close on ESC key - Stop propagation to prevent parent modal from closing
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    // Use capture phase to handle event before it reaches parent
    window.addEventListener('keydown', handleEscape, true);
    return () => window.removeEventListener('keydown', handleEscape, true);
  }, [onClose]);

  // Load image dimensions for Next.js Image component
  useEffect(() => {
    if (attachment.type.startsWith('image/')) {
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = attachment.url;
    }
  }, [attachment]);

  // FIXED: Wrapper for onClose to stop event propagation
  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderPreview = () => {
    // Image preview
    if (attachment.type.startsWith('image/')) {
      if (imageError) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ImageIcon className="w-16 h-16 mb-4" />
            <p>Unable to load image</p>
          </div>
        );
      }
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={attachment.url}
            alt={attachment.name}
            width={imageDimensions.width}
            height={imageDimensions.height}
            className="max-w-full max-h-full object-contain"
            onError={() => setImageError(true)}
            unoptimized
            priority
          />
        </div>
      );
    }

    // PDF preview
    if (attachment.type === 'application/pdf') {
      return (
        <iframe
          src={attachment.url}
          className="w-full h-full border-0"
          title={attachment.name}
        />
      );
    }

    // Text file preview
    if (
      attachment.type === 'text/plain' ||
      attachment.type === 'text/csv' ||
      attachment.name.endsWith('.txt') ||
      attachment.name.endsWith('.csv')
    ) {
      return (
        <iframe
          src={attachment.url}
          className="w-full h-full border-0 bg-background"
          title={attachment.name}
        />
      );
    }

    // Other files - show file info
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <FileText className="w-16 h-16 mb-4" />
        <p className="text-lg font-medium">{attachment.name}</p>
        <p className="text-sm mt-2">{formatFileSize(attachment.size)}</p>
        <Button
          onClick={handleDownload}
          className="mt-6 bg-gold hover:bg-gold/90 text-black"
        >
          <Download className="w-4 h-4 mr-2" />
          Download File
        </Button>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {/* FIXED: Updated z-index to z-[100] to appear above TemplateModal (z-50) */}
      <div 
        className="fixed inset-0 z-100 flex items-center justify-center pointer-events-auto"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop - FIXED: Use handleClose wrapper */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal - FIXED: Stop all event propagation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-[90vw] h-[90vh] max-w-6xl bg-background border border-border rounded-lg shadow-2xl flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header - FIXED: Stop propagation at header level too */}
          <div 
            className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">{attachment.name}</h3>
              <p className="text-sm text-muted-foreground">
                {attachment.type} • {formatFileSize(attachment.size)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* FIXED: Use handleDownload with event stopping */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                title="Download"
                className="hover:bg-muted"
              >
                <Download className="w-5 h-5" />
              </Button>
              {/* FIXED: Use handleClose with event stopping */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                title="Close (ESC)"
                className="hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content - FIXED: Stop propagation */}
          <div 
            className="flex-1 overflow-y-auto overflow-x-hidden p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full flex items-center justify-center">
              {renderPreview()}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}