//Path: src/app/api/stream/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const { conversationId, message } = await request.json();

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Simulate thinking steps
        const thinkingSteps = [
          'Analyzing your request...',
          'Gathering relevant information...',
          'Formulating comprehensive response...',
        ];

        for (let i = 0; i < thinkingSteps.length; i++) {
          const event = {
            type: 'thinking_step',
            data: {
              step: thinkingSteps[i],
              index: i + 1,
            },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Simulate tool usage if message contains "search"
        if (message.toLowerCase().includes('search')) {
          const toolEvent = {
            type: 'tool_call',
            data: {
              tool: 'web_search',
              query: message,
            },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(toolEvent)}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Stream response content
        const response = `I understand you're asking about "${message}". Let me help you with that.\n\nHere's a comprehensive answer based on my analysis:\n\n1. **Key Point**: This is important information.\n2. **Additional Context**: More details here.\n3. **Summary**: Wrapping up the response.`;
        
        const words = response.split(' ');
        
        for (const word of words) {
          const contentEvent = {
            type: 'content_delta',
            data: {
              delta: word + ' ',
            },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(contentEvent)}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Check if should create artifact
        if (message.toLowerCase().includes('code') || message.toLowerCase().includes('create')) {
          const artifactEvent = {
            type: 'artifact_created',
            data: {
              id: Math.random().toString(36).substring(7),
              type: 'code',
              title: 'Generated Code',
              language: 'python',
              content: `# Example Code\nprint("Hello, IGPT!")`,
            },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(artifactEvent)}\n\n`));
        }

        // End stream
        const endEvent = {
          type: 'message_end',
          data: {
            finishReason: 'complete',
          },
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(endEvent)}\n\n`));
        controller.close();
        
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}