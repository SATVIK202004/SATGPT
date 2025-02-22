import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleHuggingFaceApi(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
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
        temperature: 0.5,
        max_tokens: 2048,
        top_p: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HuggingFace API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from HuggingFace API');
    }

    return { content: data.choices[0].message.content };
  } catch (error) {
    console.error('HuggingFace API Error:', error);
    return {
      content: 'Error occurred while processing your request. Please try again or switch to a different model.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
