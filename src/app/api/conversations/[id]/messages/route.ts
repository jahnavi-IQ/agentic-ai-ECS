//path: src\app\api\conversations\[id]\messages\route.ts
import { NextRequest } from 'next/server';
import { streamCompletion } from '@/lib/llm-service';
import { mockModels } from '@/lib/mock-data';
import { extractPDFText } from '@/lib/pdf-utils';
import { extractDocxText } from '@/lib/docx-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================
// Type Definitions
// ============================================

interface ProcessedAttachment {
  name: string;
  type: string;
  size: number;
  content: string;
  contentType: 'text' | 'base64';
  extractedContent?: string;
}

interface ConversationAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  extractedContent?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  attachments?: ConversationAttachment[];
}

interface RequestBody {
  message: string;
  conversationHistory?: ConversationMessage[];
  modelId?: string;
  attachments?: ProcessedAttachment[];
}

interface EventData {
  type: string;
  data?: Record<string, unknown>;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Build prompt with ALL attachments from conversation
 */
async function buildPromptWithAllAttachments(
  message: string,
  currentAttachments: ProcessedAttachment[],
  conversationHistory: ConversationMessage[]
): Promise<{ prompt: string; extractedContents: Map<string, string> }> {
  const promptParts: string[] = [];
  const extractedContents = new Map<string, string>();
  const processedFileNames = new Set<string>();

  // ============================================
  // ✅ INJECT DETAILED FORMATTING INSTRUCTIONS
  // ON FIRST MESSAGE ONLY
  // ============================================
  const isFirstMessage = conversationHistory.length === 0;

  if (isFirstMessage) {
    const detailedInstructions = `
IMPORTANT FORMATTING GUIDELINES (for this entire conversation):

**Tables:**
- ALWAYS use proper markdown table syntax with pipes (|) and hyphens (-)
- Include header row with column names
- Separate headers with |---|---|---| syntax (NEVER skip this separator row
- Example:
  | Feature | React | Angular |
  |---------|-------|---------|
  | Type | Library | Framework |
- Ensure all rows have same column count

**Headings:**
- Use # for H1, ## for H2, ### for H3, etc.
- Headings create automatic visual hierarchy with different sizes
- Always add blank lines before/after headings

**Lists:**
- Use - or * for unordered bullet points, 1. 2. 3. for numbered/ordered lists
- Indent nested items with EXACTLY 2 spaces per level:
  - Main point
    - Sub-point (2 spaces)
      - Nested (4 spaces)

**Code:**
- Inline code: Use \`backticks\` for filenames, commands, variables, tech terms
  Examples: \`package.json\`, \`npm install\`, \`useState\`, \`API_KEY\`
- Code blocks: ALWAYS specify language
  \`\`\`python
  def hello():
      print("Hello")
  \`\`\`

**Diagrams:**
- Use mermaid code blocks for flowcharts, sequence diagrams, and visualizations
- CRITICAL: Use "flowchart TD" or "flowchart LR" (NOT "flow" or "graph")
- Example:
  \`\`\`mermaid
  flowchart TD
      A[Start] --> B{Decision}
      B -->|Yes| C[Action]
      B -->|No| D[End]
  \`\`\`
- Supported types: flowchart, sequenceDiagram, classDiagram, stateDiagram, gantt, pie

**Best Practices:**
1. Use tables for comparisons, feature lists and structured data
2. Structure responses with clear headings for organization
3. Use headings to organize content hierarchically  
4. Use code blocks for ALL code (never plain text)
5. Use inline code for technical terms and filenames
6. Add blank lines between major sections
---

Now, here's my actual question:
`;
    promptParts.push(detailedInstructions);
  }


  // Count total attachments across conversation
  const totalAttachments = 
    currentAttachments.length + 
    conversationHistory.reduce((sum, msg) => sum + (msg.attachments?.length || 0), 0);

  // Enforce 20 attachment limit
  if (totalAttachments > 30) {
    throw new Error('Maximum 30 attachments allowed per conversation');
  }

  // Process current message attachments
  for (const file of currentAttachments) {
    if (processedFileNames.has(file.name)) continue;
    processedFileNames.add(file.name);

    let extractedText = '';
    if (file.contentType === 'text') {
      const isCodeFile = file.name.match(/\.(js|ts|jsx|tsx|py|java|cpp|c|cs|go|rs|php|rb|swift|kt|scala|sql|html|css|json|xml|yaml|yml|sh|bash)$/i);
      
      if (isCodeFile) {
        extractedText = file.content;
        promptParts.push(
          `[Attached code file: ${file.name}]\n\`\`\`\n${file.content}\n\`\`\`\n[End of ${file.name}]`
        );
      } else {
        extractedText = file.content;
        promptParts.push(
          `[Attached file: ${file.name}]\n${file.content}\n[End of ${file.name}]`
        );
      }
    } 
    else if (file.contentType === 'base64' && file.type.startsWith('image/')) {
      extractedText = `[Image: ${file.name}]`;
      promptParts.push(`[Attached image: ${file.name}] - Image content available for analysis`);
    } 
    else if (file.type === 'application/pdf' && file.contentType === 'base64') {
      console.log(`Extracting text from PDF: ${file.name}`);
      extractedText = await extractPDFText(file.content);
      console.log(`Extracted ${extractedText.length} characters from ${file.name}`);
      promptParts.push(
        `[Attached PDF: ${file.name}]\n${extractedText}\n[End of ${file.name}]`
      );
    }
    else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      console.log(`Extracting text from Word document: ${file.name}`);
      extractedText = await extractDocxText(file.content);
      console.log(`Extracted ${extractedText.length} characters from ${file.name}`);
      promptParts.push(
        `[Attached Word document: ${file.name}]\n${extractedText}\n[End of ${file.name}]`
      );
    }
    else {
      extractedText = `[File: ${file.name}]`;
      promptParts.push(`[Attached file: ${file.name}] - File noted`);
    }

    extractedContents.set(file.name, extractedText);
  }

