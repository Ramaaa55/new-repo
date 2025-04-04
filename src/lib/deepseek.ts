import { Topic } from './types';
import { detectLanguage } from './utils/languageDetection';

// Add timeout and retry logic for API calls
const API_TIMEOUT = 30000;
const MAX_RETRIES = 3;

interface MindMapOptions {
  detailLevel: 'basic' | 'intermediate' | 'advanced';
  includeDescriptions: boolean;
  includeExamples: boolean;
  includeCrossConnections: boolean;
  includeColorCoding: boolean;
  includeCitations: boolean;
}

// Define emoji categories for enhanced visual representation
const CATEGORY_EMOJIS: Record<string, string[]> = {
  technology: ['💻', '🔌', '🖥️', '📱', '🤖', '⚙️', '🔧', '💾', '🌐', '📡'],
  business: ['📊', '💼', '📈', '🏢', '💰', '🤝', '📝', '📑', '🔍', '📣'],
  education: ['📚', '🎓', '✏️', '📖', '🔬', '🧪', '🧠', '🎯', '📋', '🧮'],
  health: ['🏥', '💊', '🩺', '🧬', '🍎', '🏃', '💪', '🧘', '❤️', '🫀'],
  environment: ['🌿', '🌳', '🌊', '☀️', '🌍', '♻️', '🌱', '🌷', '🦋', '🍃'],
  art: ['🎨', '🎭', '🎬', '📸', '🎵', '🎹', '🎸', '🖌️', '🎤', '🎧'],
  general: ['✅', '📌', '💡', '🔑', '⭐', '🎁', '🔔', '📢', '🔎', '📍']
};

// Get a relevant emoji based on topic content
function getTopicEmoji(topic: string): string {
  const lowerTopic = topic.toLowerCase();
  
  // Match topic to a category
  if (/tech|computer|software|hardware|ai|code|program|data|internet|digital/i.test(lowerTopic)) {
    return CATEGORY_EMOJIS.technology[Math.floor(Math.random() * CATEGORY_EMOJIS.technology.length)];
  } else if (/business|market|company|finance|money|sales|profit|customer|strategy|management/i.test(lowerTopic)) {
    return CATEGORY_EMOJIS.business[Math.floor(Math.random() * CATEGORY_EMOJIS.business.length)];
  } else if (/education|learn|school|study|teach|student|knowledge|science|research|academic/i.test(lowerTopic)) {
    return CATEGORY_EMOJIS.education[Math.floor(Math.random() * CATEGORY_EMOJIS.education.length)];
  } else if (/health|medical|doctor|patient|disease|wellness|fitness|diet|exercise|body/i.test(lowerTopic)) {
    return CATEGORY_EMOJIS.health[Math.floor(Math.random() * CATEGORY_EMOJIS.health.length)];
  } else if (/environment|nature|climate|green|sustainable|eco|plant|animal|earth|energy/i.test(lowerTopic)) {
    return CATEGORY_EMOJIS.environment[Math.floor(Math.random() * CATEGORY_EMOJIS.environment.length)];
  } else if (/art|creative|music|paint|design|film|photo|dance|theater|fashion/i.test(lowerTopic)) {
    return CATEGORY_EMOJIS.art[Math.floor(Math.random() * CATEGORY_EMOJIS.art.length)];
  } else {
    return CATEGORY_EMOJIS.general[Math.floor(Math.random() * CATEGORY_EMOJIS.general.length)];
  }
}

/**
 * Enhanced local fallback for when the DeepSeek API is not available
 * @param text The text to analyze
 * @returns A rich topic structure with detailed content
 */
