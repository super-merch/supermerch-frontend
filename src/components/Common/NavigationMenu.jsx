import { useState, useEffect } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

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
        } ${isVisible ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <div className="container mx-auto mt-2">
          <div
            className={`overflow-hidden rounded-2xl border border-secondary/10 bg-white ${currentSize.megaMenu} shadow-2xl`}
          >
            {item.megaMenu ? (
              <div className="grid grid-cols-[1fr_3fr]">
                <div className="border-r border-secondary/10 bg-secondary/5">
                  <nav className="flex flex-col py-3">
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.id}
                        className={cn(
                          "flex items-center justify-between gap-2 px-5 py-3 text-sm font-medium transition-all duration-200",
                          activeItem === subItem.id
                            ? "bg-primary text-white shadow-sm"
                            : "text-secondary hover:bg-primary/10 hover:text-primary"
                        )}
                        onMouseEnter={() => setActiveItem(subItem.id)}
                        onClick={() => handleItemClick(subItem)}
                      >
                        {subItem.name}
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 transition-transform",
                            activeItem === subItem.id && "translate-x-1"
                          )}
                        />
                      </button>
                    ))}
                  </nav>
                </div>
                <div className="w-full p-6 bg-white">
                  <div className="grid grid-cols-3 gap-3">
                    {item.submenu
                      .find((subItem) => subItem.id === activeItem)
                      ?.subItems?.map((subSubItem, index) => (
                        <button
                          key={index}
                          onClick={() => handleItemClick(subSubItem)}
                          className="text-sm text-secondary font-medium text-start p-3 rounded-lg hover:bg-primary/5 hover:text-primary transition-all duration-200 border border-transparent hover:border-primary/20"
                        >
                          {subSubItem.name}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              // Regular submenu layout
              <div className="p-6 bg-white">
                <h3 className="text-lg font-semibold text-secondary mb-4 pb-2 border-b border-secondary/10">
                  {item.name}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {item.submenu.map((subItem, index) => (
                    <button
                      key={index}
                      onClick={() => handleItemClick(subItem)}
                      className="text-sm text-secondary font-medium text-start p-3 rounded-lg hover:bg-primary/5 hover:text-primary transition-all duration-200 border border-transparent hover:border-primary/20"
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
      <nav className={`space-y-1 ${className}`}>
        {menuItems.map((item) => {
          const isSubmenuVisible = clickedItem === item.id;

          return (
            <div key={item.id} className="space-y-1">
              <div
                className={`flex items-center justify-between ${currentSize.item} cursor-pointer hover:bg-primary/5 rounded-lg p-3 transition-all duration-200 group`}
                onClick={() => {
                  handleItemClick(item);
                  onSubItemClick && onSubItemClick();
                }}
              >
                <span className="text-secondary capitalize font-semibold group-hover:text-primary transition-colors">
                  {item.name}
                </span>
                {item.hasSubmenu && (
                  <RiArrowDropDownLine
                    className={`text-2xl transition-all duration-300 text-secondary group-hover:text-primary cursor-pointer ${
                      isSubmenuVisible ? "rotate-180" : "rotate-0"
                    }`}
                    onClick={(e) => handleArrowClick(item, e)}
                  />
                )}
              </div>

              {item.hasSubmenu && item.submenu && isSubmenuVisible && (
                <div className="ml-3 space-y-1 border-l-2 border-primary/20 pl-3">
                  {item.submenu.map((subItem) => (
                    <div key={subItem.id} className="space-y-1">
                      <div
                        className={`${currentSize.submenu} flex items-center justify-between cursor-pointer hover:bg-primary/5 rounded-lg p-2.5 transition-all duration-200 group`}
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
                        <span className="text-secondary/80 font-medium group-hover:text-primary transition-colors">
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
                            className={`w-4 h-4 text-secondary/60 group-hover:text-primary transition-all duration-200 ${
                              expandedSubItem === subItem.id ? "rotate-90" : ""
                            }`}
                          />
                        )}
                      </div>

                      {subItem.subItems &&
                        subItem.subItems.length > 0 &&
                        expandedSubItem === subItem.id && (
                          <div className="ml-3 mt-1 space-y-1">
                            {subItem.subItems.map((subSubItem, idx) => (
                              <div
                                key={idx}
                                className={`${currentSize.submenu} cursor-pointer hover:bg-primary/5 rounded-lg p-2 transition-all duration-200 group`}
                                onClick={() => {
                                  handleItemClick(subSubItem);
                                  onSubItemClick && onSubItemClick();
                                }}
                              >
                                <span className="text-secondary/70 text-sm group-hover:text-primary transition-colors">
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
      <ul className="space-y-3 xl:space-y-0 xl:flex xl:space-x-1">
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
                  className={`flex capitalize items-center text-secondary hover:text-primary transition-all duration-200 rounded-lg px-3 py-2 hover:bg-primary/5 ${currentSize.item}`}
                  onMouseEnter={() => {
                    handleMouseEnter(item);
                    if (item.name === "Promotional") {
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
                  {item.name}
                  {item.hasSubmenu && (
                    <RiArrowDropDownLine
                      className={`text-2xl transition-all duration-300 cursor-pointer ${
                        isDesktop
                          ? `-rotate-90 ${isSubmenuVisible ? "rotate-0" : ""}`
                          : `${isSubmenuVisible ? "rotate-180" : "rotate-0"}`
                      }`}
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
