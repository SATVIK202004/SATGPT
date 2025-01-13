import React from 'react';

export function formatMessage(content: string): React.ReactNode {
  // Fix split years (e.g., "2\n0\n2\n3" -> "2023")
  const fixedContent = content.replace(
    /(\d)\s*\n\s*(\d)\s*\n\s*(\d)\s*\n\s*(\d)(?=[\s\.,]|$)/g,
    (_, d1, d2, d3, d4) => {
      const year = `${d1}${d2}${d3}${d4}`;
      return /^(19|20)\d{2}$/.test(year) ? year : `${d1}${d2}${d3}${d4}`;
    }
  );

  // Split content into sections based on numbered points, paragraphs, or code blocks
  const sections = fixedContent.split(/(\n\n+)/); // Split by double newlines or more, preserving breaks

  return sections.map((section, index) => {
    const trimmedSection = section.trim();

    // Handle code blocks
    const isCodeBlock = /(^\s*def\s|\s+if\s|\s+for\s|\s+while\s|\s+class\s|^\s+return\s|^\s+import\s|^\s{4,})/m.test(trimmedSection);
    if (isCodeBlock) {
      return (
        <pre key={index} className="bg-gray-100 p-4 rounded mb-4">
          <code>{trimmedSection}</code>
        </pre>
      );
    }

    // Handle headings (h1, h2, h3)
    if (/^#{1,3}\s/.test(trimmedSection)) {
      const level = trimmedSection.match(/^#+/)[0].length;
      const headingText = trimmedSection.replace(/^#{1,3}\s/, '');
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return React.createElement(Tag, { key: index }, headingText);
    }

    // Handle blockquotes
    if (/^>\s/.test(trimmedSection)) {
      return (
        <blockquote key={index} className="italic border-l-4 pl-4 mb-4">
          {trimmedSection.replace(/^>\s/, '')}
        </blockquote>
      );
    }

    // Handle numbered points (e.g., "1.", "2.")
    const isPoint = /^\d+\.\s/.test(trimmedSection);
    if (isPoint) {
      return (
        <div key={index} className="mb-4">
          <p className="font-semibold mb-2">{trimmedSection.split('\n')[0]}</p>
          {trimmedSection
            .split('\n')
            .slice(1)
            .map((line, i) => (
              <p key={i} className="ml-4 mb-1">{line.trim()}</p>
            ))}
        </div>
      );
    }

    // Handle unordered lists (e.g., "- item", "* item")
    const isList = /^[-*]\s/.test(trimmedSection);
    if (isList) {
      const listItems = trimmedSection.split('\n').map((line, i) => (
        <li key={i} className="ml-4 mb-1">{line.trim().replace(/^[*-]\s/, '')}</li>
      ));
      return <ul key={index} className="list-disc">{listItems}</ul>;
    }

    // Handle regular paragraphs with bold, italic, and links
    const formattedSection = trimmedSection
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text: **bold**
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text: *italic*
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" className="text-blue-500">$1</a>'); // Links

    return (
      <div key={index} className="mb-4">
        <p dangerouslySetInnerHTML={{ __html: formattedSection }} />
      </div>
    );
  });
}
