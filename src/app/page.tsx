// File: \src\app\page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeHero } from '@/components/welcome/WelcomeHero';
import { Button } from '@/components/ui/button';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect authenticated users to chat
  useEffect(() => {
    if (!loading && user) {
      console.log('✅ User authenticated on home page, redirecting to chat');
      router.push('/chat/new');
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirect loading if authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-gold border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">Redirecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Auth Buttons */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold" />
            <span className="text-xl font-bold">IGPT</span>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push('/login')}
              className="gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
            <Button
              onClick={() => router.push('/signup')}
              className="bg-gold hover:bg-gold/90 text-black gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <WelcomeHero />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © 2026 IGPT. All rights reserved.
        </div>
      </footer>
    </div>
  );
}