import { ApiConfig, ModelResponse } from '../../types/api';
import { Message } from '../../types';
import { formatResponse } from '../../utils/formatters';
import { SYSTEM_PROMPT, API_HEADERS } from './constants';
import { handleOpenRouterApi } from './api/openRouterApiHandler';


// Base handler for OpenAI-compatible APIs (Mistral, Groq, X.AI)
async function handleOpenAICompatibleApi(
  messages: Message[],
  config: ApiConfig
): Promise<ModelResponse> {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      ...API_HEADERS,
      'Authorization': `Bearer ${config.key}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return { content: formatResponse(data.choices[0].message.content) };
}

// Mistral handler
export const handleMistralApi = handleOpenAICompatibleApi;

// Groq handler
export const handleGroqApi = handleOpenAICompatibleApi;

// X.AI handler
export const handleXaiApi = handleOpenAICompatibleApi;

// OpenRouter handler
export async function handleOpenRouterApi(
  messages: Message[],
  config: ApiConfig
): Promise<ModelResponse> {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      ...API_HEADERS,
      'Authorization': `Bearer ${config.key}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return { content: formatResponse(data.choices[0].message.content) };
}

// Gemini handler
export async function handleGeminiApi(
  messages: Message[],
  config: ApiConfig
): Promise<ModelResponse> {
  const response = await fetch(`${config.url}?key=${config.key}`, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify({
      contents: [{
        parts: [{ 
          text: `${SYSTEM_PROMPT}\n\nUser: ${messages[messages.length - 1].content}`,
        }],
      }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return { content: formatResponse(data.candidates[0].content.parts[0].text) };
}

// Hugging Face handler
export async function handleHuggingFaceApi(
  messages: Message[],
  config: ApiConfig
): Promise<ModelResponse> {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.key}`,
    },
    body: JSON.stringify({
      inputs: `${SYSTEM_PROMPT}\n\nUser: ${messages[messages.length - 1].content}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return { content: formatResponse(data[0].generated_text) };
}
