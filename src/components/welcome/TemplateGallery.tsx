//Path: src/components/welcome/TemplateGallery.tsx
'use client';

import { mockTemplates } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { generateId } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import { motion } from 'framer-motion';

export function TemplateGallery() {
  const router = useRouter();
  const addConversation = useAppStore((state) => state.addConversation);

  const handleUseTemplate = (template: typeof mockTemplates[0]) => {
    const newConv = {
      id: generateId(),
      title: `${template.name} Session`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
    };
    addConversation(newConv);
    router.push(`/chat/${newConv.id}?template=${template.id}`);
  };

  return (
    <div className="py-12">
      <h2 className="text-2xl font-bold mb-6 text-gold">Quick Start Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 hover:border-gold/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl leading-none">{template.icon}</span>
                <h3 className="text-lg font-semibold leading-none group-hover:text-gold transition-colors">
                  {template.name}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {template.description}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full group-hover:border-gold group-hover:text-gold"
                onClick={() => handleUseTemplate(template)}
              >
                Use Template
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}