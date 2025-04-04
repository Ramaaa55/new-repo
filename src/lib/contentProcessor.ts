import { Topic } from './types';
import { detectLanguage } from './languageDetection';
import { correctSpelling } from './spellChecker';
import { processTopicsToGraph, optimizeLayout, generateMermaidSyntax } from './processors/graphProcessor';
import { convertTopicsToJsonTree, validateJsonTree, enhanceJsonTree } from './processors/jsonTreeConverter';
import { convertTopicsToMindElixir } from './processors/mindElixirProcessor';
import { franc } from 'franc';
import nspell from 'nspell';
import SymSpell from 'symspell-node';

// Initialize spell checkers
const symSpell = new SymSpell();
let nspellChecker: any = null;

async function initializeSpellCheckers() {
  try {
    // Initialize nspell with English dictionary
    const response = await fetch('https://cdn.jsdelivr.net/npm/dictionary-en@3.0.0/index.aff');
    const affData = await response.text();
    const dictResponse = await fetch('https://cdn.jsdelivr.net/npm/dictionary-en@3.0.0/index.dic');
    const dicData = await dictResponse.text();
    nspellChecker = nspell(affData, dicData);
    
    // Initialize SymSpell dictionary
    await symSpell.loadDictionary('https://cdn.jsdelivr.net/npm/symspell-node@1.1.1/dict/frequency_dictionary_en_82_765.txt', 0, 1);
  } catch (error) {
    console.error('Error initializing spell checkers:', error);
  }
}

// Initialize spell checkers on module load
initializeSpellCheckers();

function preprocessText(text: string): string {
  if (!text) return '';
  
  // Basic text cleaning
  let processed = text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?;:()'"]/g, ' ')
    .trim();
  
  // Spell check using multiple engines for better accuracy
  const words = processed.split(/\s+/);
  const correctedWords = words.map(word => {
    // Skip special cases
    if (word.match(/^[0-9.,!?;:()'"-]+$/)) return word;
    if (word.length < 3) return word;
    
    let corrected = word;
    
    // Try nspell first
    if (nspellChecker && !nspellChecker.correct(word)) {
      const suggestions = nspellChecker.suggest(word);
      if (suggestions.length > 0) corrected = suggestions[0];
    }
    
    // If still potentially incorrect, try SymSpell
    if (corrected === word) {
      const suggestions = symSpell.lookup(word, 2);
      if (suggestions.length > 0) corrected = suggestions[0].term;
    }
    
    return corrected;
  });
  
  return correctedWords.join(' ');
}

function extractKeyPhrases(text: string): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const phrases: string[] = [];
  
  sentences.forEach(sentence => {
    // Extract noun phrases (simple heuristic)
    const nounPhrasePattern = /\b(?:[A-Z][a-z]+\s+)+[A-Z][a-z]+\b|\b[A-Z][a-z]+\b/g;
    const matches = sentence.match(nounPhrasePattern);
    if (matches) phrases.push(...matches);
    
    // Extract important phrases based on markers
    const markerPatterns = [
      /\b(?:is|are|was|were)\s+([^,.!?]+)/g,
      /\b(?:includes|contains|consists of)\s+([^,.!?]+)/g,
      /\b(?:such as|like|especially)\s+([^,.!?]+)/g
    ];
    
    markerPatterns.forEach(pattern => {
      const matches = sentence.match(pattern);
      if (matches) phrases.push(...matches.map(m => m.trim()));
    });
  });
  
  return [...new Set(phrases)];
}

function buildHierarchy(phrases: string[]): Topic[] {
  // Group related phrases
  const groups = new Map<string, string[]>();
  
  phrases.forEach(phrase => {
    const words = phrase.toLowerCase().split(' ');
    words.forEach(word => {
      if (word.length > 3) {
        if (!groups.has(word)) groups.set(word, []);
        groups.get(word)?.push(phrase);
      }
    });
  });
  
  // Create hierarchy based on phrase relationships
  const mainTopics: Topic[] = [];
  const usedPhrases = new Set<string>();
  
  // Sort groups by size to find main topics
  const sortedGroups = Array.from(groups.entries())
    .sort((a, b) => b[1].length - a[1].length);
  
  sortedGroups.forEach(([keyword, relatedPhrases]) => {
    if (relatedPhrases.length < 2) return;
    
    const mainPhrase = relatedPhrases[0];
    if (usedPhrases.has(mainPhrase)) return;
    
    const topic: Topic = {
      title: mainPhrase,
      subtopics: relatedPhrases.slice(1)
        .filter(phrase => !usedPhrases.has(phrase))
        .map(phrase => ({
          title: phrase,
          subtopics: []
        }))
    };
    
    usedPhrases.add(mainPhrase);
    topic.subtopics.forEach(st => usedPhrases.add(st.title));
    mainTopics.push(topic);
  });
  
  return mainTopics;
}

export async function processContent(
  text: string,
  options: {
    enhanceWithEmojis?: boolean;
    correctSpelling?: boolean;
    optimizeLayout?: boolean;
    outputFormat?: 'json' | 'mermaid' | 'mindElixir' | 'all';
  } = {}
): Promise<{
  topics: Topic[];
  mermaidDiagram?: string;
  jsonTree?: any;
  mindElixirData?: any;
  language: string;
}> {
  // Detect language
  const language = detectLanguage(text);
  
  // Preprocess text
  const processedText = preprocessText(text);
  
  // Extract key phrases
  const phrases = extractKeyPhrases(processedText);
  
  // Build topic hierarchy
  let topics = buildHierarchy(phrases);
  
  // Apply spelling corrections if requested
  if (options.correctSpelling) {
    topics = topics.map(topic => correctSpelling(topic));
  }
  
  // Process topics to graph
  const graph = processTopicsToGraph(topics);
  
  // Optimize layout if requested
  if (options.optimizeLayout) {
    optimizeLayout(graph);
  }
  
  // Prepare result
  const result: {
    topics: Topic[];
    mermaidDiagram?: string;
    jsonTree?: any;
    mindElixirData?: any;
    language: string;
  } = {
    topics,
    language: language.code
  };
  
  // Generate output based on requested format
  const outputFormat = options.outputFormat || 'all';
  
  if (outputFormat === 'mermaid' || outputFormat === 'all') {
    result.mermaidDiagram = generateMermaidSyntax(graph);
  }
  
  if (outputFormat === 'json' || outputFormat === 'all' || outputFormat === 'mindElixir') {
    const jsonTree = convertTopicsToJsonTree(topics, language.code);
    
    if (validateJsonTree(jsonTree)) {
      const enhancedTree = enhanceJsonTree(jsonTree);
      result.jsonTree = enhancedTree;
      
      if (outputFormat === 'mindElixir' || outputFormat === 'all') {
        result.mindElixirData = convertTopicsToMindElixir(topics, language.code);
      }
    }
  }
  
  return result;
}