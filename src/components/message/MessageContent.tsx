import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { parseMessage, FormattedSection } from '../../utils/message/formatter';

interface MessageContentProps {
  content: string;
  isError?: boolean;
}

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => (
  <div className="relative group my-4">
    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => navigator.clipboard.writeText(code)}
        className="px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-400"
      >
        Copy code
      </button>
    </div>
    <div className="text-xs text-indigo-200 bg-indigo-900 px-4 py-1 rounded-t-md border-b border-indigo-600">
      {language}
    </div>
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      customStyle={{
        margin: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: '0.375rem',
        borderBottomRightRadius: '0.375rem',
      }}
    >
      {code}
    </SyntaxHighlighter>
  </div>
);

const Table: React.FC<{ headers: string[]; rows: string[][] }> = ({ headers, rows }) => (
  <div className="my-6 overflow-hidden">
    <div className="overflow-x-auto ring-1 ring-indigo-300 rounded-lg">
      <table className="min-w-full divide-y divide-indigo-500">
        <thead className="bg-indigo-800">
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-indigo-200 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-indigo-50 divide-y divide-indigo-200">
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`${
                i % 2 === 0 ? 'bg-indigo-100' : 'bg-indigo-200'
              } hover:bg-indigo-300 transition-colors`}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-6 py-4 whitespace-pre-wrap text-sm text-indigo-800"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Function to convert URLs in text to clickable links
const convertUrlsToLinks = (text: string) => {
  // Updated regex to better match URLs with various protocols and paths
  const urlRegex = /(https?:\/\/[^\s<>"]+(?:\([^\s<>"]*\)|[^<>"\s])*)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      const url = part.trim();
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-words"
          onClick={(e) => {
            e.preventDefault();
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
        >
          {url}
        </a>
      );
    }
    return part;
  });
};

// Function to process markdown-style links
const processMarkdownLinks = (text: string) => {
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = text.split(markdownLinkRegex);
  
  if (parts.length === 1) {
    return convertUrlsToLinks(text);
  }

  const result = [];
  for (let i = 0; i < parts.length; i += 3) {
    // Add text before the link
    if (parts[i]) {
      result.push(...convertUrlsToLinks(parts[i]));
    }
    
    // Add the markdown link if it exists
    if (parts[i + 1] && parts[i + 2]) {
      const linkText = parts[i + 1];
      const url = parts[i + 2].trim();
      result.push(
        <a
          key={`markdown-${i}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
          onClick={(e) => {
            e.preventDefault();
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
        >
          {linkText}
        </a>
      );
    }
  }
  
  return result;
};

export function MessageContent({ content, isError }: MessageContentProps) {
  const sections = parseMessage(content);

  const renderSection = (section: FormattedSection) => {
    switch (section.type) {
      case 'code':
        return (
          <CodeBlock
            code={section.content.join('\n')}
            language={section.language || 'plaintext'}
          />
        );

      case 'table':
        if (!section.headers || !section.rows) return null;
        return (
          <Table
            headers={section.headers}
            rows={section.rows}
          />
        );

      case 'header':
        const Tag = `h${section.level}` as keyof JSX.IntrinsicElements;
        return (
          <Tag className={`font-bold my-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-600 ${
            section.level === 1 ? 'text-2xl' :
            section.level === 2 ? 'text-xl' :
            'text-lg'
          }`}>
            {processMarkdownLinks(section.content[0])}
          </Tag>
        );

      case 'blockquote':
        return (
          <blockquote className="border-l-4 border-indigo-400 pl-4 my-4 italic text-indigo-600">
            {section.content.map((line, i) => (
              <p key={i} className="mb-2">{processMarkdownLinks(line)}</p>
            ))}
          </blockquote>
        );

      case 'list':
        return (
          <ul className="list-disc list-inside my-4 space-y-2 text-indigo-500">
            {section.content.map((item, i) => (
              <li key={i}>
                {processMarkdownLinks(item)}
              </li>
            ))}
          </ul>
        );

      default:
        return (
          <p className="text-indigo-400 my-4">
            {section.content.map((line, i) => (
              <React.Fragment key={i}>
                {processMarkdownLinks(line)}
                {i < section.content.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
    }
  };

  return (
    <div className={`prose prose-indigo max-w-none ${
      isError ? 'text-red-600' : ''
    }`}>
      {sections.map((section, i) => (
        <div key={i}>{renderSection(section)}</div>
      ))}
    </div>
  );
}
