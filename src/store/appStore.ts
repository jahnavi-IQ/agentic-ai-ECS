//Path: src\store\appStore.ts
import { create } from 'zustand';
import { Conversation, Connector, ModelConfig, Artifact, Template } from '@/types';
import { mockModels } from '@/lib/mock-data';

// ============================================
// Type Definitions
// ============================================

// Style configuration interface
interface StyleConfig {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

interface AppState {
  // UI State
  sidebarCollapsed: boolean;
  artifactsPanelOpen: boolean;
  activeConversationId: string | null;
  
  // Data State
  conversations: Conversation[];
  activeConnectors: Connector[];
  selectedModel: ModelConfig;
  artifacts: Artifact[];
  
  // Style Configuration State
  selectedStyle: string;
  styleConfig: StyleConfig;
  
  // Template State
  templatePrompt: string;
  
  // Template Modal State
  templateModalOpen: boolean;
  activeTemplate: Template | null;
  
  // UI Actions
  toggleSidebar: () => void;
  toggleArtifactsPanel: () => void;
  setActiveConversation: (id: string | null) => void;
  
  // Conversation Actions
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  
  // Connector Actions
  toggleConnector: (type: string) => void;
  
  // Model Actions
  setModel: (model: ModelConfig) => void;
  
  // Artifact Actions
  addArtifact: (artifact: Artifact) => void;
  removeArtifact: (id: string) => void;
  
  // Style Actions
  setSelectedStyle: (style: string) => void;
  setStyleConfig: (config: StyleConfig) => void;
  updateStyleFromSelection: (styleName: string) => void;
  
  // Template Actions
  setTemplatePrompt: (prompt: string) => void;
  
  // Template Modal Actions
  openTemplateModal: (template: Template) => void;
  closeTemplateModal: () => void;
}

// ============================================
// Predefined Style Configurations
// ============================================

const styleConfigurations: Record<string, StyleConfig> = {
  Normal: {
    systemPrompt: 'Respond naturally and conversationally with balanced detail.',
    temperature: 0.7,
    maxTokens: 2000,
  },
  Concise: {
    systemPrompt: 'Be extremely brief and to the point. Use short sentences. Avoid unnecessary elaboration.',
    temperature: 0.5,
    maxTokens: 1000,
  },
  Explanatory: {
    systemPrompt: 'Provide detailed explanations with examples, context, and thorough reasoning. Break down complex concepts.',
    temperature: 0.8,
    maxTokens: 3000,
  },
  Formal: {
    systemPrompt: 'Use formal language and professional tone. Avoid contractions. Maintain business-appropriate communication.',
    temperature: 0.6,
    maxTokens: 2000,
  },
  Creative: {
    systemPrompt: 'Be creative, imaginative, and expressive. Use vivid language and explore unconventional ideas.',
    temperature: 0.9,
    maxTokens: 2500,
  },
  Technical: {
    systemPrompt: 'Focus on technical accuracy and precision. Use industry-standard terminology. Include code examples when relevant.',
    temperature: 0.4,
    maxTokens: 3000,
  },
};

// ============================================
// Zustand Store
// ============================================

export const useAppStore = create<AppState>((set) => ({
  // ==================== Initial State ====================
  
  // UI State
  sidebarCollapsed: false,
  artifactsPanelOpen: false,
  activeConversationId: null,
  
  // Data State
  conversations: [],
  activeConnectors: [
    { type: 'web_search', enabled: false },
    { type: 'research', enabled: false },
    { type: 'style', enabled: false },
    { type: 'model', enabled: true },
  ],
  
  // Default Model: Claude 3.5 Sonnet (index 0)
  // Available models: claude-3, mistral-large-3, gpt-4, gemini, qwen-3
  selectedModel: mockModels[0],
  
  artifacts: [],
  
  // Style State
  selectedStyle: 'Normal',
  styleConfig: styleConfigurations.Normal,
  
  // Template State
  templatePrompt: '',
  
  // Template Modal State
  templateModalOpen: false,
  activeTemplate: null,

  // ==================== UI Actions ====================
  
  /**
   * Toggle sidebar visibility
   */
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  /**
   * Toggle artifacts panel visibility
   */
  toggleArtifactsPanel: () => set((state) => ({ 
    artifactsPanelOpen: !state.artifactsPanelOpen 
  })),
  
  /**
   * Set the active conversation ID
   */
  setActiveConversation: (id) => set({ 
    activeConversationId: id 
  }),
  
  // ==================== Conversation Actions ====================
  
  /**
   * Add a new conversation to the list
   */
  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations],
  })),
  
  /**
   * Update an existing conversation
   */
  updateConversation: (id, updates) => set((state) => ({
    conversations: state.conversations.map((conv) =>
      conv.id === id ? { ...conv, ...updates, updatedAt: new Date() } : conv
    ),
  })),
  
  /**
   * Delete a conversation
   */
  deleteConversation: (id) => set((state) => ({
    conversations: state.conversations.filter((conv) => conv.id !== id),
    activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
  })),
  
  // ==================== Connector Actions ====================
  
  /**
   * Toggle a connector on/off
   */
  toggleConnector: (type) => set((state) => ({
    activeConnectors: state.activeConnectors.map((conn) =>
      conn.type === type ? { ...conn, enabled: !conn.enabled } : conn
    ),
  })),
  
  // ==================== Model Actions ====================
  
  /**
   * Set the selected LLM model
   * This model will be used for all subsequent messages
   * The model is passed to the API which routes to the correct provider
   */
  setModel: (model) => set({ 
    selectedModel: model 
  }),
  
  // ==================== Artifact Actions ====================
  
  /**
   * Add an artifact and automatically open the artifacts panel
   */
  addArtifact: (artifact) => set((state) => ({
    artifacts: [...state.artifacts, artifact],
    artifactsPanelOpen: true,
  })),
  
  /**
   * Remove an artifact by ID
   */
  removeArtifact: (id) => set((state) => ({
    artifacts: state.artifacts.filter((art) => art.id !== id),
  })),
  
  // ==================== Style Actions ====================
  
  /**
   * Set the selected style name
   */
  setSelectedStyle: (style) => set({ 
    selectedStyle: style 
  }),
  
  /**
   * Set custom style configuration
   */
  setStyleConfig: (config) => set({ 
    styleConfig: config 
  }),
  
  /**
   * Updates both the selected style and applies the corresponding configuration
   * This is the main method to use when changing styles
   */
  updateStyleFromSelection: (styleName) => {
    const config = styleConfigurations[styleName];
    if (config) {
      set({
        selectedStyle: styleName,
        styleConfig: config,
      });
    } else {
      console.warn(`Style "${styleName}" not found. Available styles:`, Object.keys(styleConfigurations));
    }
  },
  
  // ==================== Template Actions ====================
  
  /**
   * Set the template prompt to be inserted into chat input
   * This is used by TemplateList to communicate with InputArea
   * NOTE: This is now deprecated in favor of openTemplateModal()
   * but kept for backward compatibility
   */
  setTemplatePrompt: (prompt) => set({ 
    templatePrompt: prompt 
  }),
  
  // ==================== Template Modal Actions ====================
  
  /**
   * Open template modal with selected template
   * This replaces the old setTemplatePrompt() flow
   */
  openTemplateModal: (template) => set({
    templateModalOpen: true,
    activeTemplate: template,
  }),
  
  /**
   * Close template modal and clear active template
   */
  closeTemplateModal: () => set({
    templateModalOpen: false,
    activeTemplate: null,
  }),
}));

