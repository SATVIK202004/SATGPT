import React from 'react';
import { parseMessage } from '../utils/messageFormatter';

interface MessageContentProps {
  content: string;
  isError?: boolean;
}

export function MessageContent({ content, isError }: MessageContentProps) {
  const sections = parseMessage(content);

  return (
    <div className={`prose prose-slate max-w-none ${isError ? 'text-red-600' : ''}`}>
      {sections.map((section, index) => (
        section.type === 'point' ? (
          <div key={index} className="mb-4">
            <p className="font-semibold mb-2">{section.heading}</p>
            {section.content.map((line, i) => (
              <p key={i} className="ml-4 mb-1">{line}</p>
            ))}
          </div>
        ) : (
          <div key={index}>
            {section.content.map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        )
      ))}
    </div>
  );
}