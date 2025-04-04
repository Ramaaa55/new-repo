import { Topic } from '../types';

// Map of categories to relevant emojis
const categoryEmojiMap: Record<string, string[]> = {
  // Technology & Computing
  technology: ['💻', '🖥️', '⌨️', '🖱️', '🔌', '💾', '📱', '📶', '🌐', '📡'],
  programming: ['👨‍💻', '👩‍💻', '🧑‍💻', '⚙️', '🔧', '🧮', '📊', '📈', '🔍', '🧪'],
  ai: ['🤖', '🧠', '⚡', '💡', '🔮', '🧩', '📊', '🧬', '🔍', '📈'],
  data: ['📊', '📈', '📉', '📇', '🔢', '🧮', '💽', '🗃️', '📋', '🔍'],
  
  // Business & Finance
  business: ['💼', '🏢', '📊', '📈', '💰', '💵', '🤝', '📝', '🗂️', '📑'],
  finance: ['💰', '💵', '💸', '💹', '📊', '📈', '🏦', '💳', '💎', '🧮'],
  marketing: ['📣', '📢', '🔍', '📊', '📈', '🎯', '💡', '📱', '📧', '📝'],
  
  // Education & Learning
  education: ['🎓', '📚', '📝', '✏️', '📖', '🧠', '👨‍🏫', '👩‍🏫', '🏫', '🔍'],
  learning: ['📚', '📖', '🧠', '💡', '🔍', '📝', '✏️', '🎓', '👨‍🎓', '👩‍🎓'],
  
  // Science & Research
  science: ['🔬', '🧪', '⚗️', '🧫', '🧬', '🔭', '📡', '⚛️', '🔍', '📊'],
  research: ['🔍', '🔬', '📊', '📈', '📝', '📚', '🧪', '🔭', '💡', '🧠'],
  
  // Health & Medicine
  health: ['❤️', '🩺', '💉', '💊', '🏥', '🧬', '🦠', '🧪', '🍎', '🏃'],
  medicine: ['💊', '💉', '🩺', '🏥', '👨‍⚕️', '👩‍⚕️', '🧬', '🦠', '🧪', '❤️'],
  
  // Arts & Creativity
  art: ['🎨', '🖌️', '🖼️', '👨‍🎨', '👩‍🎨', '✏️', '📝', '🎭', '🎬', '📷'],
  music: ['🎵', '🎶', '🎸', '🎹', '🎷', '🎺', '🎻', '🥁', '🎤', '🎧'],
  design: ['🎨', '✏️', '📐', '📏', '🖌️', '👨‍🎨', '👩‍🎨', '💡', '🖥️', '📱'],
  
  // Nature & Environment
  nature: ['🌿', '🌱', '🌳', '🌲', '🌴', '🌺', '🌸', '🌼', '🌻', '🍃'],
  environment: ['🌍', '🌎', '🌏', '🌱', '🌿', '🌳', '🌊', '☀️', '💨', '♻️'],
  
  // Communication & Social
  communication: ['🗣️', '📣', '📢', '📱', '📧', '✉️', '📝', '🤝', '👥', '💬'],
  social: ['👥', '👨‍👩‍👧‍👦', '🤝', '💬', '🗣️', '📱', '📧', '📢', '🌐', '❤️'],
  
  // Time & Planning
  time: ['⏰', '⌚', '⏱️', '📅', '🗓️', '⏳', '⌛', '🕰️', '🔄', '📆'],
  planning: ['📅', '📆', '📝', '📋', '✅', '📊', '🎯', '⏱️', '🔄', '📈'],
  
  // Emotions & Psychology
  emotions: ['😊', '😢', '😡', '😍', '😱', '😄', '😔', '😌', '❤️', '💔'],
  psychology: ['🧠', '💭', '❤️', '😊', '😔', '💡', '🔍', '📝', '🛋️', '🧩'],
  
  // Travel & Places
  travel: ['✈️', '🚂', '🚗', '🚢', '🏝️', '🏔️', '🗺️', '🧳', '🌍', '🏨'],
  places: ['🏠', '🏢', '🏫', '🏥', '🏭', '🏛️', '🏰', '🏯', '🏝️', '🏔️'],
  
  // Food & Drink
  food: ['🍎', '🍕', '🍔', '🍣', '🍜', '🍝', '🍖', '🍗', '🥗', '🍰'],
  drink: ['🍵', '☕', '🍶', '🍷', '🍸', '🍹', '🍺', '🍻', '🥤', '🧃'],
  
  // Sports & Fitness
  sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎯', '🏆', '🥇'],
  fitness: ['🏋️', '🏃', '🚴', '🧘', '💪', '🤸', '🏊', '⛹️', '🤾', '🥗'],
  
  // General Concepts
  idea: ['💡', '🧠', '✨', '💭', '🔍', '📝', '🎯', '🧩', '⚡', '🔮'],
  success: ['🏆', '🥇', '✅', '🎯', '💯', '🚀', '💪', '👍', '🔝', '⭐'],
  challenge: ['🏆', '🧗', '🏋️', '🔥', '💪', '🎯', '⚔️', '🛡️', '🧩', '⚡'],
  growth: ['📈', '🌱', '🚀', '💹', '⬆️', '💪', '🔝', '🧠', '📊', '💡'],
  innovation: ['💡', '🚀', '⚡', '✨', '🔮', '🧩', '🔍', '🧪', '⚙️', '🔧'],
  quality: ['✅', '💯', '🏆', '⭐', '🔝', '👌', '🎖️', '🥇', '💎', '🔍'],
  efficiency: ['⚡', '⏱️', '🚀', '⚙️', '🔧', '📈', '💯', '✅', '🎯', '💪'],
  security: ['🔒', '🛡️', '🔐', '🔑', '👮', '🚨', '🚫', '⚠️', '🔍', '✅'],
  analysis: ['🔍', '📊', '📈', '📉', '🧮', '🧠', '📝', '📋', '🔢', '⚙️'],
  strategy: ['♟️', '🎯', '📊', '📈', '🧩', '🧠', '📝', '🔍', '⚙️', '🚀'],
  leadership: ['👑', '🏆', '🚩', '👨‍💼', '👩‍💼', '🔝', '💪', '🤝', '📢', '💡'],
  collaboration: ['🤝', '👥', '👨‍👩‍👧‍👦', '🔄', '🧩', '🏆', '💬', '📝', '🤲', '🌐'],
  problem: ['⚠️', '❓', '🧩', '🔍', '🔧', '⚙️', '💡', '📝', '🧠', '🎯'],
  solution: ['💡', '✅', '🔑', '🧩', '🔍', '🔧', '⚙️', '📝', '🧠', '🎯']
};

