import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/message';
import { ChatInput } from './components/ChatInput';
import { ModelSelector } from './components/ModelSelector';
import { RegenerateButton } from './components/RegenerateButton';
import { SplashScreen } from './components/SplashScreen';
import { BubblesBackground } from './components/BubblesBackground';
import { Clock } from './components/Clock';
import { ShareButton } from './components/ShareButton';
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

const sampleQuestions = [
  {
    question: "What is artificial intelligence and its impact on society?",
    description: "Explore the fundamentals of AI and its transformative effects"
  },
  {
    question: "How can I improve my programming skills?",
    description: "Get personalized guidance for coding excellence"
  },
  {
    question: "What are the latest developments in quantum computing?",
    description: "Stay updated with cutting-edge quantum technology"
  }
];

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const userData = localStorage.getItem('satgpt_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.name && user.dob) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('satgpt_user');
      }
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setIsAuthenticated(true);
  };

  const handleNewChat = async () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [INITIAL_MESSAGE],
      createdAt: new Date(),
      pinned: false,
    };
    
    await setChats(prevChats => [newChat, ...prevChats]);
    await setSelectedChatId(newChat.id);
    return newChat;
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
    }
  };

  const handlePinChat = (chatId: string) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? { ...chat, pinned: !chat.pinned }
          : chat
      )
    );
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    setChats(prevChats => 
      prevChats.map(chat => ({
        ...chat,
        messages: chat.messages.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: newContent }
            : msg
        )
      }))
    );
  };

  const handleSendMessage = async (content: string, chatId?: string) => {
    const targetChatId = chatId || selectedChatId;
    if (!targetChatId) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === targetChatId 
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              title: chat.messages.length === 1 ? content.slice(0, 30) + '...' : chat.title,
            }
          : chat
      )
    );

    await generateResponse(targetChatId, newMessage);
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

    const updatedMessages = [...selectedChat.messages];
    while (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].role === 'assistant') {
      updatedMessages.pop();
    }

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

  const handleSampleQuestionClick = async (question: string) => {
    try {
      const newChat = await handleNewChat();
      // Use Promise to ensure chat is created before sending message
      await new Promise(resolve => setTimeout(resolve, 100));
      await handleSendMessage(question, newChat.id);
    } catch (error) {
      console.error('Error handling sample question:', error);
    }
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

  const handleSignOut = () => {
    localStorage.removeItem('satgpt_user');
    setIsAuthenticated(false);
    setShowSplash(true);
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId);
  const userData = localStorage.getItem('satgpt_user') ? JSON.parse(localStorage.getItem('satgpt_user')!) : null;

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (!isAuthenticated) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className={`min-h-screen ${themes[currentTheme].background} ${themes[currentTheme].text}`}>
      <BubblesBackground bubbleColors={themes[currentTheme].bubbleColors} />
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
            onDeleteChat={handleDeleteChat}
            onPinChat={handlePinChat}
            selectedChatId={selectedChatId}
          />
        </div>

        <main className="flex-1 flex flex-col">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Clock />
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
            </div>
            <div className="flex items-center space-x-4">
              {userData && (
                <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                  Welcome, {userData.name}
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Sign Out
              </button>
              {selectedChat && selectedChat.messages.length > 1 && (
                <>
                  <ShareButton 
                    messages={selectedChat.messages}
                    title={selectedChat.title}
                  />
                  <button
                    onClick={() => window.open('https://www.codechef.com/ide', '_blank')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    🖥️ CodeChef IDE
                  </button>
                  <RegenerateButton
                    onClick={handleRegenerateResponse}
                    disabled={isLoading}
                    isLoading={isLoading}
                    successMessage="Response regenerated!"
                  />
                  <button
                    onClick={handleDownloadChat}
                    className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-red-600"
                  >
                    🔍 Download Chat
                  </button>
                </>
              )}
            </div>
          </div>

          {selectedChat ? (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                {selectedChat.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onEdit={handleEditMessage}
                  />
                ))}
                {typingIndicator && (
                  <div className="p-4 opacity-70">SAT GPT Typing...</div>
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
            <div className="h-full flex items-center justify-center bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="max-w-2xl w-full p-8 rounded-2xl bg-white shadow-xl">
                <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Welcome to SAT GPT, {userData?.name}
                </h1>
                <div className="space-y-6">
                  {sampleQuestions.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleSampleQuestionClick(item.question)}
                      className="p-4 rounded-xl border-2 border-purple-200 hover:border-purple-400 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-purple-50 to-pink-50"
                    >
                      <h3 className="text-lg font-semibold text-purple-700">{item.question}</h3>
                      <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                    </div>
                  ))}
                </div>
                <p className="text-center mt-8 text-gray-600">
                  Select a question or start a new chat to begin
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
