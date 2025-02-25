import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleGemini2Api(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  try {
    const systemPrompt = getSystemPrompt(messages.some(msg => msg.content.includes('SAT GPT')));

    // Format messages into a conversation string with structured thinking prompts
    const conversation = messages.map(msg => {
      if (msg.role === 'user') {
        return `Human: ${msg.content}\n\nPlease follow this structured approach:\n` +
               `1. Identify the key components of the question.\n` +
               `2. Evaluate possible interpretations and assumptions.\n` +
               `3. Consider alternative viewpoints and counterarguments.\n` +
               `4. Construct a step-by-step reasoning chain.\n` +
               `5. Provide a well-structured, detailed response.`;
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

    // Ensure the response structure is valid before accessing it
    const candidates = data.candidates || [];
    if (!candidates.length || !candidates[0]?.content?.parts?.length) {
      throw new Error('Invalid response format from Gemini API');
    }

    let content = candidates[0].content.parts.map(part => part.text).join('\n').trim();
    content = content.replace(/^Assistant:\s*/i, '');

    // Enhanced structured response formatting
    if (!content.includes('Thinking Process:') && !content.includes('Reasoning:')) {
      const segments = content.split('\n\n');
      const thinkingProcess = segments[0] || '';
      const reasoning = segments.length > 1 ? segments[1] : '';
      const answer = segments.slice(2).join('\n\n') || content;

      content = `**Thinking Process:**\n${'-'.repeat(40)}\n` +
                `• **Identifying Key Components:**\n${thinkingProcess}\n\n` +
                
                `**Reasoning Process:**\n${'-'.repeat(40)}\n` +
                `• **Step-by-Step Logical Framework:**\n${reasoning}\n` +
                `• **Alternative Perspectives & Counterarguments:**\n` +
                `  - Considering edge cases\n` +
                `  - Evaluating different viewpoints\n` +
                `  - Weighing implications\n\n` +
                
                `**Final Answer:**\n${'-'.repeat(40)}\n${answer}`;
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
        errorMessage = 'The API response format was unexpected. Please try again later.';
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
