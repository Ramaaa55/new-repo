import React from 'react';
import { Brain, Sparkles, Clock, Download, Move } from 'lucide-react';
import { useMindMapStore } from './lib/store';
import { analyzeText } from './lib/deepseek';
import { MindMapViewer } from './components/MindMapViewer';
import { MindMapEditor } from './components/MindMapEditor';

function App() {
  const {
    inputText,
    isLoading,
    isEditing,
    setInputText,
    setMindMapData,
    setIsLoading
  } = useMindMapStore();

  const generateMindMap = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    try {
      const topics = await analyzeText(inputText);
      
      // Convert topics to Mermaid syntax
      const mermaidSyntax = `
        graph TD
          %% Node styles
          classDef default fill:#FEFCE8,stroke:#84CC16,stroke-width:2px,rx:8,ry:8,padding:12px
          classDef main fill:#FEF3C7,stroke:#D97706,stroke-width:3px,rx:12,ry:12,padding:20px,font-size:20px
          classDef bubble fill:#E0F2FE,stroke:#0EA5E9,stroke-width:2px,rx:8,ry:8,padding:12px
          classDef list fill:#FCE7F3,stroke:#EC4899,stroke-width:2px,rx:4,ry:4,padding:8px
          
          %% Main topic
          Main["${topics[0].title}"]:::main
          
          %% Subtopics
          ${topics[0].subtopics?.map((topic, i) => {
            const topicId = `Topic${i}`;
            const lines = [`${topicId}["${topic.title}"]:::bubble`, `Main --> ${topicId}`];
            
            // Add nested subtopics if they exist
            if (topic.subtopics?.length) {
              topic.subtopics.forEach((subtopic, j) => {
                const subtopicId = `Subtopic${i}_${j}`;
                lines.push(`${subtopicId}["${subtopic.title}"]:::list`);
                lines.push(`${topicId} --> ${subtopicId}`);
              });
            }
            
            return lines.join('\n');
          }).join('\n') || ''}
          
          %% Style settings
          linkStyle default stroke:#FB7185,stroke-width:2px
      `;

      setMindMapData(mermaidSyntax);
    } catch (error) {
      console.error('Error generating mind map:', error);
      // Set a basic mind map structure in case of error
      setMindMapData(`
        graph TD
          Main["Error generating mind map"]:::main
          Error["Please try again"]:::bubble
          Main --> Error
          
          classDef default fill:#FEFCE8,stroke:#84CC16,stroke-width:2px,rx:8,ry:8,padding:12px
          classDef main fill:#FEF3C7,stroke:#D97706,stroke-width:3px,rx:12,ry:12,padding:20px,font-size:20px
          classDef bubble fill:#E0F2FE,stroke:#0EA5E9,stroke-width:2px,rx:8,ry:8,padding:12px
      `);
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
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-40 p-4 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Enter your text and our AI will create a structured mind map..."
            />
          </div>
          <button
            onClick={generateMindMap}
            disabled={isLoading}
            className="bg-violet-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:bg-violet-400 shadow-sm"
          >
            {isLoading ? 'Generating...' : 'Generate Mind Map'}
          </button>

          {/* Mind Map Display */}
          <div className="mt-8">
            {isEditing ? <MindMapEditor /> : <MindMapViewer />}
          </div>
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