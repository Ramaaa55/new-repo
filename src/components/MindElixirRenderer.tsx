import React, { useEffect, useRef, useState } from 'react';
import MindElixir from 'mind-elixir';
import { MindElixirData, generateMindElixirOptions } from '../lib/processors/mindElixirProcessor';

// Import CSS for Mind-Elixir
import 'mind-elixir/dist/style.css';

interface MindElixirRendererProps {
  data: MindElixirData;
  containerId?: string;
  onExport?: (type: 'png' | 'svg' | 'pdf', data: string | Blob) => void;
}

/**
 * Mind-Elixir renderer component
 * Renders a mind map using the Mind-Elixir library
 */
const MindElixirRenderer: React.FC<MindElixirRendererProps> = ({
  data,
  containerId = 'mind-elixir-container',
  onExport
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mindElixirRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Mind-Elixir
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Generate options with custom export functions
      const options = generateMindElixirOptions(containerId);
      
      // Add export functions if onExport is provided
      if (onExport) {
        options.contextMenuOption.extend = [
          {
            name: 'Export PNG',
            onclick: () => {
              if (mindElixirRef.current) {
                const dataUrl = mindElixirRef.current.exportPng();
                onExport('png', dataUrl);
              }
            }
          },
          {
            name: 'Export SVG',
            onclick: () => {
              if (mindElixirRef.current) {
                const svgContent = mindElixirRef.current.exportSvg();
                onExport('svg', svgContent);
              }
            }
          },
          {
            name: 'Export PDF',
            onclick: () => {
              if (mindElixirRef.current) {
                // For PDF, we'll use the PNG data URL and convert it
                const dataUrl = mindElixirRef.current.exportPng();
                onExport('pdf', dataUrl);
              }
            }
          }
        ];
      }

      // Initialize Mind-Elixir
      const mindElixir = new MindElixir(options);
      mindElixirRef.current = mindElixir;

      // Load data
      mindElixir.init(data);

      // Enable operations
      mindElixir.enableFreeDrag(true);
      mindElixir.enableNodeDragging(true);

      // Set up event listeners
      mindElixir.bus.addListener('operation', (operation: any) => {
        console.log('Operation:', operation);
      });

      setIsLoaded(true);
    } catch (err) {
      console.error('Error initializing Mind-Elixir:', err);
      setError(`Error initializing mind map: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Cleanup function
    return () => {
      if (mindElixirRef.current) {
        // Perform any necessary cleanup
        mindElixirRef.current = null;
      }
    };
  }, [containerId, data, onExport]);

  // Update data when it changes
  useEffect(() => {
    if (isLoaded && mindElixirRef.current) {
      try {
        mindElixirRef.current.refresh(data);
      } catch (err) {
        console.error('Error updating Mind-Elixir data:', err);
        setError(`Error updating mind map: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, [data, isLoaded]);

  // Add zoom and pan controls
  const handleZoomIn = () => {
    if (mindElixirRef.current) {
      mindElixirRef.current.scale(1.1);
    }
  };

  const handleZoomOut = () => {
    if (mindElixirRef.current) {
      mindElixirRef.current.scale(0.9);
    }
  };

  const handleReset = () => {
    if (mindElixirRef.current) {
      mindElixirRef.current.scale(1);
      mindElixirRef.current.toCenter();
    }
  };

  return (
    <div className="mind-elixir-wrapper">
      {error && (
        <div className="mind-elixir-error">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mind-elixir-controls">
        <button onClick={handleZoomIn} title="Zoom In">
          <span role="img" aria-label="Zoom In">🔍+</span>
        </button>
        <button onClick={handleZoomOut} title="Zoom Out">
          <span role="img" aria-label="Zoom Out">🔍-</span>
        </button>
        <button onClick={handleReset} title="Reset View">
          <span role="img" aria-label="Reset View">🔄</span>
        </button>
      </div>
      
      <div 
        id={containerId} 
        ref={containerRef} 
        className="mind-elixir-container"
        style={{ 
          width: '100%', 
          height: '600px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      />
      
      <style jsx>{`
        .mind-elixir-wrapper {
          position: relative;
          width: 100%;
          margin: 20px 0;
        }
        
        .mind-elixir-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 100;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 4px;
          padding: 5px;
          display: flex;
          gap: 5px;
        }
        
        .mind-elixir-controls button {
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px 10px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .mind-elixir-controls button:hover {
          background: #f5f5f5;
        }
        
        .mind-elixir-error {
          background: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        
        /* Fix hover state bug that causes elements to displace */
        .mind-elixir-container [data-nodeid]:hover {
          transform: none !important;
          box-shadow: 0 0 5px rgba(33, 150, 243, 0.5);
        }
      `}</style>
    </div>
  );
};

export default MindElixirRenderer;
