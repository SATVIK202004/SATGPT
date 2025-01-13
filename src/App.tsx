import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/message';
import { ChatInput } from './components/ChatInput';
import { ModelSelector } from './components/ModelSelector';
import { RegenerateButton } from './components/RegenerateButton';
import { SplashScreen } from './components/SplashScreen';
import { BubblesBackground } from './components/BubblesBackground';
import { sendMessage } from './services/api';
import { modelConfigs } from './config/models';
import { INITIAL_MESSAGE } from './config/constants';
import type { Chat, Message } from './types';

const themes = {
  Default: {
    background: 'bg-white',
    text: 'text-black',
    bubbleColors: 'from-blue-200/30 to-purple-200/30'
  },
  Dark: {
    background: 'bg-gray-800',
    text: 'text-black',
    bubbleColors: 'from-blue-400/30 to-purple-400/30'
  },
  Ocean: {
    background: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    text: 'text-black',
    bubbleColors: 'from-teal-200/30 to-blue-200/30'
  },
  Forest: {
    background: 'bg-gradient-to-r from-green-600 to-emerald-500',
    text: 'text-black',
    bubbleColors: 'from-green-200/30 to-emerald-200/30'
  },
  Sunset: {
    background: 'bg-gradient-to-r from-orange-500 to-pink-500',
    text: 'text-black',
    bubbleColors: 'from-yellow-200/30 to-pink-200/30'
  },
  Royal: {
    background: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    text: 'text-black',
    bubbleColors: 'from-indigo-200/30 to-purple-200/30'
  },
  Midnight: {
    background: 'bg-gradient-to-r from-gray-900 to-slate-900',
    text: 'text-black',
    bubbleColors: 'from-blue-300/20 to-purple-300/20'
  },
  Cherry: {
    background: 'bg-gradient-to-r from-red-600 to-pink-600',
    text: 'text-black',
    bubbleColors: 'from-red-200/30 to-pink-200/30'
  }
};

export function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('Mistral ai');
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('Default');
  const [ispDetails, setIspDetails] = useState<string>('');
  const [networkSpeed, setNetworkSpeed] = useState<string>('');
  const [speedRating, setSpeedRating] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [INITIAL_MESSAGE],
      createdAt: new Date(),
      pinned: false,
    };
    setChats([newChat, ...chats]);
    setSelectedChatId(newChat.id);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === selectedChatId 
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              title: chat.messages.length === 1 ? content.slice(0, 30) + '...' : chat.title,
            }
          : chat
      )
    );

    await generateResponse(selectedChatId, newMessage);
  };

  const generateResponse = async (chatId: string, lastUserMessage: Message) => {
    setTypingIndicator(true);
    setIsLoading(true);

    try {
      const selectedChat = chats.find(chat => chat.id === chatId);
      if (!selectedChat) return;

      const response = await sendMessage(
        [...selectedChat.messages, lastUserMessage],
        modelConfigs[selectedModel]
      );

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date(),
      };

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        )
      );
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
    }
  };

  const handleRegenerateResponse = async () => {
    if (!selectedChatId) return;
    
    const selectedChat = chats.find(chat => chat.id === selectedChatId);
    if (!selectedChat || selectedChat.messages.length < 2) return;

    // Remove the last assistant message
    const updatedMessages = [...selectedChat.messages];
    while (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].role === 'assistant') {
      updatedMessages.pop();
    }

    // Get the last user message
    const lastUserMessage = updatedMessages[updatedMessages.length - 1];
    
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChatId
          ? { ...chat, messages: updatedMessages }
          : chat
      )
    );

    await generateResponse(selectedChatId, lastUserMessage);
  };

  const handleDownloadChat = () => {
    if (!selectedChatId) return;

    const selectedChat = chats.find(chat => chat.id === selectedChatId);
    if (!selectedChat) return;

    const chatContent = selectedChat.messages
      .map(message => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
      .join('\n\n');

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedChat.title || 'chat'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  return (
    <div className={`min-h-screen ${themes[currentTheme].background} ${themes[currentTheme].text}`}>
      <BubblesBackground bubbleColors={themes[currentTheme].bubbleColors} />
      {showSplash && <SplashScreen />}
      <div className="flex h-screen relative z-10">
        <div className="bg-gray-900 w-64 h-screen flex flex-col">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
          <Sidebar
            chats={chats}
            onNewChat={handleNewChat}
            onSelectChat={setSelectedChatId}
            selectedChatId={selectedChatId}
          />
        </div>

        <main className="flex-1 flex flex-col">
          <div className="p-4 flex justify-between items-center">
            <select
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value)}
              className="px-4 py-2 rounded bg-opacity-20 bg-white backdrop-blur-sm text-inherit border border-current"
            >
              {Object.keys(themes).map((theme) => (
                <option key={theme} value={theme}>
                  {theme} Theme
                </option>
              ))}
            </select>
            {selectedChat && selectedChat.messages.length > 1 && (
              <div className="flex items-center space-x-4">
                <RegenerateButton
                  onClick={handleRegenerateResponse}
                  disabled={isLoading}
                />
                <button
                  onClick={handleDownloadChat}
                  className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-red-600"
                >
                  🔍 Download Chat
                </button>
              </div>
            )}
          </div>

          {selectedChat ? (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                {selectedChat.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                  />
                ))}
                {typingIndicator && (
                  <div className="p-4 opacity-70">SATGPT Typing...</div>
                )}
              </div>
              <div className="border-t border-current border-opacity-10 p-4">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  disabled={isLoading}
                  onClear={() => {}}
                />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Welcome to SAT GPT</h1>
                <p className="opacity-70">Select a chat or start a new one</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
