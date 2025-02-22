export function getOpenRouterHeaders(apiKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': window.location.origin,
    'X-Title': 'SAT GPT',
    'OpenRouter-Retry-Count': '2'
  };
}