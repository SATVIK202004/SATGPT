import { ApiConfig, ModelResponse } from '../../../types/api';
import { Message } from '../../../types';
import { getSystemPrompt } from './baseHandler';

export async function handleAzureApi(messages: Message[], config: ApiConfig): Promise<ModelResponse> {
  try {
    const systemPrompt = getSystemPrompt(messages.some(msg => msg.content.includes('SAT GPT')));
    
    // Force the model to respond in the required structured format
    const enhancedMessages = [
      { 
        role: 'system', 
        content: `${systemPrompt}\n\n
        You must structure your response using the following format:
        
        **Initial Analysis:**  
        - Breakdown of the question and key components.  
        
        **Deep Thinking:**  
        - Consider multiple perspectives and implications.  
        - Context, potential challenges, and alternative viewpoints.  
        
        **Logical Reasoning:**  
        - Clear chain of thought.  
        - Supporting evidence and trade-offs.  
        
        **Final Response:**  
        - A well-structured, concise, and informative answer.  
        
        **Example Format:**
        ---
        Initial Analysis:  
        - [Breakdown of the problem]  
        
        Deep Thinking:  
        - [Different perspectives, challenges]  
        
        Logical Reasoning:  
        - [Step-by-step reasoning]  
        
        Final Response:  
        - [Concise and actionable answer]  
        
        Your response must strictly follow this format.`
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
        stream: false  // Removed response_format, handled manually
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

    // Ensure the response follows the required structured format
    if (!content.includes('Initial Analysis:') || 
        !content.includes('Deep Thinking:') || 
        !content.includes('Logical Reasoning:') || 
        !content.includes('Final Response:')) {
      
      // Split response to organize it better
      const segments = content.split('\n\n');
      const analysis = segments[0] || 'N/A';
      const thinking = segments.length > 1 ? segments[1] : 'N/A';
      const reasoning = segments.length > 2 ? segments[2] : 'N/A';
      const finalResponse = segments.slice(3).join('\n\n') || content;

      content = `**Initial Analysis:**\n${analysis}\n\n` +
                `**Deep Thinking:**\n${thinking}\n\n` +
                `**Logical Reasoning:**\n${reasoning}\n\n` +
                `**Final Response:**\n${finalResponse}`;
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
