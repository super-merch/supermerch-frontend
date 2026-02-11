import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const favouriteSlice = createSlice({
  name: "favouriteProducts",
  initialState: {
    favouriteItems: [],
    favouriteQuantity: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setFavouriteItems: (state, action) => {
      state.favouriteItems = action.payload;
      state.favouriteQuantity = action.payload.length;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    addToFavouriteLocal: (state, action) => {
      const exists = state.favouriteItems.find(
        (item) => item.meta.id === action.payload.meta.id
      );

      if (!exists) {
        state.favouriteItems.push(action.payload);
        state.favouriteQuantity = state.favouriteItems.length;
      }
    },

    removeFromFavouriteLocal: (state, action) => {
      state.favouriteItems = state.favouriteItems.filter(
        (item) => item.meta.id !== action.payload.meta.id
      );
      state.favouriteQuantity = state.favouriteItems.length;
    },

    clearFavourites: (state) => {
      state.favouriteItems = [];
      state.favouriteQuantity = 0;
      state.error = null;
    },
  },
});
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const loadFavouritesFromDB = (email) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const token = localStorage.getItem("token");

    if (!token) {
      dispatch(setLoading(false));
      return;
    }

    if (!email) {
      dispatch(setLoading(false));
      return;
    }

    const userId = email;
    const favResponse = await axios.get(
      `${backendUrl}/api/favourites/get-favourite`,
      {
        params: { userId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (favResponse.data.success) {
      dispatch(setFavouriteItems(favResponse.data.favouriteProducts));
    }
  } catch (error) {
    console.error("Error loading favourites:", error);
    dispatch(
      setError(error.response?.data?.message || "Failed to load favourites")
    );
  } finally {
    dispatch(setLoading(false));
  }
};

export const addToFavourite = (product, email) => async (dispatch, getState) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      dispatch(addToFavouriteLocal(product));
      console.error("User not authenticated");
      return;
    }

    // Check if already exists locally
    const { favouriteItems } = getState().favouriteProducts;
    const exists = favouriteItems.find(
      (item) => item.meta.id === product.meta.id
    );

    if (exists) {
      return;
    }

    // Add to local state first for immediate UI update
    dispatch(addToFavouriteLocal(product));

    const userId = email || getState().cart?.currentUserEmail;
    if (!userId) {
      return;
    }

    await axios.post(
      `${backendUrl}/api/favourites/save-favourite`,
      {
        userId,
        favouriteProduct: product,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error adding to favourites:", error);
    // Remove from local state if DB save failed
    dispatch(removeFromFavouriteLocal(product));
    dispatch(
      setError(error.response?.data?.message || "Failed to add to favourites")
    );
  }
};

export const removeFromFavourite = (product, email) => async (dispatch, getState) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      dispatch(removeFromFavouriteLocal(product));

      console.error("User not authenticated");
      return;
    }

    // Remove from local state first for immediate UI update
    dispatch(removeFromFavouriteLocal(product));

    const userId = email || getState().cart?.currentUserEmail;
    if (!userId) {
      return;
    }

    await axios.delete(`${backendUrl}/api/favourites/delete-favourite`, {
      data: {
        userId,
        productId: product.meta.id,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error removing from favourites:", error);
    // Add back to local state if DB removal failed
    dispatch(addToFavouriteLocal(product));
    dispatch(
      setError(
        error.response?.data?.message || "Failed to remove from favourites"
      )
    );
  }
};

export const {
  setFavouriteItems,
  setLoading,
  setError,
  addToFavouriteLocal,
  removeFromFavouriteLocal,
  clearFavourites,
} = favouriteSlice.actions;

export default favouriteSlice.reducer;
