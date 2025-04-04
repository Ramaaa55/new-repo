import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LayoutType = 'radial' | 'hierarchical' | 'organic';
export type Language = string;
export type ColorScheme = {
  primary: string;
  secondary: string;
};

interface DocumentState {
  content: string;
  language: Language;
  originalFormat: string;
}

interface MindMapNode {
  id: string;
  title: string;
  description: string;
  emoji?: string;
  children: MindMapNode[];
  vignette?: string;
}

interface MindMapSettings {
  layout: LayoutType;
  colorScheme: ColorScheme;
  textDensity: number;
  showEmojis: boolean;
  vignetteStyle: string;
  targetLanguage: Language;
  nodeSpacing: number;
  lineStyle: string;
  showBullets: boolean;
  nodeShape: string;
  animationSpeed: number;
  fontSize: number;
  autoRefresh: boolean;
  depthLimit: number;
}

interface MindMapVersion {
  id: string;
  timestamp: number;
  nodes: MindMapNode[];
  settings: MindMapSettings;
}

interface MindMapState {
  inputText: string;
  mindMapData: string | null;
  document: DocumentState | null;
  nodes: MindMapNode[];
  settings: MindMapSettings;
  versions: MindMapVersion[];
  collaborators: string[];
  isProcessing: boolean;
  isLoading: boolean;
  isEditing: boolean;
  error: string | null;
  
  // Actions
  setInputText: (text: string) => void;
  setMindMapData: (data: string) => void;
  setDocument: (doc: DocumentState) => void;
  updateNodes: (nodes: MindMapNode[]) => void;
  updateSettings: (settings: Partial<MindMapSettings>) => void;
  saveVersion: () => void;
  addCollaborator: (email: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsEditing: (isEditing: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultSettings: MindMapSettings = {
  layout: 'hierarchical',
  colorScheme: {
    primary: '#8B5CF6',
    secondary: '#EDE9FE',
  },
  textDensity: 0.7,
  showEmojis: true,
  vignetteStyle: 'none',
  targetLanguage: 'en',
  nodeSpacing: 1,
  lineStyle: 'curved',
  showBullets: true,
  nodeShape: 'rounded',
  animationSpeed: 1,
  fontSize: 1,
  autoRefresh: true,
  depthLimit: 0,
};

export const useMindMapStore = create<MindMapState>()(
  persist(
    (set) => ({
      inputText: '',
      mindMapData: null,
      document: null,
      nodes: [],
      settings: defaultSettings,
      versions: [],
      collaborators: [],
      isProcessing: false,
      isLoading: false,
      isEditing: false,
      error: null,

      setInputText: (text) => set({ inputText: text }),
      setMindMapData: (data) => set({ mindMapData: data }),
      setDocument: (doc) => set({ document: doc }),
      updateNodes: (nodes) => set({ nodes }),
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),
      saveVersion: () => set((state) => ({
        versions: [
          ...state.versions,
          {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            nodes: state.nodes,
            settings: state.settings,
          }
        ]
      })),
      addCollaborator: (email) => set((state) => ({
        collaborators: [...state.collaborators, email]
      })),
      setProcessing: (isProcessing) => set({ isProcessing }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setIsEditing: (isEditing) => set({ isEditing }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'mindmap-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        settings: state.settings,
        versions: state.versions,
        collaborators: state.collaborators,
      }),
    }
  )
);