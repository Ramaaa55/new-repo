import { franc, francAll } from 'franc';
import ISO6391 from 'iso-639-1';

export interface LanguageInfo {
  code: string;
  name: string;
  confidence: number;
  alternatives: Array<{
    code: string;
    name: string;
    confidence: number;
  }>;
}

export function detectLanguage(text: string): LanguageInfo {
  // Get primary language with confidence score
  const primaryLang = franc(text, { minLength: 20, only: ISO6391.getAllCodes() });
  
  // Get alternative language possibilities
  const allLangs = francAll(text, { minLength: 20, only: ISO6391.getAllCodes() });
  
  // Filter out the primary language from alternatives
  const alternatives = allLangs
    .filter(([code]) => code !== primaryLang)
    .slice(0, 3)
    .map(([code, confidence]) => ({
      code,
      name: ISO6391.getName(code),
      confidence: confidence
    }));

  return {
    code: primaryLang,
    name: ISO6391.getName(primaryLang),
    confidence: allLangs.find(([code]) => code === primaryLang)?.[1] || 0,
    alternatives
  };
}

export function translateNodeContent(
  content: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  // This is a placeholder for actual translation logic
  // You would typically call a translation API here
  return Promise.resolve(content);
}