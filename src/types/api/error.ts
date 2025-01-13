export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface ErrorResponse {
  error: ApiError;
  timestamp: string;
  path: string;
}