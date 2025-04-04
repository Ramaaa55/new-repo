import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Layout, Type, Palette, Sliders, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useMindMapStore, LayoutType } from '../lib/store';

const layouts: { value: LayoutType; label: string; description: string }[] = [
  { value: 'radial', label: 'Radial', description: 'Nodes arranged in a circular pattern around the central topic' },
  { value: 'hierarchical', label: 'Hierarchical', description: 'Traditional top-down tree structure' },
  { value: 'organic', label: 'Organic', description: 'Natural flowing layout with curved connections' },
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ru', name: 'Russian' },
];

const presetColors = [
  { name: 'Violet', primary: '#8B5CF6', secondary: '#EDE9FE' },
  { name: 'Sky', primary: '#0EA5E9', secondary: '#E0F2FE' },
  { name: 'Emerald', primary: '#10B981', secondary: '#D1FAE5' },
  { name: 'Amber', primary: '#F59E0B', secondary: '#FEF3C7' },
  { name: 'Rose', primary: '#F43F5E', secondary: '#FCE7F3' },
  { name: 'Slate', primary: '#64748B', secondary: '#F1F5F9' },
];

export function MindMapControls() {
  const { settings, updateSettings } = useMindMapStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    layout: true,
    appearance: true,
    content: false,
    advanced: false,
  });
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Close color picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ id, icon, title }: { id: string; icon: React.ReactNode; title: string }) => (
    <button 
      onClick={() => toggleSection(id)}
      className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-700 hover:text-violet-700 transition-colors"
    >
      <div className="flex items-center gap-2">
        {icon}
        {title}
      </div>
      {expandedSections[id] ? (
        <ChevronUp className="w-4 h-4 text-gray-500" />
      ) : (
        <ChevronDown className="w-4 h-4 text-gray-500" />
      )}
    </button>
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="space-y-4">
        {/* Layout Section */}
        <div className="border-b border-gray-100 pb-3">
          <SectionHeader id="layout" icon={<Layout className="w-4 h-4" />} title="Layout Options" />
          
          {expandedSections.layout && (
            <div className="mt-3 space-y-4">
              {/* Layout Selection */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Layout Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {layouts.map((layout) => (
                    <button
                      key={layout.value}
                      onClick={() => updateSettings({ layout: layout.value })}
                      className={`px-3 py-2 text-sm rounded-md transition-all ${
                        settings.layout === layout.value
                          ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-300'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      title={layout.description}
                    >
                      {layout.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Node Spacing */}
              <div>
                <label className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Node Spacing</span>
                  <span className="text-violet-600 font-medium">{Math.round(settings.nodeSpacing * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.nodeSpacing || 1}
                  onChange={(e) => updateSettings({ nodeSpacing: parseFloat(e.target.value) })}
                  className="w-full accent-violet-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Appearance Section */}
        <div className="border-b border-gray-100 pb-3">
          <SectionHeader id="appearance" icon={<Palette className="w-4 h-4" />} title="Appearance" />
          
          {expandedSections.appearance && (
            <div className="mt-3 space-y-4">
              {/* Color Scheme */}
              <div className="relative" ref={colorPickerRef}>
                <label className="text-xs text-gray-500 mb-1 block">Color Scheme</label>
                <div className="flex gap-2 mb-2">
                  {presetColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => updateSettings({
                        colorScheme: { primary: color.primary, secondary: color.secondary }
                      })}
                      className={`w-6 h-6 rounded-full transition-all ${
                        settings.colorScheme.primary === color.primary 
                          ? 'ring-2 ring-offset-2 ring-violet-500' 
                          : 'hover:scale-110'
                      }`}
                      style={{ background: color.primary }}
                      title={color.name}
                    />
                  ))}
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={`w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all ${
                      !presetColors.some(c => c.primary === settings.colorScheme.primary)
                        ? 'ring-2 ring-offset-2 ring-violet-500' 
                        : 'hover:scale-110'
                    }`}
                    title="Custom color"
                  />
                </div>
                
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full h-10 rounded-md border border-gray-200 flex items-center justify-center text-sm"
                  style={{ 
                    background: `linear-gradient(to right, ${settings.colorScheme.primary}, ${settings.colorScheme.secondary})` 
                  }}
                >
                  <span className="bg-white/80 px-2 py-1 rounded text-gray-700">
                    {settings.colorScheme.primary}
                  </span>
                </button>
                
                {showColorPicker && (
                  <div className="absolute z-10 mt-2">
                    <HexColorPicker
                      color={settings.colorScheme.primary}
                      onChange={(color) =>
                        updateSettings({
                          colorScheme: { ...settings.colorScheme, primary: color },
                        })
                      }
                    />
                    <div className="mt-2 bg-white p-2 border border-gray-200 rounded-md">
                      <label className="text-xs text-gray-500 mb-1 block">Secondary Color</label>
                      <HexColorPicker
                        color={settings.colorScheme.secondary}
                        onChange={(color) =>
                          updateSettings({
                            colorScheme: { ...settings.colorScheme, secondary: color },
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Vignette Style */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Background Style</label>
                <select
                  value={settings.vignetteStyle}
                  onChange={(e) => updateSettings({ vignetteStyle: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="none">None</option>
                  <option value="soft">Soft Vignette</option>
                  <option value="medium">Medium Vignette</option>
                  <option value="strong">Strong Vignette</option>
                  <option value="gradient">Gradient Background</option>
                  <option value="pattern">Subtle Pattern</option>
                </select>
              </div>

              {/* Line Style */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Connection Style</label>
                <select
                  value={settings.lineStyle || 'curved'}
                  onChange={(e) => updateSettings({ lineStyle: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="straight">Straight Lines</option>
                  <option value="curved">Curved Lines</option>
                  <option value="orthogonal">Orthogonal (Right Angles)</option>
                  <option value="arc">Arc Connections</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="border-b border-gray-100 pb-3">
          <SectionHeader id="content" icon={<Type className="w-4 h-4" />} title="Content Options" />
          
          {expandedSections.content && (
            <div className="mt-3 space-y-4">
              {/* Text Density */}
              <div>
                <label className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Text Density</span>
                  <span className="text-violet-600 font-medium">{Math.round(settings.textDensity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.textDensity}
                  onChange={(e) => updateSettings({ textDensity: parseFloat(e.target.value) })}
                  className="w-full accent-violet-600"
                />
              </div>

              {/* Emoji Toggle */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Emoji Enhancement</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSettings({ showEmojis: true })}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      settings.showEmojis
                        ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Enabled 😊
                  </button>
                  <button
                    onClick={() => updateSettings({ showEmojis: false })}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      !settings.showEmojis
                        ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Disabled
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Target Language</label>
                <select
                  value={settings.targetLanguage}
                  onChange={(e) => updateSettings({ targetLanguage: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bullet Points Toggle */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Bullet Points</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSettings({ showBullets: true })}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      settings.showBullets
                        ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Enabled •
                  </button>
                  <button
                    onClick={() => updateSettings({ showBullets: false })}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      !settings.showBullets
                        ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Disabled
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Section */}
        <div>
          <SectionHeader id="advanced" icon={<Sliders className="w-4 h-4" />} title="Advanced Options" />
          
          {expandedSections.advanced && (
            <div className="mt-3 space-y-4">
              {/* Node Shape */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Node Shape</label>
                <select
                  value={settings.nodeShape || 'rounded'}
                  onChange={(e) => updateSettings({ nodeShape: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="rounded">Rounded Rectangle</option>
                  <option value="rectangle">Rectangle</option>
                  <option value="circle">Circle</option>
                  <option value="ellipse">Ellipse</option>
                  <option value="diamond">Diamond</option>
                  <option value="hexagon">Hexagon</option>
                </select>
              </div>

              {/* Animation Speed */}
              <div>
                <label className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Animation Speed</span>
                  <span className="text-violet-600 font-medium">
                    {settings.animationSpeed === 0.5 ? 'Slow' : 
                     settings.animationSpeed === 1 ? 'Normal' : 
                     settings.animationSpeed === 1.5 ? 'Fast' : 'Custom'}
                  </span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.25"
                  value={settings.animationSpeed || 1}
                  onChange={(e) => updateSettings({ animationSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-violet-600"
                />
              </div>

              {/* Font Size */}
              <div>
                <label className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Font Size</span>
                  <span className="text-violet-600 font-medium">{Math.round((settings.fontSize || 1) * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={settings.fontSize || 1}
                  onChange={(e) => updateSettings({ fontSize: parseFloat(e.target.value) })}
                  className="w-full accent-violet-600"
                />
              </div>

              {/* Auto-Refresh Toggle */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Auto-Refresh</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSettings({ autoRefresh: true })}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      settings.autoRefresh
                        ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Zap className="w-3 h-3 inline mr-1" />
                    On
                  </button>
                  <button
                    onClick={() => updateSettings({ autoRefresh: false })}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      !settings.autoRefresh
                        ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Off
                  </button>
                </div>
              </div>

              {/* Depth Limit */}
              <div>
                <label className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Depth Limit</span>
                  <span className="text-violet-600 font-medium">
                    {settings.depthLimit === 0 ? 'No Limit' : `${settings.depthLimit} Levels`}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={settings.depthLimit || 0}
                  onChange={(e) => updateSettings({ depthLimit: parseInt(e.target.value) })}
                  className="w-full accent-violet-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            // Reset to default settings
            updateSettings({
              layout: 'hierarchical',
              textDensity: 0.7,
              colorScheme: { primary: '#8B5CF6', secondary: '#EDE9FE' },
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
            });
          }}
          className="w-full mt-4 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}