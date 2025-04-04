import { Topic } from './types';

// Emoji categories and their associated keywords
const emojiMap: Record<string, string[]> = {
  technology: ['💻', '🔧', '⚙️', '🤖', '📱'],
  education: ['📚', '🎓', '✏️', '📝', '🔬'],
  business: ['💼', '📊', '💰', '📈', '🤝'],
  science: ['🔬', '🧬', '⚗️', '🔭', '🧪'],
  nature: ['🌿', '🌳', '🌺', '🌞', '🌍'],
  health: ['❤️', '🏥', '💊', '🧠', '🩺'],
  art: ['🎨', '🖼️', '🎭', '🎬', '🎵'],
  sports: ['⚽', '🏃‍♂️', '🎯', '🏆', '🥇'],
  food: ['🍎', '🥗', '🍽️', '👨‍🍳', '🥘'],
  travel: ['✈️', '🗺️', '🏖️', '🎡', '🏰'],
  communication: ['💬', '📱', '✉️', '📢', '🤝'],
  time: ['⏰', '📅', '⌛', '🕒', '📆'],
  weather: ['☀️', '🌧️', '❄️', '🌈', '⛈️'],
  emotions: ['😊', '😢', '😡', '😍', '🤔'],
  abstract: ['💡', '🎯', '🔄', '✨', '🎲'],
};

// Keywords associated with each category
const categoryKeywords: Record<string, string[]> = {
  technology: ['computer', 'software', 'digital', 'tech', 'code', 'programming', 'data', 'system', 'network', 'device'],
  education: ['learn', 'study', 'teach', 'school', 'university', 'knowledge', 'education', 'training', 'course', 'lesson'],
  business: ['market', 'finance', 'company', 'management', 'strategy', 'business', 'profit', 'sales', 'revenue', 'client'],
  science: ['research', 'experiment', 'theory', 'scientific', 'chemistry', 'physics', 'biology', 'laboratory', 'analysis'],
  nature: ['environment', 'plant', 'animal', 'earth', 'ecosystem', 'natural', 'organic', 'climate', 'weather', 'green'],
  health: ['medical', 'health', 'wellness', 'fitness', 'disease', 'treatment', 'therapy', 'medicine', 'doctor', 'patient'],
  art: ['creative', 'design', 'music', 'paint', 'draw', 'artistic', 'performance', 'culture', 'visual', 'aesthetic'],
  sports: ['game', 'competition', 'athlete', 'team', 'fitness', 'sport', 'training', 'exercise', 'championship'],
  food: ['cook', 'recipe', 'meal', 'nutrition', 'diet', 'restaurant', 'ingredient', 'cuisine', 'food', 'eating'],
  travel: ['journey', 'destination', 'tourism', 'vacation', 'travel', 'trip', 'adventure', 'explore', 'visit'],
  communication: ['message', 'talk', 'speak', 'write', 'communicate', 'conversation', 'discussion', 'meeting', 'chat'],
  time: ['schedule', 'deadline', 'period', 'duration', 'timing', 'date', 'calendar', 'planning', 'timeline'],
  weather: ['climate', 'temperature', 'forecast', 'season', 'atmospheric', 'meteorological', 'precipitation'],
  emotions: ['feel', 'emotion', 'mood', 'psychological', 'mental', 'attitude', 'behavior', 'personality'],
  abstract: ['concept', 'idea', 'theory', 'principle', 'method', 'strategy', 'approach', 'framework', 'system'],
};

function findBestCategory(text: string): string {
  const words = text.toLowerCase().split(/\W+/);
  const scores: Record<string, number> = {};

  // Initialize scores
  Object.keys(categoryKeywords).forEach(category => {
    scores[category] = 0;
  });

  // Calculate scores based on keyword matches
  words.forEach(word => {
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      if (keywords.some(keyword => word.includes(keyword) || keyword.includes(word))) {
        scores[category]++;
      }
    });
  });

  // Find category with highest score
  return Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a)[0];
}

function getRandomEmoji(category: string): string {
  const emojis = emojiMap[category] || emojiMap.abstract;
  return emojis[Math.floor(Math.random() * emojis.length)];
}

export function assignEmojis(title: string, context: string = ''): string {
  const category = findBestCategory(title + ' ' + context);
  return getRandomEmoji(category);
}

export function enhanceTopicWithEmoji(topic: Topic): Topic {
  const enhancedTopic = {
    ...topic,
    icon: assignEmojis(topic.title, topic.description),
  };

  if (topic.subtopics) {
    enhancedTopic.subtopics = topic.subtopics.map(subtopic => enhanceTopicWithEmoji(subtopic));
  }

  return enhancedTopic;
}