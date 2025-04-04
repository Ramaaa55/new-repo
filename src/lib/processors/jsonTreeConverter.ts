import { Topic } from '../types';

/**
 * JSON Tree Node interface matching the required output format
 */
export interface JsonTreeNode {
  label: string;
  details?: string;
  children?: JsonTreeNode[];
}

/**
 * JSON Tree structure for mind map data
 */
export interface JsonTree {
  title: string;
  language: string;
  nodes: JsonTreeNode[];
}

/**
 * Convert a topic to a JSON tree node
 * @param topic The topic to convert
 * @returns A JSON tree node
 */
function topicToJsonNode(topic: Topic): JsonTreeNode {
  // Create the node with required properties
  const node: JsonTreeNode = {
    label: addEmojiIfMissing(topic.title),
    details: topic.description || undefined
  };

  // Add children if they exist
  if (topic.subtopics && topic.subtopics.length > 0) {
    node.children = topic.subtopics.map(subtopic => topicToJsonNode(subtopic));
  }

  return node;
}

/**
 * Add an emoji to a label if it doesn't already have one
 * @param label The label text
 * @returns Label with emoji
 */
function addEmojiIfMissing(label: string): string {
  // Check if the label already has an emoji
  const hasEmoji = /[\p{Emoji}]/u.test(label);
  
  if (hasEmoji) {
    return label;
  }
  
  // Default emojis based on common topics
  const defaultEmojis: Record<string, string> = {
    'introduction': '📚',
    'summary': '📋',
    'conclusion': '🏁',
    'overview': '🔍',
    'analysis': '📊',
    'research': '🔬',
    'data': '📈',
    'results': '✅',
    'methods': '🔧',
    'process': '⚙️',
    'benefits': '🌟',
    'advantages': '👍',
    'disadvantages': '👎',
    'challenges': '🧗',
    'solutions': '💡',
    'features': '✨',
    'examples': '📝',
    'case_study': '📔',
    'implementation': '🛠️',
    'future': '🔮',
    'history': '📜',
    'development': '🚀',
    'comparison': '⚖️',
    'evaluation': '📋',
    'recommendation': '👉',
    'strategy': '♟️',
    'technology': '💻',
    'business': '💼',
    'education': '🎓',
    'health': '❤️',
    'environment': '🌍',
    'science': '🔭',
    'art': '🎨',
    'design': '✏️',
    'marketing': '📢',
    'finance': '💰',
    'legal': '⚖️',
    'social': '👥',
    'communication': '💬',
    'management': '👔',
    'leadership': '👑',
    'innovation': '💡',
    'creativity': '🌈',
    'productivity': '⏱️',
    'quality': '🏆',
    'security_topic': '🔒',
    'performance': '📈',
    'efficiency': '⚡',
    'sustainability': '♻️',
    'growth': '📈',
    'impact': '💥',
    'value': '💎',
    'risk': '⚠️',
    'opportunity': '🚪',
    'planning': '📅',
    'organization': '📂',
    'collaboration': '🤝',
    'feedback_topic': '📣',
    'support_service': '🤲',
    'training': '🏋️',
    'learning': '📚',
    'knowledge': '🧠',
    'skills': '🛠️',
    'experience_user': '🌟',
    'insights': '💡',
    'trends': '📊',
    'patterns': '🔄',
    'principles': '📜',
    'guidelines': '📏',
    'standards': '📐',
    'requirements': '📋',
    'specifications': '📝',
    'architecture': '🏛️',
    'infrastructure': '🏗️',
    'components': '🧩',
    'modules': '📦',
    'integration': '🔄',
    'testing': '🧪',
    'validation_process': '✅',
    'deployment': '🚀',
    'maintenance': '🔧',
    'monitoring': '📡',
    'optimization': '⚡',
    'scaling': '📏',
    'migration': '🚚',
    'backup': '💾',
    'recovery': '🔄',
    'privacy': '🔐',
    'compliance': '📜',
    'governance': '🏛️',
    'ethics': '⚖️',
    'responsibility': '🤲',
    'transparency': '🔍',
    'accessibility': '♿',
    'usability': '👆',
    'experience_product': '😊',
    'interface': '🖥️',
    'interaction': '🤝',
    'feedback_user': '💬',
    'support_user': '🛟',
    'service': '🛎️',
    'quality_service': '✨',
    'satisfaction': '😄',
    'loyalty': '❤️',
    'engagement': '🔄',
    'retention': '🧲',
    'acquisition': '🎯',
    'conversion': '🔄',
    'revenue': '💰',
    'profit': '💵',
    'cost': '💸',
    'investment': '📈',
    'return': '↩️',
    'budget': '💼',
    'forecast': '🔮',
    'analysis_data': '🔍',
    'metrics': '📊',
    'indicators': '📉',
    'measurement': '📏',
    'evaluation_process': '🧐',
    'assessment': '📋',
    'review': '👁️',
    'audit': '🔍',
    'inspection': '🔎',
    'verification': '✅',
    'validation_data': '👍'
  };
  
  // Look for keyword matches in the label
  const lowerLabel = label.toLowerCase();
  let matchedEmoji = '📝'; // Default emoji if no match
  
  // Find the best matching keyword
  Object.entries(defaultEmojis).forEach(([keyword, emoji]) => {
    if (lowerLabel.includes(keyword)) {
      matchedEmoji = emoji;
    }
  });
  
  return `${matchedEmoji} ${label}`;
}

