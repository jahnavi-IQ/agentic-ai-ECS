// Path: src/components/chat/ConnectorBar.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Lightbulb, Palette, Brain, Check, CheckCircle, Zap } from 'lucide-react';
import { useAppStore, getAvailableStyles } from '@/store/appStore';
import { mockModels } from '@/lib/mock-data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

export function ConnectorBar() {
  const { 
    activeConnectors, 
    toggleConnector, 
    selectedModel, 
    setModel,
    selectedStyle,              
    updateStyleFromSelection    
  } = useAppStore();
  
  const [styleDialogOpen, setStyleDialogOpen] = useState(false);

  const connectorConfig = [
    {
      type: 'web_search',
      icon: Search,
      label: 'Web Search',
      description: 'Search the internet for current information',
      implemented: false, 
    },
    {
      type: 'research',
      icon: Lightbulb,
      label: 'Deep Research',
      description: 'Multi-step research with citations',
      implemented: false, 
    },
  ];

  const styleOptions = getAvailableStyles();

  const handleStyleSelect = (style: string) => {
    
    toast.info('Style customization is under development', {
      description: 'This feature will be available in a future update.',
    });
    
    updateStyleFromSelection(style);
    setStyleDialogOpen(false);
  };

  // Check if model is implemented
  const isModelImplemented = (modelId: string): boolean => {
    // Claude, Mistral, and GPT-4 are fully implemented
    return modelId === 'claude-3' || modelId === 'mistral-large-3' || modelId === 'gpt-4';
  };

  const handleModelSelect = (model: typeof mockModels[0]) => {
    if (!isModelImplemented(model.id)) {
      toast.info(`${model.name} is under development`, {
        description: 'This model will be available in a future update. Please use Claude 3.5 Sonnet, Mistral Large 3 or GPT-4 Turbo.',
      });
      return;
    }
    
    setModel(model);
    toast.success(`Switched to ${model.name}`);
  };

  // Handle connector toggle with development message
  const handleConnectorToggle = (type: string) => {
    const config = connectorConfig.find(c => c.type === type);
    
    if (config && !config.implemented) {
      toast.info(`${config.label} is under development`, {
        description: 'This feature will be available in a future update.',
      });
      return;
    }
    
    toggleConnector(type);
  };

  const getProviderBadge = (provider: string) => {
    const badges: Record<string, { color: string; bg: string; label: string }> = {
      'aws-bedrock': { color: 'text-orange-300', bg: 'bg-orange-500/20', label: 'AWS Bedrock' },
      'openai': { color: 'text-green-300', bg: 'bg-green-500/20', label: 'OpenAI' },
      'google': { color: 'text-blue-300', bg: 'bg-blue-500/20', label: 'Google' },
      'qwen': { color: 'text-red-300', bg: 'bg-red-500/20', label: 'Qwen' },
    };
    return badges[provider] || { color: 'text-gray-300', bg: 'bg-gray-500/20', label: 'Unknown' };
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <TooltipProvider>
        {connectorConfig.map((config) => {
          const connector = activeConnectors.find((c) => c.type === config.type);
          const Icon = config.icon;

          return (
            <Tooltip key={config.type}>
              <TooltipTrigger asChild>
                <Button
                  variant={connector?.enabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleConnectorToggle(config.type)}
                  className={
                    connector?.enabled
                      ? 'bg-gold hover:bg-gold/90 text-black'
                      : 'hover:bg-transparent hover:border-gold hover:text-gold transition-colors' // ✅ Added hover:bg-transparent
                  }
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {config.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.description}</p>
                {!config.implemented && (
                  <p className="text-xs text-muted-foreground mt-1">🚧 Under development</p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Style Selector - Under Development */}
        <DropdownMenu open={styleDialogOpen} onOpenChange={setStyleDialogOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-transparent hover:border-gold hover:text-gold transition-colors" // ✅ Added hover:bg-transparent
            >
              <Palette className="w-4 h-4 mr-1" />
              Style: {selectedStyle}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              🚧 Under development
            </div>
            {styleOptions.map((style) => (
              <DropdownMenuItem
                key={style}
                onClick={() => handleStyleSelect(style)}
                className={selectedStyle === style ? 'bg-gold/10 text-gold' : ''}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{style}</span>
                  {selectedStyle === style && (
                    <Check className="w-4 h-4 text-gold" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Model Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-transparent hover:border-gold hover:text-gold transition-colors min-w-50 justify-between" // ✅ Added hover:bg-transparent
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span className="font-medium">{selectedModel.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-gold" />
                <div 
                  className={`w-2 h-2 rounded-full ${getProviderBadge(selectedModel.provider).bg} border border-current ${getProviderBadge(selectedModel.provider).color}`}
                  title={getProviderBadge(selectedModel.provider).label}
                />
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-87.5">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Available Models
            </div>
            {mockModels.map((model) => {
              const badge = getProviderBadge(model.provider);
              const isSelected = selectedModel.id === model.id;
              const implemented = isModelImplemented(model.id);
              
              return (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => handleModelSelect(model)}
                  className={`cursor-pointer ${isSelected ? 'bg-gold/10 border-l-2 border-gold' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{model.name}</span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-gold" />
                        )}
                        {/* Show status badge */}
                        {!implemented && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                            🚧 Dev
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${badge.bg} ${badge.color} font-medium`}>
                          {badge.label}
                        </span>
                        {/*  Token limits and pricing */}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Context window tooltip */}
      </TooltipProvider>
    </div>
  );
}