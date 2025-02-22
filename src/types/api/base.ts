export interface BaseConfig {
  url: string;
  key: string;
  model: string;
}

export interface BaseMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface BaseResponse {
  content: string;
  error?: {
    message: string;
    code?: string;
    status?: number;
  };
}