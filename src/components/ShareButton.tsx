import React, { useState } from 'react';
import { Share2, Check, Twitter, Facebook, Linkedin as LinkedIn, MessageCircle as WhatsApp } from 'lucide-react';
import type { Message } from '../types';

interface ShareButtonProps {
  messages: Message[];
  title: string;
}

export function ShareButton({ messages, title }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatChatForSharing = () => {
    const formattedChat = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'SAT GPT'}: ${msg.content}`
    ).join('\n\n');
    
    return `${title}\n\n${formattedChat}\n\nShared from SAT GPT - https://sat-gpt-psi.vercel.app/`;
  };

  const shareText = formatChatForSharing();
  const encodedText = encodeURIComponent(shareText);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=https://sat-gpt-psi.vercel.app/&quote=${encodedText}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=https://sat-gpt-psi.vercel.app/&title=${encodeURIComponent(title)}&summary=${encodedText}`,
    whatsapp: `https://wa.me/?text=${encodedText}`
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 flex items-center gap-2"
      >
        <Share2 size={16} />
        Share Chat
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Share this chat</h3>
            
            <div className="flex space-x-4 mb-4">
              <a
                href={shareUrls.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href={shareUrls.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href={shareUrls.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors"
              >
                <LinkedIn size={20} />
              </a>
              <a
                href={shareUrls.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <WhatsApp size={20} />
              </a>
            </div>

            <button
              onClick={copyToClipboard}
              className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                'Copy to clipboard'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
