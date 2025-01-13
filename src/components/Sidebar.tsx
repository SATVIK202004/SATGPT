import React from 'react';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { SocialLinks } from './SocialLinks';
import { DEVELOPER_INFO } from '../config/constants';

interface SidebarProps {
  chats: { id: string; title: string }[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  selectedChatId: string | null;
}

export function Sidebar({ chats, onNewChat, onSelectChat, selectedChatId }: SidebarProps) {
  return (
    <div className="bg-gray-900 w-64 h-screen flex flex-col">
      <button
        onClick={onNewChat}
        className="flex items-center gap-2 m-3 p-3 rounded-md border border-gray-700 hover:bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all text-white"
      >
        <PlusCircle size={16} />
        New chat
      </button>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`flex items-center gap-2 w-full p-3 hover:bg-gradient-to-r from-silver-500 to-gray-600 transition-all text-white text-left ${
              selectedChatId === chat.id ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : ''
            }`}
          >
            <MessageSquare size={16} />
            <span className="truncate">{chat.title}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-gray-700 p-4">
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">Developed by {DEVELOPER_INFO.name}</p>
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}
