// Path: src/components/layout/Sidebar.tsx
'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen, Sparkles, PlusCircle } from 'lucide-react';
import { ChatHistory } from './ChatHistory';
import { TemplateList } from './TemplateList';
import { AccountMenu } from './AccountMenu';
import { useAppStore } from '@/store/appStore';
import { motion, AnimatePresence } from 'framer-motion';

export function Sidebar() {
  const router = useRouter();
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  const handleNewChat = () => {
    router.push('/chat/new');
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <AnimatePresence mode="wait">
      {!sidebarCollapsed && (
        <motion.aside
          key="sidebar"
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-70 bg-card border-r border-border flex flex-col"
        >
          {/* Header */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              {/* Clickable Logo - Navigate to Home */}
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Sparkles className="w-6 h-6 text-gold" />
                <span className="font-bold text-lg">IGPT</span>
              </button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="hover:bg-muted"
              >
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            </div>

            {/* New Chat Button */}
            <Button
              onClick={handleNewChat}
              className="w-full bg-gold hover:bg-gold/90 text-black font-medium"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Chat History */}
            <div className="px-4 py-4">
              <ChatHistory />
            </div>

            {/* Templates */}
            <div className="px-4 py-4 border-t border-border">
              <TemplateList />
            </div>
          </div>

          {/* Account Menu */}
          <div className="p-4 border-t border-border">
            <AccountMenu />
          </div>
        </motion.aside>
      )}

      {sidebarCollapsed && (
        <motion.div
          key="collapsed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-12 bg-card border-r border-border flex flex-col items-center py-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-muted"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}