import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

const NavigationMenu = ({
  menuItems = [],
  onItemClick,
  className = "",
  size = "default", // "small", "default", "large"
  variant = "horizontal", // "horizontal", "vertical"
}) => {
  const [activeItem, setActiveItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [focusedItem, setFocusedItem] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const timeoutRef = useRef(null);
  const menuRef = useRef(null);

  const sizeClasses = {
    small: {
      item: "text-sm px-3 py-2",
      submenu: "text-xs px-3 py-2",
      megaMenu: "w-80",
      spacing: "space-x-1",
    },
    default: {
      item: "text-base px-4 py-3",
      submenu: "text-sm px-4 py-3",
      megaMenu: "w-[800px]",
      spacing: "space-x-2",
    },
    large: {
      item: "text-lg px-5 py-4",
      submenu: "text-base px-5 py-3",
      megaMenu: "w-[1000px]",
      spacing: "space-x-3",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle clicks outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setHoveredItem(null);
        setActiveItem(null);
        setFocusedItem(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = useCallback(
    (item) => {
      if (item.onClick) {
        item.onClick();
      } else if (onItemClick) {
        onItemClick(item);
      }

      // Close mobile menu after click
      if (variant === "vertical" || isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    },
    [onItemClick, variant, isMobileMenuOpen]
  );

  const handleMouseEnter = useCallback((item) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (item.hasSubmenu) {
      setHoveredItem(item.id);
      setActiveItem(item.id);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setActiveItem(null);
    }, 150);
  }, []);

  const handleKeyDown = useCallback(
    (event, item) => {
      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          handleItemClick(item);
          break;
        case "ArrowRight":
          if (variant === "horizontal") {
            event.preventDefault();
            const currentIndex = menuItems.findIndex(
              (menuItem) => menuItem.id === item.id
            );
            const nextIndex = (currentIndex + 1) % menuItems.length;
            setFocusedItem(menuItems[nextIndex].id);
          }
          break;
        case "ArrowLeft":
          if (variant === "horizontal") {
            event.preventDefault();
            const currentIndex = menuItems.findIndex(
              (menuItem) => menuItem.id === item.id
            );
            const prevIndex =
              currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
            setFocusedItem(menuItems[prevIndex].id);
          }
          break;
        case "ArrowDown":
          if (variant === "vertical") {
            event.preventDefault();
            const currentIndex = menuItems.findIndex(
              (menuItem) => menuItem.id === item.id
            );
            const nextIndex = (currentIndex + 1) % menuItems.length;
            setFocusedItem(menuItems[nextIndex].id);
          } else if (item.hasSubmenu) {
            event.preventDefault();
            setActiveItem(item.id);
          }
          break;
        case "ArrowUp":
          if (variant === "vertical") {
            event.preventDefault();
            const currentIndex = menuItems.findIndex(
              (menuItem) => menuItem.id === item.id
            );
            const prevIndex =
              currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
            setFocusedItem(menuItems[prevIndex].id);
          }
          break;
        case "Escape":
          setActiveItem(null);
          setHoveredItem(null);
          setFocusedItem(null);
          break;
        default:
          break;
      }
    },
    [menuItems, variant, handleItemClick]
  );

  const renderSubmenu = useCallback(
    (item) => {
      if (!item.hasSubmenu || !item.submenu) return null;

      const isVisible = hoveredItem === item.id || activeItem === item.id;

      return (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-2 transition-all duration-300 ease-in-out",
            "transform origin-top",
            isVisible
              ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-y-95 translate-y-2 pointer-events-none",
            variant === "horizontal" ? "max-sm:hidden" : "sm:hidden"
          )}
          role="menu"
          aria-label={`${item.name} submenu`}
        >
          <div className="container mx-auto">
            <div
              className={cn(
                "overflow-hidden rounded-xl bg-white",
                "ring-1 ring-black/10 shadow-xl",
                currentSize.megaMenu
              )}
            >
              {item.megaMenu ? (
                // Enhanced mega menu layout
                <div className="grid grid-cols-[280px_1fr] min-h-[400px]">
                  <div className="border-r border-gray-200/20 bg-gray-50/50">
                    <nav className="flex flex-col py-4" role="menubar">
                      {item.submenu.map((subItem, index) => (
                        <button
                          key={subItem.id}
                          className={cn(
                            "flex items-center justify-between gap-3 px-6 py-3 text-sm font-medium transition-all duration-200",
                            "hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 focus:outline-none",
                            activeItem === subItem.id
                              ? "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
                              : "text-gray-700"
                          )}
                          onMouseEnter={() => setActiveItem(subItem.id)}
                          onClick={() => handleItemClick(subItem)}
                          onKeyDown={(e) => handleKeyDown(e, subItem)}
                          role="menuitem"
                          tabIndex={-1}
                        >
                          <span className="truncate">{subItem.name}</span>
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        </button>
                      ))}
                    </nav>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.submenu
                        .find((subItem) => subItem.id === activeItem)
                        ?.subItems?.map((subSubItem, index) => (
                          <button
                            key={index}
                            onClick={() => handleItemClick(subSubItem)}
                            onKeyDown={(e) => handleKeyDown(e, subSubItem)}
                            className={cn(
                              "text-left p-3 rounded-lg transition-all duration-200",
                              "hover:bg-gray-100 hover:shadow-sm focus:bg-gray-100 focus:shadow-sm focus:outline-none",
                              "text-sm font-medium text-gray-700 hover:text-gray-900"
                            )}
                            role="menuitem"
                            tabIndex={-1}
                          >
                            {subSubItem.name}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Enhanced regular submenu layout
                <div className="p-6">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {item.submenu.map((subItem, index) => (
                      <button
                        key={index}
                        onClick={() => handleItemClick(subItem)}
                        onKeyDown={(e) => handleKeyDown(e, subItem)}
                        className={cn(
                          "text-left p-4 rounded-lg transition-all duration-200",
                          "hover:bg-gray-100 hover:shadow-sm focus:bg-gray-100 focus:shadow-sm focus:outline-none",
                          "text-sm font-medium text-gray-700 hover:text-gray-900",
                          "border border-transparent hover:border-gray-200"
                        )}
                        role="menuitem"
                        tabIndex={-1}
                      >
                        {subItem.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    },
    [
      hoveredItem,
      activeItem,
      currentSize.megaMenu,
      variant,
      handleItemClick,
      handleKeyDown,
    ]
  );

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (variant === "vertical") {
    return (
      <nav
        ref={menuRef}
        className={cn("space-y-1", className)}
        role="navigation"
        aria-label="Main navigation"
      >
        {menuItems.map((item) => (
          <div key={item.id} className="space-y-1">
            <button
              className={cn(
                "flex items-center justify-between w-full text-left transition-all duration-200",
                "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
                "rounded-lg",
                currentSize.item,
                focusedItem === item.id
                  ? "bg-gray-100 ring-2 ring-blue-500"
                  : "",
                "text-gray-700 hover:text-gray-900"
              )}
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => handleKeyDown(e, item)}
              onFocus={() => setFocusedItem(item.id)}
              onBlur={() => setFocusedItem(null)}
              role="menuitem"
              tabIndex={0}
              aria-expanded={item.hasSubmenu && activeItem === item.id}
              aria-haspopup={item.hasSubmenu ? "menu" : undefined}
            >
              <span className="capitalize font-medium">{item.name}</span>
              {item.hasSubmenu && (
                <ChevronDown
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    activeItem === item.id ? "rotate-180" : ""
                  )}
                />
              )}
            </button>
            {item.hasSubmenu && item.submenu && (
              <div
                className={cn(
                  "ml-4 space-y-1 transition-all duration-300 ease-in-out",
                  "transform origin-top",
                  activeItem === item.id
                    ? "opacity-100 max-h-96"
                    : "opacity-0 max-h-0 overflow-hidden"
                )}
                role="menu"
                aria-label={`${item.name} submenu`}
              >
                {item.submenu.map((subItem) => (
                  <button
                    key={subItem.id}
                    className={cn(
                      "w-full text-left transition-all duration-200",
                      "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
                      "rounded-md text-gray-600 hover:text-gray-800",
                      currentSize.submenu
                    )}
                    onClick={() => handleItemClick(subItem)}
                    onKeyDown={(e) => handleKeyDown(e, subItem)}
                    role="menuitem"
                    tabIndex={-1}
                  >
                    {subItem.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav
      ref={menuRef}
      className={cn(className)}
      role="navigation"
      aria-label="Main navigation"
    >
      <ul className={cn("flex items-center", currentSize.spacing)}>
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={cn("relative", item.hasSubmenu ? "group" : "")}
            onMouseEnter={() => handleMouseEnter(item)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={cn(
                "flex items-center gap-2 transition-all duration-200",
                "hover:text-blue-600 focus:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "font-medium capitalize",
                currentSize.item,
                focusedItem === item.id
                  ? "text-blue-600 ring-2 ring-blue-500 ring-offset-2"
                  : "",
                "text-gray-800 hover:text-blue-600"
              )}
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => handleKeyDown(e, item)}
              onFocus={() => setFocusedItem(item.id)}
              onBlur={() => setFocusedItem(null)}
              role="menuitem"
              tabIndex={0}
              aria-expanded={
                item.hasSubmenu &&
                (hoveredItem === item.id || activeItem === item.id)
              }
              aria-haspopup={item.hasSubmenu ? "menu" : undefined}
            >
              <span>{item.name}</span>
              {item.hasSubmenu && (
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    hoveredItem === item.id || activeItem === item.id
                      ? "rotate-180"
                      : ""
                  )}
                />
              )}
            </button>
            {renderSubmenu(item)}
          </li>
        ))}
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

NavigationMenu.defaultProps = {
  menuItems: [],
  onItemClick: null,
  className: "",
  size: "default",
  variant: "horizontal",
};

export default NavigationMenu;
