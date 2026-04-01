//path: src\components\artifacts\ArtifactsPanel.tsx
'use client';

import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Download, ExternalLink } from 'lucide-react';
import { CodeArtifact } from './CodeArtifact';
import { DocumentArtifact } from './DocumentArtifact';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ArtifactsPanel() {
  const { artifacts, removeArtifact, toggleArtifactsPanel } = useAppStore();

  if (artifacts.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Artifacts</h2>
          <Button variant="ghost" size="icon" onClick={toggleArtifactsPanel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <div className="space-y-2">
            <p className="text-muted-foreground">No artifacts yet</p>
            <p className="text-sm text-muted-foreground">
              Generated code, documents, and visualizations will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold">Artifacts ({artifacts.length})</h2>
        <Button variant="ghost" size="icon" onClick={toggleArtifactsPanel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Tabs defaultValue={artifacts[0]?.id} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border px-4">
          {artifacts.map((artifact) => (
            <TabsTrigger
              key={artifact.id}
              value={artifact.id}
              className="relative group"
            >
              {artifact.title}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeArtifact(artifact.id);
                }}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollArea className="flex-1">
          {artifacts.map((artifact) => (
            <TabsContent key={artifact.id} value={artifact.id} className="m-0 h-full">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{artifact.title}</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open
                    </Button>
                  </div>
                </div>

                {artifact.type === 'code' && <CodeArtifact artifact={artifact} />}
                {artifact.type === 'document' && <DocumentArtifact artifact={artifact} />}
              </div>
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </div>
  );
}