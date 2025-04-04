import nspell from 'nspell';
import { detectLanguage } from './languageDetection';

const spellCheckers = new Map<string, any>();

export async function initializeSpellChecker(language: string) {
  if (spellCheckers.has(language)) return;

  try {
    const response = await fetch(`https://cdn.jsdelivr.net/npm/dictionary-${language}@latest/index.aff`);
    const affData = await response.text();
    
    const dictResponse = await fetch(`https://cdn.jsdelivr.net/npm/dictionary-${language}@latest/index.dic`);
    const dicData = await dictResponse.text();
    
    spellCheckers.set(language, nspell(affData, dicData));
  } catch (error) {
    console.error(`Failed to initialize spell checker for ${language}:`, error);
    // Fallback to English if language-specific dictionary fails
    if (language !== 'en') {
      await initializeSpellChecker('en');
      spellCheckers.set(language, spellCheckers.get('en'));
    }
  }
}

export async function correctSpelling(text: string): Promise<string> {
  const { code: detectedLanguage } = detectLanguage(text);
  await initializeSpellChecker(detectedLanguage);
  
  const spellChecker = spellCheckers.get(detectedLanguage) || spellCheckers.get('en');
  if (!spellChecker) return text;

  return text.split(/\s+/).map(word => {
    if (spellChecker.correct(word)) return word;
    
    const suggestions = spellChecker.suggest(word);
    return suggestions.length > 0 ? suggestions[0] : word;
  }).join(' ');
}