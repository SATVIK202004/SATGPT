export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse {
  content: string;
  error?: ApiError;
}