export const OPENROUTER_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
  defaultModel: 'deepseek/deepseek-r1:free',
  maxTokens: 2000,
  temperature: 0.7,
  topP: 0.9,
  retryCount: 3,
  appInfo: {
    name: 'SAT GPT',
    referer: window.location.origin
  }
};
