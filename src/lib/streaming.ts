//Path: src\lib\streaming.ts
// Utilities for handling Server-Sent Events (SSE) and WebSocket streaming

import { StreamEvent } from '@/types';

/**
 * WebSocket message payload type
 */
export interface WebSocketMessage {
  type: string;
  conversationId?: string;
  content?: string;
  action?: string;
  data?: Record<string, unknown>;
}

/**
 * SSE Handler configuration
 */
export interface SSEHandlers {
  onMessage: (event: StreamEvent) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * WebSocket Handler configuration
 */
export interface WebSocketHandlers {
  onMessage: (event: StreamEvent) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
}

/**
 * Server-Sent Events (SSE) Client
 * For streaming responses from the backend
 */
export class SSEClient {
  private eventSource: EventSource | null = null;
  private url: string;
  private onMessage: (event: StreamEvent) => void;
  private onError: (error: Error) => void;
  private onComplete: () => void;

  constructor(url: string, handlers: SSEHandlers) {
    this.url = url;
    this.onMessage = handlers.onMessage;
    this.onError = handlers.onError || (() => {});
    this.onComplete = handlers.onComplete || (() => {});
  }

  connect(): void {
    this.eventSource = new EventSource(this.url);

    this.eventSource.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;
        this.onMessage(data);
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    this.eventSource.onerror = () => {
      this.onError(new Error('SSE connection error'));
      this.close();
    };

    // Listen for completion event
    this.eventSource.addEventListener('complete', () => {
      this.onComplete();
      this.close();
    });
  }

  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

/**
 * WebSocket Client
 * For bidirectional real-time communication
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessage: (event: StreamEvent) => void;
  private onError: (error: Error) => void;
  private onConnect: () => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(url: string, handlers: WebSocketHandlers) {
    this.url = url;
    this.onMessage = handlers.onMessage;
    this.onError = handlers.onError || (() => {});
    this.onConnect = handlers.onConnect || (() => {});
  }

  connect(): void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.onConnect();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data as string) as StreamEvent;
          this.onMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = () => {
        console.error('WebSocket error');
        this.onError(new Error('WebSocket connection error'));
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.attemptReconnect();
      };
    } catch (error) {
      this.onError(error as Error);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      this.onError(new Error('Max reconnection attempts reached'));
    }
  }

  send(data: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

/**
 * Helper function to create a streaming chat session
 */
export function createStreamingSession(
  conversationId: string,
  token?: string
): WebSocketClient {
  const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
  const url = `${baseUrl}/stream?conversationId=${conversationId}${token ? `&token=${token}` : ''}`;
  
  return new WebSocketClient(url, {
    onMessage: (event: StreamEvent) => {
      console.log('Stream event:', event);
    },
    onError: (error: Error) => {
      console.error('Stream error:', error);
    },
    onConnect: () => {
      console.log('Stream connected');
    },
  });
}

/**
 * Parse streaming response chunks
 */
export function parseStreamChunk(chunk: string): StreamEvent | null {
  try {
    return JSON.parse(chunk) as StreamEvent;
  } catch (error) {
    console.error('Failed to parse stream chunk:', error);
    return null;
  }
}

/**
 * Handle streaming text with incremental updates
 */
export class StreamingTextHandler {
  private buffer = '';
  private onUpdate: (text: string) => void;

  constructor(onUpdate: (text: string) => void) {
    this.onUpdate = onUpdate;
  }

  addChunk(chunk: string): void {
    this.buffer += chunk;
    this.onUpdate(this.buffer);
  }

  reset(): void {
    this.buffer = '';
  }

  getFullText(): string {
    return this.buffer;
  }
}