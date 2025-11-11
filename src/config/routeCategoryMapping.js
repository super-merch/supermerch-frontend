// Route to Category Mapping Configuration
// This file maps main category routes to their corresponding category IDs and names

import { CATEGORIES_DATA } from "../data/categoriesData.js";

// Route to category mapping
export const ROUTE_CATEGORY_MAPPING = {
  "/Promotional": {
    type: "promotional",
    categoryId: null, // Promotional shows all products
    categoryName: "Promotional",
    description: "All Promotional Products",
  },
  "/Clothing": {
    type: "clothing",
    categoryId: CATEGORIES_DATA.Clothing.id, // "B"
    categoryName: "Clothing",
    description: "Clothing Products",
  },
  "/Headwear": {
    type: "headwear",
    categoryId: CATEGORIES_DATA.Headwear.id, // "G"
    categoryName: "Headwear",
    description: "Headwear Products",
  },
  "/return-gifts": {
    type: "return-gifts",
    categoryId: null, // Return gifts might be a special category
    categoryName: "Return Gifts",
    description: "Return Gifts Products",
  },
  "/24hr-production": {
    type: "24-hour-production",
    categoryId: null, // 24 Hour Production is based on product IDs, not category
    categoryName: "24 Hour Production",
    description: "24 Hour Production Products",
  },
  "/Sale": {
    type: "sale",
    categoryId: null, // Sale products are based on discount, not category
    categoryName: "Sale",
    description: "Sale Products",
  },
  "/australia-made": {
    type: "australia-made",
    categoryId: null, // Australia Made is based on product IDs, not category
    categoryName: "Australia Made",
    description: "Australia Made Products",
  },
};

// Helper function to get category mapping from route
export const getCategoryMappingFromRoute = (pathname) => {
  return ROUTE_CATEGORY_MAPPING[pathname] || null;
};

// Helper function to check if a route should auto-filter by category
export const shouldAutoFilterByCategory = (pathname) => {
  const mapping = getCategoryMappingFromRoute(pathname);
  return mapping && mapping.categoryId !== null;
};

// Helper function to get category name for display
export const getCategoryDisplayName = (pathname) => {
  const mapping = getCategoryMappingFromRoute(pathname);
  return mapping ? mapping.categoryName : "All Products";
};

// Helper function to get category description for result count
export const getCategoryDescription = (pathname) => {
  const mapping = getCategoryMappingFromRoute(pathname);
  return mapping ? mapping.description : "All Products";
};
