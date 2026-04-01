//path: src\components\artifacts\DocumentArtifact.tsx
'use client';

import { Artifact } from '@/types';
import ReactMarkdown from 'react-markdown';

interface DocumentArtifactProps {
  artifact: Artifact;
}

export function DocumentArtifact({ artifact }: DocumentArtifactProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown>{artifact.content}</ReactMarkdown>
    </div>
  );
}