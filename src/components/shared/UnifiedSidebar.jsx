import {
  X,
  Filter,
  User,
  Tag,
  Ruler,
  Palette,
  Box,
  CircleDollarSign,
} from "lucide-react";
import PropTypes from "prop-types";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  FaCaretDown,
  FaGamepad,
  FaHeadset,
  FaHeart,
  FaHome,
  FaPen,
  FaPrint,
  FaShoppingBag,
  FaTools,
  FaTshirt,
  FaUsb,
  FaUserTie,
  FaUtensils,
} from "react-icons/fa";
import {
  GiClothes,
  GiConverseShoe,
  GiMonclerJacket,
  GiWrappedSweet,
} from "react-icons/gi";
import { HiMiniBuildingOffice } from "react-icons/hi2";
import { IoGolfSharp } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ProductsContext } from "../../context/ProductsContext";
// import {
//   getSidebarConfig,
//   getCategoriesForConfig,
// } from "../../config/sidebarConfig";
import { BiDrink } from "react-icons/bi";
import { CiGlass } from "react-icons/ci";
import { FaChildDress } from "react-icons/fa6";
import { MdOutlinePhoneIphone, MdSportsGymnastics } from "react-icons/md";
import { PiBaseballCapFill, PiPantsFill } from "react-icons/pi";
import {
  setMaxPrice,
  setMinPrice,
  setSelectedCategory,
  setMoq,
} from "../../redux/slices/filterSlice";
import PriceFilter from "../shop/PriceFilter";
import AttributeFilters from "./AttributeFilters";
import ClothingGenderToggle from "./ClothingGenderToggle";
import CollapsibleSection from "./CollapsibleSection";
import ColorFilter from "./ColorFilter";
import MOQFilter from "./MOQFilter";



