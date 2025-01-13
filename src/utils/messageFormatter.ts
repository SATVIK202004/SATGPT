
export function parseMessage(content: string) {
  // Fix split years first (e.g., "2\n0\n2\n3" -> "2023")
  const fixedContent = content.replace(
    /(\d)\s*\n\s*(\d)\s*\n\s*(\d)\s*\n\s*(\d)(?=[\s\.,]|$)/g,
    (_, d1, d2, d3, d4) => {
      const year = `${d1}${d2}${d3}${d4}`;
      // Check if the concatenated result forms a valid year in the range 1900-2099
      return /^(19|20)\d{2}$/.test(year) ? year : `${d1}${d2}${d3}${d4}`;
    }
  );

  // Split fixed content into sections without breaking code blocks
  const sections = fixedContent.split(/\n\n+/); // Split by double newlines or more for paragraph separation

  return sections.map((section) => {
    const trimmedSection = section.trim();

    // Check if section looks like a code block (e.g., contains indentation or typical Python keywords)
    const isCodeBlock = /(^\s*def\s|\s+if\s|\s+for\s|\s+while\s|\s+class\s|^\s+return\s|^\s+import\s)/m.test(trimmedSection);

    if (isCodeBlock) {
      return {
        type: 'code',
        content: trimmedSection // Keep code blocks intact
      };
    }

    // Check if section starts with a number followed by a dot and a space (valid numbered point)
    const isPoint = /^\d+\.\s/.test(trimmedSection);
    const lines = trimmedSection.split('\n'); // Split into lines

    if (isPoint) {
      return {
        type: 'point',
        heading: lines[0].trim(), // Extract and trim the heading
        content: lines.slice(1).map(line => line.trim()).filter(line => line) // Keep non-empty lines
      };
    }

    // Detect Bullet Points (lines starting with - or *)
    const isBulletPoint = /^\s*[-*]\s+/.test(trimmedSection);
    if (isBulletPoint) {
      return {
        type: 'bullet-point',
        content: lines.map(line => line.trim()).filter(line => line) // Keep non-empty lines
      };
    }

    // Detect Inline Code (e.g., `code`)
    const inlineCodeDetected = trimmedSection.replace(/`([^`]+)`/g, (match, p1) => {
      return `<code>${p1}</code>`;
    });

    // Detect Links (URLs)
    const withLinks = inlineCodeDetected.replace(
      /(https?:\/\/[^\s]+)/g, 
      (url) => `<a href="${url}" target="_blank">${url}</a>`
    );

    return {
      type: 'paragraph',
      content: withLinks.split('\n').map(line => line.trim()).filter(line => line) // Keep non-empty lines for paragraphs
    };
  });
}
