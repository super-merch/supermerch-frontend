import { createSlice, createSelector } from "@reduxjs/toolkit";

const initialState = {
  items: [], // This will store all items with userEmail
  totalQuantity: 0,
  totalAmount: 0,
  cachedBasePrices: {},
  currentUserEmail: null, // Track current user
};

// Helper function to calculate price based on quantity and price breaks
const getPriceForQuantity = (quantity, priceBreaks) => {
  if (!priceBreaks || priceBreaks.length === 0) return 0;

  // Sort price breaks by quantity
  const sortedBreaks = [...priceBreaks].sort((a, b) => a.qty - b.qty);

  // Find the appropriate price break for the given quantity
  for (let i = sortedBreaks.length - 1; i >= 0; i--) {
    if (quantity >= sortedBreaks[i].qty) {
      return sortedBreaks[i].price;
    }
  }

  // If quantity is less than the smallest break, use the smallest break price
  return sortedBreaks[0]?.price || 0;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      const { email } = action.payload;
      state.currentUserEmail = email;

      // Recalculate totals for current user
      const userItems = state.items.filter((item) => item.userEmail === email);
      state.totalQuantity = userItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.totalAmount = userItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );
    },

    addToCart: (state, action) => {
      const {
        id,
        price,
        basePrices = [], // This should come from ProductDetails
        totalPrice,
        size = "",
        setupFee = 0,
        freightFee = 0,
        quantity = 1,
        marginFlat = 0,
        discountPct = 0,
        userEmail,
        dragdrop = null,
        print = "",
        sku_number,
        ...rest
      } = action.payload;

      // Use guest email if no user email provided
      const effectiveUserEmail = userEmail || "guest@gmail.com";

      if (!state.currentUserEmail) {
        // If no current user set, set it to the provided email or guest
        state.currentUserEmail = effectiveUserEmail;
      }

      // Find existing item for the specific user email, size, and color
      const color = rest.color || "";
      const existing = state.items.find(
        (item) =>
          item.id === id &&
          item.userEmail === effectiveUserEmail &&
          item.size === size &&
          (item.color || "") === color,
      );

      if (existing) {
        existing.quantity += quantity;
        // Recalculate price based on new quantity
        const newUnitPrice = getPriceForQuantity(
          existing.quantity,
          existing.basePrices,
        );
        const priceWithMargin =
          newUnitPrice + (existing.marginFlat * newUnitPrice) / 100;
        existing.price = priceWithMargin * (1 - existing.discountPct / 100);
        existing.totalPrice = existing.price * existing.quantity;
        existing.print = print;
        existing.setupFee = setupFee;
        if (dragdrop) {
          existing.dragdrop = dragdrop;
        }
      } else {
        // const unitPrice = getPriceForQuantity(quantity, basePrices);
        // const priceWithMargin = unitPrice + (marginFlat * unitPrice) / 100;
        // const finalPrice = priceWithMargin * (1 - discountPct / 100);

        state.items.push({
          cartItemId: `${Date.now()}-${Math.random()}`,
          id,
          price,
          basePrices, // Store the price breaks for future calculations
          marginFlat,
          discountPct,
          totalPrice: price * quantity,
          setupFee,
          freightFee,
          quantity,
          userEmail: effectiveUserEmail,
          size,
          dragdrop,
          print,
          sku_number,
          ...rest,
        });
      }

      // Recalculate totals for current user (including guest items if applicable)
      const currentUserItems =
        state.currentUserEmail === "guest@gmail.com"
          ? state.items.filter((item) => item.userEmail === "guest@gmail.com")
          : [
              ...state.items.filter(
                (item) => item.userEmail === "guest@gmail.com",
              ),
              ...state.items.filter(
                (item) =>
                  item.userEmail === state.currentUserEmail &&
                  item.userEmail !== "guest@gmail.com",
              ),
            ];

      state.totalQuantity = currentUserItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.totalAmount = currentUserItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );
    },

    incrementQuantity: (state, action) => {
      const { cartItemId } = action.payload;
      const item = state.items.find((item) => item.cartItemId === cartItemId);

      if (item) {
        item.quantity += 1;
        // Recalculate price based on new quantity
        const newUnitPrice = getPriceForQuantity(
          item.quantity,
          item.basePrices,
        );
        const priceWithMargin =
          newUnitPrice + ((item.marginFlat || 0) * newUnitPrice) / 100;
        item.price = priceWithMargin * (1 - (item.discountPct || 0) / 100);
        item.totalPrice = item.price * item.quantity;
      }

      // Recalculate totals for current user
      const userItems = state.items.filter(
        (item) => item.userEmail === state.currentUserEmail,
      );
      state.totalQuantity = userItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.totalAmount = userItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );
    },

    multipleQuantity: (state, action) => {
      const { cartItemId, quantity } = action.payload;
      const item = state.items.find((item) => item.cartItemId === cartItemId);

      if (item) {
        item.quantity = Math.max(quantity, 1);
        // Recalculate price based on new quantity
        const newUnitPrice = getPriceForQuantity(
          item.quantity,
          item.basePrices,
        );
        const priceWithMargin =
          newUnitPrice + ((item.marginFlat || 0) * newUnitPrice) / 100;
        item.price = priceWithMargin * (1 - (item.discountPct || 0) / 100);
        item.totalPrice = item.price * item.quantity;
      }

      // Recalculate totals for current user
      const userItems = state.items.filter(
        (item) => item.userEmail === state.currentUserEmail,
      );
      state.totalQuantity = userItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.totalAmount = userItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );
    },

    decrementQuantity: (state, action) => {
      const { cartItemId } = action.payload;
      const item = state.items.find((item) => item.cartItemId === cartItemId);

      if (item && item.quantity > 1) {
        item.quantity -= 1;
        // Recalculate price based on new quantity
        const newUnitPrice = getPriceForQuantity(
          item.quantity,
          item.basePrices,
        );
        const priceWithMargin =
          newUnitPrice + ((item.marginFlat || 0) * newUnitPrice) / 100;
        item.price = priceWithMargin * (1 - (item.discountPct || 0) / 100);
        item.totalPrice = item.price * item.quantity;
      }

      // Recalculate totals for current user
      const userItems = state.items.filter(
        (item) => item.userEmail === state.currentUserEmail,
      );
      state.totalQuantity = userItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.totalAmount = userItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );
    },

    removeFromCart: (state, action) => {
      // Get the current email (could be actual user email or "guest")
      const currentEmail = state.currentUserEmail || "guest@gmail.com";
      const { cartItemId } = action.payload;

      state.items = state.items.filter(
        (item) => item.cartItemId !== cartItemId,
      );

      // Recalculate totals for current user OR guest items
      const userItems = state.items.filter(
        (item) =>
          item.userEmail === currentEmail ||
          (state.currentUserEmail && item.userEmail === "guest@gmail.com"),
      );
      state.totalQuantity = userItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.totalAmount = userItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );
    },

    updateCartItemImage: (state, action) => {
      const { cartItemId, dragdrop } = action.payload;
      const item = state.items.find((item) => item.cartItemId === cartItemId);
      if (item) item.dragdrop = dragdrop;
    },

    updateCartItemQuantity: (state, action) => {
      const { cartItemId, quantity } = action.payload;
      const item = state.items.find((item) => item.cartItemId === cartItemId);

      if (item) {
        item.quantity = Math.max(quantity, 1);
        // Recalculate price based on new quantity
        const newUnitPrice = getPriceForQuantity(
          item.quantity,
          item.basePrices,
        );
        const priceWithMargin =
          newUnitPrice + ((item.marginFlat || 0) * newUnitPrice) / 100;
        item.price = priceWithMargin * (1 - (item.discountPct || 0) / 100);
        item.totalPrice =
          item.price * item.quantity +
          (item.setupFee || 0) +
          (item.freightFee || 0);
      }

      // Recalculate totals for current user
      const userItems = state.items.filter(
        (item) => item.userEmail === state.currentUserEmail,
      );
      state.totalQuantity = userItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.totalAmount = userItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );
    },

    clearUserCart: (state) => {
      // Only clear current user's items
      state.items = state.items.filter(
        (item) => item.userEmail !== state.currentUserEmail,
      );
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },

    clearCurrentUser: (state) => {
      // Clear current user and reset totals (for logout)
      state.currentUserEmail = null;
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },

    // Add this action to initialize user from storage
    initializeCartFromStorage: (state, action) => {
      const { email } = action.payload;
      state.currentUserEmail = email || "guest@gmail.com";

      // Recalculate totals for current user
      const userItems = state.items.filter((item) => item.userEmail === email);
      state.totalQuantity = userItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.totalAmount = userItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );
    },

    clearCart: () => initialState, // Keep this for complete reset if needed
  },
});

