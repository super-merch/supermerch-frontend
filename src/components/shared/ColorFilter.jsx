import { useState, useCallback } from "react";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "react-toastify";

const ColorFilter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
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
  ];

  // Filter colors based on search term
  const filteredColors = availableColors.filter((color) => 
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selected colors state
  const [selectedColors, setSelectedColors] = useState([]);

  const handleColorToggle = useCallback((colorName) => {
    setSelectedColors((prev) => {
      if (prev.includes(colorName)) {
        return prev.filter((name) => name !== colorName);
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
    <div className="mb-4">
      {/* Header Section */}
      <div 
        className="flex items-center justify-between py-2 px-3 bg-gray-200 cursor-pointer rounded-t-md"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-sm font-bold text-gray-800">Filter by Color</h2>
        <div className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
          <FaChevronDown size={12} className="text-gray-600" />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-white border-x border-b border-gray-300 rounded-b-md p-3">
          {/* Search Colors */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Search Colors</label>
            <input
              type="text"
              placeholder="Search for colors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray K-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Color Swatches Grid */}
          <div className="mb-3">
            <h3 className="text-xs font-medium text-gray-700 mb-2">Select Colors</h3>
            <div className="grid grid-cols-4 gap-1">
              {filteredColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorToggle(color.name)}
                  className={`flex flex-col items-center gap-1 p-1 rounded ${
                    selectedColors.includes(color.name) ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  title={color.name}
                >
                  <div
                    className={`w-8 h-8 rounded-full border transition-transform duration-200 hover:scale-110 ${
                      color.name.toLowerCase() === "white" ? "border-gray-300" : "border-gray-200"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-xs text-gray-600">{color.name}</span>
                </button>
              ))}
            </div>
            
            {filteredColors.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-2">
              No colors found matching &ldquo;{searchTerm}&rdquo;
            </p>
            )}
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApplyColorFilter}
            disabled={selectedColors.length === 0 || isApplying}
            className="w-full flex items-center justify-center gap-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors duration-200 mb-2"
          >
            {isApplying ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Applying...</span>
              </>
            ) : (
              <>
                <span>Apply Color Filter</span>
                <FaChevronDown size={8} />
              </>
            )}
          </button>

          {/* Clear All Colors Link */}
          <div className="text-center">
            <button
              onClick={handleClearAllColors}
              className="text-blue-600 hover:text-blue-800 text-xs underline"
            >
              Clear All Colors
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorFilter;
