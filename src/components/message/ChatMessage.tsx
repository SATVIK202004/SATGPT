import React, { useState } from 'react';
import { User, Bot, Copy, Edit, Check } from 'lucide-react';
import type { Message } from '../../types';
import { MessageContent } from './MessageContent';

interface ChatMessageProps {
  message: Message;
  onEdit?: (id: string, content: string) => void;
}

export function ChatMessage({ message, onEdit }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.content.startsWith('Error occurred');
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      onEdit?.(message.id, editContent);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div
      className={`py-8 ${isUser ? 'bg-gradient-to-r from-pink-100 via-pink-200 to-pink-300' : 'bg-gradient-to-r from-pink-50 via-pink-100 to-pink-200'}`}
    >
      <div className="max-w-3xl mx-auto flex gap-6 px-4">
        <div
          className={`w-8 h-8 rounded-sm flex items-center justify-center ${
            isUser
              ? 'bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600'
              : isError
              ? 'bg-gradient-to-br from-red-400 via-rose-500 to-red-700'
              : 'bg-gradient-to-br from-pink-200 via-pink-300 to-pink-400'
          }`}
        >
          {isUser ? (
            <User size={20} className="text-white" />
          ) : (
            <Bot size={20} className="text-white" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <p className="font-medium text-gray-800">{isUser ? 'You' : 'SAT GPT'}</p>
            <div className="flex gap-2">
              {isUser && (
                <button
                  onClick={handleEdit}
                  className={`p-1 rounded transition-colors hover:bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500 ${
                    isEditing ? 'bg-gradient-to-br from-pink-500 to-pink-600' : ''
                  }`}
                  title={isEditing ? 'Save' : 'Edit'}
                >
                  {isEditing ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <Edit size={16} className="text-pink-600" />
                  )}
                </button>
              )}
              <button
                onClick={handleCopy}
                className={`p-1 rounded transition-colors hover:bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500 ${
                  isCopied ? 'bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500' : ''
                }`}
                title={isCopied ? 'Copied!' : 'Copy'}
              >
                <Copy
                  size={16}
                  className={isCopied ? 'text-pink-700' : 'text-pink-600'}
                />
              </button>
            </div>
          </div>
          {isEditing && isUser ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-md border-pink-300 focus:ring-2 focus:ring-pink-500 bg-gradient-to-r from-pink-50 via-pink-100 to-pink-200"
              rows={3}
              autoFocus
            />
          ) : (
            <MessageContent content={message.content} isError={isError} />
          )}
        </div>
      </div>
    </div>
  );
}
