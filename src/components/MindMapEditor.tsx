import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { 
  Excalidraw as ExcalidrawType,
  exportToBlob as exportToBlobType,
  serializeAsJSON as serializeAsJSONType
} from '@excalidraw/excalidraw';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Download, FileImage, File as FilePdf, Settings } from 'lucide-react';
import { useMindMapStore } from '../lib/store';

interface ExportOptions {
  format: 'png' | 'pdf' | 'svg';
  scale?: number;
  quality?: number;
}

const COLORS = {
  primary: ['#FFE2DD', '#FFD4CC', '#FFC7BB', '#FFBAAA', '#FFAD99'],
  secondary: ['#E3F5FF', '#CCE9FF', '#B5DDFF', '#9ED1FF', '#87C5FF'],
  tertiary: ['#FFF2E2', '#FFE5CC', '#FFD8B5', '#FFCB9E', '#FFBE87'],
  quaternary: ['#E2FFE9', '#CCFFD8', '#B5FFC7', '#9EFFB6', '#87FFA5'],
  accent: ['#F5E3FF', '#E9CCFF', '#DDB5FF', '#D19EFF', '#C587FF'],
};

export function MindMapEditor() {
  const { mindMapData, isEditing, topics } = useMindMapStore();
  const excalidrawRef = useRef(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [Excalidraw, setExcalidraw] = useState<typeof ExcalidrawType | null>(null);
  const [exportToBlob, setExportToBlob] = useState<typeof exportToBlobType | null>(null);
  const [serializeAsJSON, setSerializeAsJSON] = useState<typeof serializeAsJSONType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import('@excalidraw/excalidraw').then(module => {
      setExcalidraw(module.Excalidraw);
      setExportToBlob(module.exportToBlob);
      setSerializeAsJSON(module.serializeAsJSON);
      setIsLoading(false);
    }).catch(error => {
      console.error('Error loading Excalidraw:', error);
    });
  }, []);

  useEffect(() => {
    if (!excalidrawRef.current || !topics || !topics.length) return;
    const elements = generateExcalidrawElements(topics);
    excalidrawRef.current.updateScene({ elements });
  }, [topics]);

  const generateExcalidrawElements = (topics) => {
    const elements = [];
    let currentId = 0;

    const getColorScheme = (depth) => {
      const schemes = [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.quaternary, COLORS.accent];
      return schemes[depth % schemes.length];
    };

    const processNode = (node, x, y, depth = 0, angle = 0, parentId = null) => {
      const id = currentId++;
      const colorScheme = getColorScheme(depth);
      const fontSize = depth === 0 ? 24 : depth === 1 ? 18 : 14;
      const padding = 30;
      
      const textWidth = node.title.length * (fontSize * 0.6);
      const textHeight = fontSize * 1.5;
      const width = textWidth + (padding * 2);
      const height = textHeight + (padding * 2);

      elements.push({
        type: 'rectangle',
        id: `node-${id}`,
        x,
        y,
        width,
        height,
        strokeColor: '#1e1e1e',
        backgroundColor: colorScheme[depth % colorScheme.length],
        fillStyle: 'solid',
        strokeWidth: depth === 0 ? 3 : 2,
        roughness: 1,
        opacity: 0.9,
        roundness: { type: 1, value: 8 },
      });

      elements.push({
        type: 'text',
        id: `text-${id}`,
        x: x + padding,
        y: y + padding,
        width: textWidth,
        height: textHeight,
        text: node.title,
        fontSize,
        fontFamily: 1,
        textAlign: 'center',
        verticalAlign: 'middle',
        strokeColor: '#1e1e1e',
      });

      if (node.icon) {
        elements.push({
          type: 'image',
          id: `icon-${id}`,
          x: x + width - 24,
          y: y + 8,
          width: 16,
          height: 16,
          status: 'loaded',
          fileId: node.icon,
        });
      }

      if (parentId !== null) {
        elements.push({
          type: 'line',
          id: `line-${parentId}-${id}`,
          x: x - 50,
          y: y + height / 2,
          width: 100,
          height: 1,
          strokeColor: '#1e1e1e',
          strokeWidth: depth === 1 ? 3 : 2,
          roughness: 1,
          startBinding: {
            elementId: `node-${parentId}`,
            focus: 1,
          },
          endBinding: {
            elementId: `node-${id}`,
            focus: 0,
          },
          strokeStyle: 'solid',
          roundness: { type: 2, value: 0.5 },
        });
      }

      if (node.subtopics && node.subtopics.length) {
        const radius = depth === 0 ? 400 : 250;
        const angleStep = (Math.PI * 2) / node.subtopics.length;
        const startAngle = angle - (Math.PI / 3);

        node.subtopics.forEach((subtopic, index) => {
          const childAngle = startAngle + (angleStep * index);
          const childX = x + (radius * Math.cos(childAngle));
          const childY = y + (radius * Math.sin(childAngle));
          
          processNode(
            subtopic,
            childX,
            childY,
            depth + 1,
            childAngle,
            id
          );
        });
      }
    };

    const canvasWidth = 2000;
    const canvasHeight = 2000;
    processNode(topics[0], canvasWidth / 2 - 150, canvasHeight / 2 - 50);

    return elements;
  };

  const exportMindMap = async ({ format, scale = 2, quality = 1 }: ExportOptions) => {
    if (!excalidrawRef.current || !exportToBlob) return;

    try {
      let exportData;
      const elements = excalidrawRef.current.getSceneElements();
      const appState = {
        ...excalidrawRef.current.getAppState(),
        exportWithDarkMode: false,
        exportBackground: true,
        viewBackgroundColor: '#ffffff',
        exportScale: scale,
        exportEmbedScene: true,
      };
      const files = excalidrawRef.current.getFiles();

      switch (format) {
        case 'png':
          exportData = await exportToBlob({
            elements,
            appState,
            files,
            getDimensions: () => ({ width: 2000, height: 2000 }),
            quality,
            scale: 2,
          });
          break;
        case 'pdf':
          const pngBlob = await exportToBlob({
            elements,
            appState,
            files,
            getDimensions: () => ({ width: 2000, height: 2000 }),
            quality,
            scale: 2,
          });
          
          const img = new Image();
          img.src = URL.createObjectURL(pngBlob);
          
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [img.width, img.height],
          });
          
          pdf.addImage(img, 'PNG', 0, 0, img.width, img.height);
          exportData = pdf.output('blob');
          break;
        case 'svg':
          const svgElement = excalidrawRef.current.getElementsByTagName('svg')[0];
          if (svgElement) {
            const svgString = await toSvg(svgElement);
            exportData = new Blob([svgString], { type: 'image/svg+xml' });
          }
          break;
      }

      if (exportData) {
        const url = URL.createObjectURL(exportData);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mindmap.${format}`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting mind map:', error);
    }
  };

  if (!isEditing) return null;
  if (isLoading || !Excalidraw) {
    return (
      <div className="relative w-full h-[600px] border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-gray-500">Loading Excalidraw...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] border border-gray-200 rounded-xl overflow-hidden">
      <Excalidraw
        ref={excalidrawRef}
        initialData={{
          elements: [],
          appState: {
            viewBackgroundColor: '#ffffff',
            currentItemStrokeColor: '#1e1e1e',
            currentItemBackgroundColor: '#ffffff',
            currentItemFillStyle: 'solid',
            currentItemStrokeWidth: 2,
            currentItemRoughness: 1,
            currentItemOpacity: 90,
            theme: 'light',
            gridSize: 20,
            scrollX: 0,
            scrollY: 0,
            zoom: { value: 1, max: 2, min: 0.5 },
          },
        }}
        UIOptions={{
          canvasActions: {
            export: false,
            saveAsImage: false,
          },
          theme: 'light',
        }}
      />
      
      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="p-2 bg-violet-600 text-white rounded-lg shadow-md hover:bg-violet-700 transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
          
          {showExportOptions && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px]">
              <button
                onClick={() => {
                  exportMindMap({ format: 'png', scale: 2 });
                  setShowExportOptions(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 rounded-md"
              >
                <FileImage className="w-4 h-4" />
                <span>Export as PNG (300 DPI)</span>
              </button>
              <button
                onClick={() => {
                  exportMindMap({ format: 'pdf', scale: 2 });
                  setShowExportOptions(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 rounded-md"
              >
                <FilePdf className="w-4 h-4" />
                <span>Export as PDF</span>
              </button>
              <button
                onClick={() => {
                  exportMindMap({ format: 'svg' });
                  setShowExportOptions(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 rounded-md"
              >
                <Settings className="w-4 h-4" />
                <span>Export as SVG</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}