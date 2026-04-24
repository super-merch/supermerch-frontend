import { ProductsContext } from "@/context/ProductsContext";
import { CheckCheck, Search } from "lucide-react";
import { useState, useCallback, useContext, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const ColorFilter = ({ toggleSidebar }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllColors, setShowAllColors] = useState(false);
  const { setPaginationData } = useContext(ProductsContext);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  useEffect(() => {
    const urlColors = searchParams.get("colors");
    if (urlColors) {
      setSelectedColors(urlColors.split(',').filter(Boolean));
    } else {
      setSelectedColors([]);
    }
  }, [location.pathname, category, search,searchParams]);

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
      } else {
        newColors = [...prev, colorName];
      }
      setSearchParams((currentParams) => {
        const newParams = new URLSearchParams(currentParams);
        
        if (newColors.length > 0) {
          newParams.set("colors", newColors.join(','));
        } else {
          newParams.delete("colors");
        }
        
        newParams.set("page", "1");
        return newParams;
      });

      setPaginationData((prev) => ({
        ...prev,
        page: 1,
        colors: newColors,
        sendAttributes: false,
      }));
      
      if (window.innerWidth <= 1025) toggleSidebar();
      
      return newColors;
    });
  }, [setPaginationData, toggleSidebar, setSearchParams]);

  return (
    <div className="py-2">
      {/* Search Colors */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
          Search Colors
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search colors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 text-sm border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]/30 focus:border-[#009688] transition-all bg-white"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7380] w-4 h-4" />
        </div>
      </div>

      {/* Color List - Workwear Style */}
      <div className="max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {filteredColors.length > 0 ? (
          <div className="space-y-1">
            {filteredColors.map((color) => {
              const isSelected = selectedColors.includes(color.name);
              return (
                <label
                  key={color.name}
                  className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg transition-colors hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleColorToggle(color.name)}
                    className="w-4 h-4 border-gray-300 rounded focus:ring-[#009688] focus:ring-2 cursor-pointer text-[#009688]"
                  />
                  
                  {/* Color Circle */}
                  <div className="w-5 h-5 rounded-full border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: color.hex }}
                  />

                  <span className={`transition-colors flex-1 text-sm font-medium ${
                    isSelected ? "text-[#009688]" : "text-[#1E2328] group-hover:text-[#009688]"
                  }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                    {color.name}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            No colors found matching &ldquo;{searchTerm}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
};

export default ColorFilter;
