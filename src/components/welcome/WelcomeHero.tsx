// Path: \src\components\welcome\WelcomeHero.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function WelcomeHero() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 py-16">
      {/* Logo Icon */}
      <div className="relative">
        <div className="absolute inset-0 blur-3xl bg-gold/20 rounded-full" />
        <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-gold to-gold/50 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-black" />
        </div>
      </div>

      {/* Heading */}
      <div className="space-y-4 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Welcome to{' '}
          <span className="bg-linear-to-r from-gold via-gold/80 to-gold/60 bg-clip-text text-transparent">
            IGPT
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
        Build intelligent AI agents for your enterprise with multi-model support, 
        advanced file processing, and real-time streaming responses.
      </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          onClick={() => router.push('/signup')}
          size="lg"
          className="bg-gold hover:bg-gold/90 text-black font-semibold text-lg px-8 gap-2"
        >
          Get Started Free
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}