// Selector to get current user's cart items
export const selectCurrentUserCartItems = (state) => {
  const currentUserEmail = state.cart.currentUserEmail || "guest@gmail.com";

  // Always include guest items along with user-specific items
  const guestItems = state.cart?.items?.filter(
    (item) => item.userEmail === "guest@gmail.com",
  );

  if (currentUserEmail === "guest@gmail.com") {
    return guestItems;
  }

  const userItems = state?.cart?.items.filter(
    (item) => item.userEmail === currentUserEmail,
  );
  return [...guestItems, ...userItems];
};
export const currentUserCartAmount = (state) => {
  const currentUserEmail = state.cart.currentUserEmail || "guest@gmail.com";

  // Always include guest items along with user-specific items
  const guestItems = state.cart?.items?.filter(
    (item) => item.userEmail === "guest@gmail.com",
  );

  if (currentUserEmail === "guest@gmail.com") {
    return guestItems.length;
  }

  const userItems = state?.cart?.items.filter(
    (item) => item.userEmail === currentUserEmail,
  );
  return guestItems.length + userItems.length;
};

export const {
  setCurrentUser,
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  updateCartItemImage,
  updateCartItemQuantity,
  clearUserCart,
  clearCurrentUser,
  clearCart,
  multipleQuantity,
  initializeCartFromStorage,
} = cartSlice.actions;

export default cartSlice.reducer;