// Map of keywords to relevant emojis (for more specific matching)
const keywordEmojiMap: Record<string, string> = {
  // Concepts and ideas
  'idea': '💡',
  'concept': '🧠',
  'theory': '🔬',
  'philosophy': '🧐',
  'thought': '💭',
  'insight': '✨',
  
  // Actions
  'create': '🛠️',
  'build': '🏗️',
  'develop': '⚙️',
  'implement': '🔧',
  'design': '🎨',
  'analyze': '🔍',
  'research': '🔎',
  'study': '📚',
  'learn': '🧩',
  'teach': '👨‍🏫',
  'share': '🤝',
  
  // Technology
  'technology': '💻',
  'computer': '🖥️',
  'software': '📊',
  'hardware': '🔌',
  'data': '📊',
  'ai': '🤖',
  'machine learning': '🧮',
  'algorithm': '📈',
  'code': '👨‍💻',
  'programming': '⌨️',
  'web': '🌐',
  'internet': '📡',
  'cloud': '☁️',
  
  // Business
  'business': '💼',
  'company': '🏢',
  'startup': '🚀',
  'entrepreneur': '👔',
  'market': '📊',
  'finance': '💰',
  'money': '💵',
  'investment': '📈',
  'strategy': '♟️',
  'planning': '📝',
  'management': '👨‍💼',
  'leadership': '👑',
  
  // Communication
  'communication': '🗣️',
  'language': '🔤',
  'speech': '🎤',
  'writing_skill': '✍️',
  'message': '📨',
  'email': '📧',
  'chat': '💬',
  'discussion': '👥',
  'presentation': '📊',
  
  // Education
  'education': '🎓',
  'school': '🏫',
  'university': '🏛️',
  'course': '📒',
  'class': '👨‍🎓',
  'student': '👩‍🎓',
  'teacher': '👨‍🏫',
  'learning': '📖',
  'knowledge': '🧠',
  
  // Science
  'science': '🔬',
  'biology': '🧬',
  'chemistry': '⚗️',
  'physics': '⚛️',
  'math': '🔢',
  'astronomy': '🔭',
  'medicine': '💊',
  'experiment': '🧪',
  'research_science': '🔍',
  
  // Arts
  'art': '🎨',
  'music': '🎵',
  'film': '🎬',
  'photography': '📷',
  'design_art': '✏️',
  'literature': '📚',
  'writing_art': '✍️',
  'creativity': '🌈',
  
  // Nature
  'nature': '🌿',
  'environment': '🌎',
  'animal': '🐾',
  'plant': '🌱',
  'ecosystem': '🌳',
  'climate': '🌤️',
  'weather': '☀️',
  'ocean': '🌊',
  'mountain': '⛰️',
  
  // Time
  'time': '⏰',
  'history': '📜',
  'future': '🔮',
  'past': '⏮️',
  'present': '⏯️',
  'schedule': '📅',
  'deadline': '⏳',
  
  // Emotions
  'emotion': '😊',
  'feeling': '💓',
  'happiness': '😄',
  'sadness': '😢',
  'anger': '😠',
  'fear': '😨',
  'love': '❤️',
  'joy': '🥳',
  
  // Health
  'health': '💪',
  'wellness': '🧘',
  'fitness': '🏋️',
  'nutrition': '🥗',
  'medicine_health': '💊',
  'mental_health': '🧠',
  'exercise': '🏃',
  
  // Travel
  'travel': '✈️',
  'journey': '🧳',
  'adventure': '🧭',
  'exploration': '🗺️',
  'destination': '📍',
  'tourism': '📸',
  
  // Social
  'social': '👥',
  'community': '🏘️',
  'society': '🌆',
  'culture': '🎭',
  'relationship': '👫',
  'family': '👨‍👩‍👧‍👦',
  'friend': '🤝',
  
  // Miscellaneous
  'problem': '⚠️',
  'solution': '🔑',
  'challenge': '🏆',
  'opportunity': '🚪',
  'success': '✅',
  'failure': '❌',
  'growth': '📈',
  'decline': '📉',
  'change': '🔄',
  'innovation': '💫',
  'improvement': '📈',
  'quality': '✅',
  'quantity': '🔢',
  'balance': '⚖️',
  'diversity': '🌈',
  'security': '🔒',
  'privacy': '🕵️',
  'ethics': '⚖️',
  'law': '⚖️',
  'policy': '📜',
  'government': '🏛️',
  'politics': '🗳️',
  'democracy': '🗽',
  'freedom': '🕊️',
  'peace': '☮️',
  'war': '⚔️',
  'conflict': '🥊',
  'cooperation': '🤝',
  'competition': '🏁',
  'goal': '🎯',
  'achievement': '🏆',
  'reward': '🏅',
  'motivation': '🔥',
  'inspiration': '✨',
  'creativity_misc': '🎨',
  'imagination': '🌈',
  'dream': '💭',
  'reality': '🌐',
  'virtual': '👓',
  'digital': '💾',
  'analog': '📻',
  'modern': '🏙️',
  'traditional': '🏺',
  'old': '👴',
  'new': '🆕',
  'beginning': '🌅',
  'end': '🌇',
  'process': '⚙️',
  'system': '🔄',
  'structure': '🏗️',
  'organization': '📋',
  'hierarchy': '📊',
  'network': '🕸️',
  'connection': '🔗',
  'link': '🔗',
  'relationship_misc': '👫',
  'dependency': '⛓️',
  'integration': '🧩',
  'separation': '✂️',
  'division': '➗',
  'unity': '🤝',
  'collaboration': '👥',
  'teamwork': '🏉',
  'individual': '👤',
  'group': '👪',
  'community_misc': '🏘️',
  'global': '🌎',
  'local': '📍',
  'universal': '🌌',
  'specific': '🎯',
  'general': '🔄',
  'abstract': '💭',
  'concrete': '🧱',
  'physical': '💪',
  'mental': '🧠',
  'spiritual': '🧘',
  'emotional': '❤️',
  'logical': '🧮',
  'rational': '🤔',
  'intuitive': '🔮',
  'conscious': '👁️',
  'unconscious': '💤',
  'visible': '👁️',
  'invisible': '👻',
  'tangible': '👐',
  'intangible': '💨',
  'real': '🏞️',
  'imaginary': '🦄',
  'true': '✅',
  'false': '❌',
  'right': '✅',
  'wrong': '❌',
  'good': '👍',
  'bad': '👎',
  'positive': '➕',
  'negative': '➖',
  'neutral': '⚪',
  'objective': '🔭',
  'subjective': '🧠',
  'fact': '📊',
  'opinion': '💭',
  'belief': '🙏',
  'doubt': '🤔',
  'certainty': '💯',
  'uncertainty': '❓',
  'probability': '🎲',
  'possibility': '🚪',
  'opportunity_misc': '🚪',
  'threat': '⚠️',
  'strength': '💪',
  'weakness': '🩹',
  'advantage': '🥇',
  'disadvantage': '🥉',
  'benefit': '🎁',
  'cost': '💰',
  'profit': '💵',
  'loss': '📉',
  'investment_misc': '📈',
  'return': '🔙',
  'input': '⌨️',
  'output': '🖨️',
  'cause': '🔍',
  'effect': '💥',
  'reason': '🧐',
  'result': '🏁',
  'purpose': '🎯',
  'function': '⚙️',
  'role': '🎭',
  'responsibility': '📝',
  'duty': '📋',
  'right_misc': '✅',
  'privilege': '👑',
  'power': '⚡',
  'control': '🎮',
  'influence': '🧲',
  'authority': '👮',
  'leadership_misc': '👑',
  'management_misc': '👨‍💼',
  'supervision': '👁️',
  'guidance': '🧭',
  'direction': '🧭',
  'instruction': '📝',
  'education_misc': '🎓',
  'training': '🏋️',
  'development': '📈',
  'growth_misc': '🌱',
  'evolution': '🧬',
  'progress': '➡️',
  'advancement': '⏩',
  'improvement_misc': '📈',
  'enhancement': '✨',
  'optimization': '⚡',
  'efficiency': '⚡',
  'effectiveness': '🎯',
  'productivity': '⚙️',
  'performance': '📊',
  'quality_misc': '✅',
  'excellence': '🏆',
  'perfection': '💯',
  'precision': '🎯',
  'accuracy': '🎯',
  'error': '❌',
  'mistake': '❌',
  'failure_misc': '❌',
  'success_misc': '✅',
  'achievement_misc': '🏆',
  'accomplishment': '🏆',
  'completion': '🏁',
  'finish': '🏁',
  'start': '🏁',
  'beginning_misc': '🌅',
  'end_misc': '🌇',
  'middle': '⏸️',
  'center': '🎯',
  'core': '🎯',
  'foundation': '🏗️',
  'base': '🏗️',
  'support': '🤝',
  'structure_misc': '🏗️',
  'framework': '🏗️',
  'architecture': '🏛️'
};

