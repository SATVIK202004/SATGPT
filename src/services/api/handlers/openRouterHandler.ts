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
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SAT GPT',
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
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenRouter API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('SATGPT REUQUEST YOU TO USE OTHER MODEL, IF ANY PROBLEM OCCURS FOR ANY INCONVIENCE');
    }

    return { content: data.choices[0].message.content };
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    return {
      content: error instanceof Error ? 
        `Error: ${error.message}. Please try again or switch to a different model.` :
        'An unexpected error occurred. Please try again or switch to a different model.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
