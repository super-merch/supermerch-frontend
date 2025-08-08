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

// 2️⃣ Configure persistence: only whitelist "cart" but blacklist currentUserEmail
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart"],
  // Blacklist the currentUserEmail field from being persisted
  transforms: [
    {
      in: (inboundState, key) => {
        if (key === 'cart') {
          // Remove currentUserEmail before saving to storage
          const { currentUserEmail, ...cartWithoutUser } = inboundState;
          return {
            ...cartWithoutUser,
            totalQuantity: 0, // Reset totals when persisting
            totalAmount: 0,
          };
        }
        return inboundState;
      },
      out: (outboundState, key) => {
        if (key === 'cart') {
          // Add currentUserEmail as null when loading from storage
          return {
            ...outboundState,
            currentUserEmail: null,
          };
        }
        return outboundState;
      },
    },
  ],
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