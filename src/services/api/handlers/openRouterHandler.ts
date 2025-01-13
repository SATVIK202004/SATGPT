import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleOpenRouterApi(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: getSystemPrompt(messages.some(msg => msg.content.includes('SAT GPT'))) },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    return {
      content: 'Error occurred while processing your request. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}