/**
 * Convert a list of topics to a JSON tree structure
 * @param topics The topics to convert
 * @param language The language of the content
 * @returns A JSON tree structure
 */
export function convertTopicsToJsonTree(topics: Topic[], language: string = 'en'): JsonTree {
  if (!topics || topics.length === 0) {
    return {
      title: 'Empty Mind Map',
      language,
      nodes: []
    };
  }
  
  // Use the first topic as the main topic
  const mainTopic = topics[0];
  
  // Create the JSON tree
  const jsonTree: JsonTree = {
    title: mainTopic.title,
    language: language,
    nodes: []
  };
  
  // Convert subtopics to JSON nodes
  if (mainTopic.subtopics && mainTopic.subtopics.length > 0) {
    jsonTree.nodes = mainTopic.subtopics.map(subtopic => topicToJsonNode(subtopic));
  }
  
  return jsonTree;
}

/**
 * Validate the JSON tree structure for completeness
 * @param jsonTree The JSON tree to validate
 * @returns True if the tree is valid
 */
export function validateJsonTree(jsonTree: JsonTree): boolean {
  // Check if the tree has a title and language
  if (!jsonTree.title || !jsonTree.language) {
    console.error('JSON tree is missing title or language');
    return false;
  }
  
  // Check if the tree has nodes
  if (!jsonTree.nodes || jsonTree.nodes.length === 0) {
    console.error('JSON tree has no nodes');
    return false;
  }
  
  // Validate each node recursively
  const validateNode = (node: JsonTreeNode): boolean => {
    // Check if the node has a label
    if (!node.label) {
      console.error('Node is missing a label');
      return false;
    }
    
    // Check if the node has details
    if (!node.details) {
      console.warn('Node is missing details:', node.label);
      // Not a critical error, so continue validation
    }
    
    // Validate children if they exist
    if (node.children && node.children.length > 0) {
      return node.children.every(child => validateNode(child));
    }
    
    return true;
  };
  
  // Validate all top-level nodes
  return jsonTree.nodes.every(node => validateNode(node));
}

/**
 * Enhance a JSON tree with additional details and formatting
 * @param jsonTree The JSON tree to enhance
 * @returns An enhanced JSON tree
 */
export function enhanceJsonTree(jsonTree: JsonTree): JsonTree {
  // Create a deep copy of the tree to avoid modifying the original
  const enhancedTree: JsonTree = JSON.parse(JSON.stringify(jsonTree));
  
  // Enhance each node recursively
  const enhanceNode = (node: JsonTreeNode): JsonTreeNode => {
    // Ensure the node has a label with an emoji
    node.label = addEmojiIfMissing(node.label);
    
    // Ensure the node has details
    if (!node.details) {
      node.details = `Additional information about ${node.label}`;
    }
    
    // Enhance children if they exist
    if (node.children && node.children.length > 0) {
      node.children = node.children.map(child => enhanceNode(child));
    }
    
    return node;
  };
  
  // Enhance all top-level nodes
  enhancedTree.nodes = enhancedTree.nodes.map(node => enhanceNode(node));
  
  return enhancedTree;
}
