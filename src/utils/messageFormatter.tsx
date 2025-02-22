import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => navigator.clipboard.writeText(value)}
          className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-md"
        >
          Copy
        </button>
      </div>
      <div className="text-xs text-gray-400 bg-gray-800 px-4 py-1 rounded-t-md">
        {language}
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

interface InlineCodeProps {
  value: string;
}

const InlineCode: React.FC<InlineCodeProps> = ({ value }) => (
  <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
    {value}
  </code>
);

interface TableProps {
  headers: string[];
  rows: string[][];
}

const Table: React.FC<TableProps> = ({ headers, rows }) => (
  <div className="overflow-x-auto my-4">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          {headers.map((header, i) => (
            <th
              key={i}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="px-6 py-4 whitespace-nowrap text-sm">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export function formatMessage(content: string): React.ReactNode {
  // Fix split years and numbers
  const fixedContent = content.replace(
    /(\d)\s*\n\s*(\d)\s*\n\s*(\d)\s*\n\s*(\d)(?=[\s.,]|$)/g,
    (_, d1, d2, d3, d4) => {
      const number = `${d1}${d2}${d3}${d4}`;
      return /^(19|20)\d{2}$/.test(number) ? number : `${d1}${d2}${d3}${d4}`;
    }
  );

  // Split content into sections while preserving code blocks
  const sections = fixedContent.split(/(?=(?:^|\n)(?:```|#{1,6}\s|>|\d+\.|[-*+]\s))/);

  return sections.map((section, index) => {
    const trimmedSection = section.trim();

    // Handle code blocks
    if (trimmedSection.startsWith('```')) {
      const [firstLine, ...rest] = trimmedSection.split('\n');
      const language = firstLine.slice(3).trim() || 'plaintext';
      const code = rest.slice(0, -1).join('\n'); // Remove closing ```
      return (
        <div key={index} className="my-4">
          <CodeBlock language={language} value={code} />
        </div>
      );
    }

    // Handle inline code
    if (trimmedSection.includes('`')) {
      const parts = trimmedSection.split(/(`[^`]+`)/);
      return (
        <div key={index} className="my-2">
          {parts.map((part, i) => {
            if (part.startsWith('`') && part.endsWith('`')) {
              return <InlineCode key={i} value={part.slice(1, -1)} />;
            }
            return formatTextWithMarkdown(part);
          })}
        </div>
      );
    }

    // Handle tables
    if (trimmedSection.includes('|') && trimmedSection.includes('\n')) {
      const lines = trimmedSection.split('\n').filter(line => line.trim());
      if (lines.length >= 2 && lines[1].includes('|-')) {
        const headers = lines[0]
          .split('|')
          .filter(cell => cell.trim())
          .map(cell => cell.trim());
        const rows = lines.slice(2).map(line =>
          line
            .split('|')
            .filter(cell => cell.trim())
            .map(cell => cell.trim())
        );
        return <Table key={index} headers={headers} rows={rows} />;
      }
    }

    // Handle headings
    if (/^#{1,6}\s/.test(trimmedSection)) {
      const level = trimmedSection.match(/^#+/)[0].length;
      const text = trimmedSection.replace(/^#+\s/, '');
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return React.createElement(
        Tag,
        {
          key: index,
          className: `font-bold my-4 ${
            level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg'
          }`,
        },
        formatTextWithMarkdown(text)
      );
    }

    // Handle blockquotes
    if (trimmedSection.startsWith('>')) {
      return (
        <blockquote
          key={index}
          className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-4 italic"
        >
          {formatTextWithMarkdown(trimmedSection.replace(/^>\s?/, ''))}
        </blockquote>
      );
    }

    // Handle lists
    if (/^[-*+]\s/.test(trimmedSection)) {
      const items = trimmedSection.split(/\n(?=[-*+]\s)/).map(item => item.replace(/^[-*+]\s/, ''));
      return (
        <ul key={index} className="list-disc list-inside my-4 space-y-2">
          {items.map((item, i) => (
            <li key={i}>{formatTextWithMarkdown(item)}</li>
          ))}
        </ul>
      );
    }

    // Handle numbered lists
    if (/^\d+\.\s/.test(trimmedSection)) {
      const items = trimmedSection.split(/\n(?=\d+\.\s)/).map(item => item.replace(/^\d+\.\s/, ''));
      return (
        <ol key={index} className="list-decimal list-inside my-4 space-y-2">
          {items.map((item, i) => (
            <li key={i}>{formatTextWithMarkdown(item)}</li>
          ))}
        </ol>
      );
    }

    // Handle regular paragraphs
    return (
      <p key={index} className="my-4">
        {formatTextWithMarkdown(trimmedSection)}
      </p>
    );
  });
}

function formatTextWithMarkdown(text: string): React.ReactNode {
  // Handle bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Handle strikethrough
  text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');
  
  // Handle links
  text = text.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
  );

  // Convert HTML-like strings to React elements
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: text,
      }}
    />
  );
}
