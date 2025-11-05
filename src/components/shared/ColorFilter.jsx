import { AppContext } from "@/context/AppContext";
import { useState, useCallback, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const ColorFilter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllColors, setShowAllColors] = useState(false);
  const { setPaginationData } = useContext(AppContext);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("category");
  const search = params.get("search");
  useEffect(() => {
    setSelectedColors([]);
  }, [location.pathname, category, search]);

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
    { name: "Grey", hex: "#6b7280" },
    { name: "Brown", hex: "#92400e" },
    { name: "Cyan", hex: "#06b6d4" },
  ];

  // Filter colors based on search term
  const filteredColors = availableColors.filter((color) =>
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selected colors state
  const [selectedColors, setSelectedColors] = useState([]);

  // Determine which colors to display
  const colorsToShow = searchTerm
    ? filteredColors
    : showAllColors
    ? availableColors
    : availableColors.slice(0, 10);

  const handleColorToggle = useCallback((colorName) => {
    setSelectedColors((prev) => {
      let newColors;
      if (prev.includes(colorName)) {
        newColors = prev.filter((name) => name !== colorName);
        setPaginationData((prev) => ({ ...prev, page: 1, colors: newColors }));
      } else {
        newColors = [...prev, colorName];
        setPaginationData((prev) => ({ ...prev, page: 1, colors: newColors }));
      }
      return newColors;
    });
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg py-4 px-2">
      {/* Search Colors */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Colors
        </label>
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
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Select Colors
        </h3>
        <div className="grid grid-cols-5 gap-1">
          {colorsToShow.map((color) => (
            <button
              key={color.name}
              onClick={() => handleColorToggle(color.name)}
              className="flex flex-col items-center gap-1 p-1 rounded hover:bg-gray-50"
            >
              <div
                className={`w-8 h-8 rounded-full border transition-transform duration-200 hover:scale-110 ${
                  color.name.toLowerCase() === "white"
                    ? "border-gray-300"
                    : "border-gray-200"
                } ${
                  selectedColors.includes(color.name)
                    ? "ring-2 ring-blue-500 ring-offset-1"
                    : ""
                }`}
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
              className="text-primary hover:text-blue-800 text-sm font-medium"
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
              className="text-primary hover:text-blue-800 text-sm font-medium"
            >
              Show Less
            </button>
          </div>
        )}

        {colorsToShow.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-3">
            No colors found matching &ldquo;{searchTerm}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
};

export default ColorFilter;
