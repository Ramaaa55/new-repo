import { create } from 'zustand';

interface MindMapState {
  inputText: string;
  mindMapData: string;
  isLoading: boolean;
  isEditing: boolean;
  setInputText: (text: string) => void;
  setMindMapData: (data: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsEditing: (editing: boolean) => void;
}

export const useMindMapStore = create<MindMapState>((set) => ({
  inputText: '',
  mindMapData: '',
  isLoading: false,
  isEditing: false,
  setInputText: (text) => set({ inputText: text }),
  setMindMapData: (data) => set({ mindMapData: data }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsEditing: (editing) => set({ isEditing: editing }),
}));