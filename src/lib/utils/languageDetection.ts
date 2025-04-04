import * as franc from 'franc';
import * as ISO6391 from 'iso-639-1';

interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  confidence?: number;
}

/**
 * Detect the language of a text
 * @param text The text to detect the language of
 * @returns Information about the detected language
 */
export function detectLanguage(text: string): LanguageInfo {
  if (!text || text.trim().length < 10) {
    // Default to English for very short texts
    return {
      code: 'en',
      name: 'English',
      nativeName: 'English'
    };
  }

  try {
    // Use franc to detect the language
    const detectedLangCode = franc.franc(text);
    
    // If detection failed or returned 'und' (undefined)
    if (!detectedLangCode || detectedLangCode === 'und') {
      return {
        code: 'en',
        name: 'English',
        nativeName: 'English'
      };
    }
    
    // Convert 3-letter code to 2-letter ISO code
    const isoCode = detectedLangCode.substring(0, 2);
    
    // Get language details from ISO code
    if (ISO6391.validate(isoCode)) {
      return {
        code: isoCode,
        name: ISO6391.getName(isoCode),
        nativeName: ISO6391.getNativeName(isoCode)
      };
    } else {
      // Fallback to English if ISO code is not valid
      return {
        code: 'en',
        name: 'English',
        nativeName: 'English'
      };
    }
  } catch (error) {
    console.error('Error detecting language:', error);
    // Fallback to English on error
    return {
      code: 'en',
      name: 'English',
      nativeName: 'English'
    };
  }
}

/**
 * Get a list of supported languages
 * @returns Array of supported language information
 */
export function getSupportedLanguages(): LanguageInfo[] {
  return ISO6391.getLanguages().map(lang => ({
    code: lang.code,
    name: lang.name,
    nativeName: lang.nativeName
  }));
}
