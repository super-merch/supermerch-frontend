






import { createSlice } from '@reduxjs/toolkit';

const getInitialFavouriteItems = () => {
  try {
    const storedItems = localStorage.getItem('favouriteItems');
    return storedItems ? JSON.parse(storedItems) : [];
  } catch (error) {
    console.error('Failed to load favourite items from localStorage', error);
    return [];
  }
};

const initialFavouriteItems = getInitialFavouriteItems(); // ✅ Called once

const favouriteSlice = createSlice({
  name: 'favouriteProducts',
  initialState: {
    favouriteItems: initialFavouriteItems,
    favouriteQuantity: initialFavouriteItems.length,
  },
  reducers: {
    addToFavourite: (state, action) => {
      const exists = state.favouriteItems.find(
        (item) => item.meta.id === action.payload.meta.id
        
      );
      console.log('Removing product with ID:', action.payload.meta.id);

      if (!exists) {
        state.favouriteItems.push(action.payload);
        state.favouriteQuantity = state.favouriteItems.length;

        localStorage.setItem(
          'favouriteItems',
          JSON.stringify(state.favouriteItems)
        );
      }
    },

    removeFromFavourite: (state, action) => {
      state.favouriteItems = state.favouriteItems.filter(
        (item) => item.meta.id !== action.payload.meta.id
      );
      state.favouriteQuantity = state.favouriteItems.length;

      localStorage.setItem(
        'favouriteItems',
        JSON.stringify(state.favouriteItems)
      );
    },
  },
});

export const { addToFavourite, removeFromFavourite } = favouriteSlice.actions;
export default favouriteSlice.reducer;
