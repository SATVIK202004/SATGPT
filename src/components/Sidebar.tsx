import React from 'react';
import { PlusCircle, MessageSquare, Pin, Trash2 } from 'lucide-react';
import { SocialLinks } from './SocialLinks';
import { DEVELOPER_INFO } from '../config/constants';
import type { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onPinChat: (id: string) => void;
  selectedChatId: string | null;
}

export function Sidebar({ 
  chats, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat,
  onPinChat, 
  selectedChatId 
}: SidebarProps) {
  // Sort chats: pinned first, then by creation date
  const sortedChats = [...chats].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

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
        {sortedChats.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-2 w-full p-3 hover:bg-gradient-to-r from-silver-500 to-gray-600 transition-all text-white ${
              selectedChatId === chat.id ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : ''
            }`}
          >
            <button
              onClick={() => onSelectChat(chat.id)}
              className="flex items-center gap-2 flex-1 text-left"
            >
              <MessageSquare size={16} />
              <span className="truncate">{chat.title}</span>
            </button>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPinChat(chat.id);
                }}
                className={`p-1 rounded-md hover:bg-gray-700 ${chat.pinned ? 'text-yellow-500' : 'text-gray-400'}`}
                title={chat.pinned ? 'Unpin chat' : 'Pin chat'}
              >
                <Pin size={16} className={chat.pinned ? 'rotate-45' : ''} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this chat?')) {
                    onDeleteChat(chat.id);
                  }
                }}
                className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-red-500"
                title="Delete chat"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
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
