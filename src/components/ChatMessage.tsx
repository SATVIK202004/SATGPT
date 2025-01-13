import React, { useEffect, useRef } from 'react';
import { User, Bot } from 'lucide-react';
import type { Message } from '../types';
import { MessageContent } from './MessageContent';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.content.startsWith('Error occurred');
  const messageRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [message]);

  const renderErrorContent = isError ? (
    <div className="text-red-600 font-bold">Error: {message.content}</div>
  ) : (
    <MessageContent content={message.content} isError={isError} />
  );

  return (
    <div
      ref={messageRef}
      className={`py-6 ${isUser ? 'bg-gradient-to-r from-blue-100 to-blue-200' : 'bg-gradient-to-r from-teal-100 to-teal-200'}`}
    >
      <div className="max-w-3xl mx-auto flex gap-6 px-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-600' : isError ? 'bg-red-600' : 'bg-teal-600'
          }`}
        >
          {isUser ? (
            <User size={22} className="text-white" />
          ) : (
            <Bot size={22} className="text-white" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <p className={`font-semibold ${isUser ? 'text-blue-800' : 'text-teal-800'}`}>
              {isUser ? 'You' : 'SAT GPT'}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
          {renderErrorContent}
        </div>
      </div>
    </div>
  );
}
