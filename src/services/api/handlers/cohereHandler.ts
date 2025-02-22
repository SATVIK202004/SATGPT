import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleCohereApi(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  try {
    const systemPrompt = getSystemPrompt(messages.some(msg => msg.content.includes('SAT GPT')));

    const chatHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'User' : 'Chatbot',
      message: msg.content
    }));

    const currentMessage = messages[messages.length - 1].content;

    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        message: currentMessage,
        chat_history: chatHistory,
        model: 'command',
        temperature: 0.8,
        prompt_truncation: 'AUTO',
        stream: false,
        citation_quality: 'accurate',
        connectors: [],
        documents: [],
        preamble: systemPrompt,
        response_format: {
          type: "text",
          structure: {
            thinking: "Analysis and breakdown of the question",
            reasoning: "Logical path to the answer",
            answer: "Final comprehensive response"
          }
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Cohere API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.text || typeof data.text !== 'string') {
      throw new Error('Invalid response format from Cohere API');
    }

    const textResponse = data.text.trim();
    
    // Ensure the response includes thinking and reasoning
    if (!textResponse.includes("Thinking:")) {
      textResponse = "Thinking: Analyzing the question to determine the key aspects.\n\n" + textResponse;
    }
    if (!textResponse.includes("Reasoning:")) {
      textResponse += "\n\nReasoning: Based on logical inference and relevant data, the answer is derived.";
    }

    return { content: textResponse };
  } catch (error) {
    console.error('Cohere API Error:', error);
    
    let errorMessage = 'Error occurred while processing your request. Please try again.';
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key') || error.message.includes('Unauthorized')) {
        errorMessage = 'Authentication failed. Please check your API key.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again in a few moments.';
      } else if (error.message.includes('Invalid response format')) {
        errorMessage = 'Received an invalid response from Cohere. Please try again.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }

    return {
      content: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
