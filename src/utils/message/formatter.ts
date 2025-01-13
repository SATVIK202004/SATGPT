export interface MessageSection {
  type: 'point' | 'paragraph' | 'code' | 'list' | 'header';
  heading?: string;
  content: string[];
}

export function parseMessage(content: string): MessageSection[] {
  // Split sections by numbered points, double newlines, or code blocks
  const sections = content.split(/(?=\n?\d+\.\s|\n\n|^ {4,}|\n[-+*]\s)/);

  return sections.map((section) => {
    const trimmedSection = section.trimEnd(); // Preserve leading whitespace for code blocks

    // Check if the section is a code block
    const isCodeBlock = /^ {4,}|\b(def|class|import|return|if|for|while)\b/m.test(trimmedSection);

    if (isCodeBlock) {
      return {
        type: 'code',
        content: trimmedSection.split('\n'), // Preserve indentation and line breaks
      };
    }

    // Check if section starts with a numbered point
    const isPoint = /^\d+\.\s/.test(trimmedSection);
    const lines = trimmedSection.split('\n'); // Split into lines.

    if (isPoint) {
      return {
        type: 'point',
        heading: lines[0].trim(), // First line as heading
        content: lines.slice(1).map((line) => line.trim()).filter((line) => line), // Process the rest as content
      };
    }

    // Check if section starts with a bullet point
    const isList = /^[\*\-\+]\s/.test(trimmedSection);
    if (isList) {
      return {
        type: 'list',
        content: lines.map((line) => line.replace(/^[\*\-\+]\s/, '').trim()).filter((line) => line), // Remove list markers and clean
      };
    }

    // Check for headers (Markdown-style headers, e.g., # Heading)
    const isHeader = /^#\s/.test(trimmedSection);
    if (isHeader) {
      return {
        type: 'header',
        heading: lines[0].replace(/^#\s/, '').trim(), // Header without leading # and spaces
        content: lines.slice(1).map((line) => line.trim()).filter((line) => line), // Process content
      };
    }

    // Handle paragraphs
    return {
      type: 'paragraph',
      content: lines.map((line) => line.trim()).filter((line) => line), // Trim and filter empty lines
    };
  });
}
