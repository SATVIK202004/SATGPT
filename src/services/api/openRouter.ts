import axios from 'axios';
import { Message } from '../../types';
import { ApiConfig } from '../../types/api';
import { ApiResponse } from './types';
import { SYSTEM_PROMPT } from './constants';
import { validateMessages, validateApiConfig } from './validation';
import { OPENROUTER_CONFIG } from '../../config/openRouter';

export async function handleOpenRouterApi(
  messages: Message[],
  config: ApiConfig
): Promise<ApiResponse> {
  try {
    validateMessages(messages);
    validateApiConfig(config);

    const response = await axios.post(
      config.url,
      {
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        max_tokens: OPENROUTER_CONFIG.maxTokens,
        temperature: OPENROUTER_CONFIG.temperature,
        top_p: OPENROUTER_CONFIG.topP
      },
      {
        headers: {
          'Authorization': `Bearer ${config.key}`,
          'HTTP-Referer': OPENROUTER_CONFIG.appInfo.referer,
          'X-Title': OPENROUTER_CONFIG.appInfo.name,
          'Content-Type': 'application/json',
          'OpenRouter-Retry-Count': OPENROUTER_CONFIG.retryCount.toString()
        }
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenRouter API');
    }

    return { content: response.data.choices[0].message.content };
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        content: 'An error occurred while processing your request.',
        error: {
          message: error.response?.data?.error?.message || error.message,
          status: error.response?.status,
          code: 'OPENROUTER_API_ERROR'
        }
      };
    }
    
    return {
      content: 'An unexpected error occurred.',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNEXPECTED_ERROR'
      }
    };
  }
}