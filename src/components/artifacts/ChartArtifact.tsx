//Path: src/components/artifacts/ChartArtifact.tsx
'use client';

import { Artifact } from '@/types';

interface ChartArtifactProps {
  artifact: Artifact;
}

export function ChartArtifact({ artifact }: ChartArtifactProps) {
  // Placeholder for chart visualization
  // In production, integrate with recharts or chart.js
  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-8 text-center border border-border">
        <p className="text-muted-foreground mb-2">📊 Chart Visualization</p>
        <p className="text-sm text-muted-foreground">
          Chart rendering will be implemented here
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          Integration with Recharts or Chart.js coming soon
        </p>
      </div>
      
      {/* Data Preview */}
      <div className="text-sm">
        <h4 className="font-semibold mb-2">Data Preview:</h4>
        <pre className="bg-background rounded p-4 overflow-auto text-xs">
          {artifact.content}
        </pre>
      </div>
    </div>
  );
}