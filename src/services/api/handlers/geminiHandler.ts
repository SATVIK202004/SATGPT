import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleGeminiApi(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  const response = await fetch(`${config.url}?key=${config.key}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ 
          text: `${getSystemPrompt(messages.some(msg => msg.content.includes('SAT GPT')))}\n\nUser: ${messages[messages.length - 1].content}`
        }],
      }],
    }),
  });
  const data = await response.json();
  return { content: data.candidates[0].content.parts[0].text };
}