/**
 * Find the most relevant emoji for a given text using advanced matching
 * @param text The text to find an emoji for
 * @returns The most relevant emoji or null if none found
 */
function findRelevantEmoji(text: string): string | null {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  
  // First, check for exact matches in the keyword map
  for (const [keyword, emoji] of Object.entries(keywordEmojiMap)) {
    if (lowerText === keyword || lowerText.includes(` ${keyword} `)) {
      return emoji;
    }
  }
  
  // Then check for keywords contained in the text
  for (const [keyword, emoji] of Object.entries(keywordEmojiMap)) {
    if (lowerText.includes(keyword)) {
      return emoji;
    }
  }
  
  // If no direct keyword match, try to match categories
  for (const [category, emojis] of Object.entries(categoryEmojiMap)) {
    if (lowerText.includes(category)) {
      // Return a random emoji from the category
      return emojis[Math.floor(Math.random() * emojis.length)];
    }
  }
  
  // Try to find partial matches in categories
  const words = lowerText.split(/\s+/);
  for (const word of words) {
    if (word.length < 3) continue; // Skip short words
    
    for (const [category, emojis] of Object.entries(categoryEmojiMap)) {
      if (category.includes(word) || word.includes(category)) {
        return emojis[Math.floor(Math.random() * emojis.length)];
      }
    }
  }
  
  // No relevant emoji found
  return null;
}

/**
 * Enhance a topic with an emoji based on its content
 * @param topic The topic to enhance
 * @returns The enhanced topic with emoji
 */
export function enhanceTopicWithEmoji(topic: Topic): Topic {
  // Create a copy of the topic to avoid modifying the original
  const enhancedTopic = { ...topic };
  
  // Find a relevant emoji for the topic title
  const emoji = findRelevantEmoji(topic.title);
  
  // Add the emoji to the topic if found
  if (emoji) {
    enhancedTopic.icon = emoji;
    
    // Only add emoji to the beginning if it's not already there
    if (!topic.title.includes(emoji)) {
      enhancedTopic.title = `${emoji} ${topic.title}`;
    }
  }
  
  // Recursively enhance subtopics
  if (topic.subtopics && topic.subtopics.length > 0) {
    enhancedTopic.subtopics = topic.subtopics.map(subtopic => 
      enhanceTopicWithEmoji(subtopic)
    );
  }
  
  return enhancedTopic;
}
