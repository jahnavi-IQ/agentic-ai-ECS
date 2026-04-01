// Path: src/components/chat/MermaidDiagram.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  code: string;
  id: string;
}

export function MermaidDiagram({ code, id }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    // Initialize mermaid once
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code.trim()) return;

      setIsRendering(true);
      setError('');

      try {
        // Clean and preprocess code
        const cleanCode = preprocessMermaidCode(code);
        
        // Generate unique ID
        const diagramId = `mermaid-${id}-${Date.now()}`;

        // Render mermaid (this is async)
        const result = await mermaid.render(diagramId, cleanCode);
        
        // Update state with SVG (React will handle DOM update)
        setSvg(result.svg);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      } finally {
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [code, id]);

  if (isRendering) {
    return (
      <div className="mermaid-diagram my-4 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin h-4 w-4 border-2 border-gold border-t-transparent rounded-full" />
          Rendering diagram...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4 p-4 border border-destructive/50 rounded-lg bg-destructive/10">
        <p className="text-destructive text-sm font-semibold">❌ Error rendering diagram</p>
        <p className="text-destructive/80 text-xs mt-2">{error}</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-destructive/70 hover:text-destructive">
            Show code
          </summary>
          <pre className="mt-2 text-xs bg-background p-2 rounded overflow-x-auto text-foreground">
            {code}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram my-4 p-4 bg-muted rounded-lg overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Preprocessing function
function preprocessMermaidCode(code: string): string {
  let processed = code.trim();

  // Remove markdown code fence artifacts if present
  processed = processed.replace(/^```mermaid\n?/i, '').replace(/\n?```$/i, '');

  // Check if diagram type is already present
  const hasValidType = /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|gantt|pie|erDiagram|journey|gitGraph|timeline|mindmap|quadrantChart|requirementDiagram|C4Context)/i.test(processed);

  if (hasValidType) {
    // Already has valid type, return as-is
    return processed;
  }

  // Fix deprecated "flow" keyword
  if (processed.startsWith('flow ') || processed.startsWith('flow\n')) {
    processed = processed.replace(/^flow\s*/, 'flowchart TD\n');
    return processed;
  }

  // Fix deprecated "graph" to "flowchart"
  if (processed.startsWith('graph ')) {
    processed = processed.replace(/^graph\s+(TD|TB|BT|RL|LR)/i, 'flowchart $1');
    return processed;
  }

  // If no diagram type found, assume it's a flowchart
  processed = `flowchart TD\n${processed}`;

  return processed;
}