const UnifiedSidebar = ({
  pageType = "GENERAL",
  customConfig = null,
  isSearchPage = false,
  categoryType,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCategory } = useSelector((state) => state.filters);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    setPaginationData,
  } = useContext(ProductsContext);



  const getAppliedFilters = (searchParams) => {
    const filters = [];

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      let label = "";
      if (minPrice && maxPrice) {
        label = `$${minPrice} - $${maxPrice}`;
      } else if (minPrice) {
        label = `Above $${minPrice}`;
      } else {
        label = `Below $${maxPrice}`;
      }
      filters.push({
        type: "price",
        label: label,
        params: ["minPrice", "maxPrice"],
      });
    }

    const colors = searchParams.get("colors");
    if (colors) {
      colors.split(",").forEach((color) => {
        filters.push({
          type: "color",
          label: color,
          value: color,
          params: ["colors"],
        });
      });
    }

    const moq = searchParams.get("moq");
    if (moq) {
      filters.push({
        type: "moq",
        label: `MOQ: ${moq} or less`,
        value: moq,
        params: ["moq"],
      });
    }

    const attrNames = searchParams.getAll("attrName");
    const attrValues = searchParams.getAll("attrValue");
    if (attrNames.length > 0 && attrValues.length > 0) {
      attrNames.forEach((name, idx) => {
        const rawValues = attrValues[idx] || "";
        const values = rawValues
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        values.forEach((value) => {
          filters.push({
            type: "attribute",
            name,
            value,
            label: `${name}: ${value}`,
            params: ["attrName", "attrValue"],
          });
        });
      });
    }

    return filters;
  };

  const appliedFilters = useMemo(
    () => getAppliedFilters(new URLSearchParams(location.search)),
    [location.search]
  );

  const handleRemoveFilter = (filter) => {
    const newParams = new URLSearchParams(location.search);

    if (filter.type === "color") {
      const currentColors = newParams.get("colors")?.split(",") || [];
      const updatedColors = currentColors.filter((c) => c !== filter.value);

      if (updatedColors.length > 0) {
        newParams.set("colors", updatedColors.join(","));
      } else {
        newParams.delete("colors");
      }

      // Update state immediately
      setPaginationData((prev) => ({
        ...prev,
        colors: updatedColors,
        page: 1,
      }));
    } else if (filter.type === "price") {
      newParams.delete("minPrice");
      newParams.delete("maxPrice");

      // Update Redux state immediately
      dispatch(setMinPrice(0));
      dispatch(setMaxPrice(1000000));

      // Update pagination state
      setPaginationData((prev) => ({
        ...prev,
        pricerange: undefined,
        page: 1,
      }));
    } else if (filter.type === "attribute") {
      const attrNames = newParams.getAll("attrName");
      const attrValues = newParams.getAll("attrValue");
      const grouped = new Map();

      attrNames.forEach((name, idx) => {
        const rawValues = attrValues[idx] || "";
        const values = rawValues
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        if (values.length === 0) return;
        const existing = grouped.get(name) || [];
        const merged = [...existing, ...values];
        grouped.set(name, Array.from(new Set(merged)));
      });

      if (filter.name && filter.value && grouped.has(filter.name)) {
        const remaining = grouped
          .get(filter.name)
          .filter((v) => v !== filter.value);
        if (remaining.length > 0) {
          grouped.set(filter.name, remaining);
        } else {
          grouped.delete(filter.name);
        }
      }

      newParams.delete("attrName");
      newParams.delete("attrValue");
      grouped.forEach((values, name) => {
        newParams.append("attrName", name);
        newParams.append("attrValue", values.join(","));
      });

      const attributesPayload = Array.from(grouped.entries()).map(
        ([name, values]) => ({ name, value: values.join(",") })
      );

      // Update state immediately
      setPaginationData((prev) => ({
        ...prev,
        attributes: attributesPayload.length > 0 ? attributesPayload : null,
        sendAttributes: false,
        page: 1,
      }));
    } else if (filter.type === "moq") {
      newParams.delete("moq");
      dispatch(setMoq(null));
      setPaginationData((prev) => ({
        ...prev,
        moq: null,
        page: 1,
      }));
    }

    newParams.set("page", "1");

    // Update URL - this will trigger the useEffect that reads from URL
    setSearchParams(newParams, { replace: true });
  };

  // Fixed handleClearAllFilters function
  const handleClearAllFilters = () => {
    const newParams = new URLSearchParams(searchParams);

    // Remove all filter params
    newParams.delete("minPrice");
    newParams.delete("maxPrice");
    newParams.delete("colors");
    newParams.delete("attrName");
    newParams.delete("attrValue");
    newParams.set("page", "1");

    // Update all states immediately
    dispatch(setMinPrice(0));
    dispatch(setMaxPrice(1000000));
    dispatch(setMoq(null));

    setPaginationData((prev) => ({
      ...prev,
      pricerange: undefined,
      colors: [],
      attributes: null,
      moq: null,
      page: 1,
    }));

    // Update URL last
    setSearchParams(newParams, { replace: true });
  };

  // Mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      const isMobileScreen = window.innerWidth <= 500;
      setIsMobile(isMobileScreen);

      // On desktop, keep sidebar open; on mobile, keep it closed by default
      if (window.innerWidth > 1025) {
        setIsSidebarOpen(true);
      } else {
        // Only close if transitioning to mobile, don't force close if user opened it
        // if (!isMobile) {
        //   setIsSidebarOpen(false);
        // }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add click outside functionality to close sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.querySelector("[data-sidebar-content]");
        const hamburgerButton = document.querySelector("[data-sidebar-toggle]");

        // Check if click target is an input, textarea, or inside one
        const isInputElement =
          event.target.tagName === "INPUT" ||
          event.target.tagName === "TEXTAREA" ||
          event.target.tagName === "SELECT" ||
          event.target.closest("input") ||
          event.target.closest("textarea") ||
          event.target.closest("select");

        // Don't close if clicking on input elements inside the sidebar
        if (isInputElement && sidebar && sidebar.contains(event.target)) {
          return;
        }

        if (
          sidebar &&
          !sidebar.contains(event.target) &&
          hamburgerButton &&
          !hamburgerButton.contains(event.target)
        ) {
          setIsSidebarOpen(false);
        }
      }
    };

    if (isMobile && isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, {
        passive: true,
      });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobile, isSidebarOpen]);



  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };



  return (
    <>
      {/* Mobile Backdrop/Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={() => toggleSidebar()}
        />
      )}

      <div className="z-10 lg:sticky md:sticky lg:top-[110px] md:top-[110px] lg:h-fit lg:max-h-[calc(100vh-130px)] md:h-fit md:max-h-[calc(100vh-130px)] lg:flex lg:flex-col md:flex md:flex-col bg-transparent mt-12">
        {/* Hidden toggle button for external control */}
        <button
          data-sidebar-toggle
          onClick={toggleSidebar}
          className="hidden"
          aria-hidden="true"
        />

        {/* Sidebar - Desktop: sticky, Mobile: right drawer */}
        <aside
          data-sidebar-content
          onClick={(e) => e.stopPropagation()}
          className={`transition-all duration-300 ease-in-out ${
            isMobile
              ? `fixed top-0 right-0 h-screen w-[280px] shadow-2xl z-[100] transform bg-white ${
                  isSidebarOpen ? "translate-x-0" : "translate-x-full"
                }`
              : isSidebarOpen
              ? "relative w-[260px] flex flex-col h-full max-h-full bg-white border border-[#CBD5E1] rounded-xl overflow-hidden shadow-sm"
              : "hidden"
          }`}
        >
          {/* Sidebar Header - Workwear Style */}
          <div className="p-4 md:p-5 border-b border-[#CBD5E1] bg-[#009688]">
            <div className="flex items-center justify-between">
              <h2
                className="text-white font-bold flex items-center gap-2"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "18px",
                }}
              >
                <Filter size={20} className="text-white" />
                Filters
              </h2>
              {isMobile && (
                <button
                  type="button"
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div
            className={`overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${
              isMobile
                ? "h-[calc(100vh-60px)] px-4 py-4 bg-white"
                : "flex-1 min-h-0 px-4 py-4 bg-white"
            }`}
          >
            {appliedFilters.length > 0 && (
              <div className="mb-4 bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Applied Filters
                  </h3>
                  <button
                    onClick={handleClearAllFilters}
                    className="text-xs text-primary hover:text-primary-dark font-medium"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {appliedFilters.map((filter, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors group"
                    >
                      <span className="max-w-[150px] truncate">
                        {filter.label}
                      </span>
                      <button
                        onClick={() => handleRemoveFilter(filter)}
                        className="flex-shrink-0 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${filter.label} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Filters Section */}
            <div className="mt-3 space-y-3">
              {pageType === "CLOTHING" && (
                <CollapsibleSection
                  title="Gender"
                  defaultExpanded={false}
                  icon={<User size={18} />}
                >
                  <ClothingGenderToggle />
                </CollapsibleSection>
              )}

              <CollapsibleSection
                title="Price Range"
                defaultExpanded={false}
                icon={<CircleDollarSign size={18} />}
              >
                <PriceFilter toggleSidebar={() => toggleSidebar()} />
              </CollapsibleSection>

              <CollapsibleSection
                title="Minimum Quantity"
                defaultExpanded={false}
                icon={<Box size={18} />}
              >
                <MOQFilter toggleSidebar={toggleSidebar} />
              </CollapsibleSection>

              <CollapsibleSection
                title="Color"
                defaultExpanded={false}
                icon={<Palette size={18} />}
              >
                <ColorFilter toggleSidebar={toggleSidebar} />
              </CollapsibleSection>
              {categoryType !== "australia" &&
                categoryType !== "24hr-production" &&
                categoryType !== "sales" &&
                categoryType !== "clearance" && (
                  <AttributeFilters
                    toggleSidebar={toggleSidebar}
                    categoryType={categoryType}
                  />
                )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

UnifiedSidebar.propTypes = {
  pageType: PropTypes.string,
  customConfig: PropTypes.object,
};

export default UnifiedSidebar;
