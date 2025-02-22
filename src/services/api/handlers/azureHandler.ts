import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleAzureApi(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
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
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
        response_format: {
          type: "text",
          structure: {
            thinking: "Analysis and breakdown of the question",
            reasoning: "Logical path to the answer",
            answer: "Final comprehensive response"
          }
        },
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Azure API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Azure API');
    }

    // Process the response to ensure proper formatting
    let content = data.choices[0].message.content;
    
    // If the response doesn't already have the structure, format it
    if (!content.includes('Thinking Process:') && !content.includes('Reasoning:')) {
      content = `Thinking Process:\n${'-'.repeat(20)}\n${content.slice(0, 200)}...\n\n` +
                `Reasoning:\n${'-'.repeat(20)}\n${content.slice(200, 400)}...\n\n` +
                `Answer:\n${'-'.repeat(20)}\n${content}`;
    }

    return { content };
  } catch (error) {
    console.error('Azure API Error:', error);
    
    let errorMessage = 'An error occurred while processing your request.';
    if (error instanceof Error) {
      if (error.message.includes('Invalid response format')) {
        errorMessage = 'The model response was not in the expected format. Please try again.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again in a few moments.';
      } else {
        errorMessage = `Error: ${error.message}. Please try again or switch to a different model.`;
      }
    }

    return {
      content: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
