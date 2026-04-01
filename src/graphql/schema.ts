// src/graphql/schema.ts
// GraphQL schema for IGPT platform

import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  # ============================================
  # Core Types
  # ============================================

  type User {
    id: ID!
    email: String
    phoneNumber: String
    name: String
    avatarUrl: String
    createdAt: DateTime!
    lastActiveAt: DateTime
  }

  type Conversation {
    id: ID!
    userId: ID!
    user: User!
    title: String!
    messageCount: Int!
    status: ConversationStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    lastMessage: Message
    messages(limit: Int, offset: Int): [Message!]!
    artifacts: [Artifact!]!
    metadata: JSON
  }

  enum ConversationStatus {
    ACTIVE
    ARCHIVED
    DELETED
  }

  type Message {
    id: ID!
    conversationId: ID!
    conversation: Conversation!
    role: MessageRole!
    content: String!
    tokensUsed: Int
    model: String
    provider: String
    thinkingSteps: [ThinkingStep!]
    createdAt: DateTime!
    metadata: JSON
  }

  enum MessageRole {
    USER
    ASSISTANT
    SYSTEM
  }

  type ThinkingStep {
    step: String!
    index: Int!
  }

  type Artifact {
    id: ID!
    conversationId: ID!
    conversation: Conversation!
    artifactType: ArtifactType!
    title: String
    language: String
    currentVersion: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    versions: [ArtifactVersion!]!
    currentContent: ArtifactVersion
  }

  enum ArtifactType {
    CODE
    DOCUMENT
    HTML
    REACT
    MERMAID
    SVG
  }

  type ArtifactVersion {
    id: ID!
    artifactId: ID!
    version: Int!
    content: String!
    sizeBytes: Int!
    storagePath: String
    createdAt: DateTime!
  }

  type Attachment {
    id: ID!
    messageId: ID!
    fileName: String!
    fileType: String
    sizeBytes: Int!
    storagePath: String!
    extractedContent: String
    uploadedAt: DateTime!
  }

  type SearchResult {
    conversationId: ID!
    conversation: Conversation!
    messageId: ID!
    snippet: String!
    score: Float!
    createdAt: DateTime!
  }

  type UsageSummary {
    totalMessages: Int!
    totalTokens: Int!
    totalCost: Float!
    period: String!
  }

  # ============================================
  # Input Types
  # ============================================

  input CreateConversationInput {
    title: String!
    metadata: JSON
  }

  input UpdateConversationInput {
    title: String
    status: ConversationStatus
  }

  input SendMessageInput {
    conversationId: ID!
    content: String!
    attachments: [AttachmentInput!]
  }

  input AttachmentInput {
    fileName: String!
    fileType: String!
    fileData: String!  # Base64 encoded
  }

  input CreateArtifactInput {
    conversationId: ID!
    artifactType: ArtifactType!
    title: String
    language: String
    content: String!
  }

  input UpdateArtifactInput {
    content: String!
  }

  # ============================================
  # Queries
  # ============================================

  type Query {
    # User queries
    me: User!
    
    # Conversation queries
    conversation(id: ID!): Conversation
    conversations(
      userId: ID!
      status: ConversationStatus
      limit: Int
      offset: Int
    ): ConversationConnection!
    
    # Message queries
    message(id: ID!): Message
    messages(
      conversationId: ID!
      limit: Int
      offset: Int
    ): MessageConnection!
    
    # Artifact queries
    artifact(id: ID!, version: Int): ArtifactVersion
    artifacts(conversationId: ID!): [Artifact!]!
    
    # Search queries
    searchConversations(
      query: String!
      userId: ID!
      limit: Int
    ): [SearchResult!]!
    
    # Usage queries
    usage(userId: ID!, period: String!): UsageSummary!
    
    # Health check
    health: HealthStatus!
  }

  type ConversationConnection {
    edges: [ConversationEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ConversationEdge {
    node: Conversation!
    cursor: String!
  }

  type MessageConnection {
    edges: [MessageEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type MessageEdge {
    node: Message!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type HealthStatus {
    status: String!
    timestamp: DateTime!
    database: String!
    cache: String!
  }

  # ============================================
  # Mutations
  # ============================================

  type Mutation {
    # Conversation mutations
    createConversation(input: CreateConversationInput!): Conversation!
    updateConversation(id: ID!, input: UpdateConversationInput!): Conversation!
    deleteConversation(id: ID!): Boolean!
    archiveConversation(id: ID!): Conversation!
    
    # Message mutations
    sendMessage(input: SendMessageInput!): Message!
    deleteMessage(id: ID!): Boolean!
    
    # Artifact mutations
    createArtifact(input: CreateArtifactInput!): Artifact!
    updateArtifact(id: ID!, input: UpdateArtifactInput!): ArtifactVersion!
    deleteArtifact(id: ID!): Boolean!
    
    # User mutations
    updateProfile(name: String, avatarUrl: String): User!
  }

  # ============================================
  # Subscriptions
  # ============================================

  type Subscription {
    # Real-time message streaming
    messageAdded(conversationId: ID!): Message!
    
    # Token streaming for LLM responses
    tokenStreamed(conversationId: ID!): TokenStreamEvent!
    
    # Typing indicators
    typingIndicator(conversationId: ID!): TypingEvent!
    
    # Conversation updates
    conversationUpdated(userId: ID!): Conversation!
  }

  type TokenStreamEvent {
    messageId: ID!
    delta: String!
    fullText: String!
    type: StreamEventType!
  }

  enum StreamEventType {
    THINKING_STEP
    CONTENT_DELTA
    CONTENT_END
    DONE
  }

  type TypingEvent {
    userId: ID!
    userName: String
    isTyping: Boolean!
    timestamp: DateTime!
  }
`;

export default typeDefs;
