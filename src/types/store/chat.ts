import { BaseMessage } from '../api/base';

export interface ChatMessage extends BaseMessage {
  id: string;
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
  selectedModel: string;
}

export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  setError: (error?: string) => void;
  setModel: (model: string) => void;
}