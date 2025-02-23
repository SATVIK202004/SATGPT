import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

const BASE_MAX_TOKENS = 8190;
const MAX_HISTORY = 8190;
const RETRY_DELAYS = [1000, 2000, 4000, 8000]; // Exponential backoff

async function fetchWithRetry(messages: Message[], config: ApiConfig, attempt = 0): Promise<ModelResponse> {
  try {
    const trimmedMessages = messages.slice(-MAX_HISTORY);
    const dynamicMaxTokens = Math.min(BASE_MAX_TOKENS, 12000 - JSON.stringify(trimmedMessages).length); // Dynamic token limit

    const modelSettings = {
      temperature: config.model.includes('deepseek') ? 0.5 : 0.7,
      top_p: config.model.includes('deepseek') ? 0.85 : 0.9,
    };

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
        max_tokens: dynamicMaxTokens,
        ...modelSettings,
        response_format: {
          type: "text",
          structure: {
            context_awareness: "Checks if the response requires historical context.",
            deep_thinking: "Breaks down the question from multiple perspectives.",
            analysis: "Includes pros, cons, edge cases, and potential pitfalls.",
            reasoning: "Logical deduction, analogy-based thinking, and pattern recognition.",
            adaptive_depth: "Adjusts the depth of response based on complexity.",
            answer: "Final structured response optimized for clarity and impact."
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
    console.error(`API Error (Attempt ${attempt + 1}):`, error);

    if (error instanceof Error && error.message.includes('rate limit') && attempt < RETRY_DELAYS.length) {
      await new Promise(res => setTimeout(res, RETRY_DELAYS[attempt]));
      return fetchWithRetry(messages, config, attempt + 1);
    }

    if (error instanceof Error && /401|403/.test(error.message)) {
      return { content: "⚠️ Authentication failed! Please check your API key.", error: error.message };
    }

    return {
      content: error instanceof Error ? 
        `🚨 Error: ${error.message}. Try again later or switch models.` :
        'An unexpected error occurred. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleGroqApi(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  return fetchWithRetry(messages, config);
}
