import { useState, useEffect } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import PropTypes from "prop-types";
import { useSearchParams } from "react-router-dom";

const NavigationMenu = ({
  menuItems = [],
  onItemClick,
  onSubItemClick,
  className = "",
  size = "default", // "small", "default", "large"
  variant = "horizontal", // "horizontal", "vertical"
}) => {
  const [activeItem, setActiveItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [clickedItem, setClickedItem] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [expandedSubItem, setExpandedSubItem] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const sizeClasses = {
    small: {
      item: "text-base px-2 py-1",
      submenu: "text-sm px-2 py-1",
      megaMenu: "w-80",
    },
    default: {
      item: "text-sm px-3 py-2",
      submenu: "text-base px-3 py-1",
      megaMenu: "w-[1200px]",
    },
    large: {
      item: "text-lg px-4 py-3",
      submenu: "text-lg px-4 py-2",
      megaMenu: "w-[1200px]",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  // Detect if device is desktop (≥ 1024px)
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  const handleItemClick = (item) => {
    // Always navigate to the main page when clicking the main item
    if (item.onClick) {
      item.onClick();
    } else if (onItemClick) {
      onItemClick(item);
    }
    setHoveredItem(null);
    setActiveItem(null);
  };

  const handleArrowClick = (item, e) => {
    // Prevent the main item click from firing
    e.stopPropagation();

    if (item.hasSubmenu) {
      // Toggle submenu on arrow click
      if (!isDesktop) {
        setClickedItem(clickedItem === item.id ? null : item.id);
        setActiveItem(clickedItem === item.id ? null : item.id);
      } else {
        // On desktop, show submenu on arrow click (same as hover)
        setHoveredItem(hoveredItem === item.id ? null : item.id);
        setActiveItem(hoveredItem === item.id ? null : item.id);
      }
    }
  };

  const handleMouseEnter = (item) => {
    // Only handle hover on desktop
    if (isDesktop && item.hasSubmenu) {
      setHoveredItem(item.id);
      setActiveItem(item.id);
    }
  };

  const handleMouseLeave = () => {
    // Only handle mouse leave on desktop
    if (isDesktop) {
      setHoveredItem(null);
    }
  };

  const renderSubmenu = (item) => {
    if (!item.hasSubmenu || !item.submenu) return null;

    // Determine if submenu should be visible
    const isVisible = isDesktop
      ? hoveredItem === item.id
      : clickedItem === item.id;

    // On mobile, don't render submenu at all if not visible
    if (!isDesktop && !isVisible) return null;

    return (
      <div
        className={`absolute left-0 top-full z-50 transition-all duration-300 ${
          isDesktop ? "hidden xl:block" : "block"
        } ${
          isVisible
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2"
        }`}
      >
        <div className="container mx-auto mt-4">
          <div
            className={`overflow-hidden rounded-xl border border-gray-200 bg-white ${currentSize.megaMenu} shadow-2xl`}
          >
            {item.megaMenu ? (
              <div className="grid grid-cols-[260px_1fr]">
                {/* Sidebar Navigation */}
                <div className="border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white">
                  <nav className="flex flex-col p-3 space-y-1">
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.id}
                        className={cn(
                          "flex items-center justify-between gap-3 px-2 py-2 text-sm font-semibold transition-all duration-200 text-left rounded-lg group",
                          activeItem === subItem.id
                            ? "bg-primary text-white shadow-md scale-[1.02]"
                            : "text-gray-700 hover:bg-blue-50 hover:text-primary"
                        )}
                        onMouseEnter={() => setActiveItem(subItem.id)}
                        onClick={() => handleItemClick(subItem)}
                      >
                        <span className="flex-1 text-left">{subItem.name}</span>
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 transition-all flex-shrink-0",
                            activeItem === subItem.id
                              ? "translate-x-1 text-white"
                              : "text-gray-400 group-hover:text-primary group-hover:translate-x-0.5"
                          )}
                        />
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Content Area */}
                <div className="w-full p-8 bg-white min-h-[400px]">
                  {(() => {
                    const activeSubItem = item.submenu.find(
                      (subItem) => subItem.id === activeItem
                    );

                    if (!activeSubItem)
                      return (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <p className="text-sm">
                            Hover over a category to see items
                          </p>
                        </div>
                      );

                    // Check if this is a promotional item with columns
                    if (activeSubItem.columns) {
                      return (
                        <div>
                          {/* Category Header */}
                          <div className="mb-6 pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-secondary">
                              {activeSubItem.name}
                            </h3>
                          </div>

                          {/* Columns Grid */}
                          <div
                            className={`grid gap-6`}
                            style={{
                              gridTemplateColumns: `repeat(5, 1fr)`,
                            }}
                          >
                            {activeSubItem.columns.map((column, colIndex) => (
                              <div key={colIndex} className="space-y-2">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                                    {column.title}
                                  </h4>
                                </div>
                                <div className="space-y-0.5">
                                  {column.items.map((itemName, itemIndex) => {
                                    const subSubItem =
                                      activeSubItem.subItems.find(
                                        (si) =>
                                          si.name === itemName &&
                                          si.columnTitle === column.title
                                      );

                                    return (
                                      <button
                                        key={itemIndex}
                                        onClick={() =>
                                          subSubItem &&
                                          handleItemClick(subSubItem)
                                        }
                                        className="text-xs text-gray-700 hover:text-primary font-medium text-start px-2 py-1.5 rounded-md hover:bg-blue-50 transition-all duration-200 w-full group flex items-center justify-between"
                                      >
                                        <span className="leading-relaxed">
                                          {itemName}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // Default grid for non-promotional items
                    return (
                      <div>
                        <div className="mb-6 pb-4 border-b border-gray-200">
                          <h3 className="text-lg font-bold text-secondary">
                            {activeSubItem.name}
                          </h3>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {activeSubItem.subItems?.map((subSubItem, index) => (
                            <button
                              key={index}
                              onClick={() => handleItemClick(subSubItem)}
                              className="text-xs text-gray-700 hover:text-primary font-medium text-start px-2 py-1.5 rounded-md hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-200 group flex items-center justify-between"
                            >
                              <span className="leading-relaxed">
                                {subSubItem.name}
                              </span>
                              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              // Regular submenu layout
              <div className="p-8 bg-white">
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-secondary">
                    {item.name}
                  </h3>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {item.submenu.map((subItem, index) => (
                    <button
                      key={index}
                      onClick={() => handleItemClick(subItem)}
                      className="text-xs text-gray-700 hover:text-primary font-medium text-start px-2 py-1.5 rounded-md hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-200 group flex items-center justify-between"
                    >
                      <span className="leading-relaxed">{subItem.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (variant === "vertical") {
    return (
      <nav className={`space-y-2 ${className}`}>
        {menuItems.map((item) => {
          const isSubmenuVisible = clickedItem === item.id;

          return (
            <div key={item.id} className="space-y-1">
              <div
                className={cn(
                  "flex items-center justify-between cursor-pointer rounded-lg p-3 transition-all duration-200 group",
                  isSubmenuVisible
                    ? "bg-blue-50 text-primary"
                    : "hover:bg-gray-100 text-gray-700",
                  currentSize.item
                )}
                onClick={() => {
                  handleItemClick(item);
                  onSubItemClick && onSubItemClick();
                }}
              >
                <span className="capitalize font-semibold group-hover:text-primary transition-colors">
                  {item.name}
                </span>
                {item.hasSubmenu && (
                  <RiArrowDropDownLine
                    className={cn(
                      "text-2xl transition-all duration-300 cursor-pointer",
                      isSubmenuVisible
                        ? "rotate-180 text-primary"
                        : "rotate-0 text-gray-500"
                    )}
                    onClick={(e) => handleArrowClick(item, e)}
                  />
                )}
              </div>

              {item.hasSubmenu && item.submenu && isSubmenuVisible && (
                <div className="ml-4 space-y-1 border-l-2 border-blue-200 pl-4 py-2">
                  {item.submenu.map((subItem) => (
                    <div key={subItem.id} className="space-y-1">
                      <div
                        className={cn(
                          "flex items-center justify-between cursor-pointer rounded-lg p-2.5 transition-all duration-200 group",
                          expandedSubItem === subItem.id
                            ? "bg-blue-50 text-primary"
                            : "hover:bg-gray-50 text-gray-600",
                          currentSize.submenu
                        )}
                        onClick={() => {
                          if (subItem.name && subItem.id) {
                            handleItemClick(subItem);
                            onSubItemClick && onSubItemClick();
                          } else {
                            handleItemClick(subItem);
                            onSubItemClick && onSubItemClick();
                          }
                        }}
                      >
                        <span className="font-medium group-hover:text-primary transition-colors">
                          {subItem.name}
                        </span>

                        {subItem.subItems && subItem.subItems.length > 0 && (
                          <ChevronRight
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedSubItem(
                                expandedSubItem === subItem.id
                                  ? null
                                  : subItem.id
                              );
                            }}
                            className={cn(
                              "w-4 h-4 transition-all duration-200",
                              expandedSubItem === subItem.id
                                ? "rotate-90 text-primary"
                                : "text-gray-400 group-hover:text-primary"
                            )}
                          />
                        )}
                      </div>

                      {subItem.subItems &&
                        subItem.subItems.length > 0 &&
                        expandedSubItem === subItem.id && (
                          <div className="ml-3 mt-1 space-y-1 border-l border-gray-200 pl-3">
                            {subItem.subItems.map((subSubItem, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  "cursor-pointer rounded-lg p-2 transition-all duration-200 group hover:bg-gray-50",
                                  currentSize.submenu
                                )}
                                onClick={() => {
                                  handleItemClick(subSubItem);
                                  onSubItemClick && onSubItemClick();
                                }}
                              >
                                <span className="text-gray-600 text-sm group-hover:text-primary transition-colors">
                                  {subSubItem.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className={`${className}`}>
      <ul className="space-y-3 xl:space-y-0 xl:flex xl:items-center xl:gap-1">
        {menuItems.map((item) => {
          const isSubmenuVisible = isDesktop
            ? hoveredItem === item.id
            : clickedItem === item.id;

          return (
            <li
              key={item.id}
              onMouseLeave={handleMouseLeave}
              className={`cursor-pointer ${
                item.hasSubmenu ? "group relative" : ""
              }`}
            >
              <div>
                <span
                  className={cn(
                    "flex capitalize items-center gap-1 transition-all duration-200 rounded-lg px-3 py-2 text-base font-semibold",
                    item.hasSubmenu
                      ? "text-gray-700 hover:text-primary hover:bg-blue-50"
                      : "text-gray-700 hover:text-primary hover:bg-gray-100",
                    isSubmenuVisible && "text-primary bg-blue-50"
                  )}
                  onMouseEnter={() => {
                    handleMouseEnter(item);
                    if (
                      item.name === "Promotional" ||
                      item.name === "Clothing"
                    ) {
                      setActiveItem(item.submenu[0].id);
                    }
                  }}
                  onClick={() => {
                    if (
                      item.name === "Promotional" ||
                      item.name === "Clothing" ||
                      item.name === "Headwear"
                    ) {
                      return;
                    }
                    handleItemClick(item);
                  }}
                >
                  <span className="relative">
                    {item.name}
                    {(isSubmenuVisible && item.hasSubmenu) || searchParams.get("type") == item.name && (
                      <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
                    )}
                  </span>
                  {item.hasSubmenu && (
                    <RiArrowDropDownLine
                      className={cn(
                        "text-xl transition-all duration-300 cursor-pointer",
                        isSubmenuVisible ? "rotate-180" : "rotate-0"
                      )}
                      onClick={(e) => handleArrowClick(item, e)}
                    />
                  )}
                </span>
                {renderSubmenu(item)}
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

NavigationMenu.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      path: PropTypes.string,
      hasSubmenu: PropTypes.bool,
      submenu: PropTypes.array,
      megaMenu: PropTypes.bool,
      onClick: PropTypes.func,
    })
  ).isRequired,
  onItemClick: PropTypes.func,
  className: PropTypes.string,
  size: PropTypes.oneOf(["small", "default", "large"]),
  variant: PropTypes.oneOf(["horizontal", "vertical"]),
};

export default NavigationMenu;
