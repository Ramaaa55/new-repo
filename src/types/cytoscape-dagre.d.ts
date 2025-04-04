declare module 'cytoscape-dagre' {
  import { Core } from 'cytoscape';
  
  const cytoscapeDagre: (cy: Core) => void;
  export default cytoscapeDagre;
  
  namespace cytoscapeDagre {
    interface DagreLayoutOptions {
      name: 'dagre';
      // Layout options
      nodeSep?: number;
      edgeSep?: number;
      rankSep?: number;
      rankDir?: 'TB' | 'BT' | 'LR' | 'RL';
      ranker?: 'network-simplex' | 'tight-tree' | 'longest-path';
      minLen?: (edge: any) => number;
      edgeWeight?: (edge: any) => number;
      // General layout options
      fit?: boolean;
      padding?: number;
      animate?: boolean;
      animationDuration?: number;
      boundingBox?: { x1: number; y1: number; x2: number; y2: number } | { x1: number; y1: number; w: number; h: number };
      ready?: () => void;
      stop?: () => void;
    }
  }
}
