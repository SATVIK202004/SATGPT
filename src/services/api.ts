import { ApiConfig, ModelResponse } from '../types/api';
import { Message } from '../types';
import {
  handleMistralApi,
  handleGeminiApi,
  handleGroqApi,
  handleXaiApi,
  handleOpenRouterApi,
  handleDeepInfraApi,
  handleCohereApi,
  handleGlmApi,
  handleAi21Api
} from './api/handlers';

export async function sendMessage(
  messages: Message[],
  config: ApiConfig
): Promise<ModelResponse> {
  try {
    if (!config || !config.url) {
      throw new Error('Invalid API configuration');
    }

    let response: ModelResponse;

    switch (config.url) {
      case 'https://api.mistral.ai/v1/chat/completions':
        response = await handleMistralApi(messages, config);
        break;

      case 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent':
        response = await handleGeminiApi(messages, config);
        break;

      case 'https://api.groq.com/openai/v1/chat/completions':
        response = await handleGroqApi(messages, config);
        break;

      case 'https://api.x.ai/v1/chat/completions':
        response = await handleXaiApi(messages, config);
        break;

      case 'https://openrouter.ai/api/v1/chat/completions':
        response = await handleOpenRouterApi(messages, config);
        break;

      case 'https://api.deepinfra.com/v1/openai/chat/completions':
        response = await handleDeepInfraApi(messages, config);
        break;

      case 'https://api.cohere.com/v1/chat':
        response = await handleCohereApi(messages, config);
        break;

      case 'https://open.bigmodel.cn/api/paas/v4/chat/completions':
        response = await handleGlmApi(messages, config);
        break;

      case 'https://api.ai21.com/studio/v1/chat/completions':
        response = await handleAi21Api(messages, config);
        break;

      default:
        throw new Error(`Unsupported model provider: ${config.url}`);
    }

    if (!response || !response.content) {
      throw new Error('Invalid response from API');
    }

    return response;
  } catch (error) {
    console.error('API Error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      content: 'Error occurred while processing your request. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}