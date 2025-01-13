// ApiConfig interface reflects configuration parameters like API URL, key, and model
export interface ApiConfig {
  url: string;  // API URL (For OpenRouter, e.g., 'https://openrouter.ai/api/v1/chat/completions')
  key: string;  // API key for authorization
  model: string; // Model name (e.g., 'openrouter-model')
}

// ModelResponse interface returns a response with content and optional error information
export interface ModelResponse {
  content: string;  // The content of the model's response
  error?: string;   // Optional error message if an issue occurs
}
