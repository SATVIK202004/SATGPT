import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

const MAX_TOKENS = 8190;
const MAX_HISTORY = 8190;

export async function handleGroqApi(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  try {
    const trimmedMessages = messages.slice(-MAX_HISTORY);

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: getSystemPrompt(trimmedMessages.some(msg => msg.content.includes('SAT GPT'))) },
          ...trimmedMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
        top_p: 0.9,
        response_format: {
          type: "text",
          structure: {
            thinking: "Analysis and breakdown of the question",
            reasoning: "Logical path to the answer",
            answer: "Final comprehensive response"
          }
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    return { content: data.choices[0].message.content };
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof Error && error.message.includes('rate limit')) {
      await new Promise(res => setTimeout(res, 1000));
      return handleGroqApi(messages, config);
    }

    return {
      content: error instanceof Error ? 
        `Error: ${error.message}. Please try again or switch to a different model.` :
        'An unexpected error occurred. Please try again or switch to a different model.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
