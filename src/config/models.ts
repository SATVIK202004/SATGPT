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
    model: 'jamba-1.5-large',
  },
  'Meta': {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: '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',
    model: 'llama-3.3-70b-specdec',
  },
  'llm': {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: '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',
    model: 'llama-3.1-70b-versatile',
  },
  'Groq': {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: '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',
    model: 'llama-3.3-70b-versatile',
  },
  'llama': {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: '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',
    model: 'llama-3.2-90b-vision-preview',
  },
  'M2': {
    url: 'https://api.deepinfra.com/v1/openai/chat/completions',
    key: 'yWLkjJ1C5GW9ew78IFtLmeNje5O95Gkx',
    model: 'meta-llama/Llama-3.3-70B-Instruct',
  },
  'DeepInfra': {
    url: 'https://api.deepinfra.com/v1/openai/chat/completions',
    key: 'a1ZiHJ7yJSmPUi6H29rXaaYskdmt3Fe1',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  },
  'Cohere': {
    url: 'https://api.cohere.com/v1/chat',
    key: 'biiGwJPbdxqo7Fb6lOrIhSYrESSxrHG7TpyGczpM',
    model: 'c4ai-aya-expanse-32b',
  },
  'GLM-4': {
    url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    key: 'f00ec615083a48e7b8eb25b126144313.yNnz402kXJV5ie4y',
    model: 'glm-4-plus',
  },
}
