// src/lib/websocket/websocket-server.ts
// WebSocket server for real-time communication
// Compatible with AWS API Gateway WebSocket API

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { pubsub, TOPICS } from '@/graphql/resolvers';

interface WebSocketClient extends WebSocket {
  userId?: string;
  conversationId?: string;
  isAlive?: boolean;
}

interface WebSocketMessage {
  action: string;
  data?: any;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  initialize(server: any) {
    this.wss = new WebSocketServer({
      noServer: true,
      path: '/api/ws',
    });

    // Handle WebSocket upgrade
    server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
      const { pathname } = parse(request.url || '', true);

      if (pathname === '/api/ws') {
        this.wss?.handleUpgrade(request, socket, head, (ws) => {
          this.wss?.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    // Handle connections
    this.wss.on('connection', (ws: WebSocketClient, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    // Start heartbeat to detect dead connections
    this.startHeartbeat();

    console.log('✅ WebSocket server initialized');
  }

  private handleConnection(ws: WebSocketClient, request: IncomingMessage) {
    const connectionId = this.generateConnectionId();
    ws.isAlive = true;

    // Extract user info from query params or headers
    const { query } = parse(request.url || '', true);
    const userId = query.userId as string;
    const conversationId query.conversationId as string;

    ws.userId = userId;
    ws.conversationId = conversationId;

    // Store connection
    this.clients.set(connectionId, ws);

    console.log(`🔌 WebSocket connected: ${connectionId} (user: ${userId})`);

    // Send connection acknowledgment
    this.sendToClient(ws, {
      type: 'connection',
      connectionId,
      message: 'Connected to IGPT WebSocket server',
    });

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(ws, message, connectionId);
      } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
        this.sendToClient(ws, {
          type: 'error',
          message: 'Invalid message format',
        });
      }
    });

    // Handle pong (heartbeat response)
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Handle disconnection
    ws.on('close', () => {
      this.clients.delete(connectionId);
      console.log(`🔌 WebSocket disconnected: ${connectionId}`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${connectionId}:`, error);
      this.clients.delete(connectionId);
    });
  }

  private handleMessage(
    ws: WebSocketClient,
    message: WebSocketMessage,
    connectionId: string
  ) {
    console.log(`📨 Received message:`, message.action);

    switch (message.action) {
      case 'ping':
        this.sendToClient(ws, { type: 'pong', timestamp: Date.now() });
        break;

      case 'subscribe':
        // Subscribe to conversation updates
    if (message.data?.conversationId) {
          ws.conversationId = message.data.conversationId;
          this.sendToClient(ws, {
            type: 'subscribed',
            conversationId: message.data.conversationId,
          });
        }
        break;

      case 'typing':
        // Broadcast typing indicator to other users in conversation
        if (ws.conversationId) {
          this.broadcastToConversation(ws.conversationId, ws.userId!, {
            type: 'typing',
            userId: ws.userId,
            isTyping: message.data?.isTyping || false,
            timestamp: Date.now(),
          });
        }
        break;

      case 'message':
        // Handle chat message (relay to backend)
        this.sendToClient(ws, {
          type: 'message_received',
          messageId: message.data?.messageId,
        });
        break;

      default:
        this.sendToClient(ws, {
          type: 'error',
          message: `Unknown action: ${message.action}`,
        });
    }
  }

  private sendToClient(ws: WebSocketClient, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  private broadcastToConversation(
    conversationId: string,
    excludeUserId: string,
    data: any
  ) {
    this.clients.forEach((client) => {
      if (
        client.conversationId === conversationId &&
        client.userId !== excludeUserId &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Stream LLM tokens to specific conversation
  streamToken(conversationId: string, data: any) {
    this.clients.forEach((client) => {
      if (
        client.conversationId === conversationId &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(
          JSON.stringify({
            type: 'token',
            ...data,
          })
        );
      }
    });
  }

  // Broadcast message to all clients in a conversation
  broadcastMessage(conversationId: string, message: any) {
    this.clients.forEach((client) => {
      if (
        client.conversationId === conversationId &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(
          JSON.stringify({
            type: 'message',
            ...message,
          })
        );
      }
    });
  }

  // Heartbeat to detect dead connections
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, connectionId) => {
        if (client.isAlive === false) {
          console.log(`💀 Terminating dead connection: ${connectionId}`);
          client.terminate();
          this.clients.delete(connectionId);
          return;
        }

        client.ilive = false;
        client.ping();
      });
    }, 30000); // Every 30 seconds
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  getStats() {
    return {
      totalConnections: this.clients.size,
      connectionsByConversation: this.groupByConversation(),
    };
  }

  private groupByConversation() {
    const grouped: Record<string, number> = {};
    this.clients.forEach((client) => {
      if (client.conversationId) {
        grouped[client.conversationId] = (grouped[client.conversationId] || 0) + 1;
      }
    });
    return grouped;
  }

  shutdown() {
    console.log('🛑 Shutting down WebSocket server...');

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clients.forEach((client) => {
      client.close(1001, 'Server shutting down');
    });

    this.wss?.close();
    console.log('✅ WebSocket server shut down');
  }
}

// Singleton instance
export const websocketMar = new WebSocketManager();

export default websocketManager;

