import { useState, useEffect } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { ChevronRight } from "lucide-react";
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
  const [clickedItem, setClickedItem] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const sizeClasses = {
    small: {
      item: "text-base px-2 py-1",
      submenu: "text-sm px-2 py-1",
      megaMenu: "w-80",
    },
    default: {
      item: "text-lg px-3 py-2",
      submenu: "text-base px-3 py-1",
      megaMenu: "w-[900px]",
    },
    large: {
      item: "text-xl px-4 py-3",
      submenu: "text-lg px-4 py-2",
      megaMenu: "w-[1000px]",
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
    if (item.hasSubmenu) {
      // On mobile/tablet, toggle submenu on click
      if (!isDesktop) {
        setClickedItem(clickedItem === item.id ? null : item.id);
        setActiveItem(clickedItem === item.id ? null : item.id);
      }
    } else {
      // Navigate to page if no submenu
      if (item.onClick) {
        item.onClick();
      } else if (onItemClick) {
        onItemClick(item);
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
    const isVisible = isDesktop ? hoveredItem === item.id : clickedItem === item.id;

    // On mobile, don't render submenu at all if not visible
    if (!isDesktop && !isVisible) return null;

    return (
      <div
        className={`absolute left-0 top-full z-50 shadow-md backdrop-blur-sm transition-all duration-500 ${
          isDesktop ? "hidden xl:block" : "block"
        } ${isVisible ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <div className="container mx-auto">
          <div className={`overflow-hidden rounded-lg border bg-[#333333] ${currentSize.megaMenu} shadow-lg`}>
            {item.megaMenu ? (
              // Mega menu layout
              <div className="grid grid-cols-[1fr_3fr]">
                <div className="border-r backdrop-blur-sm">
                  <nav className="flex flex-col py-2">
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.id}
                        className={cn(
                          "flex items-center justify-between gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted",
                          activeItem === subItem.id ? "bg-muted font-medium text-primary" : "text-white"
                        )}
                        onMouseEnter={() => setActiveItem(subItem.id)}
                        onClick={() => handleItemClick(subItem)}
                      >
                        {subItem.name}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ))}
                  </nav>
                </div>
                <div className="w-full p-5">
                  <div className="grid grid-cols-3 gap-4">
                    {item.submenu
                      .find((subItem) => subItem.id === activeItem)
                      ?.subItems?.map((subSubItem, index) => (
                        <button
                          key={index}
                          onClick={() => handleItemClick(subSubItem)}
                          className="font-semibold hover:underline text-[13px] block text-start text-white p-2 hover:bg-gray-700 rounded"
                        >
                          {subSubItem.name}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              // Regular submenu layout
              <div className="p-5">
                <h3 className="text-lg font-semibold text-blue-500 mb-4">{item.name}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {item.submenu.map((subItem, index) => (
                    <button
                      key={index}
                      onClick={() => handleItemClick(subItem)}
                      className="font-semibold hover:underline text-[13px] block text-start text-white p-2 hover:bg-gray-700 rounded"
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
  };

  if (variant === "vertical") {
    return (
      <nav className={`space-y-2 ${className}`}>
        {menuItems.map((item) => {
          const isSubmenuVisible = clickedItem === item.id;

          return (
            <div key={item.id} className="space-y-1">
              <div
                className={`flex items-center justify-between ${currentSize.item} cursor-pointer hover:bg-gray-100 rounded-lg p-3 transition-colors`}
                onClick={() => handleItemClick(item)}
              >
                <span className="text-customBlue capitalize font-medium">{item.name}</span>
                {item.hasSubmenu && (
                  <RiArrowDropDownLine
                    className={`text-xl transition-all duration-300 text-gray-500 ${isSubmenuVisible ? "rotate-180" : "rotate-0"}`}
                  />
                )}
              </div>
              {item.hasSubmenu && item.submenu && isSubmenuVisible && (
                <div className="ml-4 space-y-1 border-l-2 border-gray-100 pl-4">
                  {item.submenu.map((subItem) => (
                    <div
                      key={subItem.id}
                      className={`${currentSize.submenu} cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors`}
                      onClick={() => handleItemClick(subItem)}
                    >
                      <span className="text-gray-700">{subItem.name}</span>
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
      <ul className="space-y-3 xl:space-y-0 xl:flex xl:space-x-2">
        {menuItems.map((item) => {
          const isSubmenuVisible = isDesktop ? hoveredItem === item.id : clickedItem === item.id;

          return (
            <li key={item.id} onMouseLeave={handleMouseLeave} className={`cursor-pointer ${item.hasSubmenu ? "group relative" : ""}`}>
              <div className="text-customBlue">
                <span
                  className={`flex capitalize items-center hover:text-blue-400 hover:drop-shadow-lg hover:underline hover:shadow-blue-400/50 transition-all duration-300 ${currentSize.item}`}
                  onMouseEnter={() => handleMouseEnter(item)}
                  onClick={() => handleItemClick(item)}
                >
                  {item.name}
                  {item.hasSubmenu && (
                    <RiArrowDropDownLine
                      className={`text-2xl transition-all duration-300 ${
                        isDesktop ? `-rotate-90 ${isSubmenuVisible ? "rotate-0" : ""}` : `${isSubmenuVisible ? "rotate-180" : "rotate-0"}`
                      }`}
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
