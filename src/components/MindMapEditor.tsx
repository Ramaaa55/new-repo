import React, { useCallback, useEffect, useRef } from 'react';
import { Excalidraw, exportToBlob } from '@excalidraw/excalidraw';
import { useMindMapStore } from '../lib/store';

export function MindMapEditor() {
  const { mindMapData, isEditing } = useMindMapStore();
  const excalidrawRef = useRef(null);

  const onSave = useCallback(async () => {
    if (!excalidrawRef.current) return;

    try {
      const blob = await exportToBlob({
        elements: excalidrawRef.current.getSceneElements(),
        appState: excalidrawRef.current.getAppState(),
        files: excalidrawRef.current.getFiles(),
        getDimensions: () => ({ width: 2048, height: 2048 }),
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mindmap.png';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving mind map:', error);
    }
  }, []);

  if (!isEditing) return null;

  return (
    <div className="w-full h-[600px] border border-gray-200 rounded-xl overflow-hidden">
      <Excalidraw
        ref={excalidrawRef}
        initialData={{
          elements: [],
          appState: {
            viewBackgroundColor: '#ffffff',
            currentItemStrokeColor: '#000000',
            currentItemBackgroundColor: '#ffffff',
            currentItemFillStyle: 'solid',
            currentItemStrokeWidth: 2,
            currentItemRoughness: 0,
          },
        }}
      />
      <button
        onClick={onSave}
        className="absolute bottom-4 right-4 bg-violet-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-violet-700 transition-colors"
      >
        Save Changes
      </button>
    </div>
  );
}