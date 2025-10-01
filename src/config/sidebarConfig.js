// Sidebar configuration for different page types
import { getFilteredCategories } from "../data/categoriesData.js";

// Configuration objects for each page type
export const SIDEBAR_CONFIGS = {
  PROMOTIONAL: {
    type: "promotional",
    title: "Promotional",
    showAllCategories: true,
    allowedCategories: [], // Empty means show all categories
    description: "Browse all promotional products across all categories",
  },

  CLOTHING: {
    type: "clothing",
    title: "Clothing",
    showAllCategories: false,
    allowedCategories: ["Clothing"],
    description: "Browse clothing products and accessories",
  },

  HEADWEAR: {
    type: "headwear",
    title: "Headwear",
    showAllCategories: false,
    allowedCategories: ["Headwear"],
    description: "Browse headwear products including caps, hats, and more",
  },

  GENERAL: {
    type: "general",
    title: "Categories",
    showAllCategories: true,
    allowedCategories: [
      "All Products",
      "Bags",
      "Clothing",
      "Drinkware",
      "Exhibitions & Events",
      "Food",
      "Fun & Games",
      "Headwear",
      "Health & Personal",
      "Home & Office",
      "Keyrings & Tools",
      "Leisure & Outdoors",
      "Office Stationery",
      "Writing",
      "PRINTING and Magnets",
      "Tech",
      "Capital Equipment",
    ],
    description: "Browse products across all categories",
  },
};

// Helper function to get configuration for a specific page type
export const getSidebarConfig = (pageType) => {
  return SIDEBAR_CONFIGS[pageType] || SIDEBAR_CONFIGS.GENERAL;
};

// Helper function to get filtered categories for a specific configuration
export const getCategoriesForConfig = (config) => {
  return getFilteredCategories(config.allowedCategories, config.showAllCategories);
};

// Page type mappings for easy reference
export const PAGE_TYPES = {
  PROMOTIONAL: "PROMOTIONAL",
  CLOTHING: "CLOTHING",
  HEADWEAR: "HEADWEAR",
  RETURN_GIFTS: "GENERAL",
  HOUR_PRODUCTION: "GENERAL",
  SALE: "GENERAL",
  AUSTRALIA_MADE: "GENERAL",
};

// Helper function to determine page type from route
export const getPageTypeFromRoute = (pathname) => {
  const routeMap = {
    "/Spromotional": PAGE_TYPES.PROMOTIONAL,
    "/Clothing": PAGE_TYPES.CLOTHING,
    "/Headwear": PAGE_TYPES.HEADWEAR,
    "/ReturnGifts": PAGE_TYPES.RETURN_GIFTS,
    "/production": PAGE_TYPES.HOUR_PRODUCTION,
    "/sales": PAGE_TYPES.SALE,
    "/Australia": PAGE_TYPES.AUSTRALIA_MADE,
    "/australia-made": PAGE_TYPES.AUSTRALIA_MADE,
    "/hour-production": PAGE_TYPES.HOUR_PRODUCTION,
  };

  return routeMap[pathname] || PAGE_TYPES.GENERAL;
};
