import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { Topic } from '../types';
import { Graph } from 'graphology';
import { validateTopicStructure } from '../validation';

// Register the dagre layout with cytoscape
cytoscape.use(dagre);

interface ProcessedGraph {
  nodes: Array<{
    id: string;
    label: string;
    level: number;
    data: Topic;
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: string;
    label?: string; // Added for relationship descriptions
  }>;
}

let nodeCounter = 0;
function generateUniqueId(prefix: string = 'node'): string {
  return `${prefix}-${nodeCounter++}-${Date.now()}`;
}

// Enhanced color palette for better visual hierarchy
const colorPalette = {
  root: {
    background: '#FEF3C7',
    border: '#D97706',
    text: '#92400E'
  },
  level1: {
    background: '#E0F2FE',
    border: '#0EA5E9',
    text: '#0C4A6E'
  },
  level2: {
    background: '#FCE7F3',
    border: '#EC4899',
    text: '#831843'
  },
  level3: {
    background: '#F3E8FF',
    border: '#A855F7',
    text: '#6B21A8'
  }
};

export function processTopicsToGraph(topics: Topic[]): ProcessedGraph {
  if (!Array.isArray(topics) || topics.length === 0) {
    throw new Error('Invalid or empty topics array');
  }

  const graph = new Graph();
  const nodes: ProcessedGraph['nodes'] = [];
  const edges: ProcessedGraph['edges'] = [];
  const usedIds = new Set<string>();
  
  function processNode(topic: Topic, parentId: string | null = null, level: number = 0) {
    if (!validateTopicStructure(topic)) {
      console.error('Invalid topic structure:', topic);
      return;
    }

    const id = generateUniqueId();
    if (usedIds.has(id)) {
      throw new Error(`Duplicate node ID detected: ${id}`);
    }
    usedIds.add(id);
    
    // Enhanced node data with meaningful content
    const nodeLabel = topic.title.length > 50 
      ? `${topic.title.substring(0, 47)}...`
      : topic.title;

    nodes.push({
      id,
      label: nodeLabel,
      level,
      data: {
        ...topic,
        description: topic.description || 'No description available',
        examples: topic.examples || [],
        context: topic.context || '',
        color: getColorForLevel(level)
      }
    });

    if (parentId) {
      // Add meaningful relationship labels
      const relationshipType = determineRelationshipType(topic, level);
      edges.push({
        source: parentId,
        target: id,
        type: 'hierarchy',
        label: relationshipType
      });
    }

    // Process subtopics with enhanced relationship handling
    topic.subtopics?.forEach((subtopic, index) => {
      if (validateTopicStructure(subtopic)) {
        processNode(subtopic, id, level + 1);
      }
    });

    // Add cross-connections with descriptive labels
    topic.relationships?.forEach(rel => {
      if (!rel.to || typeof rel.to !== 'string') {
        console.error('Invalid relationship:', rel);
        return;
      }

      const targetNode = nodes.find(n => n.data.title === rel.to);
      if (targetNode) {
        edges.push({
          source: id,
          target: targetNode.id,
          type: rel.type,
          label: rel.description || capitalizeFirstLetter(rel.type)
        });
      }
    });
  }

  topics.forEach(topic => processNode(topic));
  return { nodes, edges };
}

function getColorForLevel(level: number): typeof colorPalette[keyof typeof colorPalette] {
  switch (level) {
    case 0: return colorPalette.root;
    case 1: return colorPalette.level1;
    case 2: return colorPalette.level2;
    default: return colorPalette.level3;
  }
}

function determineRelationshipType(topic: Topic, level: number): string {
  if (level === 0) return 'contains';
  if (level === 1) return 'includes';
  if (topic.relationships?.[0]?.type) {
    return capitalizeFirstLetter(topic.relationships[0].type);
  }
  return 'relates to';
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function optimizeLayout(processedGraph: ProcessedGraph): ProcessedGraph {
  const cy = cytoscape({
    headless: true,
    elements: {
      nodes: processedGraph.nodes.map(node => ({
        data: { 
          id: node.id,
          label: node.label,
          level: node.level,
          ...node.data
        }
      })),
      edges: processedGraph.edges.map(edge => ({
        data: {
          source: edge.source,
          target: edge.target,
          type: edge.type,
          label: edge.label
        }
      }))
    }
  });

  // Apply enhanced dagre layout with improved spacing
  cy.layout({
    name: 'dagre',
    rankDir: 'TB',
    align: 'UL',
    ranker: 'network-simplex',
    nodeSep: 80,
    rankSep: 120,
    edgeSep: 50,
    padding: 50,
    spacingFactor: 1.2,
    animate: false,
    fit: true,
    // Prevent node overlap
    overlap: 'removeOverlap',
    // Improve edge routing
    edgeWeight: (edge: any) => edge.data('type') === 'hierarchy' ? 2 : 1
  }).run();

  // Extract optimized positions
  const optimizedNodes = processedGraph.nodes.map(node => {
    const cyNode = cy.getElementById(node.id);
    return {
      ...node,
      position: cyNode.position()
    };
  });

  return {
    nodes: optimizedNodes,
    edges: processedGraph.edges
  };
}

export function generateMermaidSyntax(processedGraph: ProcessedGraph): string {
  try {
    let mermaidSyntax = 'graph TD\n';
    
    // Add node style definitions
    mermaidSyntax += `
      %% Node styles
      classDef root fill:${colorPalette.root.background},stroke:${colorPalette.root.border},stroke-width:3px,color:${colorPalette.root.text},font-weight:bold
      classDef level1 fill:${colorPalette.level1.background},stroke:${colorPalette.level1.border},stroke-width:2px,color:${colorPalette.level1.text}
      classDef level2 fill:${colorPalette.level2.background},stroke:${colorPalette.level2.border},stroke-width:2px,color:${colorPalette.level2.text}
      classDef level3 fill:${colorPalette.level3.background},stroke:${colorPalette.level3.border},stroke-width:2px,color:${colorPalette.level3.text}
    `;

    // Add nodes with enhanced formatting
    processedGraph.nodes.forEach(node => {
      const nodeClass = `class${node.level === 0 ? 'root' : `level${node.level}`}`;
      mermaidSyntax += `  ${node.id}["${node.data.icon || ''} ${node.label}"]\n`;
      mermaidSyntax += `  class ${node.id} ${nodeClass}\n`;
    });

    // Add edges with relationship labels
    processedGraph.edges.forEach(edge => {
      const linkStyle = edge.type === 'hierarchy' ? '-->' : '-.->';
      const labelText = edge.label ? `|${edge.label}|` : '';
      mermaidSyntax += `  ${edge.source} ${linkStyle}${labelText} ${edge.target}\n`;
    });

    return mermaidSyntax;
  } catch (error) {
    console.error('Error generating Mermaid syntax:', error);
    return `
      graph TD
        error["Error Generating Mind Map"]
        details["${error instanceof Error ? error.message : 'Unknown error'}"]
        error --> details
        style error fill:#FEE2E2,stroke:#EF4444,stroke-width:2px
        style details fill:#FEF3C7,stroke:#D97706,stroke-width:2px
    `;
  }
}