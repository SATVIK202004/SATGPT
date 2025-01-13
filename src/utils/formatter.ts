export function formatResponse(content: string): string {
  // Define regex to match split years (numbers that look like a year, e.g., 2023)
  const yearPattern = /(\d)\s*\n\s*(\d)\s*\n\s*(\d)\s*\n\s*(\d)(?=[\s.,]|$)/g;
  // Define regex to match currency splits (e.g., $ 10, $ 20)
  const currencyPattern = /\$\s*(\d+)/g;
  // Define regex to fix phone number splits (e.g., (123) 456-7890)
  const phoneNumberPattern = /(\(\d{3}\))\s*(\d{3})\s*-\s*(\d{4})/g;

  let formattedContent = content;

  // First pass: Join split years (1900-2099)
  formattedContent = formattedContent.replace(yearPattern, (_, d1, d2, d3, d4) => {
    const year = `${d1}${d2}${d3}${d4}`;
    return parseInt(year, 10) >= 1900 && parseInt(year, 10) <= 2099 ? year : `${d1}${d2}${d3}${d4}`;
  });

  // Second pass: Fix improperly split numbers (e.g., currency and phone numbers)
  formattedContent = formattedContent
    .replace(currencyPattern, '$$1')  // Fix currency splits
    .replace(phoneNumberPattern, '$1 $2-$3');  // Fix phone number format

  // Third pass: Fix improper split of numbers in non-code blocks
  formattedContent = formattedContent.replace(/(\d)\s*\n\s*(?=\d)/g, (match, digit, offset, fullString) => {
    const beforeMatch = fullString.slice(0, offset).trimEnd();
    const afterMatch = fullString.slice(offset).trimStart();

    // Don't modify if it's inside Python code or similar formatted content
    if (/(:|def|class|return|if|for|while|try|except|elif|else|with)\s*$/.test(beforeMatch) || /^[\d\w]/.test(afterMatch)) {
      return match;
    }

    return digit;
  });

  return formattedContent;
}