// ============================================
// Selectors (for optimized access)
// ============================================

/**
 * Get the current style configuration for API calls
 */
export const getStyleConfig = () => useAppStore.getState().styleConfig;

/**
 * Get the currently selected model
 */
export const getSelectedModel = () => useAppStore.getState().selectedModel;

/**
 * Get all enabled connectors
 */
export const getEnabledConnectors = () => {
  const connectors = useAppStore.getState().activeConnectors;
  return connectors.filter(conn => conn.enabled);
};

/**
 * Check if a specific connector is enabled
 */
export const isConnectorEnabled = (type: string) => {
  const connectors = useAppStore.getState().activeConnectors;
  const connector = connectors.find(conn => conn.type === type);
  return connector?.enabled || false;
};

/**
 * Get active conversation
 */
export const getActiveConversation = () => {
  const state = useAppStore.getState();
  if (!state.activeConversationId) return null;
  
  return state.conversations.find(
    conv => conv.id === state.activeConversationId
  ) || null;
};

/**
 * Get the complete request configuration for API calls
 * Use this when making requests to the backend
 */
export const getRequestConfig = () => {
  const state = useAppStore.getState();
  return {
    // Model configuration
    modelId: state.selectedModel.id,
    modelProvider: state.selectedModel.provider,
    modelName: state.selectedModel.name,
    
    // Style configuration
    style: state.selectedStyle,
    styleConfig: state.styleConfig,
    
    // Connectors
    enabledConnectors: getEnabledConnectors().map(c => c.type),
  };
};

/**
 * Get available style names
 */
export const getAvailableStyles = () => Object.keys(styleConfigurations);

/**
 * Get style configuration by name
 */
export const getStyleByName = (styleName: string) => {
  return styleConfigurations[styleName] || styleConfigurations.Normal;
};

/**
 * Get the current template prompt
 * NOTE: Deprecated in favor of template modal
 */
export const getTemplatePrompt = () => useAppStore.getState().templatePrompt;

/**
 * Get the active template for modal
 */
export const getActiveTemplate = () => useAppStore.getState().activeTemplate;

/**
 * Check if template modal is open
 */
export const isTemplateModalOpen = () => useAppStore.getState().templateModalOpen;