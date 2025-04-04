declare module 'typo-js' {
  class Typo {
    constructor(
      dictionary: string,
      affData?: string,
      wordData?: string,
      settings?: {
        platform?: string;
        dictionaryPath?: string;
      }
    );

    check(word: string): boolean;
    suggest(word: string): string[];
    
    // Add any other methods that might be used
    addWord(word: string): void;
    addWordWithAffix(word: string, affixFlags: string): void;
    removeWord(word: string): void;
  }

  export = Typo;
}
