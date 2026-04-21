/**
 * Safely parses a JSON string, handling potential markdown wrappers or trailing conversational text
 * that AI models sometimes include even when requested not to.
 */
export function safeParseJson<T = any>(text: string, fallback: T): T {
  if (!text) return fallback;
  
  const cleaned = text.trim();
  
  // 1. Try direct parse
  try { 
    return JSON.parse(cleaned); 
  } catch (e) {}

  // 2. Try markdown extraction
  const mdMatch = cleaned.match(/```json\s*([\s\S]*?)\s*```/);
  if (mdMatch) {
    try { 
      return JSON.parse(mdMatch[1].trim()); 
    } catch (e) {}
  }

  // 3. Try to find the first '{' or '[' and find the largest valid JSON from there
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIdx = -1;
  let endChar = '';

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endChar = '}';
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endChar = ']';
  }

  if (startIdx !== -1) {
    const searchArea = cleaned.substring(startIdx);
    let lastEnd = searchArea.lastIndexOf(endChar);
    
    // Attempt to parse by shrinking from the last found closing character
    // This handles trailing "helpful" text from AI that might contain brackets
    let attempts = 0;
    while (lastEnd !== -1 && attempts < 10) { // Limit attempts for performance
      const candidate = searchArea.substring(0, lastEnd + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {
        lastEnd = searchArea.lastIndexOf(endChar, lastEnd - 1);
        attempts++;
      }
    }
  }

  console.error("JSON parsing failed, returning fallback.");
  return fallback;
}
