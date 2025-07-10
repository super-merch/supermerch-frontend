import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import filterSlice from "./slices/filterSlice";
import categoryReducer from "./slices/categorySlice";
import promotionalReducer from "./slices/promotionalSlice";
import favouriteReducer from "./slices/favouriteSlice";
export const store = configureStore({
  reducer: {
    categoryProduct: categoryReducer,
    cart: cartReducer,
    filters: filterSlice,
    promotionals: promotionalReducer,
    favouriteProducts: favouriteReducer
  },
});
