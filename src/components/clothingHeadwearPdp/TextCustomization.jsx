import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Available fonts for text customization
const FONTS = [
  { id: 'helvetica-bold', name: 'Helvetica Bold', family: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: 700 },
  { id: 'arial-black', name: 'Arial Black', family: "'Arial Black', Gadget, sans-serif", weight: 900 },
  { id: 'times-bold', name: 'Times New Roman Bold', family: "'Times New Roman', Times, serif", weight: 700 },
  { id: 'georgia', name: 'Georgia', family: "Georgia, serif", weight: 400 },
  { id: 'impact', name: 'Impact', family: "Impact, Charcoal, sans-serif", weight: 400 },
  { id: 'verdana-bold', name: 'Verdana Bold', family: "Verdana, Geneva, sans-serif", weight: 700 },
  { id: 'courier-bold', name: 'Courier Bold', family: "'Courier New', Courier, monospace", weight: 700 },
];

// Available colors for text customization
const COLORS = [
  { id: 'royal-blue', name: 'Royal Blue', hex: '#4169E1' },
  { id: 'navy', name: 'Navy', hex: '#000080' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'red', name: 'Red', hex: '#FF0000' },
  { id: 'gold', name: 'Gold', hex: '#FFD700' },
  { id: 'green', name: 'Green', hex: '#008000' },
  { id: 'orange', name: 'Orange', hex: '#FFA500' },
  { id: 'purple', name: 'Purple', hex: '#800080' },
  { id: 'silver', name: 'Silver', hex: '#C0C0C0' },
];

const MAX_CHARS_PER_LINE = 25;
const MAX_LINES = 4;

export default function TextCustomization({
  onTextChange,
  initialData = null,
  position = 'Left Chest',
}) {
  const [lines, setLines] = useState(() => {
    if (initialData?.lines) {
      return initialData.lines;
    }
    return Array(MAX_LINES).fill('');
  });
  const [selectedFont, setSelectedFont] = useState(() => {
    return initialData?.font || FONTS[0];
  });
  const [selectedColor, setSelectedColor] = useState(() => {
    return initialData?.color || COLORS[0];
  });

  // Notify parent of changes
  useEffect(() => {
    const filledLines = lines.filter(line => line.trim() !== '');
    if (onTextChange) {
      onTextChange({
        lines: lines,
        filledLines: filledLines,
        font: selectedFont,
        color: selectedColor,
        hasContent: filledLines.length > 0,
      });
    }
  }, [lines, selectedFont, selectedColor, onTextChange]);

  const handleLineChange = (index, value) => {
    if (value.length <= MAX_CHARS_PER_LINE) {
      const newLines = [...lines];
      newLines[index] = value;
      setLines(newLines);
    }
  };

  const getPreviewText = () => {
    return lines.filter(line => line.trim() !== '');
  };

  const previewLines = getPreviewText();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left side - Text Entry */}
      <div className="space-y-6">
        {/* Position indicator */}
        <div className="flex items-center space-x-2 text-sm text-[#6B7380]">
          <i className="ri-map-pin-2-line"></i>
          <span>Position: <strong className="text-[#1E2328]">{position}</strong></span>
        </div>

        {/* Text Lines */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-[#1E2328]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Enter Your Text
            </h4>
            <span className="text-xs text-[#6B7380]">Max {MAX_CHARS_PER_LINE} characters per line</span>
          </div>

          <div className="space-y-3">
            {lines.map((line, index) => (
              <div key={index} className="relative">
                <label className="block text-sm font-medium text-[#6B7380] mb-1">
                  Line {index + 1}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => handleLineChange(index, e.target.value)}
                    placeholder={`Enter text for line ${index + 1}...`}
                    maxLength={MAX_CHARS_PER_LINE}
                    className="w-full px-4 py-3 border border-[#E8ECF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent transition-all text-[#1E2328]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7380]">
                    {line.length}/{MAX_CHARS_PER_LINE}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Font Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#1E2328]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Select Font
          </label>
          <div className="relative">
            <select
              value={selectedFont.id}
              onChange={(e) => setSelectedFont(FONTS.find(f => f.id === e.target.value) || FONTS[0])}
              className="w-full px-4 py-3 border border-[#E8ECF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent appearance-none bg-white text-[#1E2328] cursor-pointer"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {FONTS.map((font) => (
                <option key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                  {font.name}
                </option>
              ))}
            </select>
            <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7380] pointer-events-none"></i>
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#1E2328]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Select Color
          </label>
          <div className="relative">
            <select
              value={selectedColor.id}
              onChange={(e) => setSelectedColor(COLORS.find(c => c.id === e.target.value) || COLORS[0])}
              className="w-full px-4 py-3 border border-[#E8ECF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent appearance-none bg-white text-[#1E2328] cursor-pointer"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {COLORS.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
            <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7380] pointer-events-none"></i>
          </div>
          
          {/* Color swatches */}
          <div className="flex flex-wrap gap-2 mt-2">
            {COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor.id === color.id 
                    ? 'border-[#009688] ring-2 ring-[#009688] ring-offset-2' 
                    : 'border-[#E8ECF2] hover:border-[#009688]'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-[#1E2328]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Preview
          </h4>
          <span className="text-xs text-[#6B7380] italic">Live preview of your text</span>
        </div>

        <div className="bg-gradient-to-br from-[#009688] to-[#00695c] rounded-xl p-6 min-h-[280px] flex items-center justify-center shadow-lg">
          {previewLines.length > 0 ? (
            <div className="text-center space-y-1">
              {previewLines.map((line, index) => (
                <div
                  key={index}
                  className="text-lg md:text-xl lg:text-2xl whitespace-pre-wrap break-words"
                  style={{
                    fontFamily: selectedFont.family,
                    fontWeight: selectedFont.weight,
                    color: selectedColor.hex,
                    textShadow: selectedColor.id === 'white' ? '0 0 2px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-[#6B7380]">
              <i className="ri-text text-4xl mb-2 block opacity-50"></i>
              <p className="text-sm">Your text preview will appear here</p>
            </div>
          )}
        </div>

        {/* Preview info */}
        <div className="bg-[#F8F9FA] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7380]">Font:</span>
            <span className="text-[#1E2328] font-medium">{selectedFont.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7380]">Color:</span>
            <div className="flex items-center space-x-2">
              <span
                className="w-4 h-4 rounded-full border border-[#E8ECF2]"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <span className="text-[#1E2328] font-medium">{selectedColor.name}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7380]">Lines used:</span>
            <span className="text-[#1E2328] font-medium">{previewLines.length}/{MAX_LINES}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

TextCustomization.propTypes = {
  onTextChange: PropTypes.func,
  initialData: PropTypes.shape({
    lines: PropTypes.arrayOf(PropTypes.string),
    font: PropTypes.object,
    color: PropTypes.object,
  }),
  position: PropTypes.string,
};

// Export constants for use in other components
export { FONTS, COLORS, MAX_CHARS_PER_LINE, MAX_LINES };