function localTextAnalysis(text: string): Topic[] {
  console.log('Using enhanced local text analysis as fallback');
  
  // Split text into sentences and paragraphs
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  
  // Extract keywords based on frequency and importance
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Sort words by frequency
  const keywords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)  // Get more keywords for richer content
    .map(entry => entry[0]);
  
  // Create a main topic with rich content
  const mainTitle = paragraphs[0]?.substring(0, 50).trim() || 'Main Topic';
  const mainEmoji = getTopicEmoji(mainTitle);
  
  const mainTopic: Topic = {
    title: `${mainEmoji} ${mainTitle}`,
    description: paragraphs[0] || 'No description available',
    examples: [
      sentences[0] || 'Example content will appear here',
      sentences[1] || 'Additional examples help illustrate key points'
    ],
    context: 'This is the primary topic extracted from the text',
    icon: mainEmoji,
    color: '#FEF3C7',
    subtopics: []
  };
  
  // Group sentences by similarity to create coherent topics
  const topics: Record<string, string[]> = {};
  keywords.forEach(keyword => {
    topics[keyword] = sentences.filter(sentence => 
      sentence.toLowerCase().includes(keyword)
    );
  });
  
  // Create subtopics based on keywords and their related sentences
  const subtopics = Object.entries(topics)
    .filter(([_, sentences]) => sentences.length > 0)
    .map(([keyword, topicSentences], index) => {
      // Create a descriptive title with proper capitalization
      const title = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      const topicEmoji = getTopicEmoji(title);
      
      // Create a rich description using multiple sentences
      const description = topicSentences.slice(0, 3).join(' ');
      
      // Extract examples from the sentences
      const examples = topicSentences.slice(3, 6).map(s => s.trim());
      
      // Create sub-subtopics with detailed content
      const subSubtopics = topicSentences.slice(6, 11).map((sentence, i) => {
        const subEmoji = CATEGORY_EMOJIS.general[i % CATEGORY_EMOJIS.general.length];
        return {
          title: `${subEmoji} ${sentence.length > 50 ? sentence.substring(0, 50) + '...' : sentence}`,
          description: sentence,
          examples: [
            `Point ${i+1}: ${sentence.split(' ').slice(0, 5).join(' ')}...`,
            `Detail: ${sentence.split(' ').slice(-5).join(' ')}...`
          ],
          context: `Supporting detail for ${title}`,
          icon: subEmoji,
          color: i % 2 === 0 ? '#E0F2FE' : '#FCE7F3',
          subtopics: []
        };
      });
      
      // Create related topics connections
      const relatedKeywords = keywords
        .filter(k => k !== keyword && Math.random() > 0.7)  // Random selection of related topics
        .slice(0, 3);
      
      return {
        title: `${topicEmoji} ${title}`,
        description,
        examples,
        context: `This topic appears ${topicSentences.length} times in the text`,
        icon: topicEmoji,
        color: index % 2 === 0 ? '#E0F2FE' : '#FCE7F3',
        relatedTopics: relatedKeywords,
        subtopics: subSubtopics
      };
    });
  
  if (subtopics.length > 0) {
    mainTopic.subtopics = subtopics.slice(0, 7);  // Include more subtopics for richness
  } else {
    // If no keywords found, use paragraphs as subtopics
    mainTopic.subtopics = paragraphs.slice(1, 8).map((p, i) => {
      const firstSentence = p.split(/[.!?]+/)[0].trim();
      const topicEmoji = CATEGORY_EMOJIS.general[i % CATEGORY_EMOJIS.general.length];
      
      return {
        title: `${topicEmoji} ${firstSentence.length > 50 ? firstSentence.substring(0, 50) + '...' : firstSentence}`,
        description: p,
        examples: [
          `Key point: ${p.split(' ').slice(0, 7).join(' ')}...`,
          `Detail: ${p.split(' ').slice(-7).join(' ')}...`
        ],
        context: `Paragraph ${i+2} from the original text`,
        icon: topicEmoji,
        color: i % 2 === 0 ? '#E0F2FE' : '#FCE7F3',
        subtopics: []
      };
    });
  }
  
  return [mainTopic];
}

