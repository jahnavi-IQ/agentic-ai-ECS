//Path: src\components\layout\Header.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function Header() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Clickable Logo/Name */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            IGPT
          </span>
        </button>

        {/* Right side - can add user menu, settings, etc. */}
        <div className="flex items-center gap-4">
          {/* Add future items here */}
        </div>
      </div>
    </header>
  );
}