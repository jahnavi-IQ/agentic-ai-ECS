//Path: src\components\layout\ChatHistory.tsx
'use client';

import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, truncate } from '@/lib/utils';
import { MessageSquare, Search, Trash2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

export function ChatHistory() {
  const router = useRouter();
  const params = useParams();
  const { conversations, deleteConversation } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lazy initialization - Date.now() only runs once on mount
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Update current time every minute to refresh "Today/Yesterday" labels
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every 60 seconds
    
    return () => clearInterval(interval);
  }, []);

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Use useMemo to make grouping pure and memoized
  const groupedConversations = useMemo(() => {
    return {
      today: filteredConversations.filter((conv) => {
        const diff = currentTime - conv.updatedAt.getTime();
        return diff < 24 * 60 * 60 * 1000;
      }),
      yesterday: filteredConversations.filter((conv) => {
        const diff = currentTime - conv.updatedAt.getTime();
        return diff >= 24 * 60 * 60 * 1000 && diff < 48 * 60 * 60 * 1000;
      }),
      older: filteredConversations.filter((conv) => {
        const diff = currentTime - conv.updatedAt.getTime();
        return diff >= 48 * 60 * 60 * 1000;
      }),
    };
  }, [filteredConversations, currentTime]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Chat History
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedConversations).map(([key, convs]) => {
          if (convs.length === 0) return null;
          
          return (
            <div key={key} className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground px-2">
                {key === 'today' ? 'Today' : key === 'yesterday' ? 'Yesterday' : 'Older'}
              </h4>
              {convs.map((conv, index) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                      params.id === conv.id
                        ? 'bg-gold/10 text-gold'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => router.push(`/chat/${conv.id}`)}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {truncate(conv.title, 30)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(conv.updatedAt, currentTime)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          );
        })}
      </div>

      {filteredConversations.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          {searchQuery ? 'No conversations found' : 'No conversations yet'}
        </div>
      )}
    </div>
  );
}