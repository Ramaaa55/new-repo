import React, { useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Edit } from 'lucide-react';
import { useMindMapStore } from '../lib/store';
import mermaid from 'mermaid';

export function MindMapViewer() {
  const { mindMapData, setIsEditing } = useMindMapStore();
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mindMapData) return;

    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        primaryColor: '#FEFCE8',
        primaryTextColor: '#374151',
        primaryBorderColor: '#84CC16',
        lineColor: '#FB7185',
        secondaryColor: '#E0F2FE',
        tertiaryColor: '#FCE7F3',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
      },
      flowchart: {
        curve: 'basis',
        padding: 32,
        nodeSpacing: 100,
        rankSpacing: 100,
        htmlLabels: true,
        useMaxWidth: true,
        defaultRenderer: 'dagre-wrapper',
        diagramPadding: 24,
      },
      securityLevel: 'loose'
    });

    mermaid.render('mindmap-diagram', mindMapData).then(({ svg }) => {
      if (svgRef.current) {
        svgRef.current.innerHTML = svg;
      }
    });
  }, [mindMapData]);

  if (!mindMapData) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="border-b border-gray-100 p-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Use mouse wheel to zoom, click and drag to pan
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit in Excalidraw
        </button>
      </div>
      <div className="p-8">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={2}
          centerOnInit={true}
          wheel={{ wheelEnabled: true }}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                <button
                  onClick={() => zoomIn()}
                  className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                >
                  <ZoomIn className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                >
                  <ZoomOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <TransformComponent wrapperClass="!w-full" contentClass="!w-full">
                <div
                  ref={svgRef}
                  className="flex justify-center items-center min-h-[600px] w-full"
                />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}