export async function analyzeText(text: string, options: MindMapOptions): Promise<Topic[]> {
  // Check if API key is valid (not empty and not the placeholder)
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  const isValidApiKey = apiKey && 
                        apiKey.trim() !== '' && 
                        apiKey !== 'your_deepseek_api_key_here';
  
  // Fallback to local processing if API key is not available or invalid
  if (!isValidApiKey) {
    console.warn('DeepSeek API key not found or invalid. Falling back to local processing.');
    return localTextAnalysis(text);
  }

  let retries = 0;
  let lastError: Error | null = null;
  
  while (retries < MAX_RETRIES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const languageInfo = detectLanguage(text);
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{
            role: 'system',
            content: `You are an expert at comprehensive text analysis and mind mapping. Create an engaging and informative mind map structure that includes rich context, meaningful relationships, and visual enhancements. The source text is in ${languageInfo.code}.

          🎯 **Detail Level**: ${options.detailLevel}
          - 🔍 Basic: Essential concepts with clear, direct relationships
          - 📚 Intermediate: Key concepts plus supporting details and examples
          - 🎓 Advanced: In-depth analysis with comprehensive examples and interconnections

          ✨ **Required Elements** (based on settings):
          - 📝 Descriptions: ${options.includeDescriptions} (Clear, engaging explanations using full sentences)
          - 💡 Examples: ${options.includeExamples} (Practical, real-world applications)
          - 🔄 Cross-Connections: ${options.includeCrossConnections} (Meaningful relationships)
          - 🎨 Color Coding: ${options.includeColorCoding} (Intuitive visual organization)
          - 📚 Citations: ${options.includeCitations} (Source references)

          🌟 **CRITICAL REQUIREMENTS**:
          1. 📊 Create **meaningful hierarchies** with clear parent-child relationships
          2. 📖 Write **full sentences** for all descriptions and titles - NEVER use just 1-2 words
          3. 🎯 Include **relevant examples** that illustrate key points
          4. 🔄 Highlight **cross-connections** between related topics
          5. 🎨 Use **emojis and icons** to enhance understanding
          6. ⚖️ Maintain **balanced structure** utilizing both X and Y axes
          7. ✅ Ensure **accuracy** and relevance of all information
          8. 📐 Keep **consistent detail** across all branches
          9. 💎 Use **clear, engaging language** throughout
          10. 🎯 Limit to **3 levels** of hierarchy for clarity

          IMPORTANT FORMATTING RULES:
          1. Each topic title MUST start with an emoji
          2. All descriptions MUST be full sentences (at least 10-15 words)
          3. Include at least 2-3 examples per topic
          4. Use bullet points within descriptions where appropriate
          5. Ensure balanced distribution of content (not just horizontal)

          Your response must be a valid JSON array containing only the enhanced topics structure. Do not include any additional text, markdown, or explanations outside the JSON array.`
          }, {
            role: 'user',
            content: `Analyze this text and create a detailed mind map with rich content, full sentences, and visual elements: ${text.substring(0, 4000)}`
          }],
          temperature: 0.7,
          max_tokens: 4000,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`API error: ${response.status}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
      }

      const data = await response.json();
      let topics = await parseAIResponse(data.choices[0].message.content);
      
      // Enhance the topics with emojis if they don't already have them
      topics = enhanceTopicsWithEmojis(topics);
      
      return topics;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries++;
      
      console.error(`API call failed (attempt ${retries}/${MAX_RETRIES}):`, 
        error instanceof Error ? error.message : String(error));
      
      if (retries === MAX_RETRIES) {
        // Fallback to local processing on final retry
        console.warn('Falling back to local processing after API failures');
        return localTextAnalysis(text);
      }
      
      // Exponential backoff with jitter
      const backoffTime = Math.min(1000 * Math.pow(2, retries) + Math.random() * 1000, 10000);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }

  throw new Error(`Failed to analyze text: ${lastError?.message || 'Unknown error'}`);
}

// Function to enhance topics with emojis if they don't already have them
function enhanceTopicsWithEmojis(topics: Topic[]): Topic[] {
  return topics.map(topic => {
    // Check if the topic already has an emoji at the start
    if (!topic.title.match(/^[\p{Emoji}]/u)) {
      const emoji = getTopicEmoji(topic.title);
      topic.title = `${emoji} ${topic.title}`;
      topic.icon = emoji;
    }
    
    // Ensure description is a full sentence
    if (topic.description && topic.description.split(' ').length < 8) {
      topic.description = `This section covers ${topic.description} in detail, explaining key concepts and applications.`;
    }
    
    // Add examples if missing
    if (!topic.examples || topic.examples.length === 0) {
      topic.examples = [
        `Example: ${topic.title.replace(/^[\p{Emoji}]\s*/u, '')}`,
        'For more details, explore the subtopics below.'
      ];
    }
    
    // Process subtopics recursively
    if (topic.subtopics && topic.subtopics.length > 0) {
      topic.subtopics = enhanceTopicsWithEmojis(topic.subtopics);
    }
    
    return topic;
  });
}

async function cleanJsonContent(content: string): Promise<string> {
  try {
    // Log the raw content for debugging
    console.log('Raw AI Content:', content);
    
    // First try to parse the content directly
    JSON.parse(content);
    return content;
  } catch (e) {
    // If direct parsing fails, try to extract and clean the JSON
    try {
      // Remove any markdown code block markers
      let cleaned = content.replace(/```json\n?|\n?```/g, '');
      
      // Find the first '[' and last ']' to extract the array
      const startIndex = cleaned.indexOf('[');
      const endIndex = cleaned.lastIndexOf(']');
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('No valid JSON array found');
      }
      
      cleaned = cleaned.slice(startIndex, endIndex + 1);
      
      // Replace smart quotes with regular quotes
      cleaned = cleaned.replace(/[""]/g, '"');
      
      // Replace single quotes with double quotes
      cleaned = cleaned.replace(/'/g, '"');
      
      // Remove trailing commas in arrays and objects
      cleaned = cleaned.replace(/,(\s*[\]}])/g, '$1');
      
      // Remove any remaining non-JSON characters
      cleaned = cleaned.replace(/[^\x20-\x7E]/g, '');
      
      // Try to parse the cleaned content
      try {
        JSON.parse(cleaned);
        return cleaned;
      } catch (parseError) {
        // If parsing still fails, try to repair the JSON
        const { jsonrepair } = await import('jsonrepair');
        return jsonrepair(cleaned);
      }
    } catch (cleanError) {
      console.error('Error cleaning JSON:', cleanError);
      // Return a valid empty array as fallback
      return '[]';
    }
  }
}

async function parseAIResponse(content: string): Promise<Topic[]> {
  try {
    const cleanedContent = await cleanJsonContent(content);
    let topics: Topic[];

    try {
      topics = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Error parsing cleaned content:', parseError);
      return [{
        title: '❌ Error Processing Content',
        description: 'An error occurred while analyzing the text. The system was unable to generate a proper mind map structure.',
        examples: ['Please try again with simpler text', 'Consider breaking down your content into smaller sections'],
        context: 'The AI was unable to process the input correctly',
        icon: '❌',
        color: '#FEE2E2',
        subtopics: []
      }];
    }

    if (!Array.isArray(topics)) {
      console.error('Invalid topics structure - not an array');
      return [{
        title: '⚠️ Invalid Structure',
        description: 'The generated content was not in the correct format. This usually happens when the AI generates unexpected output.',
        examples: ['Try again with different content', 'Check if your text contains unusual formatting'],
        context: 'Processing error',
        icon: '⚠️',
        color: '#FEF3C7',
        subtopics: []
      }];
    }

    const isValidTopic = (topic: any): topic is Topic => {
      if (!topic || typeof topic !== 'object') return false;
      if (typeof topic.title !== 'string' || !topic.title.trim()) return false;
      
      // Validate optional properties if they exist
      if (topic.description !== undefined && typeof topic.description !== 'string') return false;
      if (topic.examples !== undefined && !Array.isArray(topic.examples)) return false;
      if (topic.context !== undefined && typeof topic.context !== 'string') return false;
      if (topic.icon !== undefined && typeof topic.icon !== 'string') return false;
      if (topic.color !== undefined && typeof topic.color !== 'string') return false;
      if (topic.citations !== undefined && !Array.isArray(topic.citations)) return false;
      if (topic.relatedTopics !== undefined && !Array.isArray(topic.relatedTopics)) return false;
      
      // Recursively validate subtopics if they exist
      if (topic.subtopics !== undefined) {
        if (!Array.isArray(topic.subtopics)) return false;
        if (!topic.subtopics.every(isValidTopic)) return false;
      }
      
      return true;
    };

    // Filter out invalid topics and ensure we have at least one valid topic
    topics = topics.filter(isValidTopic);
    
    if (!topics.length) {
      return [{
        title: '📋 No Valid Topics',
        description: 'The analysis did not produce any valid topics. This might be due to the complexity or format of your input text.',
        examples: ['Try using clearer, more structured text', 'Break down complex ideas into simpler components'],
        context: 'Processing error',
        icon: '📋',
        color: '#FEF9C3',
        subtopics: []
      }];
    }

    return topics;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [{
      title: '🚨 Error Processing Content',
      description: 'An error occurred while analyzing the text. The system encountered technical difficulties during processing.',
      examples: ['Please try again with simpler text', 'If the problem persists, contact support'],
      context: 'The AI was unable to process the input correctly',
      icon: '🚨',
      color: '#FEE2E2',
      subtopics: []
    }];
  }
}