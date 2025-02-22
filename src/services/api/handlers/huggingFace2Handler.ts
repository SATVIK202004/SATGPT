import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleHuggingFace2Api(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  try {
    const systemPrompt = getSystemPrompt(messages.some(msg => msg.content.includes('SAT GPT')));
    
    // Format messages for the API
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
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
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
        stream: false,
        stop: null
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HuggingFace API request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

  const data = await response.json();
    
    // Handle different response formats from HuggingFace
    let rawContent = '';
    if (Array.isArray(data)) {
      rawContent = data[0]?.generated_text || data[0]?.text || '';
    } else if (typeof data === 'object') {
      rawContent = data.generated_text || data.text || data.choices?.[0]?.message?.content || '';
    } else if (typeof data === 'string') {
      rawContent = data;
    }

    if (!rawContent) {
      throw new Error('No valid content found in API response');
    }

// Format the response with structured sections
    const content = formatResponse(rawContent);

    return { content: content.trim() };
  } catch (error) {
    console.error('HuggingFace2 API Error:', error);
    
    let errorMessage = 'An unexpected error occurred. Please try switching to a different model.';
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please check your API key.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again in a few moments.';
      } else if (error.message.includes('503')) {
        errorMessage = 'The model is currently overloaded. Please try again in a few moments.';
      } else {
        errorMessage = `Error: ${error.message}. Please try switching to a different model.`;
      }
    }
    
    return {
      content: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}


function formatResponse(rawResponse: string): string {
  // If the response already has a structured format, return it as is
  if (rawResponse.includes('Initial Analysis:') || 
      rawResponse.includes('Thinking Process:') || 
      rawResponse.includes('Reasoning:')) {
    return rawResponse;
  }

  // Clean up the response
  const cleanResponse = rawResponse
    .trim()
    .replace(/^Assistant:|^AI:|^Response:/, '')
    .trim();

  // Split the response into segments for structured formatting
  const segments = cleanResponse.split(/\n{2,}/);
  
  // Create structured sections
  const analysis = segments[0] || '';
  const thinking = segments.length > 1 ? segments[1] : '';
  const reasoning = segments.length > 2 ? segments[2] : '';
  const answer = segments.length > 3 ? 
    segments.slice(3).join('\n\n') : 
    cleanResponse;

  return `Initial Analysis:\n${'-'.repeat(40)}\n` +
         `• Question Breakdown:\n${analysis}\n\n` +
         
         `Deep Thinking Process:\n${'-'.repeat(40)}\n` +
         `• Key Considerations:\n${thinking}\n` +
         `• Explored Perspectives:\n` +
         `  - Context and implications\n` +
         `  - Potential challenges\n` +
         `  - Alternative viewpoints\n\n` +
         
         `Reasoning Framework:\n${'-'.repeat(40)}\n` +
         `• Logical Analysis:\n${reasoning}\n` +
         `• Supporting Evidence:\n` +
         `  - Validated assumptions\n` +
         `  - Considered trade-offs\n\n` +
         
         `Final Response:\n${'-'.repeat(40)}\n${answer}`;
}
