import { Message } from '../../types';
import { ApiConfig } from '../../types/api';

export function validateMessages(messages: Message[]): void {
  if (!Array.isArray(messages)) {
    throw new Error('Messages must be an array');
  }
  if (messages.length === 0) {
    throw new Error('Messages array cannot be empty');
  }
  messages.forEach((msg, index) => {
    if (!msg.content || typeof msg.content !== 'string') {
      throw new Error(`Invalid message content at index ${index}`);
    }
    if (!['user', 'assistant'].includes(msg.role)) {
      throw new Error(`Invalid message role at index ${index}`);
    }
  });
}

export function validateApiConfig(config: ApiConfig): void {
  if (!config.url || typeof config.url !== 'string') {
    throw new Error('Invalid API URL');
  }
  if (!config.key || typeof config.key !== 'string') {
    throw new Error('Invalid API key');
  }
  if (!config.model || typeof config.model !== 'string') {
    throw new Error('Invalid model name');
  }
}