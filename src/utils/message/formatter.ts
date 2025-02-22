export interface FormattedSection {
  type: 'text' | 'code' | 'table' | 'header' | 'blockquote' | 'list';
  content: string[];
  language?: string;
  level?: number;
  headers?: string[];
  rows?: string[][];
}

export function parseMessage(content: string): FormattedSection[] {
  const sections: FormattedSection[] = [];
  const lines = content.split('\n');
  let currentSection: FormattedSection | null = null;

  const finishCurrentSection = () => {
    if (currentSection && currentSection.content.length > 0) {
      sections.push(currentSection);
      currentSection = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines between sections
    if (!trimmedLine && !currentSection) continue;

    // Table detection and parsing
    if (trimmedLine.startsWith('|') || (currentSection?.type === 'table' && trimmedLine.includes('|'))) {
      const cells = trimmedLine
        .split('|')
        .map(cell => cell.trim())
        .filter((cell, index, array) => {
          // Keep cells that have content or are between content
          return cell !== '' || (index > 0 && index < array.length - 1);
        });

      if (cells.length > 0) {
        if (!currentSection || currentSection.type !== 'table') {
          finishCurrentSection();
          currentSection = {
            type: 'table',
            content: [],
            headers: cells,
            rows: []
          };
        } else if (trimmedLine.includes('-|-') || trimmedLine.includes('|-|')) {
          // Skip separator line
          continue;
        } else if (currentSection.type === 'table' && cells.length > 0) {
          currentSection.rows = currentSection.rows || [];
          currentSection.rows.push(cells);
        }
        continue;
      }
    } else if (currentSection?.type === 'table') {
      finishCurrentSection();
    }

    // Code block detection
    if (trimmedLine.startsWith('```')) {
      if (currentSection?.type === 'code') {
        finishCurrentSection();
      } else {
        finishCurrentSection();
        const language = trimmedLine.slice(3).trim();
        currentSection = {
          type: 'code',
          content: [],
          language: language || 'plaintext'
        };
      }
      continue;
    }

    // Header detection
    if (trimmedLine.startsWith('#') && !currentSection) {
      const level = trimmedLine.match(/^#+/)?.[0].length || 1;
      sections.push({
        type: 'header',
        content: [trimmedLine.replace(/^#+\s/, '')],
        level
      });
      continue;
    }

    // Blockquote detection
    if (trimmedLine.startsWith('>') && !currentSection) {
      currentSection = {
        type: 'blockquote',
        content: [trimmedLine.slice(1).trim()]
      };
      continue;
    }

    // List detection
    if (/^[-*+]\s/.test(trimmedLine) || /^\d+\.\s/.test(trimmedLine)) {
      if (!currentSection?.type || currentSection.type !== 'list') {
        finishCurrentSection();
        currentSection = {
          type: 'list',
          content: []
        };
      }
      currentSection.content.push(trimmedLine);
      continue;
    }

    // Handle content based on current section type
    if (currentSection) {
      if (currentSection.type === 'code') {
        currentSection.content.push(line); // Preserve indentation for code
      } else if (!trimmedLine) {
        finishCurrentSection();
      } else {
        currentSection.content.push(trimmedLine);
      }
    } else {
      currentSection = {
        type: 'text',
        content: [trimmedLine]
      };
    }
  }

  finishCurrentSection();

  // Clean up table data
  return sections.map(section => {
    if (section.type === 'table' && section.rows) {
      // Remove the separator row if it was accidentally included
      section.rows = section.rows.filter(row => 
        !row.every(cell => cell.match(/^[-:|]+$/))
      );
      
      // Ensure all rows have the same number of columns as headers
      const headerCount = section.headers?.length || 0;
      section.rows = section.rows.map(row => {
        while (row.length < headerCount) row.push('');
        return row.slice(0, headerCount);
      });
    }
    return section;
  });
}
