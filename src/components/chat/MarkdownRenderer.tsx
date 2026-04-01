//Path: src\components\chat\MarkdownRenderer.tsx
'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import mermaid from 'mermaid';
import { CodeBlock } from './CodeBlock';
import * as React from'react';
interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });
  }, []);

  // Render Mermaid diagrams after content updates
  useEffect(() => {
    if (containerRef.current) {
      const mermaidBlocks = containerRef.current.querySelectorAll('.language-mermaid');
      mermaidBlocks.forEach((block, index) => {
        const code = block.textContent || '';
        const id = `mermaid-${Date.now()}-${index}`;
        
        // Create container for mermaid diagram
        const container = document.createElement('div');
        container.className = 'mermaid-diagram my-4 p-4 bg-muted rounded-lg';
        container.setAttribute('data-processed', 'true');
        
        try {
          mermaid.render(id, code).then((result) => {
            container.innerHTML = result.svg;
            block.parentNode?.replaceChild(container, block);
          });
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          container.innerHTML = `<pre class="text-destructive">Error rendering diagram</pre>`;
          block.parentNode?.replaceChild(container, block);
        }
      });
    }
  }, [content]);

  return (
    <div ref={containerRef} className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Code blocks
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const value = String(children).replace(/\n$/, '');

            if (language === 'mermaid') {
              return (
                <pre className="language-mermaid hidden">
                  {value}
                </pre>
              );
            }

            return (
              <CodeBlock
                language={language}
                value={value}
              />
            );
          },

          // Headings
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-6 mb-4 text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold mt-5 mb-3 text-foreground border-b border-border pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold mt-3 mb-2 text-foreground">
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-4 leading-7 text-foreground">
              {children}
            </p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-4">
              {children}
            </li>
          ),

          // Tables
          table: ({ children }) => {
            // Filter out empty tbody rows with proper typing
            const filteredChildren = React.Children.map(children, (child) => {
              if (
                React.isValidElement(child) && 
                typeof child.type === 'string' && 
                child.type === 'tbody'
              ) {
                const filteredRows = React.Children.toArray(child.props.children).filter(
                  (row) => {
                    if (!React.isValidElement(row)) return true;

                    // Type guard for row props
                    const rowProps = row.props as { children?: React.ReactNode };
                    if (!rowProps.children) return false;

                    // Check if row has any non-empty cells
                    const cells = React.Children.toArray(rowProps.children);
                    return cells.some((cell) => {
                      if (!React.isValidElement(cell)) return false;

                      // Type guard for cell props
                      const cellProps = cell.props as { children?: React.ReactNode };
                      const content = cellProps.children;
                      
                      if (!content) return false;
                      
                      // Check if content is not empty
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
              <div className="overflow-x-auto my-4 rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border">
                  {filteredChildren}
                </table>
              </div>
            );
          },

          thead: ({ children }) => (
            <thead className="bg-muted">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-border">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold text-foreground border border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-foreground border border-border">
              {children}
            </td>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gold pl-4 italic my-4 text-muted-foreground">
              {children}
            </blockquote>
          ),

          // Horizontal rule
          hr: () => (
            <hr className="my-6 border-border" />
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold/80 underline underline-offset-2"
            >
              {children}
            </a>
          ),

          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">
              {children}
            </strong>
          ),

          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic">
              {children}
            </em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}