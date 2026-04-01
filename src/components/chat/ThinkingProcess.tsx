//Path: src/components/chat/ThinkingProcess.tsx
'use client';

import { ThinkingStep } from '@/types';
import { ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThinkingProcessProps {
  steps: ThinkingStep[];
}

export function ThinkingProcess({ steps }: ThinkingProcessProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate duration safely
  const getDuration = (): string => {
    if (steps.length === 0) return '0.00';
    
    const firstTimestamp = steps[0]?.timestamp;
    const lastTimestamp = steps[steps.length - 1]?.timestamp;
    
    if (!firstTimestamp || !lastTimestamp) return '0.00';
    
    const duration = (lastTimestamp.getTime() - firstTimestamp.getTime()) / 1000;
    return duration.toFixed(2);
  };

  return (
    <div className="bg-muted/50 rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/70 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm">
          <Brain className="w-4 h-4 text-gold" />
          <span className="font-medium">Thinking Process</span>
          <span className="text-muted-foreground">
            ({steps.length} step{steps.length !== 1 ? 's' : ''}, {getDuration()}s)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2 border-t border-border">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs text-gold font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">{step.step}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}