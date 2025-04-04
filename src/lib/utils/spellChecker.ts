import Typo from 'typo-js';

// Initialize dictionary
let dictionary: Typo | null = null;
let isInitialized = false;

// Common grammar patterns to check
const grammarPatterns = [
  { pattern: /\s+,/g, replacement: ',' },                      // Remove space before comma
  { pattern: /,(?!\s)/g, replacement: ', ' },                  // Add space after comma
  { pattern: /\s+\./g, replacement: '.' },                     // Remove space before period
  { pattern: /\.(?!\s|$)/g, replacement: '. ' },               // Add space after period
  { pattern: /\s+!/g, replacement: '!' },                      // Remove space before exclamation mark
  { pattern: /!(?!\s|$)/g, replacement: '! ' },                // Add space after exclamation mark
  { pattern: /\s+\?/g, replacement: '?' },                     // Remove space before question mark
  { pattern: /\?(?!\s|$)/g, replacement: '? ' },               // Add space after question mark
  { pattern: /\s+;/g, replacement: ';' },                      // Remove space before semicolon
  { pattern: /;(?!\s|$)/g, replacement: '; ' },                // Add space after semicolon
  { pattern: /\s+:/g, replacement: ':' },                      // Remove space before colon
  { pattern: /:(?!\s|$)/g, replacement: ': ' },                // Add space after colon
  { pattern: /\bi\b/g, replacement: 'I' },                     // Capitalize standalone 'i'
  { pattern: /(?<=\.\s)\w/g, replacement: (match: string) => match.toUpperCase() },  // Capitalize first letter after period
  { pattern: /(?<=!\s)\w/g, replacement: (match: string) => match.toUpperCase() },   // Capitalize first letter after exclamation
  { pattern: /(?<=\?\s)\w/g, replacement: (match: string) => match.toUpperCase() },  // Capitalize first letter after question
];

/**
 * Initialize the spell checker with a dictionary
 */
async function initializeSpellChecker() {
  if (isInitialized) return;
  
  try {
    // Initialize English dictionary
    dictionary = new Typo('en_US');
    isInitialized = true;
    console.log('Spell checker initialized successfully');
  } catch (error) {
    console.error('Failed to initialize spell checker:', error);
    // Continue without spell checking if dictionary fails to load
  }
}

/**
 * Correct spelling errors in a text
 * @param text The text to correct
 * @returns The corrected text
 */
export async function correctSpelling(text: string): Promise<string> {
  if (!text) return text;
  
  // Initialize the spell checker if not already initialized
  await initializeSpellChecker();
  
  // If dictionary failed to initialize, return the original text
  if (!dictionary) return text;
  
  // Split text into words and non-word tokens
  const tokens = text.split(/(\s+|[.,;:!?()])/g);
  
  // Correct each word
  const correctedTokens = tokens.map(token => {
    // Skip empty tokens, whitespace, and punctuation
    if (!token.trim() || /^[\s.,;:!?()]+$/.test(token)) {
      return token;
    }
    
    // Skip words with numbers or special characters
    if (/[0-9@#$%^&*_+=\\|<>[\]{}]/.test(token)) {
      return token;
    }
    
    // Skip URLs and email addresses
    if (/^(https?:\/\/|www\.|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(token)) {
      return token;
    }
    
    // Check if the word is spelled correctly
    if (dictionary && dictionary.check(token)) {
      return token;
    }
    
    // Get suggestions for misspelled words
    const suggestions = dictionary ? dictionary.suggest(token) : [];
    
    // Return the first suggestion if available, otherwise return the original word
    return suggestions.length > 0 ? suggestions[0] : token;
  });
  
  // Join the corrected tokens back into a string
  let correctedText = correctedTokens.join('');
  
  // Apply grammar corrections
  for (const { pattern, replacement } of grammarPatterns) {
    if (typeof replacement === 'string') {
      correctedText = correctedText.replace(pattern, replacement);
    } else {
      correctedText = correctedText.replace(pattern, replacement);
    }
  }
  
  // Fix capitalization at the beginning of the text
  if (correctedText.length > 0) {
    correctedText = correctedText.charAt(0).toUpperCase() + correctedText.slice(1);
  }
  
  // Fix common double-word errors
  correctedText = correctedText.replace(/\b(\w+)\s+\1\b/gi, '$1');
  
  return correctedText;
}

/**
 * Check if a word is spelled correctly
 * @param word The word to check
 * @returns True if the word is spelled correctly
 */
export async function isSpelledCorrectly(word: string): Promise<boolean> {
  if (!word) return true;
  
  // Initialize the spell checker if not already initialized
  await initializeSpellChecker();
  
  // If dictionary failed to initialize, assume the word is correct
  if (!dictionary) return true;
  
  // Skip words with numbers or special characters
  if (/[0-9@#$%^&*_+=\\|<>[\]{}]/.test(word)) {
    return true;
  }
  
  // Skip URLs and email addresses
  if (/^(https?:\/\/|www\.|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(word)) {
    return true;
  }
  
  // Check if the word is spelled correctly
  return dictionary.check(word);
}

/**
 * Get spelling suggestions for a word
 * @param word The word to get suggestions for
 * @param limit Maximum number of suggestions to return
 * @returns Array of spelling suggestions
 */
export async function getSpellingSuggestions(word: string, limit = 5): Promise<string[]> {
  if (!word) return [];
  
  // Initialize the spell checker if not already initialized
  await initializeSpellChecker();
  
  // If dictionary failed to initialize, return empty array
  if (!dictionary) return [];
  
  // Skip words with numbers or special characters
  if (/[0-9@#$%^&*_+=\\|<>[\]{}]/.test(word)) {
    return [];
  }
  
  // Skip URLs and email addresses
  if (/^(https?:\/\/|www\.|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(word)) {
    return [];
  }
  
  // Get suggestions for the word
  const suggestions = dictionary.suggest(word);
  
  // Return suggestions up to the limit
  return suggestions.slice(0, limit);
}
