import { ApiConfig } from '../types/api';

export const modelConfigs: Record<string, ApiConfig> = {
  'Mistral ai': {
    url: 'https://api.mistral.ai/v1/chat/completions',
    key: '1uhB5Phsr3TTxFTCuSMxgqCtFyLX16PT',
    model: 'mistral-large-2411',
  },
  'jamba': {
    url: 'https://api.ai21.com/studio/v1/chat/completions',
    key: 'ngjb5IH1SKDubrKZBbZKctWQNTnOox0B',
    model: 'jamba-instruct',
  },
  'Meta': {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: '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',
    model: 'llama-3.3-70b-specdec',
    backupKeys: [
      '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',
      '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',
      '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'
    ]
  },
  'llama': {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: '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',
    model: 'llama-3.2-90b-vision-preview',
   
  },
  'Groq': {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: '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',
    model: 'llama-3.3-70b-versatile',
    backupKeys: [
      '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',
      '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',
      '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'
    ]
  },
  'llm': {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: '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',
    model: 'llama-3.2-90b-vision-preview',
    backupKeys: [
      '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',
      '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',
      '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'
    ]
  },
  'Gpt-4o mini': {
    url: 'https://models.inference.ai.azure.com/chat/completions',
    key: '',
    model: 'gpt-4o-mini',
  },
  'Qwen-2.5': {
    url: 'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-32B-Instruct/v1/chat/completions',
    key: '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',
    model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
  },
  'Cohere': {
    url: 'https://api.cohere.com/v1/chat',
    key: 'biiGwJPbdxqo7Fb6lOrIhSYrESSxrHG7TpyGczpM',
    model: 'c4ai-aya-expanse-32b',
  },
  'DeepSeek-R1': {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: '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',
    model: 'deepseek-r1-distill-llama-70b',
  },
  'GPT-4o': {
    url: 'https://models.inference.ai.azure.com/chat/completions',
    key: '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',
    model: 'gpt-4o',
  },
  'NVIDIA Deepseek-R1': {
    url: 'https://integrate.api.nvidia.com/v1/chat/completions',
    key: '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',
    model: 'deepseek-ai/deepseek-r1',
  },
  'Gemini-2': {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    key: 'AIzaSyD9hLITPgnH4NwQ3DVK2GiyCm1J77IiPjA',
    model: 'gemini-2.0-flash-thinking-exp',
  },
}
