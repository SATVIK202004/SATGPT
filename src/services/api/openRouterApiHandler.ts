import { ApiConfig } from '../../types/api';
import { Message } from '../../types';

export async function handleOpenRouterApi(messages: Message[], config: ApiConfig): Promise<{ content: string, error?: string }> {
  try {
    const requestBody = {
      model: config.model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    };

    // Perform the API request to OpenRouter
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Check for errors in the response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API Error: ${response.status} - ${errorText}`);
      throw new Error(`OpenRouter API request failed: ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();
    
    // If the API response contains choices, return the content
    if (data.choices && data.choices.length > 0) {
      return { content: data.choices[0].message.content };
    } else {
      console.error('Unexpected response format from OpenRouter:', data);
      throw new Error('Unexpected response format from OpenRouter');
    }
  } catch (error) {
    // Handle network errors or any other errors
    console.error('OpenRouter API request failed:', error);
    return {
      content: 'Error occurred while processing your request. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
