import { useState } from 'react';
import { Brain, Sparkles, Clock, Settings } from 'lucide-react';
import { useMindMapStore } from './lib/store';
import { analyzeText } from './lib/deepseek';
import { MindMapViewer } from './components/MindMapViewer';
import { MindMapEditor } from './components/MindMapEditor';
import { DocumentUploader } from './components/DocumentUploader';

type DetailLevel = 'basic' | 'intermediate' | 'advanced';
type MindMapOptions = {
  detailLevel: DetailLevel;
  includeDescriptions: boolean;
  includeExamples: boolean;
  includeCrossConnections: boolean;
  includeColorCoding: boolean;
  includeCitations: boolean;
};

function App() {
  const {
    inputText,
    isLoading,
    isEditing,
    setInputText,
    setMindMapData,
    setIsLoading,
    document,
    setDocument,
    setError
  } = useMindMapStore();

  const [options, setOptions] = useState<MindMapOptions>({
    detailLevel: 'intermediate',
    includeDescriptions: true,
    includeExamples: true,
    includeCrossConnections: true,
    includeColorCoding: true,
    includeCitations: false
  });

  const generateMindMap = async () => {
    if (!inputText?.trim() && !document?.content) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const content = document?.content || inputText;
      
      // Input validation
      if (content.length < 10) {
        throw new Error('Please provide more text to generate a meaningful mind map');
      }
      
      if (content.length > 50000) {
        throw new Error('Text is too long. Please provide a shorter text (maximum 50,000 characters)');
      }
      
      console.log('Generating mind map with options:', options);
      const topics = await analyzeText(content, options);
      
      if (!topics || !Array.isArray(topics) || !topics.length) {
        throw new Error('No valid topics generated');
      }

      const mainTopic = topics[0];
      if (!mainTopic || !mainTopic.title) {
        throw new Error('Invalid main topic structure');
      }
      
      // Simplified and reliable sanitization function
      const sanitizeText = (text: string | undefined): string => {
        if (!text) return 'Topic';
        
        // Remove all non-alphanumeric characters except spaces
        let cleaned = text
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Limit length
        if (cleaned.length > 25) {
          cleaned = cleaned.substring(0, 25) + '...';
        }
        
        // If empty after sanitization, provide a default
        if (!cleaned) {
          return 'Topic';
        }
        
        return cleaned;
      };
      
      // Generate a simplified and reliable Mermaid syntax
      let mermaidSyntax = 'graph TD\n';
      
      // Add styles
      mermaidSyntax += '  %% Node styles\n';
      mermaidSyntax += '  classDef main fill:#FEF3C7,stroke:#D97706,stroke-width:3px,color:#000000,font-weight:bold\n';
      mermaidSyntax += '  classDef level1 fill:#E0F2FE,stroke:#0EA5E9,stroke-width:2px,color:#000000\n';
      mermaidSyntax += '  classDef level2 fill:#FCE7F3,stroke:#EC4899,stroke-width:2px,color:#000000\n\n';
      
      // Add main topic with a simple ID
      const mainTitle = sanitizeText(mainTopic.title);
      mermaidSyntax += `  main["${mainTitle}"]\n`;
      
      // Add subtopics with simple IDs
      if (mainTopic.subtopics && mainTopic.subtopics.length > 0) {
        mainTopic.subtopics.forEach((topic, i) => {
          if (!topic) return;
          
          const topicId = `t${i}`;
          const topicTitle = sanitizeText(topic.title);
          
          // Add node definition
          mermaidSyntax += `  ${topicId}["${topicTitle}"]\n`;
          
          // Add edge from main to this topic
          mermaidSyntax += `  main --> ${topicId}\n`;
          
          // Add subtopics if they exist
          if (topic.subtopics && topic.subtopics.length > 0) {
            topic.subtopics.forEach((subtopic, j) => {
              if (!subtopic) return;
              
              const subtopicId = `st${i}_${j}`;
              const subtopicTitle = sanitizeText(subtopic.title);
              
              // Add node definition
              mermaidSyntax += `  ${subtopicId}["${subtopicTitle}"]\n`;
              
              // Add edge from topic to subtopic
              mermaidSyntax += `  ${topicId} --> ${subtopicId}\n`;
            });
          }
        });
      } else {
        // Ensure we have at least one valid node besides the main one
        mermaidSyntax += `  t0["No subtopics found"]\n`;
        mermaidSyntax += `  main --> t0\n`;
      }
      
      // Apply styles
      mermaidSyntax += '\n  %% Apply styles\n';
      mermaidSyntax += '  class main main\n';
      
      // Apply styles to subtopics
      if (mainTopic.subtopics && mainTopic.subtopics.length > 0) {
        mainTopic.subtopics.forEach((topic, i) => {
          const topicId = `t${i}`;
          mermaidSyntax += `  class ${topicId} level1\n`;
          
          if (topic.subtopics && topic.subtopics.length > 0) {
            topic.subtopics.forEach((_subtopic, j) => {
              const subtopicId = `st${i}_${j}`;
              mermaidSyntax += `  class ${subtopicId} level2\n`;
            });
          }
        });
      } else {
        mermaidSyntax += '  class t0 level1\n';
      }
      
      console.log('Generated Mermaid syntax:', mermaidSyntax);
      setMindMapData(mermaidSyntax);
    } catch (error: any) {
      console.error('Error generating mind map:', error);
      setError(error?.message || 'Failed to generate mind map. Please try again.');
      
      // Create a simple error diagram that will always render correctly
      const errorDiagram = `graph TD
  main["Error: ${error?.message ? sanitizeText(error.message) : 'Failed to generate mind map'}"]
  error["Please try again"]
  main --> error
  class main main
  class error level1
  classDef main fill:#FEF3C7,stroke:#D97706,stroke-width:3px,color:#000000,font-weight:bold
  classDef level1 fill:#E0F2FE,stroke:#0EA5E9,stroke-width:2px,color:#000000`;
      
      setMindMapData(errorDiagram);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-violet-600" />
            <span className="text-xl font-bold text-gray-900">MindMap AI</span>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your Documents Into
            <span className="text-violet-600"> Beautiful Mind Maps</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Upload your documents or enter text to create detailed, AI-powered mind maps with rich context and connections.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Upload Document</h2>
              <DocumentUploader />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-6">Or Enter Text</h2>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-40 p-4 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Enter your text and our AI will create a structured mind map..."
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Mind Map Options
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detail Level
                </label>
                <select
                  value={options.detailLevel}
                  onChange={(e) => setOptions({ ...options, detailLevel: e.target.value as DetailLevel })}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                >
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeDescriptions}
                    onChange={(e) => setOptions({ ...options, includeDescriptions: e.target.checked })}
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-700">Include Descriptions</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeExamples}
                    onChange={(e) => setOptions({ ...options, includeExamples: e.target.checked })}
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-700">Include Examples</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeCrossConnections}
                    onChange={(e) => setOptions({ ...options, includeCrossConnections: e.target.checked })}
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-700">Show Cross-Connections</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeColorCoding}
                    onChange={(e) => setOptions({ ...options, includeColorCoding: e.target.checked })}
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-700">Color Code Categories</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeCitations}
                    onChange={(e) => setOptions({ ...options, includeCitations: e.target.checked })}
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-700">Include Citations</span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={generateMindMap}
            disabled={isLoading || (!inputText?.trim() && !document?.content)}
            className="bg-violet-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:bg-violet-400 shadow-sm"
          >
            {isLoading ? 'Generating...' : 'Generate Mind Map'}
          </button>

          <div className="mt-8">
            {isEditing ? <MindMapEditor /> : <MindMapViewer />}
          </div>
        </div>
      </div>

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

      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Brain className="w-8 h-8 text-violet-600" />
            <span className="text-xl font-bold text-gray-900">MindMap AI</span>
          </div>
          <div className="text-center text-gray-600">
            <p className="mb-4">Transform your ideas into mind maps in seconds.</p>
            <p> 2025 MindMap AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;