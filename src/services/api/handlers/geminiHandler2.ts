import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleGemini2Api(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  try {
    const systemPrompt = getSystemPrompt(messages.some(msg => msg.content.includes('SAT GPT')));
    
    // Format messages into a conversation string with enhanced thinking prompts
    const conversation = messages.map(msg => {
      if (msg.role === 'user') {
        return `Human: ${msg.content}\n\nPlease follow this structured approach:\n` +
               `1. First, analyze the question and break it down into key components\n` +
               `2. Consider relevant context and potential implications\n` +
               `3. Form a logical reasoning chain\n` +
               `4. Provide a comprehensive answer`;
      }
      return `Assistant: ${msg.content}`;
    }).join('\n\n');

    const fullPrompt = `${systemPrompt}\n\n${conversation}`;

    const response = await fetch(`${config.url}?key=${config.key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          stopSequences: ["Human:", "Assistant:"]
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Gemini API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Unknown error from Gemini API');
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    let content = data.candidates[0].content.parts[0].text.trim();
    content = content.replace(/^Assistant:\s*/i, '');

    // Enhanced response formatting with detailed sections
    if (!content.includes('Thinking Process:') && !content.includes('Reasoning:')) {
      const segments = content.split('\n\n');
      const thinkingProcess = segments[0] || '';
      const reasoning = segments.length > 1 ? segments[1] : '';
      const answer = segments.slice(2).join('\n\n') || content;

      content = `Thinking Process:\n${'-'.repeat(40)}\n` +
                `• Analysis of Key Components:\n${thinkingProcess}\n\n` +
                
                `Reasoning Process:\n${'-'.repeat(40)}\n` +
                `• Logical Framework:\n${reasoning}\n` +
                `• Implications Considered:\n` +
                `  - Context and relevance\n` +
                `  - Potential impact\n` +
                `  - Alternative perspectives\n\n` +
                
                `Detailed Answer:\n${'-'.repeat(40)}\n${answer}`;
    }

    return { content };
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    let errorMessage = 'An error occurred while processing your request.';
    
    if (error instanceof Error) {
      if (error.message.includes('SAFETY')) {
        errorMessage = 'The response was blocked due to safety concerns. Please try rephrasing your question.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again in a few moments.';
      } else if (error.message.includes('Invalid response format')) {
        errorMessage = 'Received an invalid response format. Please try again.';
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


