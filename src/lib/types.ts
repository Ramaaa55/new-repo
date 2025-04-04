export interface Topic {
  title: string;
  description?: string;
  examples?: string[];
  context?: string;
  icon?: string;
  color?: string;
  citations?: string[];
  relatedTopics?: string[];
  subtopics?: Topic[];
  importance?: number;
  depth?: number;
  language?: string;
  vignetteStyle?: 'none' | 'soft' | 'medium' | 'strong';
  relationships?: Array<{
    to: string;
    type: 'related' | 'depends' | 'influences' | 'part-of';
    description?: string;
    strength?: number; // Added for relationship strength
    bidirectional?: boolean; // Added for bidirectional relationships
  }>;
  metadata?: {
    created: number;
    modified: number;
    tags: string[];
    category?: string;
    priority?: number;
  };
  styling?: {
    fontSize?: number;
    fontWeight?: string;
    borderStyle?: string;
    backgroundColor?: string;
    textColor?: string;
    iconSize?: number;
  };
}

export type DetailLevel = 'basic' | 'intermediate' | 'advanced';

export interface MindMapOptions {
  detailLevel: DetailLevel;
  includeDescriptions: boolean;
  includeExamples: boolean;
  includeCrossConnections: boolean;
  includeColorCoding: boolean;
  includeCitations: boolean;
  layout?: {
    style: 'hierarchical' | 'radial' | 'organic';
    direction?: 'TB' | 'LR' | 'RL' | 'BT';
    spacing?: number;
    compactness?: number;
  };
  theme?: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
}

export interface TopicRelationship {
  source: string;
  target: string;
  type: 'related' | 'depends' | 'influences' | 'part-of';
  description?: string;
  strength?: number;
  bidirectional?: boolean;
}