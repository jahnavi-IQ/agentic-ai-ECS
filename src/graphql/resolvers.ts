// src/graphql/resolvers.ts
// GraphQL resolvers for IGPT platform

import { PubSub } from 'graphql-subscriptions';
import { ConversationRepository } from '@/lib/db/repositories/conversation.repository';
import { MessageRepository } from '@/lib/db/repositories/message.repository';
import { ArtifactRepository } from '@/lib/db/repositories/artifact.repository';
import { VectorSearchService } from '@/lib/search/vector-search.service';
import { GraphQLError } from 'graphql';

const pubsub = new PubSub();

// Repository instances
const conversationRepo = new ConversationRepository();
const messageRepo = new MessageRepository();
const artifactRepo = new ArtifactRepository();
const vectorSearch = new VectorSearchService();

// Subscription topics
const TOPICS = {
  MESSAGE_ADDED: 'MESSAGE_ADDED',
  TOKEN_STREAMED: 'TOKEN_STREAMED',
  TYPING_INDICATOR: 'TYPING_INDICATOR',
  CONVERSATION_UPDATED: 'CONVERSATION_UPDATED',
};

export const resolvers = {
  // ============================================
  // Queries
  // ============================================
  Query: {
    // Get current user
    me: async (_parent: any, _args: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return context.user;
    },

    // Get single conversation
    conversation: async (_parent: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const conversation = await conversationRepo.findById(id);

      if (!conversation) {
        throw new GraphQLError('Conversation not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check ownership
      if (conversation.userId !== context.user.id) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return conversation;
    },

    // Get user's conversations
    conversations: async (
      _parent: any,
      args: {
        userId: string;
        status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
        limit?: number;
        offset?: number;
      },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify user can only query their own conversations
      if (args.userId !== context.user.id) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const limit = args.limit || 20;
      const offset = args.offset || 0;

      const conversations = await conversationRepo.findByUserId(
        args.userId,
        args.status?.toLowerCase() || 'active',
        limit + 1, // Fetch one extra to determine hasNextPage
        offset
      );

      const hasNextPage = conversations.length > limit;
      const edges = conversations.slice(0, limit).map((conv, index) => ({
        node: conv,
        cursor: Buffer.from(`${offset + index}`).toString('base64'),
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        totalCount: await conversationRepo.countByUserId(args.userId),
      };
    },

    // Get single message
    message: async (_parent: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const message = await messageRepo.findById(id);

      if (!message) {
        throw new GraphQLError('Message not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Check ownership through conversation
      const conversation = await conversationRepo.findById(message.conversationId);
      if (conversation?.userId !== context.user.id) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return message;
    },

    // Get messages for conversation
    messages: async (
      _parent: any,
      args: { conversationId: string; limit?: number; offset?: number },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify ownership
      const conversation = await conversationRepo.findById(args.conversationId);
      if (!conversation || conversation.userId !== context.user.id) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const limit = args.limit || 50;
      const offset = args.offset || 0;

      const messages = await messageRepo.findByConversationId(
        args.conversationId,
        limit + 1,
        offset
      );

      const hasNextPage = messages.length > limit;
      const edges = messages.slice(0, limit).map((msg, index) => ({
        node: msg,
        cursor: Buffer.from(`${offset + index}`).toString('base64'),
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: offset > 0,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        totalCount: await messageRepo.countByConversationId(args.conversationId),
      };
    },

    // Get artifact
    artifact: async (
      _parent: any,
      { id, version }: { id: string; version?: number },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await artifactRepo.getArtifactVersion(id, version);
    },

    // Get artifacts for conversation
    artifacts: async (
      _parent: any,
      { conversationId }: { conversationId: string },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify ownership
      const conversation = await conversationRepo.findById(conversationId);
      if (!conversation || conversation.userId !== context.user.id) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return await artifactRepo.findByConversationId(conversationId);
    },

    // Search conversations
    searchConversations: async (
      _parent: any,
      args: { query: string; userId: string; limit?: number },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify user can only search their own conversations
      if (args.userId !== context.user.id) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return await vectorSearch.searchConversations(
        args.query,
        args.userId,
        args.limit || 10
      );
    },

    // Get usage summary
    usage: async (
      _parent: any,
      { userId, period }: { userId: string; period: string },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (userId !== context.user.id) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // TODO: Implement usage tracking
      return {
        totalMessages: 0,
        totalTokens: 0,
        totalCost: 0,
        period,
      };
    },

    // Health check
    health: async () => {
      // Check database connection
      let databaseStatus = 'healthy';
      try {
        await conversationRepo.healthCheck();
      } catch (error) {
        databaseStatus = 'unhealthy';
      }

      // Check cache connection
      let cacheStatus = 'healthy';
      try {
        // TODO: Implement cache health check
      } catch (error) {
        cacheStatus = 'unhealthy';
      }

      return {
        status: databaseStatus === 'healthy' && cacheStatus === 'healthy' ? 'healthy' : 'degraded',
        timestamp: new Date(),
        database: databaseStatus,
        cache: cacheStatus,
      };
    },
  },

  // ============================================
  // Mutations
  // ============================================
  Mutation: {
    // Create conversation
    createConversation: async (
      _parent: any,
      { input }: { input: { title: string; metadata?: any } },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const conversation = await conversationRepo.create({
        userId: context.user.id,
        title: input.title,
        metadata: input.metadata,
      });

      // Publish update
      pubsub.publish(TOPICS.CONVERSATION_UPDATED, {
        conversationUpdated: conversation,
        userId: context.user.id,
      });

      return conversation;
    },

    // Update conversation
    updateConversation: async (
      _parent: any,
      {
        id,
        input,
      }: { id: string; input: { title?: string; status?: string } },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify ownership
      const conversation = await conversationRepo.findById(id);
      if (!conversation || conversation.userId !== context.user.id) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const updated = await conversationRepo.update(id, input);

      // Publish update
      pubsub.publish(TOPICS.CONVERSATION_UPDATED, {
        conversationUpdated: updated,
        userId: context.user.id,
      });

      return updated;
    },

    // Delete conversation
    deleteConversation: async (
      _parent: any,
      { id }: { id: string },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify ownership
      const conversation = await conversationRepo.findById(id);
      if (!conversation || conversation.userId !== context.user.id) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await conversationRepo.delete(id);
      return true;
    },

    // Archive conversation
    archiveConversation: async (
      _parent: any,
      { id }: { id: string },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await conversationRepo.update(id, { status: 'archived' });
    },

    // Send message
    sendMessage: async (
      _parent: any,
      {
        input,
      }: {
        input: {
          conversationId: string;
          content: string;
          attachments?: any[];
        };
      },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify ownership
      const conversation = await conversationRepo.findById(input.conversationId);
      if (!conversation || conversation.userId !== context.user.id) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Create message
      const message = await messageRepo.create({
        conversationId: input.conversationId,
        userId: context.user.id,
        role: 'user',
        content: input.content,
      });

      // Publish to subscribers
      pubsub.publish(TOPICS.MESSAGE_ADDED, {
        messageAdded: message,
        conversationId: input.conversationId,
      });

      return message;
    },

    // Delete message
    deleteMessage: async (
      _parent: any,
      { id }: { id: string },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify ownership through conversation
      const message = await messageRepo.findById(id);
      if (!message) {
        throw new GraphQLError('Message not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const conversation = await conversationRepo.findById(message.conversationId);
      if (!conversation || conversation.userId !== context.user.id) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await messageRepo.delete(id);
      return true;
    },

    // Create artifact
    createArtifact: async (
      _parent: any,
      {
        input,
      }: {
        input: {
          conversationId: string;
          artifactType: string;
          title?: string;
          language?: string;
          content: string;
        };
      },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await artifactRepo.create({
        ...input,
        userId: context.user.id,
      });
    },

    // Update artifact
    updateArtifact: async (
      _parent: any,
      { id, input }: { id: string; input: { content: string } },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await artifactRepo.updateArtifact(id, input.content);
    },

    // Delete artifact
    deleteArtifact: async (
      _parent: any,
      { id }: { id: string },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      await artifactRepo.delete(id);
      return true;
    },

    // Update user profile
    updateProfile: async (
      _parent: any,
      { name, avatarUrl }: { name?: string; avatarUrl?: string },
      context: any
    ) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // TODO: Implement user update
      return context.user;
    },
  },

  // ============================================
  // Subscriptions
  // ============================================
  Subscription: {
    // Subscribe to new messages
    messageAdded: {
      subscribe: (_parent: any, { conversationId }: { conversationId: string }) => {
        return pubsub.asyncIterator([`${TOPICS.MESSAGE_ADDED}_${conversationId}`]);
      },
    },

    // Subscribe to token streaming
    tokenStreamed: {
      subscribe: (_parent: any, { conversationId }: { conversationId: string }) => {
        return pubsub.asyncIterator([`${TOPICS.TOKEN_STREAMED}_${conversationId}`]);
      },
    },

    // Subscribe to typing indicators
    typingIndicator: {
      subscribe: (_parent: any, { conversationId }: { conversationId: string }) => {
        return pubsub.asyncIterator([`${TOPICS.TYPING_INDICATOR}_${conversationId}`]);
      },
    },

    // Subscribe to conversation updates
    conversationUpdated: {
      subscribe: (_parent: any, { userId }: { userId: string }) => {
        return pubsub.asyncIterator([`${TOPICS.CONVERSATION_UPDATED}_${userId}`]);
      },
    },
  },

  // ============================================
  // Field Resolvers
  // ============================================
  Conversation: {
    user: async (parent: any) => {
      // TODO: Fetch user from database
      return { id: parent.userId };
    },

    lastMessage: async (parent: any) => {
      const messages = await messageRepo.findByConversationId(parent.id, 1, 0);
      return messages[0] || null;
    },

    messages: async (
      parent: any,
      { limit, offset }: { limit?: number; offset?: number }
    ) => {
      return await messageRepo.findByConversationId(
        parent.id,
        limit || 50,
        offset || 0
      );
    },

    artifacts: async (parent: any) => {
      return await artifactRepo.findByConversationId(parent.id);
    },
  },

  Message: {
    conversation: async (parent: any) => {
      return await conversationRepo.findById(parent.conversationId);
    },
  },

  Artifact: {
    conversation: async (parent: any) => {
      return await conversationRepo.findById(parent.conversationId);
    },

    versions: async (parent: any) => {
      return await artifactRepo.listVersions(parent.id);
    },

    currentContent: async (parent: any) => {
      return await artifactRepo.getArtifactVersion(parent.id, parent.currentVersion);
    },
  },

  SearchResult: {
    conversation: async (parent: any) => {
      return await conversationRepo.findById(parent.conversationId);
    },
  },
};

export default resolvers;

// Export PubSub for use in other modules (e.g., LLM streaming)
export { pubsub, TOPICS };
