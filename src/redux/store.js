// redux/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // uses localStorage

import cartReducer from "./slices/cartSlice";
import filterSlice from "./slices/filterSlice";
import categoryReducer from "./slices/categorySlice";
import promotionalReducer from "./slices/promotionalSlice";
import favouriteReducer from "./slices/favouriteSlice";

// 1️⃣ Create a root reducer
const rootReducer = combineReducers({
  categoryProduct: categoryReducer,
  cart: cartReducer,
  filters: filterSlice,
  promotionals: promotionalReducer,
  favouriteProducts: favouriteReducer,
});

// 2️⃣ Configure persistence: only whitelist "cart"
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart"],
};

// 3️⃣ Wrap the root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4️⃣ Create store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist dispatches some non-serializable actions — ignore those
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

// 5️⃣ Export a persistor
export const persistor = persistStore(store);
