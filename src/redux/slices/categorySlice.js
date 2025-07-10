import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch promotional menu data
export const fetchcategoryProduct = createAsyncThunk(
    "products/fetchcategoryProduct",
    async () => {
        try {
            // console.log("API Request started...");
            const response = await axios.get("http://localhost:5000/api/client-products");
            // console.log(response, "this is response"); // Log here
            return response.data;
        } catch (error) {
            console.error("API fetch error:", error); // Log any errors
            throw error; // Rethrow for Redux to handle
        }
    }
);


const categorytSlice = createSlice({
    name: "categoryProduct",
    initialState: {
        categoryProduct: [],
        filteredProducts: [], // products that match the promotional category
        status: "idle",
        error: null,
    },
    reducers: {
        matchProduct: (state, action) => {
            const { categoryProducts, checkcatPro } = action.payload; // Directlsy use payload as string
            // console.log(checkcatPro, "state.categoryProduct"); // Log state correctly
            // console.log(categoryProducts, "categoryProductsredux")

            const matchedProducts = checkcatPro.data?.filter(check => {
                // Get the type_id from the product safely
                const typeId = check.product?.categorisation?.promodata_product_type?.type_id;

                // Only proceed if typeId exists
                if (!typeId) return false;

                // Check if this typeId exists in any of the categoryProducts subTypes
                return categoryProducts.some(category =>
                    category.subTypes.some(sub => sub.id === typeId)
                );
            });
            state.filteredProducts = matchedProducts || [];
            // console.log(matchedProducts, "Filtered Matched Products");


        }

        // ****************************************************************************



    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchcategoryProduct.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchcategoryProduct.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.categoryProduct = action.payload;
            })
            .addCase(fetchcategoryProduct.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    },
});

export const { matchProduct } = categorytSlice.actions;
export default categorytSlice.reducer;
