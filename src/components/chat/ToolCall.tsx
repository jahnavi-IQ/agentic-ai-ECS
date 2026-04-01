//Path: src/components/chat/ToolCall.tsx
'use client';

import { Search, FileText, Code, Database } from 'lucide-react';

interface ToolCall {
  id: string;
  tool: string;
  input?: Record<string, unknown>;
  output?: string;
  status?: 'pending' | 'completed' | 'error';
}

interface ToolCallProps {
  toolCall: ToolCall;
}

export function ToolCall({ toolCall }: ToolCallProps) {
  const getIcon = () => {
    switch (toolCall.tool) {
      case 'web_search':
        return <Search className="w-4 h-4" />;
      case 'research':
        return <FileText className="w-4 h-4" />;
      case 'code_execution':
        return <Code className="w-4 h-4" />;
      case 'database_query':
        return <Database className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (toolCall.status) {
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border">
      <div className={getStatusColor()}>{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{toolCall.tool.replace('_', ' ')}</div>
        {toolCall.output && (
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {toolCall.output}
          </div>
        )}
      </div>
    </div>
  );
}