  // Process attachments from conversation history
  for (const msg of conversationHistory) {
    if (!msg.attachments) continue;

    for (const attachment of msg.attachments) {
      if (processedFileNames.has(attachment.name)) continue;
      processedFileNames.add(attachment.name);

      if (attachment.extractedContent) {
        promptParts.push(
          `[Previously uploaded: ${attachment.name}]\n${attachment.extractedContent}\n[End of ${attachment.name}]`
        );
        extractedContents.set(attachment.name, attachment.extractedContent);
      } else {
        promptParts.push(`[Previously uploaded: ${attachment.name}]`);
      }
    }
  }

  // Build final prompt
  let finalPrompt = message;
  if (promptParts.length > 0) {
    finalPrompt = `${promptParts.join('\n\n')}\n\n${message}`;
  }

  return { prompt: finalPrompt, extractedContents };
}

// ============================================
// API Route Handler
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    
    const body = await request.json() as RequestBody;
    const { message, conversationHistory, modelId, attachments } = body;

    console.log('=== API Route Received ===');
    console.log('Message:', message);
    console.log('Current attachments:', attachments?.length || 0);
    
    // Count total attachments in conversation
    const historyAttachments = conversationHistory?.reduce(
      (sum, msg) => sum + (msg.attachments?.length || 0), 
      0
    ) || 0;
    console.log('History attachments:', historyAttachments);
    console.log('Total attachments in conversation:', (attachments?.length || 0) + historyAttachments);

    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    const userMessage = typeof message === 'string' 
      ? message 
      : JSON.stringify(message);

    const model = mockModels.find((m) => m.id === modelId) || mockModels[0];

    // Build prompt with ALL attachments
    const { prompt: promptWithAttachments, extractedContents } = await buildPromptWithAllAttachments(
      userMessage,
      attachments || [],
      conversationHistory || []
    );

    console.log('=== Prompt Built ===');
    console.log('Total files processed:', extractedContents.size);
    console.log('Prompt length:', promptWithAttachments.length);

    // Build conversation history context
    let finalPrompt = promptWithAttachments;
    if (conversationHistory && conversationHistory.length > 0) {
      const historyText = conversationHistory.length > 10
        ? [
            conversationHistory[0],  // keep first message
            ...conversationHistory.slice(-9)  // + 9 most recent
          ]
          .map((msg: ConversationMessage) => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            return `${role}: ${msg.content}`;
          })
          .join('\n\n')
        : conversationHistory
          .map((msg: ConversationMessage) => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            return `${role}: ${msg.content}`;
          })
          .join('\n\n');
      
      finalPrompt = `Previous conversation:\n${historyText}\n\n${promptWithAttachments}`;
    }
    
    const systemPrompt = `You are IGPT, an intelligent enterprise AI assistant.

    Your capabilities: 
    - Expert coding & programming assistance, Data analysis, visualization, Document analysis,
    - Code review and explanation
    - Image analysis, Multi-file context awareness
    - Research with citations

    IMPORTANT - File Context:
    - You have access to ALL files uploaded in this conversation
    - Supported formats: PDF, Word (.docx), text, CSV, images, and all code files
    - Users may reference files from earlier messages
    - When users mention a file name, refer to its extracted content
    - Maintain context of all uploaded documents throughout the conversation

    Guidelines:
    - Think step-by-step
    - Reference specific files when answering
    - Use markdown formatting for code with syntax highlighting

    Current model: ${model.name}`;

    // Create Server-Sent Events stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const thinkingSteps: string[] = [];
          let contentBuffer = '';
          const startTime = Date.now();

          for await (const chunk of streamCompletion(
            finalPrompt,
            model,
            systemPrompt
          )) {
            const eventData: EventData = { type: chunk.type };

            switch (chunk.type) {
              case 'thinking_step':
                thinkingSteps.push(chunk.data as string);
                eventData.data = { 
                  step: chunk.data, 
                  index: thinkingSteps.length,
                  timestamp: Date.now() - startTime,
                };
                break;

              case 'content_delta':
                contentBuffer += chunk.data as string;
                eventData.data = { 
                  delta: chunk.data, 
                  fullText: contentBuffer 
                };
                break;

              case 'content_end':
                eventData.data = { 
                  thinkingSteps, 
                  fullText: contentBuffer,
                  duration: Date.now() - startTime,
                  model: model.name,
                };
                break;

              case 'error':
                eventData.data = { error: chunk.data };
                break;
            }

            const sseData = `data: ${JSON.stringify(eventData)}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }

          controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
          controller.close();
          
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData: EventData = {
            type: 'error',
            data: { 
              error: error instanceof Error ? error.message : 'Unknown error',
              stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
            },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
    
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}