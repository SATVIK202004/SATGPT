import React from 'react';
import { User, Bot } from 'lucide-react';
import type { Message } from '../../types';
import { MessageContent } from './MessageContent';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.content.startsWith('Error occurred');

  return (
    <div className={`py-8 ${isUser ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="max-w-3xl mx-auto flex gap-6 px-4">
        <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${
          isUser ? 'bg-gray-500' : isError ? 'bg-red-500' : 'bg-teal-500'
        }`}>
          {isUser ? (
            <User size={20} className="text-white" />
          ) : (
            <Bot size={20} className="text-white" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <p className="font-medium">{isUser ? 'You' : 'SAT GPT'}</p>
          <MessageContent content={message.content} isError={isError} />
        </div>
      </div>
    </div>
  );
}