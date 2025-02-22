import React, { useState, useEffect, FormEvent } from 'react';
import { Send, X, Sun, Moon, Smile, Search, Image, Trash2, Sparkles, Command } from 'lucide-react';
import { createWorker } from 'tesseract.js';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  onClear: () => void;
}

interface ImagePreview {
  url: string;
  text: string;
}

const GOOGLE_CONFIG = {
  API_KEY: 'AIzaSyA7I6GQ9ataKDMw2f5btszojLglAd_zaHCNQmWl32CGSN0mvDEspjxURVEDBTQBkMR8Egd8QVZGQQM3VYklcNeNl3',
  SEARCH_ENGINE_ID: '90576cdd3216a414d',
  BASE_URL: 'https://www.googleapis.com/customsearch/v1'
};

const MAX_IMAGES = 4;

export function ChatInput({ onSendMessage, disabled, onClear }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(true);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const maxCharLimit = 80000;
  const [isTypingEffect, setIsTypingEffect] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    const savedDraft = localStorage.getItem('chatInputDraft');
    if (savedDraft) {
      setInput(savedDraft);
    }
  }, []);

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
      setSearchResults([]);
      setImagePreviews([]);
      localStorage.removeItem('chatInputDraft');
    }
  };

  const processImage = async (file: File): Promise<{ text: string; url: string }> => {
    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();

    const url = URL.createObjectURL(file);

    return { text, url };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - imagePreviews.length;
    const filesToProcess = files.slice(0, remainingSlots);

    if (filesToProcess.length === 0) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setIsProcessingImage(true);
    try {
      const results = await Promise.all(filesToProcess.map(processImage));
      
      setImagePreviews(prev => [...prev, ...results.map(r => ({ url: r.url, text: r.text }))]);
      
      const newText = results.map(r => r.text).join('\n\n');
      setInput(prev => prev + (prev ? '\n\n' : '') + newText);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Error processing images. Please try again.');
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleTyping = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    setInput(newInput);
    setIsTyping(true);
    setIsCleared(false);

    if (isSearchEnabled && newInput.length > 2) {
      await performSearch(newInput);
    } else {
      setSearchResults([]);
    }
  };

  const performSearch = async (query: string) => {
    try {
      setIsSearching(true);
      const response = await fetch(
        `${GOOGLE_CONFIG.BASE_URL}?key=${GOOGLE_CONFIG.API_KEY}&cx=${GOOGLE_CONFIG.SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setIsCleared(true);
    setSearchResults([]);
    setImagePreviews(prev => {
      prev.forEach(preview => URL.revokeObjectURL(preview.url));
      return [];
    });
    onClear();
    localStorage.removeItem('chatInputDraft');
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleSearchEnabled = () => {
    setIsSearchEnabled((prev) => !prev);
    if (!isSearchEnabled) {
      setSearchResults([]);
    }
  };

  const handleEmojiInsert = (emoji: string) => {
    setInput((prev) => prev + emoji);
    setIsTyping(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  return (
    <div 
      className={`max-w-4xl mx-auto p-6 rounded-2xl backdrop-blur-sm transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-900/90 to-purple-900/90 text-white' 
          : 'bg-gradient-to-r from-purple-50/90 to-pink-50/90 text-gray-800'
      }`}
      style={{
        boxShadow: isDarkMode 
          ? '0 0 20px rgba(147, 51, 234, 0.3)' 
          : '0 0 20px rgba(219, 39, 119, 0.1)',
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setShowCommandPalette(!showCommandPalette)}
            className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-sm transition-all duration-300 ${
              isDarkMode
                ? 'bg-purple-800/50 hover:bg-purple-700/50'
                : 'bg-purple-100 hover:bg-purple-200'
            }`}
          >
            <Command size={14} />
            <span>Commands</span>
          </button>
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {imagePreviews.map((preview, index) => (
              <div 
                key={index} 
                className="relative group transform transition-all duration-300 hover:scale-105"
                style={{
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s`,
                }}
              >
                <img
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-xl border-2 border-purple-500/50 shadow-lg"
                  style={{
                    boxShadow: '0 4px 20px rgba(147, 51, 234, 0.2)',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute bottom-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative group">
          <div 
            className={`absolute inset-0 rounded-xl transition-all duration-500 ${
              isTypingEffect ? 'animate-pulse' : ''
            }`}
            style={{
              background: isDarkMode 
                ? 'linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(219, 39, 119, 0.1))' 
                : 'linear-gradient(45deg, rgba(147, 51, 234, 0.05), rgba(219, 39, 119, 0.05))',
              filter: 'blur(8px)',
              zIndex: -1,
            }}
          />
          <textarea
            value={input}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything... Type / for commands"
            rows={3}
            disabled={disabled || isProcessingImage}
            className={`w-full resize-none rounded-xl border-2 ${
              isDarkMode 
                ? 'border-purple-600/30 bg-gray-800/50 text-white placeholder-gray-400' 
                : 'border-purple-300/50 bg-white/80 text-gray-800 placeholder-gray-500'
            } pl-4 pr-32 py-4 focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 disabled:opacity-50 transition-all duration-300`}
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(8px)',
            }}
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <div className="flex gap-2 p-1 rounded-lg bg-gray-100/10 backdrop-blur-sm">
              <label className={`cursor-pointer transform transition-all duration-300 hover:scale-110 ${
                imagePreviews.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={disabled || isProcessingImage || imagePreviews.length >= MAX_IMAGES}
                />
                <Image
                  size={20}
                  className={`${
                    isProcessingImage ? 'animate-pulse' : ''
                  } text-purple-500 hover:text-purple-600`}
                />
              </label>
              {[
                {
                  icon: <Search size={20} />,
                  onClick: () => performSearch(input),
                  disabled: disabled || !input.trim() || !isSearchEnabled,
                  color: 'text-blue-500 hover:text-blue-600'
                },
                {
                  icon: <X size={20} />,
                  onClick: handleClear,
                  disabled: disabled,
                  color: 'text-red-500 hover:text-red-600'
                },
                {
                  icon: <Smile size={20} />,
                  onClick: () => handleEmojiInsert('😊'),
                  color: 'text-yellow-500 hover:text-yellow-600'
                },
                {
                  icon: <Send size={20} />,
                  onClick: handleSubmit,
                  disabled: disabled || !input.trim(),
                  color: 'text-green-500 hover:text-green-600'
                }
              ].map((button, index) => (
                <button
                  key={index}
                  type={button.icon.type === Send ? 'submit' : 'button'}
                  onClick={button.onClick}
                  disabled={button.disabled}
                  className={`p-2 rounded-lg transform transition-all duration-300 hover:scale-110 disabled:opacity-50 ${button.color}`}
                >
                  {button.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isProcessingImage && (
          <div className="flex items-center justify-center gap-2 text-purple-500">
            <Sparkles className="animate-spin" size={16} />
            <span className="animate-pulse">Processing image...</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-xs">
            <p className="text-purple-600/80">
              {input.length}/{maxCharLimit} characters • {wordCount} words
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={toggleSearchEnabled}
                className={`px-3 py-1 rounded-full transition-colors ${
                  isSearchEnabled
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isSearchEnabled ? 'Search Enabled' : 'Search Disabled'}
              </button>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`px-3 py-1 rounded-full flex items-center gap-2 transition-colors ${
                  isDarkMode
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-800 text-white'
                }`}
              >
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                <span>{isDarkMode ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>
        </div>

        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
      </form>
    </div>
  );
}
