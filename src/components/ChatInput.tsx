import React, { useState, useEffect, FormEvent } from 'react';
import { Send, X, Sun, Moon, Smile } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  onClear: () => void; // Added clear message handler
}

export function ChatInput({ onSendMessage, disabled, onClear }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode toggle state
  const maxCharLimit = 80000;

  // Load draft from local storage
  useEffect(() => {
    const savedDraft = localStorage.getItem('chatInputDraft');
    if (savedDraft) {
      setInput(savedDraft);
    }
  }, []);

  // Save draft to local storage
  useEffect(() => {
    localStorage.setItem('chatInputDraft', input);
  }, [input]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      setIsTyping(false);
      setIsCleared(false);
      localStorage.removeItem('chatInputDraft'); // Clear draft after sending
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setIsTyping(true);
    setIsCleared(false);
  };

  const handleClear = () => {
    setInput('');
    setIsCleared(true);
    onClear();
    localStorage.removeItem('chatInputDraft'); // Clear draft when cleared
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleEmojiInsert = (emoji: string) => {
    setInput((prev) => prev + emoji);
    setIsTyping(true);
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  return (
    <form
      onSubmit={handleSubmit}
      className={`max-w-3xl mx-auto p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}
    >
      <div className="relative">
        <textarea
          value={input}
          onChange={handleTyping}
          placeholder="Send a message..."
          rows={2}
          disabled={disabled}
          className={`w-full resize-none rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-blue-300 bg-gray-50'} pl-4 pr-12 py-3 focus:ring-2 focus:ring-blue-300 disabled:opacity-50`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="absolute right-2 bottom-2.5 rounded-md p-2 text-blue-500 hover:bg-blue-100 disabled:opacity-50"
        >
          <Send size={20} />
        </button>

        {/* Clear Button */}
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="absolute right-12 bottom-2.5 rounded-md p-2 text-red-500 hover:bg-red-100 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        {/* Emoji Picker Button */}
        <button
          type="button"
          onClick={() => handleEmojiInsert('😊')}
          className="absolute right-20 bottom-2.5 rounded-md p-2 text-yellow-500 hover:bg-yellow-100 disabled:opacity-50"
        >
          <Smile size={20} />
        </button>
      </div>

      {/* Character & Word count */}
      <div className="flex justify-between text-xs mt-2">
        <p>{input.length}/{maxCharLimit} characters</p>
        <p>{wordCount} words</p>
        {input.length > maxCharLimit && (
          <p className="text-red-500">Character limit exceeded</p>
        )}
      </div>

      {/* Typing indicator */}
      {isTyping && !disabled && (
        <p className="text-xs mt-2">Typing...</p>
      )}

      {/* Clear message indicator */}
      {isCleared && (
        <p className="text-xs text-red-500 mt-2">Message cleared</p>
      )}

      {/* Dark Mode Toggle */}
      <button
        type="button"
        onClick={toggleDarkMode}
        className="mt-4 px-4 py-2 rounded-md border border-gray-300 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        {isDarkMode ? ' Light Mode' : ' Dark Mode'}
      </button>

      <p className="text-xs text-center mt-4">
        Free Research Preview. SATGPT may produce inaccurate information.
      </p>
    </form>
  );
}

