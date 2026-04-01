//Path: src\types\index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  thinking?: ThinkingStep[];
  attachments?: Attachment[];
  toolCalls?: ToolCall[];
  artifactId?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  extractedContent?: string; 
}

export interface ThinkingStep {
  id: string;
  step: string;
  index: number;
  output?: string; 
  status?: 'pending' | 'completed' | 'error';
  timestamp?: Date;
}

export interface ToolCall {
  id: string;
  tool: string;
  input?: Record<string, unknown>;
  query: string;
  result?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  preview?: string;
}

export interface Artifact {
  id: string;
  type: 'code' | 'document' | 'chart';
  title: string;
  content: string;
  language?: string;
  createdAt: Date;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
  category: 'HR' | 'Technical' | 'Business';
}

export type ConnectorType = 'web_search' | 'research' | 'style' | 'model';

export interface ConnectorConfig {
  apiKey?: string;
  endpoint?: string;
  maxResults?: number;
  temperature?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface Connector {
  type: ConnectorType;
  enabled: boolean;
  config?: ConnectorConfig; 
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'aws-bedrock' | 'openai' | 'google' | 'qwen';
  maxTokens: number;
  costPer1M: number;
  modelId?: string; // Provider-specific model ID
}
export interface StreamChunk {
  type: 'thinking_start' | 'thinking_step' | 'content_start' | 'content_delta' | 'content_end' | 'tool_use' | 'error';
  data?: unknown;
}

export type StreamEvent =
  | {
      type: 'message_start';
      data: {
        messageId: string;
        timestamp: number;
      };
    }
  | {
      type: 'content_delta';
      data: {
        delta: string;
        messageId: string;
      };
    }
  | {
      type: 'thinking_step';
      data: {
        step: string;
        index: number;
      };
    }
  | {
      type: 'tool_call';
      data: {
        tool: string;
        query: string;
      };
    }
  | {
      type: 'artifact_created';
      data: {
        artifactId: string;
        artifactType: 'code' | 'document' | 'chart';
        content: string;
      };
    }
  | {
      type: 'message_end';
      data: {
        messageId: string;
        finishReason: 'complete' | 'stop' | 'error';
      };
    };