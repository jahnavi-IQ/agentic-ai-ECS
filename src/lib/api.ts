//Path: src\lib\api.ts
// API client for making HTTP requests to backend

import { Conversation, Message, Template } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface RequestOptions extends Omit<RequestInit, 'headers'> {
  token?: string;
  headers?: Record<string, string>;
}

interface ConversationResponse {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface MessageResponse {
  messageId: string;
  status: string;
}

interface UploadResponse {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, headers: customHeaders, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Conversations API
export const conversationsApi = {
  list: () => request<ConversationResponse[]>('/conversations'),
  
  get: (id: string) => request<ConversationResponse>(`/conversations/${id}`),
  
  create: (data: { title: string }) =>
    request<ConversationResponse>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    request<{ success: boolean }>(`/conversations/${id}`, {
      method: 'DELETE',
    }),
  
  sendMessage: (
    conversationId: string, 
    content: string, 
    attachments?: Array<{ id: string; name: string; type: string; size: number; url: string }>
  ) =>
    request<MessageResponse>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, attachments }),
    }),
};

// Upload API
export const uploadApi = {
  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },
};

// Templates API
export const templatesApi = {
  list: () => request<Template[]>('/templates'),
  
  get: (id: string) => request<Template>(`/templates/${id}`),
  
  create: (data: Omit<Template, 'id'>) =>
    request<Template>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Export as named constant instead of default
const api = {
  conversations: conversationsApi,
  upload: uploadApi,
  templates: templatesApi,
};

export default api;