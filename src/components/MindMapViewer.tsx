import { useEffect, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Edit, Download } from 'lucide-react';
import { useMindMapStore } from '../lib/store';
import mermaid from 'mermaid';
import { toPng } from 'html-to-image';

export function MindMapViewer() {
  const { mindMapData, setIsEditing } = useMindMapStore();
  const svgRef = useRef<HTMLDivElement>(null);
  const [activeTooltip, setActiveTooltip] = useState<{id: string, content: string, x: number, y: number} | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (!mindMapData) return;

    // Initialize mermaid with specific configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      logLevel: 'error',
      securityLevel: 'loose',
      themeVariables: {
        primaryColor: '#FEFCE8',
        primaryTextColor: '#374151',
        primaryBorderColor: '#84CC16',
        lineColor: '#FB7185',
        secondaryColor: '#E0F2FE',
        tertiaryColor: '#FCE7F3',
        fontFamily: 'system-ui, sans-serif',
      },
      flowchart: {
        curve: 'basis',
        padding: 48,
        nodeSpacing: 80,
        rankSpacing: 120,
        htmlLabels: true,
        useMaxWidth: true,
      }
    });

    // Add error handler for Mermaid parsing errors
    mermaid.parseError = (err, hash) => {
      console.error('Mermaid parse error:', err, hash);
    };

    // Guaranteed valid fallback diagram
    const fallbackDiagram = `
      graph TD
        main[" Main Topic"]
        sub1[" Subtopic 1"]
        sub2[" Subtopic 2"]
        sub3[" Subtopic 3"]
        main --> sub1
        main --> sub2
        main --> sub3
        class main main
        class sub1 level1
        class sub2 level1
        class sub3 level1
        classDef main fill:#FEF3C7,stroke:#D97706,stroke-width:3px,color:#000000,font-weight:bold
        classDef level1 fill:#E0F2FE,stroke:#0EA5E9,stroke-width:2px,color:#000000
    `;

    const renderDiagram = async () => {
      try {
        // Set rendering state to prevent multiple renders
        setIsRendering(true);
        
        // Clear previous content and error state
        if (svgRef.current) {
          svgRef.current.innerHTML = '';
        }
        setRenderError(null);

        // Validate mindMapData before processing
        if (!mindMapData || !mindMapData.trim() || !mindMapData.includes('graph')) {
          throw new Error('Invalid mind map data format');
        }

        // Sanitize and format the mindMapData
        let formattedData = mindMapData
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n');
        
        // Validate the syntax before rendering
        try {
          // Basic validation to catch common syntax errors
          if (!formattedData.startsWith('graph')) {
            throw new Error('Invalid diagram format: must start with "graph TD" or "graph LR"');
          }
          
          // Remove any problematic patterns that are known to cause issues
          formattedData = formattedData
            // Remove any instances of "de William MacA" which causes parsing errors
            .replace(/\bde\s+William\s+Mac[A-Z][a-z]*/g, 'William')
            // Fix unbalanced quotes
            .replace(/"/g, '"')
            .replace(/([a-zA-Z0-9_]+)(\s*\[)([^\]]*[^"\]])/g, '$1$2"$3"')
            // Replace empty lines with comments to avoid null token errors
            .replace(/^\s*$/gm, '%% comment')
            // Ensure node IDs are alphanumeric
            .replace(/([^a-zA-Z0-9_]+)(\s*\[)/g, 'node_$1$2');
          
          console.log('Rendering diagram with data:', formattedData);

          // Use a unique ID for each render to avoid conflicts
          const diagramId = `mindmap-diagram-${Date.now()}`;
          
          // Try to render with a timeout to prevent hanging
          const renderPromise = new Promise<{svg: string}>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Rendering timed out after 5 seconds'));
            }, 5000);
            
            mermaid.render(diagramId, formattedData)
              .then(result => {
                clearTimeout(timeout);
                resolve(result);
              })
              .catch(error => {
                clearTimeout(timeout);
                reject(error);
              });
          });
          
          const { svg } = await renderPromise;
          
          if (svgRef.current) {
            svgRef.current.innerHTML = svg;

            // Post-process SVG
            const svgElement = svgRef.current.querySelector('svg');
            if (svgElement) {
              // Make SVG responsive
              svgElement.setAttribute('width', '100%');
              svgElement.setAttribute('height', '100%');
              svgElement.style.minHeight = '600px';
              
              // Fix SVG viewBox to ensure proper scaling
              const viewBox = svgElement.getAttribute('viewBox');
              if (!viewBox) {
                const bbox = svgElement.getBBox();
                svgElement.setAttribute('viewBox', `0 0 ${bbox.width + 100} ${bbox.height + 100}`);
              }

              // Add smooth transitions - FIXED: removed transform effects that cause elements to "fly"
              const style = document.createElement('style');
              style.textContent = `
                /* Base styles for nodes */
                .node { 
                  cursor: pointer;
                  /* Remove transitions that cause movement */
                  transition: filter 0.3s ease, opacity 0.3s ease;
                  /* Fix position to prevent movement */
                  transform-box: fill-box;
                  transform-origin: center center;
                  /* Ensure stable positioning - very important */
                  position: absolute;
                  /* Prevent text selection */
                  user-select: none;
                  /* Add a will-change hint for browser optimization */
                  will-change: filter, opacity;
                  /* Ensure GPU acceleration without causing movement */
                  backface-visibility: hidden;
                }
                
                /* Hover effects that don't cause movement */
                .node:hover { 
                  filter: brightness(1.1) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07));
                  /* No transform changes on hover to prevent movement */
                }
                
                /* Edge styling */
                .edgePath { 
                  transition: stroke-width 0.3s ease, opacity 0.3s ease;
                  pointer-events: none;
                  /* Ensure edges don't move */
                  position: absolute;
                  /* Prevent any transform that could cause movement */
                  transform: none !important;
                  /* Add GPU acceleration without transforms */
                  will-change: stroke-width, opacity;
                }
                
                /* Ensure edge labels don't move */
                .edgeLabel {
                  transition: filter 0.3s ease;
                  pointer-events: none;
                  position: absolute;
                  transform: none !important;
                }
                
                /* Cluster styling */
                .cluster { 
                  transition: filter 0.3s ease;
                  /* Ensure stable positioning */
                  position: absolute;
                  /* Prevent any transform that could cause movement */
                  transform: none !important;
                }
                
                .cluster:hover { 
                  filter: brightness(1.05);
                  /* No transform to prevent movement */
                }
                
                /* Node shape styling */
                .node rect, .node circle, .node ellipse, .node polygon, .node path {
                  transition: stroke-width 0.3s ease;
                  stroke-width: 2px;
                  /* Ensure shapes don't move */
                  position: absolute;
                }
                
                .node:hover rect, .node:hover circle, .node:hover ellipse, .node:hover polygon, .node:hover path {
                  stroke-width: 3px;
                  /* No transform that could cause movement */
                  transform: none !important;
                }
                
                /* Ensure labels don't move */
                .node .label {
                  transition: filter 0.3s ease;
                  /* Fix position */
                  position: absolute;
                  /* Prevent transformations that cause movement */
                  transform: none !important;
                }
                
                /* Apply a subtle opacity change instead of movement on hover */
                .node:hover .label {
                  filter: brightness(1.1);
                }
                
                /* Prevent SVG group transforms which cause jitter */
                g {
                  /* Critical fix: this prevents g elements from being transformed
                     which is a major cause of elements shifting on hover */
                  transform-origin: initial !important;
                  /* We want it to use whatever transform is initially set
                     but not change dynamically during interactions */
                }
                
                /* Override any inline styles that might cause movement */
                [style*="transition"], [style*="transform"] {
                  transition: filter 0.3s ease, opacity 0.3s ease !important;
                  /* Only allow non-movement transforms */
                  transform: none !important;
                }
                
                /* Ensure font and size consistency to prevent text reflow */
                .label text, .edgeLabel text {
                  font-family: system-ui, sans-serif !important;
                  font-size: 14px !important;
                  font-weight: normal !important;
                }
              `;
              svgElement.appendChild(style);

              // Enhance text readability
              const texts = svgElement.querySelectorAll('text');
              texts.forEach(text => {
                text.style.fontFamily = 'system-ui, sans-serif';
                text.style.fontSize = '14px';
                text.style.fontWeight = '400';
                // Fix text positioning
                text.style.dominantBaseline = 'middle';
                text.style.textAnchor = 'middle';
              });

              // Improve edge paths
              const edges = svgElement.querySelectorAll('.edgePath path');
              edges.forEach(edge => {
                edge.setAttribute('stroke-linecap', 'round');
                edge.setAttribute('stroke-linejoin', 'round');
                edge.setAttribute('stroke-width', '2');
                // Fix edge positioning
                edge.setAttribute('vector-effect', 'non-scaling-stroke');
              });

              // Add tooltips to nodes with fixed positioning
              const nodes = svgElement.querySelectorAll('.node');
              nodes.forEach((node, index) => {
                const nodeId = `node-${index}`;
                node.setAttribute('data-node-id', nodeId);
                
                // Extract node text content for tooltip
                const textElement = node.querySelector('text');
                let tooltipContent = textElement ? textElement.textContent || '' : '';
                
                // Enhance tooltip content if available
                if (tooltipContent) {
                  // Add bullet points for readability if content is long
                  if (tooltipContent.length > 30) {
                    tooltipContent = `• ${tooltipContent.replace(/\s*-\s*/g, '\n• ')}`;
                  }
                }
                
                // Use a better approach for tooltips - use a fixed position div outside the SVG
                node.addEventListener('mouseenter', (e) => {
                  // Get the node's position relative to the viewport
                  const rect = (e.currentTarget as Element).getBoundingClientRect();
                  
                  // Calculate tooltip position relative to the viewport
                  const x = rect.left + rect.width / 2;
                  const y = rect.top - 10;
                  
                  // Set tooltip with fixed positioning
                  setActiveTooltip({
                    id: nodeId,
                    content: tooltipContent,
                    x,
                    y
                  });
                });
                
                node.addEventListener('mouseleave', () => {
                  setActiveTooltip(null);
                });
              });
              
              // Fix any foreignObject elements that might cause rendering issues
              const foreignObjects = svgElement.querySelectorAll('foreignObject');
              foreignObjects.forEach(fo => {
                fo.setAttribute('overflow', 'visible');
                fo.style.overflow = 'visible';
                
                // Ensure content is properly sized
                const div = fo.querySelector('div');
                if (div) {
                  div.style.width = '100%';
                  div.style.height = '100%';
                  div.style.overflow = 'visible';
                }
              });
            }
          }
        } catch (error: unknown) {
          console.error('Mermaid render error:', error);
          setRenderError('Failed to render the mind map diagram. Using fallback diagram.');
          
          // Render the fallback diagram
          if (svgRef.current) {
            try {
              const { svg } = await mermaid.render('fallback-diagram', fallbackDiagram);
              svgRef.current.innerHTML = svg;
              
              // Add a notice about using fallback
              const notice = document.createElement('div');
              notice.style.position = 'absolute';
              notice.style.top = '10px';
              notice.style.left = '10px';
              notice.style.padding = '8px 12px';
              notice.style.backgroundColor = 'rgba(254, 226, 226, 0.9)';
              notice.style.color = '#B91C1C';
              notice.style.borderRadius = '4px';
              notice.style.fontSize = '14px';
              notice.style.fontWeight = 'bold';
              notice.style.zIndex = '100';
              notice.textContent = 'Using fallback diagram due to rendering errors';
              
              svgRef.current.appendChild(notice);
            } catch (fallbackError) {
              // If even the fallback diagram fails, show a basic HTML error message
              svgRef.current.innerHTML = `
                <div style="color: #EF4444; text-align: center; padding: 2rem;">
                  <h3>Error Rendering Mind Map</h3>
                  <p>Please check console for details</p>
                </div>
              `;
            }
          }
        }
      } catch (error: unknown) {
        console.error('Error in mind map rendering process:', error);
        setRenderError('Error in mind map rendering process. Using fallback diagram.');
        
        // Render the fallback diagram as a last resort
        if (svgRef.current) {
          try {
            const { svg } = await mermaid.render('error-fallback-diagram', fallbackDiagram);
            svgRef.current.innerHTML = svg;
            
            // Add a notice about using fallback
            const notice = document.createElement('div');
            notice.style.position = 'absolute';
            notice.style.top = '10px';
            notice.style.left = '10px';
            notice.style.padding = '8px 12px';
            notice.style.backgroundColor = 'rgba(254, 226, 226, 0.9)';
            notice.style.color = '#B91C1C';
            notice.style.borderRadius = '4px';
            notice.style.fontSize = '14px';
            notice.style.fontWeight = 'bold';
            notice.style.zIndex = '100';
            notice.textContent = 'Using fallback diagram due to rendering errors';
            
            svgRef.current.appendChild(notice);
          } catch (finalError) {
            // If even the fallback diagram fails, show a basic HTML error message
            svgRef.current.innerHTML = `
              <div style="color: #EF4444; text-align: center; padding: 2rem;">
                <h3>Error Rendering Mind Map</h3>
                <p>Please check console for details</p>
              </div>
            `;
          }
        }
      } finally {
        // Reset rendering state
        setIsRendering(false);
      }
    };

    renderDiagram();
  }, [mindMapData]);

  const handleDownload = async () => {
    if (!svgRef.current) return;
    
    try {
      const dataUrl = await toPng(svgRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        width: svgRef.current.scrollWidth,
        height: svgRef.current.scrollHeight,
        pixelRatio: 2, // Higher resolution for better quality
      });
      
      const link = document.createElement('a');
      link.download = 'mindmap.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error downloading mind map:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!mindMapData) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg border border-gray-200 p-8">
        <div className="text-gray-400 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">No Mind Map Available</h3>
          <p className="text-sm">Upload a document or enter text to generate a mind map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[600px] bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button 
          onClick={handleEdit}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          title="Edit Mind Map"
        >
          <Edit size={18} className="text-gray-600" />
        </button>
        <button 
          onClick={handleDownload}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          title="Download as PNG"
        >
          <Download size={18} className="text-gray-600" />
        </button>
      </div>
      
      {/* Error message if rendering failed */}
      {renderError && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          <strong>Error:</strong> {renderError}
        </div>
      )}
      
      {/* Loading indicator */}
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-20">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">Generating Mind Map...</p>
          </div>
        </div>
      )}
      
      {/* Mind Map Viewer with Zoom Controls */}
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={2}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
        limitToBounds={false}
        doubleClick={{ disabled: true }} // Disable double-click to zoom to prevent accidental zooms
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
              <button 
                onClick={() => zoomIn()}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={18} className="text-gray-600" />
              </button>
              <button 
                onClick={() => zoomOut()}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={18} className="text-gray-600" />
              </button>
              <button 
                onClick={() => resetTransform()}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                title="Reset View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"></path>
                  <path d="M3 12h18"></path>
                </svg>
              </button>
            </div>
            
            <TransformComponent wrapperClass="h-full w-full" contentClass="h-full w-full">
              <div ref={svgRef} className="h-full w-full p-4"></div>
            </TransformComponent>
            
            {/* Fixed position tooltip - rendered outside the transform component for stable positioning */}
            {activeTooltip && (
              <div 
                className="fixed bg-white p-3 rounded-lg shadow-lg text-sm max-w-xs z-50 pointer-events-none"
                style={{
                  left: `${activeTooltip.x}px`,
                  top: `${activeTooltip.y}px`,
                  transform: 'translateX(-50%) translateY(-100%)',
                  border: '1px solid #e5e7eb',
                  maxWidth: '250px',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-line', // Preserve line breaks in tooltip content
                }}
              >
                {activeTooltip.content}
              </div>
            )}
          </>
        )}
      </TransformWrapper>
    </div>
  );
}