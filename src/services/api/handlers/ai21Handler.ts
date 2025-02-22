import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleAi21Api(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  try {
    const systemPrompt = getSystemPrompt(messages.some(msg => msg.content.includes('SAT GPT')));
    
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: formattedMessages,
        documents: [],
        tools: [],
        n: 1,
        max_tokens: 2048,
        temperature: 0.4,
        top_p: 1,
        stop: [],
        response_format: {
          type: "text",
          structure: {
            thinking: "Carefully evaluating the provided messages to extract relevant context and intent.",
            reasoning: "Utilizing structured analysis to ensure the generated response aligns with the conversation and maintains coherence.",
            answer: "Final comprehensive response"
          }
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `AI21 API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response format from AI21 API');
    }

    const responseContent = data.choices[0].message.content.trim();
    
    return {
      thinking: "Analyzing the conversation to understand user intent and generate a meaningful response.",
      reasoning: "Applying logical structuring and language processing techniques to craft an accurate and relevant reply.",
      content: responseContent
    };
  } catch (error) {
    console.error('AI21 API Error:', error);
    return {
      thinking: "Encountered an issue while processing the request, assessing possible causes.",
      reasoning: "Likely reasons include API response inconsistencies, network errors, or invalid data structures.",
      content: 'Error occurred while processing your request. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
