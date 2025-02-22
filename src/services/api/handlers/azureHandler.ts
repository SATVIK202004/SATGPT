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
          1. Initial Analysis: Break down the question and identify key aspects
          2. Deep Thinking: Consider multiple perspectives and implications
          3. Logical Reasoning: Form a clear chain of thought
          4. Final Response: Provide a comprehensive answer
          
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
        response_format: {
          type: "text",
          structure: {
            initial_analysis: "Breakdown of the question and key components",
            deep_thinking: "Multiple perspectives and implications",
            logical_reasoning: "Clear chain of thought",
            final_response: "Comprehensive answer"
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

    let content = data.choices[0].message.content;

    // If the response doesn't already have the structured format, add it
    if (!content.includes('Initial Analysis:') && 
        !content.includes('Deep Thinking:') && 
        !content.includes('Logical Reasoning:')) {
      
      // Split content into meaningful segments
      const segments = content.split('\n\n');
      const analysis = segments[0] || '';
      const thinking = segments.length > 1 ? segments[1] : '';
      const reasoning = segments.length > 2 ? segments[2] : '';
      const finalResponse = segments.slice(3).join('\n\n') || content;

      content = `Initial Analysis:\n${'-'.repeat(40)}\n` +
                `• Question Components:\n${analysis}\n\n` +
                
                `Deep Thinking:\n${'-'.repeat(40)}\n` +
                `• Multiple Perspectives:\n${thinking}\n` +
                `• Key Considerations:\n` +
                `  - Context and implications\n` +
                `  - Potential challenges\n` +
                `  - Alternative viewpoints\n\n` +
                
                `Logical Reasoning:\n${'-'.repeat(40)}\n` +
                `• Reasoning Chain:\n${reasoning}\n` +
                `• Supporting Evidence:\n` +
                `  - Validated assumptions\n` +
                `  - Considered trade-offs\n\n` +
                
                `Final Response:\n${'-'.repeat(40)}\n${finalResponse}`;
    }

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
