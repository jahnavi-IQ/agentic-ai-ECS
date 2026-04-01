//Path: \src\lib\llm-service.ts
import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ModelConfig, StreamChunk } from '@/types';

// ============================================
// Initialize All Provider Clients
// ============================================

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY!,
  },
});

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');


// ============================================
// Helper: Ensure String
// ============================================

/**
 * Safely convert any value to string
 * Handles objects, arrays, undefined, etc.
 */
function ensureString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// ============================================
// Helper: Build System Prompt
// ============================================

/**
 * Build complete system prompt with model context
 */
function buildSystemPrompt(model: ModelConfig, customPrompt?: string): string {
  const basePrompt = customPrompt || 'You are IGPT, an intelligent enterprise AI assistant in Technology & finance domains.';
  
  return `${basePrompt}

Current model: ${model.name}
Provider: ${model.provider}`;
}

// ============================================
// Main Streaming Function
// ============================================

/**
 * Universal streaming function for all LLM providers
 * @param prompt - User's message (will be converted to string if needed)
 * @param model - Selected model configuration
 * @param systemPrompt - System instructions for the AI
 */
export async function* streamCompletion(
  prompt: string | unknown,
  model: ModelConfig,
  systemPrompt?: string
): AsyncGenerator<StreamChunk> {
  try {
    // Ensure prompt is always a string
    const safePrompt = ensureString(prompt);
    
    // Build complete system prompt
    const completeSystemPrompt = buildSystemPrompt(model, systemPrompt);
    
    // Emit initial thinking state
    yield { type: 'thinking_start' };
    yield { 
      type: 'thinking_step', 
      data: `Connecting to ${model.name}...` 
    };

    // Route to appropriate provider with safe prompt
    switch (model.provider) {
      case 'aws-bedrock':
        yield* streamBedrockCompletion(safePrompt, model, completeSystemPrompt);
        break;
      case 'openai':
        yield* streamOpenAICompletion(safePrompt, model, completeSystemPrompt);
        break;
      case 'google':
        yield* streamGoogleCompletion(safePrompt, model, completeSystemPrompt);
        break;
      case 'qwen':
        yield* streamQwenCompletion(safePrompt, model, completeSystemPrompt);
        break;
      default:
        throw new Error(`Unsupported provider: ${model.provider}`);
    }
  } catch (error) {
    console.error('LLM streaming error:', error);
    yield {
      type: 'error',
      data: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// ============================================
// Provider-Specific Implementations
// ============================================

/**
 * AWS Bedrock Implementation (Claude, Mistral)
 * Routes to correct format based on model
 */
async function* streamBedrockCompletion(
  prompt: string,
  model: ModelConfig,
  systemPrompt: string
): AsyncGenerator<StreamChunk> {
  const modelId = getBedrockModelId(model.id);
  
  console.log('=== Bedrock Request ===');
  console.log('Region:', process.env.BEDROCK_REGION || 'us-east-1');
  console.log('Model ID:', modelId);
  console.log('Model Type:', model.id);
  console.log('Is Inference Profile:', modelId.includes('.'));
  console.log('Prompt length:', prompt.length);
  console.log('System prompt length:', systemPrompt.length);
  
  yield { 
    type: 'thinking_step', 
    data: 'Analyzing your request...' 
  };

  // Route to correct API format based on model
  if (modelId.includes('mistral')) {
    yield* streamBedrockMistral(prompt, modelId, systemPrompt);
  } else {
    yield* streamBedrockClaude(prompt, modelId, systemPrompt);
  }
}

/**
 * Bedrock Claude Format (Anthropic)
 * Supports both legacy direct model IDs and new inference profiles
 */
async function* streamBedrockClaude(
  prompt: string,
  modelId: string,
  systemPrompt: string
): AsyncGenerator<StreamChunk> {
  // Claude payload format (works with both direct models and inference profiles)
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 8192,
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  const command = new InvokeModelWithResponseStreamCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  try {
    console.log(`Invoking Claude model: ${modelId}`);
    const response = await bedrockClient.send(command);
    
    if (!response.body) {
      throw new Error('No response body from Bedrock');
    }

    yield { 
      type: 'thinking_step', 
      data: 'Processing information...' 
    };
    yield { type: 'content_start' };

    let tokenCount = 0;
    for await (const event of response.body) {
      if (event.chunk?.bytes) {
        const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
        
        if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
          tokenCount++;
          
          if (tokenCount % 50 === 0) {
            yield {
              type: 'thinking_step',
              data: 'Continuing analysis...',
            };
          }
          
          yield { 
            type: 'content_delta', 
            data: chunk.delta.text 
          };
        }
      }
    }

    yield { 
      type: 'thinking_step', 
      data: 'Finalizing response...' 
    };
    yield { type: 'content_end' };
    
  } catch (error) {
    console.error('=== Bedrock Claude Error ===');
    console.error('Error details:', error);
    console.error('Model ID used:', modelId);
    console.error('Is this a legacy model?', !modelId.includes('.'));
    throw error;
  }
}

/**
 * Bedrock Mistral Format
 */
async function* streamBedrockMistral(
  prompt: string,
  modelId: string,
  systemPrompt: string
): AsyncGenerator<StreamChunk> {
  // Combine system prompt with user prompt in Mistral's instruction format
  const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}`;
  
  // Mistral's required instruction format
  const formattedPrompt = `<s>[INST] ${fullPrompt} [/INST]`;
  
  // Mistral payload format (different from Claude!)
  const payload = {
    prompt: formattedPrompt,
    max_tokens: 8000,
    temperature: 0.7,
  };

  console.log('=== Mistral Payload ===');
  console.log('Formatted prompt length:', formattedPrompt.length);

  const command = new InvokeModelWithResponseStreamCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  try {
    const response = await bedrockClient.send(command);
    
    if (!response.body) {
      throw new Error('No response body from Bedrock');
    }

    yield { 
      type: 'thinking_step', 
      data: 'Mistral is thinking...' 
    };
    yield { type: 'content_start' };

    let tokenCount = 0;
    for await (const event of response.body) {
      if (event.chunk?.bytes) {
        const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
        
        // Mistral response format: { outputs: [{ text: "..." }] }
        if (chunk.outputs && chunk.outputs[0]?.text) {
          tokenCount++;
          
          if (tokenCount % 50 === 0) {
            yield {
              type: 'thinking_step',
              data: 'Continuing generation...',
            };
          }
          
          yield { 
            type: 'content_delta', 
            data: chunk.outputs[0].text 
          };
        }
      }
    }

    yield { 
      type: 'thinking_step', 
      data: 'Finalizing response...' 
    };
    yield { type: 'content_end' };
    
  } catch (error) {
    console.error('=== Bedrock Mistral Error ===');
    console.error('Error details:', error);
    throw error;
  }
}

/**
 * OpenAI Implementation (GPT-4)
 */
async function* streamOpenAICompletion(
  prompt: string,
  model: ModelConfig,
  systemPrompt: string
): AsyncGenerator<StreamChunk> {
  console.log('=== OpenAI Request ===');
  console.log('Model:', 'gpt-4-turbo-preview');
  console.log('Prompt type:', typeof prompt);
  console.log('Prompt length:', prompt.length);
  console.log('System prompt length:', systemPrompt.length);
  
  yield { 
    type: 'thinking_step', 
    data: 'Connecting to OpenAI...' 
  };

  try {
    const stream = await openaiClient.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: systemPrompt
        },
        { 
          role: 'user', 
          content: prompt
        },
      ],
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
    });

    yield { 
      type: 'thinking_step', 
      data: 'GPT-4 is thinking...' 
    };
    yield { type: 'content_start' };

    let tokenCount = 0;
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        tokenCount++;
        
        if (tokenCount === 10) {
          yield {
            type: 'thinking_step',
            data: 'Analyzing context...',
          };
        } else if (tokenCount === 30) {
          yield {
            type: 'thinking_step',
            data: 'Formulating response...',
          };
        }
        
        yield { 
          type: 'content_delta', 
          data: content 
        };
      }
    }

    yield { type: 'content_end' };
    
  } catch (error) {
    console.error('=== OpenAI Error ===');
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Google AI Implementation (Gemini)
 */
async function* streamGoogleCompletion(
  prompt: string,
  model: ModelConfig,
  systemPrompt: string
): AsyncGenerator<StreamChunk> {
  yield { 
    type: 'thinking_step', 
    data: 'Connecting to Google AI...' 
  };

  const genModel = googleAI.getGenerativeModel({ 
    model: 'gemini-pro',
    systemInstruction: systemPrompt,
  });
  
  const result = await genModel.generateContentStream(prompt);

  yield { 
    type: 'thinking_step', 
    data: 'Gemini is processing...' 
  };
  yield { type: 'content_start' };

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield { 
        type: 'content_delta', 
        data: text 
      };
    }
  }

  yield { type: 'content_end' };
}

/**
 * Qwen Implementation (via Hugging Face)
 */
async function* streamQwenCompletion(
  prompt: string,
  model: ModelConfig,
  systemPrompt: string
): AsyncGenerator<StreamChunk> {
  yield { 
    type: 'thinking_step', 
    data: 'Connecting to Qwen (Hugging Face)...' 
  };

  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
  
  if (!HF_API_KEY) {
    throw new Error('Hugging Face API key not configured');
  }

  const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`;

  const response = await fetch(
    'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 2048,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Qwen API error: ${response.statusText}`);
  }

  yield { 
    type: 'thinking_step', 
    data: 'Qwen is generating response...' 
  };
  yield { type: 'content_start' };

  const data = await response.json();
  const text = data[0]?.generated_text || '';
  
  // Simulate streaming by chunking words
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    if (i === Math.floor(words.length / 3)) {
      yield {
        type: 'thinking_step',
        data: 'Continuing generation...',
      };
    }
    
    yield { 
      type: 'content_delta', 
      data: words[i] + ' ' 
    };
    
    // Small delay for streaming effect
    await new Promise(resolve => setTimeout(resolve, 30));
  }

  yield { type: 'content_end' };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Map model IDs to Bedrock model identifiers
 * 
 * IMPORTANT: Claude Sonnet 4.6 requires inference profiles:
 * - global.anthropic.claude-sonnet-4-6 (recommended for on-demand)
 * - us.anthropic.claude-sonnet-4-6 (US data residency)
 * - eu.anthropic.claude-sonnet-4-6 (EU data residency)
 * - jp.anthropic.claude-sonnet-4-6 (Japan data residency)
 */
function getBedrockModelId(modelId: string): string {
  const modelMap: Record<string, string> = {
    // Claude Sonnet 4.6 - NEW (uses inference profiles)
    'claude-sonnet-4.6': 'global.anthropic.claude-sonnet-4-6',
    'claude-4.6-sonnet': 'global.anthropic.claude-sonnet-4-6',
    
    // Mistral Large
    'mistral-large-3': 'mistral.mistral-large-2402-v1:0',
  };
  
  // Default to Claude Sonnet 4.6 (modern, supported model)
  // Falls back to inference profile if model not found
  return modelMap[modelId] || 'global.anthropic.claude-sonnet-4-6';
}

/**
 * Test provider connectivity (synchronous)
 */
export function testProvider(provider: string): boolean {
  try {
    switch (provider) {
      case 'aws-bedrock':
        return !!(
          process.env.BEDROCK_ACCESS_KEY_ID && 
          process.env.BEDROCK_SECRET_ACCESS_KEY
        );
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      case 'google':
        return !!process.env.GOOGLE_AI_API_KEY;
      case 'qwen':
        return !!process.env.HUGGINGFACE_API_KEY;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

/**
 * Get list of available providers
 */
export function getAvailableProviders(): string[] {
  const providers: string[] = [];
  
  if (testProvider('aws-bedrock')) providers.push('aws-bedrock');
  if (testProvider('openai')) providers.push('openai');
  if (testProvider('google')) providers.push('google');
  if (testProvider('qwen')) providers.push('qwen');
  
  return providers;
}