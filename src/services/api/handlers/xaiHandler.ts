import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleXaiApi(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
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
  const data = await response.json();
  return { content: data.choices[0].message.content };
}