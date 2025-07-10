import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  filteredProducts: [],
  selectedCategory: "all",
  selectedBrands: [],
  searchText: "",
  minPrice: 0,
  maxPrice: 1000,
  activeFilters: {
    category: null,
    brands: [],
    price: [],
  },
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      // console.log("setProducts called, resetting products");
      state.products = action.payload;
      if (state.filteredProducts.length === 0) {
        state.filteredProducts = action.payload;
      }

    },
    setSearchText: (state, action) => {
      state.searchText = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setMinPrice: (state, action) => {
      state.minPrice = action.payload;
    },
    setMaxPrice: (state, action) => {
      state.maxPrice = action.payload;
    },
    setSelectedBrands: (state, action) => {
      state.selectedBrands = action.payload;
    },
    applyFilters: (state) => {
      const {
        products = [],
        selectedCategory,
        selectedBrands,
        searchText,
        minPrice,
        maxPrice,
      } = state;
      const isCategoryMatch = (product) =>
        product?.product.categorisation.supplier_category === selectedCategory || selectedCategory === "all";
      const isBrandMatch = (product) =>
        selectedBrands.length === 0 || selectedBrands.includes(product?.brand);

      const isSearchMatch = (product) =>
        product?.overview?.name?.toLowerCase()?.includes(searchText.toLowerCase()) ||
        false;
      const getRealPrice = (product) => {
        const priceGroups = product.product?.prices?.price_groups || [];
        const basePrice =
          priceGroups.find((group) => group?.base_price) || {};
        const priceBreaks = basePrice.base_price?.price_breaks || [];
        return priceBreaks.length > 0 && priceBreaks[0]?.price !== undefined
          ? priceBreaks[0].price
          : 0;
      };
      const isPriceMatch = (product) => {
        const realPrice = getRealPrice(product);
        return realPrice >= minPrice && realPrice <= maxPrice;
      };

      // console.log("Applying filters with category:", state.selectedCategory);
      // console.log("Filtered products before:", state.filteredProducts.length);
      

      // state.filteredProducts = products.filter(
      //   (product) =>
      //     isCategoryMatch(product) &&
      //     isBrandMatch(product) &&
      //     isSearchMatch(product) &&
      //     isPriceMatch(product)
      // );


      const filtered = products.filter(
        (product) =>
          isCategoryMatch(product) &&
          isBrandMatch(product) &&
          isSearchMatch(product) &&
          isPriceMatch(product)
      );

      // If no products match, return an empty array
      state.filteredProducts = filtered.length > 0 ? filtered : [];

      state.activeFilters = {
        category: selectedCategory !== "all" ? selectedCategory : null,
        brands: selectedBrands.length > 0 ? selectedBrands : null,
        price: minPrice > 0 || maxPrice < 1000 ? [minPrice, maxPrice] : null,
      };
    },
  },
});

export const {
  setProducts,
  setSearchText,
  setSelectedCategory,
  setMinPrice,
  setMaxPrice,
  setSelectedBrands,
  applyFilters,
} = filterSlice.actions;

export const selectActiveFilters = (state) => state.filters.activeFilters;
export const selectProducts = (state) => state.filters.products;

export const selectFilteredCount = (state) => {
  state.filters.filteredProducts.length;
}


export default filterSlice.reducer;
