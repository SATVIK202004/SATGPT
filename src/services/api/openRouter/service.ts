import axios, { AxiosError } from 'axios';
import { OpenRouterConfig, OpenRouterRequest, OpenRouterResponse, BaseMessage, ApiError } from '../../../types/api';
import { DEFAULT_CONFIG } from './config';

export class OpenRouterService {
  private config: OpenRouterConfig;

  constructor(config: Partial<OpenRouterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.key}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'SAT GPT',
      'OpenRouter-Retry-Count': String(this.config.retryCount)
    };
  }

  async sendMessage(messages: BaseMessage[]): Promise<string> {
    try {
      const request: OpenRouterRequest = {
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: this.config.topP
      };

      const response = await axios.post<OpenRouterResponse>(
        this.config.url,
        request,
        { headers: this.getHeaders() }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      const apiError: ApiError = {
        message: 'Failed to send message',
        code: 'OPENROUTER_ERROR'
      };

      if (error instanceof AxiosError) {
        apiError.status = error.response?.status;
        apiError.details = error.response?.data;
      }

      throw apiError;
    }
  }
}