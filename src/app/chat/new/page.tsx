// file: src\app\chat\new\page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useAppStore } from '@/store/appStore';
import { generateId } from '@/lib/utils';

export default function NewChatPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const addConversation = useAppStore((state) => state.addConversation);
  const setActiveConversation = useAppStore((state) => state.setActiveConversation);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/login');
      } else {
        // Create new conversation and redirect
        const newConversation = {
          id: generateId(),
          title: 'New Chat',
          createdAt: new Date(),
          updatedAt: new Date(),
          messageCount: 0,
        };

        addConversation(newConversation);
        setActiveConversation(newConversation.id);
        router.push(`/chat/${newConversation.id}`);
      }
    }
  }, [user, loading, router, addConversation, setActiveConversation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" />
        <p className="text-sm text-muted-foreground">Creating new chat...</p>
      </div>
    </div>
  );
}