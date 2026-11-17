/**
 * Predefined LLM Providers matching ARDA backend agentruntime implementation.
 * References:
 * - arda/services/gateway/server.go
 * - arda/pkg/agentruntime/provider.go
 */

export interface LLMProviderMeta {
  id: string;
  name: string;
  aliases: string[];
  models: string[];
  description: string;
  placeholderKey: string;
}

export const ARDA_LLM_PROVIDERS: LLMProviderMeta[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    aliases: ['gpt'],
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-preview', 'o1-mini'],
    description: 'Direct OpenAI integration for GPT-4o, reasoning models & function calling',
    placeholderKey: 'sk-proj-...',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    aliases: ['claude'],
    models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
    description: 'Direct Anthropic Messages API for Claude 3.5 Sonnet & Opus',
    placeholderKey: 'sk-ant-api03-...',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    aliases: ['gemini'],
    models: [
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro-latest',
    ],
    description: 'Google DeepMind Gemini API for multimodal reasoning and fast execution',
    placeholderKey: 'AIzaSy...',
  },
  {
    id: 'groq',
    name: 'Groq',
    aliases: ['groqcloud'],
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    description: 'Groq LPU Inference Engine for ultra-low latency execution',
    placeholderKey: 'gsk_...',
  },
  {
    id: 'grok',
    name: 'xAI Grok',
    aliases: ['xai'],
    models: ['grok-beta', 'grok-2'],
    description: 'xAI API for Grok reasoning models',
    placeholderKey: 'xai-...',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    aliases: [],
    models: ['openrouter/auto', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.3-70b-instruct'],
    description: 'Unified routing gateway to open-source and proprietary models',
    placeholderKey: 'sk-or-v1-...',
  },
];

export const getProviderDisplayName = (providerId: string): string => {
  const clean = providerId.trim().toLowerCase();
  const match = ARDA_LLM_PROVIDERS.find(
    (p) => p.id === clean || p.aliases.includes(clean)
  );
  return match ? `${match.name} (${match.id})` : providerId;
};

export const getProviderModels = (providerId: string): string[] => {
  const clean = providerId.trim().toLowerCase();
  const match = ARDA_LLM_PROVIDERS.find(
    (p) => p.id === clean || p.aliases.includes(clean)
  );
  return match ? match.models : [];
};

export const getDefaultModelForProvider = (providerId: string): string => {
  const models = getProviderModels(providerId);
  return models.length > 0 ? models[0] : '';
};

