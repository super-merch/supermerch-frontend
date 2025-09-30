// Utility functions for dynamic category filtering based on product availability

/**
 * Extract unique category names from a product list
 * @param {Array} products - Array of product objects
 * @returns {Array} Array of unique category names
 */
export const extractCategoriesFromProducts = (products) => {
  if (!products || !Array.isArray(products)) {
    return [];
  }

  const categories = new Set();

  products.forEach((product) => {
    // Check different possible category fields in the product structure
    const categoryFields = [
      product?.product?.categorisation?.supplier_category,
      product?.product?.categorisation?.category,
      product?.product?.categorisation?.sub_category,
      product?.overview?.category,
      product?.category,
      product?.supplier_category,
    ];

    categoryFields.forEach((field) => {
      if (field && typeof field === "string") {
        categories.add(field);
      }
    });
  });

  return Array.from(categories);
};

/**
 * Filter categories based on product availability
 * @param {Array} allCategories - All available categories
 * @param {Array} products - Products to check against
 * @returns {Array} Filtered categories that have products
 */
export const filterCategoriesByProductAvailability = (allCategories, products) => {
  if (!allCategories || !Array.isArray(allCategories) || !products || !Array.isArray(products)) {
    return allCategories || [];
  }

  // Extract categories that actually have products
  const categoriesWithProducts = extractCategoriesFromProducts(products);

  // If no products found, return empty array
  if (categoriesWithProducts.length === 0) {
    return [];
  }

  // Filter allCategories to only include those that have products
  const filteredCategories = allCategories.filter((category) => {
    // Check if this category has products
    return categoriesWithProducts.some(
      (productCategory) =>
        productCategory === category.name ||
        productCategory === category.id ||
        // Handle variations in naming
        productCategory.toLowerCase().includes(category.name.toLowerCase()) ||
        category.name.toLowerCase().includes(productCategory.toLowerCase())
    );
  });

  return filteredCategories;
};

/**
 * Check if a specific category should be shown based on product availability
 * @param {Object} category - Category object to check
 * @param {Array} products - Products to check against
 * @returns {boolean} Whether the category should be shown
 */
export const shouldShowCategory = (category, products) => {
  if (!category || !products || !Array.isArray(products)) {
    return false;
  }

  // Check if any product belongs to this category
  return products.some((product) => {
    const productCategory =
      product?.product?.categorisation?.supplier_category ||
      product?.product?.categorisation?.category ||
      product?.overview?.category ||
      product?.category;

    if (!productCategory) return false;

    // Check main category match
    if (productCategory === category.name || productCategory === category.id) {
      return true;
    }

    // Check subcategories
    if (category.subTypes && Array.isArray(category.subTypes)) {
      return category.subTypes.some((subType) => productCategory === subType.name || productCategory === subType.id);
    }

    return false;
  });
};

/**
 * Get product data mapping for different page types
 * @returns {Object} Mapping of page types to their product data sources
 */
export const getPageTypeProductMapping = () => {
  return {
    SALE: {
      productKey: "discountedProducts",
      fetchFunction: "fetchDiscountedProducts",
      apiEndpoint: "/api/client-products-discounted",
    },
    AUSTRALIA_MADE: {
      productKey: "australia",
      fetchFunction: "fetchAustraliaProducts",
      apiEndpoint: "/api/australia/get-products",
    },
    HOUR_PRODUCTION: {
      productKey: "hourProd",
      fetchFunction: "fetchHourProducts",
      apiEndpoint: "/api/24hour/get",
    },
    RETURN_GIFTS: {
      productKey: "products", // Use general products for return gifts
      fetchFunction: "fetchProducts",
      apiEndpoint: "/api/client-products",
    },
  };
};
