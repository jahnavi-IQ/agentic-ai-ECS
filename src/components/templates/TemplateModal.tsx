// Path:\src\components\templates\TemplateModal.tsx

'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image'; // ← ADD THIS
import { X, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAppStore } from '@/store/appStore';
import { useRouter } from 'next/navigation';
import { generateId } from '@/lib/utils';

const MAX_ATTACHMENTS = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function TemplateModal() {
  const router = useRouter();
  const { templateModalOpen, activeTemplate, closeTemplateModal, addConversation, setActiveConversation } = useAppStore();
  
  const [prompt, setPrompt] = useState(() => activeTemplate?.prompt || '');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    if (previewFile) {
      return;
    }
    
    closeTemplateModal();
    setPrompt('');
    setAttachments([]);
  };

  if (activeTemplate && prompt !== activeTemplate.prompt && !templateModalOpen) {
    setPrompt(activeTemplate.prompt);
  }

  if (!templateModalOpen || !activeTemplate) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const currentTotal = attachments.length;
    const newTotal = currentTotal + files.length;
    
    if (newTotal > MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} attachments allowed. You have ${currentTotal}, trying to add ${files.length}.`);
      return;
    }

    const validFiles: File[] = [];
    
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 10MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileClick = (file: File, index: number) => {
    setPreviewFile(file);
    setPreviewIndex(index);
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    try {
      const newConversation = {
        id: generateId(),
        title: activeTemplate.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 0,
      };

      addConversation(newConversation);
      setActiveConversation(newConversation.id);

      sessionStorage.setItem(`template_${newConversation.id}`, JSON.stringify({
        prompt,
        attachmentCount: attachments.length,
        templateName: activeTemplate.name,
      }));

      closeTemplateModal();
      router.push(`/chat/${newConversation.id}`);
      toast.success('Template loaded! Starting chat...');
      
      setPrompt('');
      setAttachments([]);
    } catch (error) {
      console.error('Error submitting template:', error);
      toast.error('Failed to create chat');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-lg border border-border w-full max-w-5xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeTemplate.icon}</span>
              <div>
                <h2 className="text-lg font-semibold">{activeTemplate.name}</h2>
                <p className="text-sm text-muted-foreground">{activeTemplate.description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Files Section */}
            <div className="w-80 border-r border-border flex flex-col bg-muted/10">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Attachments</span>
                  <span className="text-xs text-muted-foreground">
                    {attachments.length} / {MAX_ATTACHMENTS}
                  </span>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full gap-2"
                  variant="outline"
                  disabled={attachments.length >= MAX_ATTACHMENTS}
                >
                  <Upload className="w-4 h-4" />
                  Upload Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.docx,.txt,.csv,.js,.ts,.py,.java,.cpp,.c,.html,.css,.json,.xml,.md"
                />
              </div>

              {/* File List */}
              <div className="flex-1 overflow-y-auto p-2">
                {attachments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <FileText className="w-12 h-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No files attached
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="group relative p-3 rounded-lg border border-border bg-background hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleFileClick(file, index)}
                      >
                        <div className="flex items-start gap-2">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          ) : (
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(index);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Prompt Editor */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4">
                <label className="text-sm font-medium mb-2 block">
                  Customize Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-[calc(100%-2rem)] p-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gold/50 text-sm"
                  placeholder="Enter your prompt..."
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-gold hover:bg-gold/90 text-black"
                  disabled={!prompt.trim()}
                >
                  Use Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Portal */}
      {previewFile && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/90 z-100 flex items-center justify-center p-4"
          onClick={handleClosePreview}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClosePreview}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* File Preview */}
            <div 
              className="bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {previewFile.type.startsWith('image/') ? (
                <div className="relative flex items-center justify-center" style={{ maxHeight: '80vh' }}>
                  <Image
                    src={URL.createObjectURL(previewFile)}
                    alt={previewFile.name}
                    width={1200}
                    height={900}
                    className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                    unoptimized
                    priority
                  />
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium mb-2">{previewFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(previewFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            {attachments.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 rounded-full px-4 py-2 text-white text-sm">
                {previewIndex + 1} / {attachments.length}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}