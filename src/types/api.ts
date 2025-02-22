
export interface ApiConfig {
  url: string;
  key: string;
  model: string;
  backupKeys?: string[];
}

export interface ModelResponse {
  content: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
