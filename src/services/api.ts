import { ApiConfig, ModelResponse } from '../types/api';
import { Message } from '../types';
import {
  handleMistralApi,
  handleGeminiApi,
  handleGemini2Api,
  handleGroqApi,
  handleXaiApi,
  handleOpenRouterApi,
  handleDeepInfraApi,
  handleCohereApi,
  handleGlmApi,
  handleAi21Api,
  handleAzureApi,
  handleHuggingFaceApi,
  handleHuggingFace2Api,
  handleTogetherApi,
  handleNvidiaApi
} from './api/handlers';

let keyRotationIndex: Record<string, number> = {};

async function tryWithBackupKeys(
  handler: (messages: Message[], config: ApiConfig) => Promise<ModelResponse>,
  messages: Message[],
  config: ApiConfig
): Promise<ModelResponse> {
  const allKeys = [config.key, ...(config.backupKeys || [])];
  
  if (!keyRotationIndex[config.url]) {
    keyRotationIndex[config.url] = 0;
  }

  for (let attempt = 0; attempt < allKeys.length; attempt++) {
    const currentIndex = (keyRotationIndex[config.url] + attempt) % allKeys.length;
    const currentKey = allKeys[currentIndex];

    try {
      const response = await handler(messages, { ...config, key: currentKey });
      if (!response.error) {
        keyRotationIndex[config.url] = (currentIndex + 1) % allKeys.length;
        return response;
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed with key ${currentKey}:`, error);
      continue;
    }
  }

  return {
    content: 'All API keys have been exhausted. Please try again later or switch to a different model.',
    error: 'API_KEYS_EXHAUSTED'
  };
}

export async function sendMessage(
  messages: Message[],
  config: ApiConfig
): Promise<ModelResponse> {
  try {
    if (!config || !config.url) {
      throw new Error('Invalid API configuration');
    }

    let handler;
    switch (config.url) {
      case 'https://api.mistral.ai/v1/chat/completions':
        handler = handleMistralApi;
        break;
      case 'https://api.groq.com/openai/v1/chat/completions':
        handler = handleGroqApi;
        break;
      case 'https://api.ai21.com/studio/v1/chat/completions':
        handler = handleAi21Api;
        break;
      case 'https://api.deepinfra.com/v1/openai/chat/completions':
        handler = handleDeepInfraApi;
        break;
      case 'https://api.cohere.com/v1/chat':
        handler = handleCohereApi;
        break;
      case 'https://open.bigmodel.cn/api/paas/v4/chat/completions':
        handler = handleGlmApi;
        break;
      case 'https://models.inference.ai.azure.com/chat/completions':
        handler = handleAzureApi;
        break;
      case 'https://openrouter.ai/api/v1/chat/completions':
        handler = handleOpenRouterApi;
        break;
      case 'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B/v1/chat/completions':
        handler = handleHuggingFaceApi;
        break;
      case 'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-32B-Instruct/v1/chat/completions':
        handler = handleHuggingFace2Api;
        break;
      case 'https://api.together.xyz/v1/chat/completions':
        handler = handleTogetherApi;
        break;
      case 'https://integrate.api.nvidia.com/v1/chat/completions':
        handler = handleNvidiaApi;
        break;
      case 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent':
        handler = handleGemini2Api;
        break;
      default:
        throw new Error(`Unsupported model provider: ${config.url}`);
    }

    // Use backup keys for Groq-based models
    if (config.url === 'https://api.groq.com/openai/v1/chat/completions' && config.backupKeys) {
      return await tryWithBackupKeys(handler, messages, config);
    }

    const response = await handler(messages, config);
    
    if (!response || (!response.content && !response.error)) {
      throw new Error('Invalid response from API handler');
    }

    return response;
  } catch (error) {
    console.error('API Error:', error);
    return {
      content: 'An error occurred while processing your request. Please try again or switch to a different model.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
