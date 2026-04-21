/**
 * Safely parses a JSON string, handling potential markdown wrappers or trailing conversational text
 * that AI models sometimes include even when requested not to.
 */
export function safeParseJson<T = any>(text: string, fallback: T): T {
  if (!text) return fallback;
  
  try {
    // 1. Try direct parse
    return JSON.parse(text);
  } catch (e) {
    // 2. Try to extract JSON from markdown blocks or surrounding text
    try {
      const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (innerError) {
      console.error("Failed to parse extracted JSON:", innerError);
    }
    
    // 3. Last ditch: return fallback
    console.error("JSON parsing failed, returning fallback.", e);
    return fallback;
  }
}
