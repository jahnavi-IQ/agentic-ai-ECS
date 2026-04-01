//Path: src\components\chat\AttachmentCarousel.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface AttachmentCarouselProps {
  files: File[];
  initialIndex?: number;
  onClose: () => void;
}

export function AttachmentCarousel({ files, initialIndex = 0, onClose }: AttachmentCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [textContent, setTextContent] = useState<string>('');
  const currentFile = files[currentIndex];

  // Read text/code file content when file changes
  useEffect(() => {
    const isTextOrCode = 
      currentFile.type.startsWith('text/') ||
      currentFile.name.match(/\.(js|ts|jsx|tsx|py|java|cpp|c|cs|go|rs|php|rb|swift|kt|scala|sql|html|css|json|xml|yaml|yml|sh|bash|md)$/i);

    if (isTextOrCode) {
      // Defer state update to avoid cascading renders
      setTimeout(() => {
        setTextContent('Loading...');
      }, 0);

      const reader = new FileReader();
      reader.onload = (e) => {
        setTextContent(e.target?.result as string || 'Unable to read file');
      };
      reader.onerror = () => {
        setTextContent('Error reading file');
      };
      reader.readAsText(currentFile);
    } else {
      // Clear text content for non-text files
      setTimeout(() => {
        setTextContent('');
      }, 0);
    }
  }, [currentFile]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFilePreview = () => {
    const fileUrl = URL.createObjectURL(currentFile);

    // Image preview - Using Next.js Image component
    if (currentFile.type.startsWith('image/')) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={fileUrl}
            alt={currentFile.name}
            fill
            className="object-contain"
            unoptimized
            priority
          />
        </div>
      );
    }

    // PDF preview
    if (currentFile.type === 'application/pdf') {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-full border-0"
          title={currentFile.name}
        />
      );
    }

    // Text/Code preview
    if (
      currentFile.type.startsWith('text/') ||
      currentFile.name.match(/\.(js|ts|jsx|tsx|py|java|cpp|c|cs|go|rs|php|rb|swift|kt|scala|sql|html|css|json|xml|yaml|yml|sh|bash|md)$/i)
    ) {
      return (
        <pre className="w-full h-full overflow-auto bg-muted p-4 rounded text-sm font-mono">
          <code>{textContent || 'Loading...'}</code>
        </pre>
      );
    }

    // Word document or other files
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <div className="text-6xl mb-4">📄</div>
        <p className="text-lg font-medium">{currentFile.name}</p>
        <p className="text-sm mt-2">{formatFileSize(currentFile.size)}</p>
        <p className="text-xs mt-2">Preview not available for this file type</p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-[72vw] h-[85vh] max-w-5xl bg-background rounded-lg shadow-2xl flex flex-col"
        >
          {/* Compact Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-background/50 backdrop-blur rounded-t-lg">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{currentFile.name}</h3>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(currentFile.size)}
                {files.length > 1 && ` • ${currentIndex + 1}/${files.length}`}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-2 h-8 w-8"
              title="Close (ESC)"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            {getFilePreview()}
          </div>

          {/* Navigation Footer */}
          {files.length > 1 && (
            <div className="flex items-center justify-between px-4 py-2 bg-background/50 backdrop-blur rounded-b-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="h-8 gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </Button>

              <div className="text-xs text-muted-foreground font-medium">
                {currentIndex + 1} / {files.length}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="h-8 gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
