//path: src\components\artifacts\CodeArtifact.tsx
'use client';

import { Artifact } from '@/types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Button } from '@/components/ui/button';
import { Copy, Play } from 'lucide-react';
import { toast } from 'sonner';

interface CodeArtifactProps {
  artifact: Artifact;
}

export function CodeArtifact({ artifact }: CodeArtifactProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    toast.success('Code copied to clipboard');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {artifact.language || 'plaintext'}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          {['javascript', 'typescript', 'python'].includes(artifact.language || '') && (
            <Button variant="ghost" size="sm">
              <Play className="w-4 h-4 mr-1" />
              Run
            </Button>
          )}
        </div>
      </div>
      
      <div className="rounded-lg overflow-hidden border border-border">
        <SyntaxHighlighter
          language={artifact.language || 'typescript'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#1a1a1a',
          }}
        >
          {artifact.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}