import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleAzureApi(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  try {
    const systemPrompt = getSystemPrompt(messages.some(msg => msg.content.includes('SAT GPT')));
    
    // Enhanced prompt to encourage structured thinking
    const enhancedMessages = [
      { 
        role: 'system', 
        content: `${systemPrompt}\n\nPlease structure your responses with the following components:
          1. Initial Analysis: Break down the question and identify key aspects.
          2. Deep Thinking: Consider multiple perspectives and implications.
          3. Logical Reasoning: Form a clear chain of thought.
          4. Final Response: Provide a comprehensive answer.
          
          Always maintain clarity and logical flow in your responses.`
      },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content,
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
        messages: enhancedMessages,
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
        stream: false  // Removed response_format
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

    let content = data.choices[0].message.content;

    return { content };
  } catch (error) {
    console.error('Azure API Error:', error);
    
    let errorMessage = 'An error occurred while processing your request.';
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please check your API key.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again in a few moments.';
      } else if (error.message.includes('Invalid response format')) {
        errorMessage = 'The model response was not in the expected format. Please try again.';
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
