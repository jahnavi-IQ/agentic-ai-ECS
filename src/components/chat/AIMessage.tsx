// Path: src/components/chat/AIMessage.tsx
'use client';

import { useRef, useMemo } from 'react';
import * as React from 'react';
import { Message } from '@/types';
import { Bot, Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThinkingProcess } from './ThinkingProcess';
import { ToolCall } from './ToolCall';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { CodeBlock } from './CodeBlock';
import { MermaidDiagram } from './MermaidDiagram';
import { toast } from 'sonner';

interface AIMessageProps {
  message: Message;
}

// ✅ Helper to extract text from React nodes
const extractText = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node)) {
    return extractText(node.props.children);
  }
  return '';
};

export function AIMessage({ message }: AIMessageProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // ✅ Extract mermaid blocks with TEXT-BASED placeholders
  const { processedContent, mermaidBlocks } = useMemo(() => {
    const blocks: Array<{ id: string; code: string }> = [];
    let content = message.content;

    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    let match;
    let index = 0;

    while ((match = mermaidRegex.exec(message.content)) !== null) {
      const code = match[1].trim();
      
      // ✅ Use double curly braces - plain text, won't be sanitized
      const placeholder = `{{MERMAID:${index}}}`;
      
      blocks.push({
        id: `${message.id}-${index}`,
        code,
      });

      content = content.replace(match[0], placeholder);
      index++;
    }

    console.log('🔍 Extracted mermaid blocks:', blocks.length);
    console.log('📝 Processed content preview:', content.substring(0, 200));

    return { processedContent: content, mermaidBlocks: blocks };
  }, [message.content, message.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Copied to clipboard');
  };

  const components: Components = {
    // ✅ Table cleanup (preserved from original)
    table({ children }) {
      const filteredChildren = React.Children.map(children, child => {
        if (
          React.isValidElement(child) && 
          typeof child.type === 'string' && 
          child.type === 'tbody'
        ) {
          const filteredRows = React.Children.toArray(child.props.children).filter(
            (row) => {
              if (!React.isValidElement(row)) return true;

              const rowProps = row.props as { children?: React.ReactNode };
              if (!rowProps.children) return false;

              const cells = React.Children.toArray(rowProps.children);
              return cells.some((cell) => {
                if (!React.isValidElement(cell)) return false;

                const cellProps = cell.props as { children?: React.ReactNode };
                const content = cellProps.children;
                
                if (!content) return false;
                
                const textContent = String(content).trim();
                return textContent.length > 0;
              });
            }
          );

          return React.cloneElement(child, {}, ...filteredRows);
        }
        return child;
      });

      return (
        <div className="overflow-x-auto my-3 rounded-lg border border-border">
          <table className="min-w-full divide-y divide-border">
            {filteredChildren}
          </table>
        </div>
      );
    },

    // ✅ Code blocks (preserved, with reduced inline code size)
    code({ className, children }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const value = String(children).replace(/\n$/, '');

      // Skip mermaid - handled by placeholder system
      if (language === 'mermaid') {
        return null;
      }

      // Inline code - REDUCED SIZE: text-sm → text-xs
      if (!className) {
        return (
          <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono text-gold border border-border">
            {children}
          </code>
        );
      }

      // Block code
      return (
        <CodeBlock
          language={language}
          value={value}
          inline={false}
        />
      );
    },

    // ✅ Paragraph - Handle mermaid placeholders + REDUCED SIZE
    p({ children }) {
      const text = extractText(children);
      
      console.log('🔍 Paragraph text:', text); // Debug log
      
      // Match {{MERMAID:0}} pattern
      const placeholderMatch = text.match(/\{\{MERMAID:(\d+)\}\}/);

      if (placeholderMatch) {
        const index = parseInt(placeholderMatch[1], 10);
        const block = mermaidBlocks[index];

        console.log('✅ Found mermaid placeholder:', index, 'Block exists:', !!block);

        if (block) {
          return <MermaidDiagram key={block.id} id={block.id} code={block.code} />;
        }
      }

      // Regular paragraph - REDUCED SIZE: text-base → text-sm
      return (
        <p className="text-sm text-foreground mb-2 leading-relaxed">
          {children}
        </p>
      );
    },

    // ✅ Headings - ALL REDUCED BY 1-2 SIZE CLASSES
    h1: ({ children }) => (
      <h1 className="text-xl font-bold mt-4 mb-3 text-foreground border-b border-border pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold mt-3 mb-2 text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold mt-3 mb-2 text-foreground">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-sm font-semibold mt-2 mb-1 text-foreground">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-sm font-medium mt-2 mb-1 text-foreground">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-sm font-medium mt-2 mb-1 text-muted-foreground">
        {children}
      </h6>
    ),

    // ✅ Table components - REDUCED SIZE: text-sm → text-xs
    thead: ({ children }) => (
      <thead className="bg-muted">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-border bg-background/50">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-muted/50 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children, style }) => (
      <th 
        className="px-3 py-1.5 text-left text-xs font-semibold text-foreground"
        style={style}
      >
        {children}
      </th>
    ),
    td: ({ children, style }) => (
      <td 
        className="px-3 py-1.5 text-xs text-foreground"
        style={style}
      >
        {children}
      </td>
    ),

    // ✅ Lists - REDUCED SIZE: added text-sm, reduced spacing
    ul: ({ children }) => (
      <ul className="text-sm list-disc list-outside ml-6 my-2 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="text-sm list-decimal list-outside ml-6 my-2 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-sm text-foreground">
        {children}
      </li>
    ),

    // ✅ Blockquote - REDUCED SIZE: added text-sm
    blockquote: ({ children }) => (
      <blockquote className="text-sm border-l-3 border-gold pl-3 italic my-3 text-foreground/80 bg-gold/5 py-2">
        {children}
      </blockquote>
    ),

    // ✅ Links - REDUCED SIZE: added text-sm
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gold hover:text-gold/80 underline underline-offset-2"
      >
        {children}
      </a>
    ),

    // ✅ Strong/Bold - REDUCED SIZE
    strong: ({ children }) => (
      <strong className="text-sm font-semibold text-foreground">
        {children}
      </strong>
    ),

    // ✅ Emphasis/Italic - REDUCED SIZE
    em: ({ children }) => (
      <em className="text-sm italic text-foreground">
        {children}
      </em>
    ),

    // ✅ Horizontal rule - reduced margin
    hr: () => (
      <hr className="my-3 border-border" />
    ),
  };

  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-gold" />
      </div>
      
      <div className="flex-1 max-w-2xl space-y-3">
        {/* Thinking Process */}
        {message.thinking && message.thinking.length > 0 && (
          <ThinkingProcess steps={message.thinking} />
        )}

        {/* Tool Calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-2">
            {message.toolCalls.map((toolCall) => (
              <ToolCall key={toolCall.id} toolCall={toolCall} />
            ))}
          </div>
        )}

        {/* Main Content - REDUCED TEXT SIZES APPLIED */}
        <div ref={contentRef} className="prose prose-invert max-w-none markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={components}
          >
            {processedContent}
          </ReactMarkdown>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Regenerate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <ThumbsUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <ThumbsDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}