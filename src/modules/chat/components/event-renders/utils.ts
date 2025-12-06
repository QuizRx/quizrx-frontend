/**
 * Utility function to extract and parse JSON from various formats
 * Handles:
 * 1. Markdown code blocks (```json ... ```)
 * 2. Plain JSON objects
 * 3. JSON followed by additional text
 */
export function extractJsonFromData(data: string): any {
  try {
    // Quick validation: data should have minimum length
    if (!data || data.trim().length < 5) {
      return null;
    }
    
    let jsonString = data;
    
    // Method 1: Extract from markdown code block (```json ... ```)
    const markdownJsonMatch = data.match(/```json\s*\n?([\s\S]*?)\n?```/);
    if (markdownJsonMatch) {
      jsonString = markdownJsonMatch[1].trim();
    } else {
      // Method 2: Extract first JSON object using regex
      const jsonObjectMatch = data.match(/\{[\s\S]*?\}/);
      if (jsonObjectMatch) {
        jsonString = jsonObjectMatch[0];
      }
    }
    
    // Validate that JSON looks complete (has matching braces)
    const openBraces = (jsonString.match(/\{/g) || []).length;
    const closeBraces = (jsonString.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      // JSON is incomplete, silently return null
      return null;
    }
    
    return JSON.parse(jsonString);
  } catch (e) {
    // Only log errors for data that looks like it should be valid JSON
    // (avoid logging streaming chunks that are obviously incomplete)
    if (data.trim().length > 20 && data.includes("}")) {
      console.error("Failed to parse JSON from data:", e);
      console.error("Raw data:", data);
    }
    return null;
  }
}

/**
 * Formats a value for display, handling null values and formatting underscores
 */
export function formatValue(value: string | null | undefined): string {
  if (!value || value === "null") return "Not specified";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

