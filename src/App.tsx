import React, { useState, useEffect, useRef } from 'react';
import { Brain, Sparkles, Clock, Download, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import mermaid from 'mermaid';

function App() {
  const [inputText, setInputText] = useState('');
  const [mindMap, setMindMap] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
        fontFamily: 'Comic Sans MS, cursive, sans-serif',
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
  }, []);

  const downloadMindMap = () => {
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current.querySelector('svg');
    if (!svgElement) return;
    
    // Get the actual dimensions
    const bbox = svgElement.getBBox();
    const width = Math.max(bbox.width + 200, 1200);
    const height = Math.max(bbox.height + 200, 800);
    
    // Create a temporary SVG with proper dimensions
    const tempSvg = svgElement.cloneNode(true) as SVGElement;
    tempSvg.setAttribute('width', width.toString());
    tempSvg.setAttribute('height', height.toString());
    tempSvg.setAttribute('viewBox', `${bbox.x - 100} ${bbox.y - 100} ${width} ${height}`);
    
    // Prepare SVG for high-quality export
    const svgData = new XMLSerializer().serializeToString(tempSvg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Create high-resolution canvas (4x for better quality)
      const scale = 4;
      canvas.width = width * scale;
      canvas.height = height * scale;

      if (ctx) {
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Scale and draw the SVG
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        
        // Create download link with maximum quality
        const link = document.createElement('a');
        link.download = 'mindmap.png';
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const generateMindMap = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    try {
      const topics = inputText.split('.').map(topic => topic.trim()).filter(topic => topic.length > 0);
      if (topics.length === 0) return;

      const mainTopic = topics[0].replace(/"/g, '');
      const subtopics = topics.slice(1);

      const mermaidSyntax = `
        graph LR
          %% Node styles
          classDef default fill:#FEFCE8,stroke:#84CC16,stroke-width:2px,rx:8,ry:8,padding:12px
          classDef main fill:#FEF3C7,stroke:#D97706,stroke-width:3px,rx:12,ry:12,padding:20px,font-size:20px
          classDef bubble fill:#E0F2FE,stroke:#0EA5E9,stroke-width:2px,rx:8,ry:8,padding:12px
          classDef list fill:#FCE7F3,stroke:#EC4899,stroke-width:2px,rx:4,ry:4,padding:8px
          
          %% Main topic with sketch-like style
          Main["${mainTopic}"]:::main
          
          %% Create subtopics with alternating styles and improved layout
          ${subtopics.map((topic, i) => {
            if (!topic) return '';
            const title = topic.split('\n')[0].replace(/"/g, '');
            const style = i % 2 === 0 ? 'bubble' : 'list';
            const position = i % 3 === 0 ? 'right' : (i % 3 === 1 ? 'left' : 'bottom');
            
            let connection = '';
            if (position === 'right') {
              connection = `Main --> Topic${i}`;
            } else if (position === 'left') {
              connection = `Main --- Topic${i}`;
            } else {
              connection = `Main -.- Topic${i}`;
            }
            
            return `
              Topic${i}["${title}"]:::${style}
              ${connection}
            `;
          }).filter(Boolean).join('\n')}
          
          %% Style settings for connections
          linkStyle default stroke:#FB7185,stroke-width:2px,stroke-dasharray:5
      `;

      const { svg } = await mermaid.render('mindmap-diagram', mermaidSyntax);
      setMindMap(svg);
    } catch (error) {
      console.error('Error generating mind map:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-violet-600" />
            <span className="text-xl font-bold text-gray-900">MindMap AI</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your Ideas Into
            <span className="text-violet-600"> Beautiful Mind Maps</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Professional AI-powered mind mapping that turns your complex thoughts into clear, organized visualizations in seconds.
          </p>
        </div>
      </div>

      {/* Mind Map Generator */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Generate Your Mind Map</h2>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Separate your main topics with periods (.)</p>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-40 p-4 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Enter your main topic. First subtopic. Second subtopic. Third subtopic."
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={generateMindMap}
              disabled={isLoading}
              className="bg-violet-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:bg-violet-400 shadow-sm"
            >
              {isLoading ? 'Generating...' : 'Generate Mind Map'}
            </button>
            {mindMap && (
              <button
                onClick={downloadMindMap}
                className="bg-white text-violet-600 border-2 border-violet-600 px-8 py-4 rounded-xl font-semibold hover:bg-violet-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PNG
              </button>
            )}
          </div>
          {mindMap && (
            <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="border-b border-gray-100 p-4 flex items-center justify-between">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  Click and drag to pan
                </div>
              </div>
              <div className="p-8">
                <TransformWrapper
                  initialScale={1}
                  minScale={0.5}
                  maxScale={2}
                  centerOnInit={true}
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
                          id="mindmap" 
                          className="flex justify-center items-center min-h-[600px] w-full"
                          dangerouslySetInnerHTML={{ __html: mindMap }} 
                        />
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-50 py-24 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Why Choose MindMap AI?</h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-violet-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our advanced AI understands context and relationships, creating perfectly structured mind maps.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-violet-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Crystal Clear Output</h3>
              <p className="text-gray-600 leading-relaxed">
                Beautiful, organized mind maps that make your ideas shine and easy to understand.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-violet-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Save Hours of Work</h3>
              <p className="text-gray-600 leading-relaxed">
                What takes hours manually is done in seconds with our professional AI technology.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-white py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Trusted by Professionals Worldwide</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-2xl">
              <p className="text-gray-600 mb-4">"Transformed how I organize my thoughts. Worth every penny."</p>
              <p className="font-medium text-gray-900">Sarah Chen</p>
              <p className="text-sm text-gray-500">Product Manager</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl">
              <p className="text-gray-600 mb-4">"The AI understanding is incredible. Saves me hours every week."</p>
              <p className="font-medium text-gray-900">Mark Thompson</p>
              <p className="text-sm text-gray-500">Content Strategist</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl">
              <p className="text-gray-600 mb-4">"Best tool I've found for quick, professional mind mapping."</p>
              <p className="font-medium text-gray-900">Lisa Rodriguez</p>
              <p className="text-sm text-gray-500">Research Analyst</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Brain className="w-8 h-8 text-violet-600" />
            <span className="text-xl font-bold text-gray-900">MindMap AI</span>
          </div>
          <div className="text-center text-gray-600">
            <p className="mb-4">Transform your ideas into mind maps in seconds.</p>
            <p>© 2025 MindMap AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;