import { OpenRouterConfig } from '../../../types/api';

export const DEFAULT_CONFIG: OpenRouterConfig = {
  url: 'https://openrouter.ai/api/v1/chat/completions',
  key: process.env.OPENROUTER_API_KEY || '',
  model: 'openai/gpt-3.5-turbo',
  maxTokens: 1000,
  temperature: 0.7,
  topP: 0.9,
  retryCount: 2
};