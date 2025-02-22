import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

const NVIDIA_DEFAULTS = {
  temperature: 0.2,
  top_p: 0.7,
  max_tokens: 1024,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  stop: null,
  stream: true
};

export async function handleNvidiaApi(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  try {
    // Format messages to match NVIDIA's expected format
    const formattedMessages = [
      { role: 'system', content: getSystemPrompt(messages.some(msg => msg.content.includes('SAT GPT'))) },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))
    ];

    // Prepare request with LangChain-like configuration
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`,
        'Accept': 'application/json',
        'User-Agent': 'SAT-GPT/1.0'
      },
      body: JSON.stringify({
        model: config.model,
        messages: formattedMessages,
        ...NVIDIA_DEFAULTS,
        n: 1,
        logit_bias: {},
        user: 'SAT-GPT'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NVIDIA API Error Response:', errorText);
      throw new Error(`NVIDIA API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Enhanced response handling with better type checking
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response from NVIDIA API: Empty or non-object response');
    }

    // Handle different response formats with type checking
    let content = '';
    if (Array.isArray(data.choices) && data.choices.length > 0) {
      const choice = data.choices[0];
      if (choice.message?.content) {
        content = choice.message.content;
      } else if (choice.text) {
        content = choice.text;
      } else {
        throw new Error('No valid content found in NVIDIA API response choice');
      }
    } else if (data.generated_text) {
      content = data.generated_text;
    } else {
      console.error('Unexpected NVIDIA API response format:', data);
      throw new Error('Unexpected response format from NVIDIA API');
    }

    // Process and clean the response
    content = content.trim();

    // Add usage information if available
    if (data.usage) {
      console.debug('NVIDIA API Usage:', data.usage);
    }

    return { content };
  } catch (error) {
    console.error('NVIDIA API Error:', error);
    
    // Enhanced error handling with specific error types
    let errorMessage: string;
    if (error instanceof TypeError) {
      errorMessage = 'Network or parsing error occurred. Please check your connection and try again.';
    } else if (error instanceof Error) {
      errorMessage = `NVIDIA API Error: ${error.message}. Please try again or switch to a different model.`;
    } else {
      errorMessage = 'An unexpected error occurred with the NVIDIA API. Please try again or switch to a different model.';
    }
    
    return {
      content: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
