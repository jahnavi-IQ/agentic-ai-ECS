// File: src/app/chat/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { ArtifactsPanel } from '@/components/artifacts/ArtifactsPanel';
import { useAppStore } from '@/store/appStore';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const artifactsPanelOpen = useAppStore((state) => state.artifactsPanelOpen);

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔒 Not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ⚠️ ONLY ONE <Sidebar /> HERE */}
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
      
      {artifactsPanelOpen && <ArtifactsPanel />}
    </div>
  );
}