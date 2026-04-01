//Path: src\components\layout\TemplateList.tsx (FINAL VERSION - Use appStore)
'use client';

import { useState } from 'react';
import { Template } from '@/types';
import { mockTemplates } from '@/lib/mock-data';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { motion, AnimatePresence } from 'framer-motion';

export function TemplateList() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['General']));
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const openTemplateModal = useAppStore((state) => state.openTemplateModal);

  // Group templates by category
  const templatesByCategory = mockTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  const categories = ['HR', 'Technical', 'Business'] as const;

  const toggleFolder = (category: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedFolders(newExpanded);
  };

  const handleTemplateClick = (template: Template) => {
    // Open modal via store
    openTemplateModal(template);
  };

  return (
    <div className="space-y-2">
      {/* Main Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-2 py-1 hover:bg-muted rounded-lg transition-colors"
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          TEMPLATES
        </h3>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1 overflow-hidden"
          >
            {/* Render folders */}
            {categories.map((category) => {
              const templates = templatesByCategory[category] || [];
              const isFolderExpanded = expandedFolders.has(category);

              return (
                <div key={category}>
                  {/* Folder Header */}
                  <button
                    onClick={() => toggleFolder(category)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                  >
                    {isFolderExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    <span>📁 {category}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {templates.length}
                    </span>
                  </button>

                  {/* Templates in Folder */}
                  {isFolderExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="relative"
                          onMouseEnter={() => setHoveredTemplate(template.id)}
                          onMouseLeave={() => setHoveredTemplate(null)}
                        >
                          <button
                            onClick={() => handleTemplateClick(template)}
                            className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-muted hover:text-gold rounded-md transition-colors text-left"
                          >
                            <span className="text-base">{template.icon}</span>
                            <span className="flex-1 truncate text-xs">{template.name}</span>
                          </button>

                          {/* Tooltip on Hover */}
                          {hoveredTemplate === template.id && (
                            <div className="absolute left-full top-0 ml-2 z-50 w-72 p-3 bg-popover border border-border rounded-lg shadow-lg">
                              <div className="text-xs font-semibold mb-1">
                                {template.icon} {template.name}
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                {template.description}
                              </div>
                              <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono text-muted-foreground max-h-24 overflow-y-auto">
                                {template.prompt}
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground italic">
                                Click to use this template
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
