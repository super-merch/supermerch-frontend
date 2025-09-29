import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "react-toastify";

const ColorFilter = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  
  // Color swatch component
  const ColorSwatch = ({ color, name, onClick, isSelected = false }) => (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
        isSelected 
          ? "bg-blue-100 shadow-sm border border-blue-200" 
          : "hover:bg-gray-50"
      }`}
      title={name}
    >
      <div
        className={`w-8 h-8 rounded-full border-2 shadow-sm transition-transform duration-200 group-hover:scale-110 ${
          color.toLowerCase() === "white" ? "border-gray-300" : "border-white"
        }`}
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-600 font-medium">{name}</span>
    </button>
  );

  // Available colors with their display names and hex values
  const availableColors = [
    { name: "Red", hex: "#ef4444" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Green", hex: "#10b981" },
    { name: "Yellow", hex: "#f59e0b" },
    { name: "Orange", hex: "#f97316" },
    { name: "Purple", hex: "#8b5cf6" },
    { name: "Pink", hex: "#ec4899" },
    { name: "Black", hex: "#1f2937" },
    { name: "White", hex: "#ffffff" },
    { name: "Gray", hex: "#6b7280" },
    { name: "Brown", hex: "#92400e" },
    { name: "Cyan", hex: "#06b6d4" },
    { name: "Lime", hex: "#84cc16" },
    { name: "Teal", hex: "#14b8a6" },
    { name: "Indigo", hex: "#6366f1" },
    { name: "Magenta", hex: "#d946ef" },
  ];

  // Filter colors based on search term
  const filteredColors = availableColors.filter(color =>
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // For now, we'll simulate selected colors state (you can integrate with Redux later)
  const [selectedColors, setSelectedColors] = useState([]);

  const handleColorToggle = useCallback((colorName) => {
    setSelectedColors(prev => {
      if (prev.includes(colorName)) {
        return prev.filter(name => name !== colorName);
      } else {
        return [...prev, colorName];
      }
    });
  }, []);

  const handleApplyColorFilter = useCallback(() => {
    if (selectedColors.length === 0) {
      toast.info("Please select at least one color to filter");
      return;
    }
    
    setIsApplying(true);
    
    // Simulate API call or filter application
    setTimeout(() => {
      toast.success(`Applied filter for colors: ${selectedColors.join(", ")}`);
      setIsApplying(false);
    }, 1000);
  }, [selectedColors]);

  const handleClearAllColors = useCallback(() => {
    setSelectedColors([]);
    setSearchTerm("");
    toast.info("All color filters cleared");
  }, []);

  return (
    <div className="pb-6 border-b border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800 tracking-wide">
          Filter by Color
        </h2>
      </div>

      {/* Search Colors */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search for colors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
        />
      </div>

      {/* Color Swatches Grid */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-gray-600 mb-3">Select Colors</h3>
        <div className="grid grid-cols-4 gap-2">
          {filteredColors.map((color) => (
            <ColorSwatch
              key={color.name}
              color={color.hex}
              name={color.name}
              isSelected={selectedColors.includes(color.name)}
              onClick={() => handleColorToggle(color.name)}
            />
          ))}
        </div>
        
        {filteredColors.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4">
            No colors found matching "<span className="font-medium">{searchTerm}</span>"
          </p>
        )}
      </div>

      {/* Selected Colors Info */}
      {selectedColors.length > 0 && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>{selectedColors.length}</strong> color{selectedColors.length > 1 ? "s" : ""} selected:{" "}
            <span className="font-medium">{selectedColors.join(", ")}</span>
          </p>
        </div>
      )}

      {/* Apply Button */}
      <button
        onClick={handleApplyColorFilter}
        disabled={selectedColors.length === 0 || isApplying}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors duration-200"
      >
        {isApplying ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Applying...</span>
          </>
        ) : (
          <>
            <span>Apply Color Filter</span>
            <FaChevronDown size={10} />
          </>
        )}
      </button>

      {/* Clear All Colors Link */}
      <div className="mt-3 text-center">
        <button
          onClick={handleClearAllColors}
          className="text-blue-600 hover:text-blue-800 text-xs font-medium underline transition-colors duration-200"
        >
          Clear All Colors
        </button>
      </div>
    </div>
  );
};

export default ColorFilter;
