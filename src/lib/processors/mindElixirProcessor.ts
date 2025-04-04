import { Topic } from '../types';
import { JsonTree, JsonTreeNode } from './jsonTreeConverter';

/**
 * Mind-Elixir data structure
 * Based on the Mind-Elixir documentation
 */
export interface MindElixirData {
  nodeData: MindElixirNode;
  linkData?: Record<string, any>; // For custom links between nodes
}

/**
 * Mind-Elixir node structure
 */
export interface MindElixirNode {
  id: string;
  topic: string;
  root?: boolean;
  style?: Record<string, any>;
  expanded?: boolean;
  direction?: 'right' | 'left';
  children?: MindElixirNode[];
  tags?: string[];
  icons?: string[];
  hyperLink?: string;
  notes?: string;
  background?: string;
}

/**
 * Generate a unique ID for a node
 * @returns A unique ID string
 */
function generateNodeId(): string {
  return `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Convert a JSON tree node to a Mind-Elixir node
 * @param node The JSON tree node to convert
 * @param direction The direction of the node (right or left)
 * @param depth The depth of the node in the tree
 * @returns A Mind-Elixir node
 */
function jsonNodeToMindElixirNode(
  node: JsonTreeNode, 
  direction: 'right' | 'left' = 'right', 
  depth: number = 0
): MindElixirNode {
  // Extract emoji if present
  const emojiMatch = node.label.match(/^([\p{Emoji}])\s+(.*)/u);
  const emoji = emojiMatch ? emojiMatch[1] : '';
  const label = emojiMatch ? emojiMatch[2] : node.label;
  
  // Create the Mind-Elixir node
  const mindNode: MindElixirNode = {
    id: generateNodeId(),
    topic: label,
    expanded: depth < 3, // Auto-expand first 3 levels
    direction,
    notes: node.details || '',
    style: {
      fontSize: Math.max(14, 18 - depth), // Decrease font size with depth
    }
  };
  
  // Add emoji as icon if present
  if (emoji) {
    mindNode.icons = [emoji];
  }
  
  // Add background color based on depth
  const colors = [
    '#f9f9f9', // Root
    '#e3f2fd', // Level 1
    '#bbdefb', // Level 2
    '#90caf9', // Level 3
    '#64b5f6', // Level 4
    '#42a5f5', // Level 5
    '#2196f3', // Level 6+
  ];
  
  mindNode.background = colors[Math.min(depth, colors.length - 1)];
  
  // Add children if they exist
  if (node.children && node.children.length > 0) {
    mindNode.children = node.children.map((child, index) => {
      // Alternate directions for better layout
      const childDirection = depth === 0 
        ? (index % 2 === 0 ? 'right' : 'left') 
        : direction;
      
      return jsonNodeToMindElixirNode(child, childDirection, depth + 1);
    });
  }
  
  return mindNode;
}

/**
 * Convert a JSON tree to Mind-Elixir data format
 * @param jsonTree The JSON tree to convert
 * @returns Mind-Elixir compatible data
 */
export function convertJsonTreeToMindElixir(jsonTree: JsonTree): MindElixirData {
  // Create the root node
  const rootNode: MindElixirNode = {
    id: 'root',
    topic: jsonTree.title,
    root: true,
    expanded: true,
    style: {
      fontSize: 20,
      fontWeight: 'bold'
    },
    children: []
  };
  
  // Add main branches, alternating between right and left
  if (jsonTree.nodes && jsonTree.nodes.length > 0) {
    rootNode.children = jsonTree.nodes.map((node, index) => {
      const direction = index % 2 === 0 ? 'right' : 'left';
      return jsonNodeToMindElixirNode(node, direction, 1);
    });
  }
  
  return {
    nodeData: rootNode
  };
}

/**
 * Generate Mind-Elixir initialization options
 * @param container The container element ID
 * @returns Mind-Elixir options
 */
export function generateMindElixirOptions(container: string): Record<string, any> {
  return {
    el: `#${container}`,
    direction: 2, // 1: vertical, 2: horizontal
    draggable: true,
    contextMenu: true,
    toolBar: true,
    nodeMenu: true,
    keypress: true,
    allowUndo: true,
    allowRedo: true,
    overflowHidden: false,
    primaryLinkStyle: 2, // 1: straight, 2: curve
    primaryNodeVerticalGap: 25,
    primaryNodeHorizontalGap: 65,
    contextMenuOption: {
      focus: true,
      extend: [
        {
          name: 'Export PNG',
          onclick: () => {
            // This will be implemented in the component
            console.log('Export PNG');
          }
        },
        {
          name: 'Export SVG',
          onclick: () => {
            // This will be implemented in the component
            console.log('Export SVG');
          }
        },
        {
          name: 'Export PDF',
          onclick: () => {
            // This will be implemented in the component
            console.log('Export PDF');
          }
        }
      ]
    },
    theme: {
      primary: '#2196f3',
      secondary: '#4CAF50',
      success: '#8BC34A',
      danger: '#F44336',
      warning: '#FFC107',
      info: '#03A9F4',
      light: '#F5F5F5',
      dark: '#212121'
    }
  };
}

/**
 * Convert a list of topics to Mind-Elixir data format
 * @param topics The topics to convert
 * @param language The language of the content
 * @returns Mind-Elixir compatible data
 */
export function convertTopicsToMindElixir(topics: Topic[], language: string = 'en'): MindElixirData {
  if (!topics || topics.length === 0) {
    // Create an empty mind map
    return {
      nodeData: {
        id: 'root',
        topic: 'Empty Mind Map',
        root: true,
        notes: `Language: ${language}` // Use language in notes
      }
    };
  }
  
  // Use the first topic as the main topic
  const mainTopic = topics[0];
  
  // Create the root node
  const rootNode: MindElixirNode = {
    id: 'root',
    topic: mainTopic.title,
    root: true,
    expanded: true,
    style: {
      fontSize: 20,
      fontWeight: 'bold'
    },
    notes: `Language: ${language}`, // Add language info to notes
    children: []
  };
  
  // Add main branches, alternating between right and left
  if (mainTopic.subtopics && mainTopic.subtopics.length > 0) {
    rootNode.children = mainTopic.subtopics.map((subtopic, index) => {
      // Create a JSON tree node first
      const jsonNode: JsonTreeNode = {
        label: subtopic.title,
        details: subtopic.description,
        children: subtopic.subtopics?.map(sub => ({
          label: sub.title,
          details: sub.description,
          children: sub.subtopics?.map(subsub => ({
            label: subsub.title,
            details: subsub.description,
            children: []
          })) || []
        })) || []
      };
      
      // Convert to Mind-Elixir node
      const direction = index % 2 === 0 ? 'right' : 'left';
      return jsonNodeToMindElixirNode(jsonNode, direction, 1);
    });
  }
  
  return {
    nodeData: rootNode
  };
}
