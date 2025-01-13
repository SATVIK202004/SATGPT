import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleCohereApi(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`,
        'accept': 'application/json'
      },
      body: JSON.stringify({
        message: messages[messages.length - 1].content,
        model: config.model,
        preamble: getSystemPrompt(messages.some(msg => msg.content.includes('SAT GPT'))),
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.text || data.message || data.response || '' };
  } catch (error) {
    console.error('Cohere API Error:', error);
    return {
      content: 'Error occurred while processing your request. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
