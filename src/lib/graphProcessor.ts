import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { Topic } from './types';
import { Graph } from 'graphology';
import { validateTopicStructure } from './validation';

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
  }>;
}

let nodeCounter = 0;
function generateUniqueId(prefix: string = 'node'): string {
  return `${prefix}-${nodeCounter++}-${Date.now()}`;
}

export function processTopicsToGraph(topics: Topic[]): ProcessedGraph {
  // Validate input data
  if (!Array.isArray(topics) || topics.length === 0) {
    throw new Error('Invalid or empty topics array');
  }

  const graph = new Graph();
  const nodes: ProcessedGraph['nodes'] = [];
  const edges: ProcessedGraph['edges'] = [];
  const usedIds = new Set<string>();
  
  function processNode(topic: Topic, parentId: string | null = null, level: number = 0) {
    // Validate topic structure
    if (!validateTopicStructure(topic)) {
      console.error('Invalid topic structure:', topic);
      return;
    }

    const id = generateUniqueId();
    if (usedIds.has(id)) {
      throw new Error(`Duplicate node ID detected: ${id}`);
    }
    usedIds.add(id);
    
    nodes.push({
      id,
      label: topic.title,
      level,
      data: topic
    });

    if (parentId) {
      edges.push({
        source: parentId,
        target: id,
        type: 'hierarchy'
      });
    }

    // Process subtopics with validation
    topic.subtopics?.forEach(subtopic => {
      if (validateTopicStructure(subtopic)) {
        processNode(subtopic, id, level + 1);
      }
    });

    // Add cross-connections with validation
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
          type: rel.type
        });
      }
    });
  }

  topics.forEach(topic => processNode(topic));

  return { nodes, edges };
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
          type: edge.type
        }
      }))
    }
  });

  // Apply dagre layout with optimized settings
  cy.layout({
    name: 'dagre',
    rankDir: 'TB',
    align: 'UL',
    ranker: 'network-simplex',
    nodeSep: 50, // Minimum node spacing
    rankSep: 100,
    edgeSep: 50,
    padding: 50,
    spacingFactor: 1.2,
    animate: false,
    fit: true
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
    const { nodes, edges } = processedGraph;
    
    let mermaidSyntax = 'graph TD\n';
    
    // Node style classes with improved visibility
    mermaidSyntax += `
      %% Node styles
      classDef default fill:#FEFCE8,stroke:#84CC16,stroke-width:2px,rx:8,ry:8,padding:12px
      classDef main fill:#FEF3C7,stroke:#D97706,stroke-width:3px,rx:12,ry:12,padding:20px,font-size:20px
      classDef bubble fill:#E0F2FE,stroke:#0EA5E9,stroke-width:2px,rx:8,ry:8,padding:12px
      classDef list fill:#FCE7F3,stroke:#EC4899,stroke-width:2px,rx:4,ry:4,padding:8px
      
      %% Link styles
      linkStyle default stroke:#94a3b8,stroke-width:2px,fill:none
    `;

    // Add nodes with their styles
    nodes.forEach(node => {
      const nodeClass = node.level === 0 ? 'main' : 
                       node.level === 1 ? 'bubble' : 'list';
      
      const escapedTitle = node.data.title
        .replace(/"/g, '\\"')
        .replace(/\n/g, '<br/>');
      
      mermaidSyntax += `    ${node.id}["${escapedTitle}${
        node.data.icon ? ' ' + node.data.icon : ''
      }"]:::${nodeClass}\n`;
      
      // Add descriptions as notes if available
      if (node.data.description) {
        const escapedDesc = node.data.description
          .replace(/"/g, '\\"')
          .replace(/\n/g, '<br/>');
        mermaidSyntax += `    note for ${node.id} "${escapedDesc}"\n`;
      }
    });

    // Add edges with different styles based on type
    edges.forEach(edge => {
      const style = edge.type === 'hierarchy' ? '-->' : 
                   edge.type === 'influences' ? '-.->>' :
                   edge.type === 'depends' ? '==>' : '-.->';
      
      mermaidSyntax += `    ${edge.source} ${style} ${edge.target}\n`;
    });

    return mermaidSyntax;
  } catch (error) {
    console.error('Error generating Mermaid syntax:', error);
    return `
      graph TD
        error["Error Generating Mind Map"]
        details["${error.message}"]
        error --> details
        style error fill:#FEE2E2,stroke:#EF4444,stroke-width:2px
        style details fill:#FEF3C7,stroke:#D97706,stroke-width:2px
    `;
  }
}