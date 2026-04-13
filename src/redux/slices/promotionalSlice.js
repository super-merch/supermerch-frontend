import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    filteredPromotionalProducts: [],
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

const promotionalSlice = createSlice({
    name: "promotionals",
    initialState,
    reducers: {
        // Initially set all products if needed.
        setAllProducts: (state, action) => {
            state.filteredPromotionalProducts = action.payload;
            // console.log(action.payload, "afterwards");

        },
        matchPromotionalProduct: (state, action) => {
            const { categoryProducts, checkAllPro } = action.payload;
            // If checkAllPro is an array, use it directly; otherwise, try checkAllPro.data
            const allProducts = Array.isArray(checkAllPro) ? checkAllPro : checkAllPro.data || [];

            const matchedProducts = allProducts.filter(product => {
                const typeId = product.product?.categorisation?.promodata_product_type?.type_id;
                if (!typeId) return false;
                // Check if this typeId exists in any of the categoryProducts subTypes
                return categoryProducts.some(category =>
                    category.subTypes.some(sub => sub.id === typeId)
                );
            });
            state.filteredPromotionalProducts = matchedProducts || [];
            // console.log(matchedProducts, "Filtered Matched Products");
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
                filteredPromotionalProducts = [],
                selectedCategory,
                selectedBrands,
                searchText,
                minPrice,
                maxPrice,
            } = state;
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
            // console.log("Filtered products before:", state.filteredPromotionalProducts.length);

            const filtered = filteredPromotionalProducts.filter(
                (product) =>
                    // isCategoryMatch(product) &&
                    isBrandMatch(product) &&
                    isSearchMatch(product) &&
                    isPriceMatch(product)
            );

            // If no products match, return an empty array
            state.filteredPromotionalProducts = filtered.length > 0 ? filtered : [];

            state.activeFilters = {
                category: selectedCategory !== "all" ? selectedCategory : null,
                brands: selectedBrands.length > 0 ? selectedBrands : null,
                price: minPrice > 0 || maxPrice < 1000 ? [minPrice, maxPrice] : null,
            };
        },
    },
});

export const { setAllProducts, matchPromotionalProduct,
    setSearchText,
    setSelectedCategory,
    setMinPrice,
    setMaxPrice,
    setSelectedBrands,
    applyFilters
} = promotionalSlice.actions;

export const selectActiveFilters = (state) => state.promotionals.activeFilters;
export const selectProducts = (state) => state.promotionals.filteredPromotionalProducts;

export const selectFilteredCount = (state) => {
    state.filters.filteredPromotionalProducts.length;
}

export default promotionalSlice.reducer;
