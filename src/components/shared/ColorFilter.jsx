import { useState, useCallback } from "react";
import { toast } from "react-toastify";

const ColorFilter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

  // Available colors with their display names and hex values matching the image
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
  const filteredColors = availableColors.filter((color) => color.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Selected colors state
  const [selectedColors, setSelectedColors] = useState([]);

  // Determine which colors to display
  const colorsToShow = searchTerm ? filteredColors : (showAllColors ? availableColors : availableColors.slice(0, 10));

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
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Search Colors */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Search Colors</label>
        <input
          type="text"
          placeholder="Search for colors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Color Swatches Grid */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select Colors</h3>
        <div className="grid grid-cols-5 gap-1">
          {colorsToShow.map((color) => (
            <button
              key={color.name}
              onClick={() => handleColorToggle(color.name)}
              className="flex flex-col items-center gap-1 p-1 rounded hover:bg-gray-50"
            >
              <div
                className={`w-8 h-8 rounded-full border transition-transform duration-200 hover:scale-110 ${
                  color.name.toLowerCase() === "white" ? "border-gray-300" : "border-gray-200"
                } ${selectedColors.includes(color.name) ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-xs text-gray-700">{color.name}</span>
            </button>
          ))}
        </div>

        {/* View More Colors Button - only show when not searching and not showing all */}
        {!searchTerm && !showAllColors && availableColors.length > 10 && (
          <div className="mt-3 text-center">
            <button
              onClick={() => setShowAllColors(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View More Colors ({availableColors.length - 10} more)
            </button>
          </div>
        )}

        {/* Show Less Button - only show when showing all colors */}
        {!searchTerm && showAllColors && (
          <div className="mt-3 text-center">
            <button
              onClick={() => setShowAllColors(false)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Show Less
            </button>
          </div>
        )}

        {colorsToShow.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-3">No colors found matching &ldquo;{searchTerm}&rdquo;</p>
        )}
      </div>

      {/* Apply Button - Using same color as Price Filter */}
      <button
        onClick={handleApplyColorFilter}
        disabled={selectedColors.length === 0 || isApplying}
        className={`w-full py-2 px-4 text-white text-sm font-medium rounded transition-colors duration-200 mb-3 ${
          isApplying ? "bg-gray-400 cursor-not-allowed" : "bg-smallHeader hover:bg-smallHeader-dark"
        }`}
      >
        {isApplying ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1" />
            <span>Applying...</span>
          </>
        ) : (
          <>
            <span>Apply Color Filter</span>
          </>
        )}
      </button>

      {/* Clear All Colors Link */}
      <div className="text-center">
        <button onClick={handleClearAllColors} className="text-blue-600 hover:text-blue-800 text-sm">
          Clear All Colors
        </button>
      </div>
    </div>
  );
};

export default ColorFilter;
