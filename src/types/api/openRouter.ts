import { BaseConfig, BaseMessage } from './base';

export interface OpenRouterConfig extends BaseConfig {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  retryCount?: number;
}

export interface OpenRouterMessage extends BaseMessage {
  name?: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: OpenRouterMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}