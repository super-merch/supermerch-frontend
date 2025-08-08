// import { createSlice } from "@reduxjs/toolkit";
// import { getPriceForQuantity } from "../helper";

// const cartSlice = createSlice({
//   name: 'cart',
//   initialState: {
//     items: [],
//     totalQuantity: 0,
//     totalAmount: 0,
//   },
//   reducers: {
//     addToCart: (state, action) => {
//       const { id, printMethodKey, quantity, priceBreaks } = action.payload;
//       const existing = state.items.find(item =>
//         item.id === id && item.printMethodKey === printMethodKey
//       );

//       if (existing) {
//         const newQty = existing.quantity + quantity;
//         existing.quantity = newQty;
//         existing.price = getPriceForQuantity(newQty, priceBreaks);
//       } else {

//         const price = priceBreaks.length > 0 
//         ? getPriceForQuantity(quantity, priceBreaks)
//         : action.payload.price; // do this ao that it will also work for buy one sample qunatity
//         state.items.push({ ...action.payload, price });
//       }
//       state.totalQuantity = state.items.length;
//       state.totalAmount = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
//     },
//     incrementQuantity: (state, action) => {
//       const item = state.items.find(item => item.id === action.payload);
//       if (item) {
//         item.quantity += 1;
//         // state.totalQuantity += 1;
//         state.totalAmount += item.price;
//       }
//     },
//     decrementQuantity: (state, action) => {
//       const item = state.items.find(item => item.id === action.payload);
//       if (item && item.quantity > 1) {
//         item.quantity -= 1;
//         // state.totalQuantity -= 1;
//         state.totalAmount -= item.price;
//       }
//     },
//     removeFromCart: (state, action) => {
//       const item = state.items.find(item => item.id === action.payload);
//       if (item) {
//         state.totalQuantity -= item.quantity;
//         state.totalAmount -= item.price * item.quantity;
//         state.items = state.items.filter(item => item.id !== action.payload);
//       }
//     },
//     updateCartItemImage: (state, action) => {
//       const { id, dragdrop } = action.payload;
//       const item = state.items.find(item => item.id === id);
//       if (item) {
//         item.dragdrop = dragdrop;
//       }
//     },


//     // perfect for implementing the addtocart the same product
//     updateCartItemQuantity: (state, action) => {
//       const { id, quantity } = action.payload;
//       const item = state.items.find(item => item.id === id);

//       if (item) {
//         const newQty = Math.max(quantity, 1);
//         item.quantity = newQty;
//         item.price = getPriceForQuantity(newQty, item.priceBreaks);

//         // Update totals
//         state.totalAmount = state.items.reduce(
//           (sum, item) => sum + item.price * item.quantity,
//           0
//         );
//       }
//     }
//   },
// });

// export const {
//   addToCart,
//   incrementQuantity,
//   decrementQuantity,
//   removeFromCart,
//   updateCartItemImage,
//   updateCartItemQuantity
// } = cartSlice.actions;

// export default cartSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

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
  name: 'cart',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      const { email } = action.payload;
      state.currentUserEmail = email;
      
      // Recalculate totals for current user
      const userItems = state.items.filter(item => item.userEmail === email);
      state.totalQuantity = userItems.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = userItems.reduce((sum, item) => sum + item.totalPrice, 0);
    },

    addToCart: (state, action) => {
      const { 
        id, 
        price, 
        basePrices = [], // This should come from ProductDetails
        totalPrice, 
        setupFee = 0, 
        freightFee = 0, 
        quantity = 1,
        marginFlat = 0,
        discountPct = 0,
        ...rest 
      } = action.payload;
      
      if (!state.currentUserEmail) {
        console.error('No user logged in');
        return;
      }

      // Find existing item for current user
      const existing = state.items.find(item => 
        item.id === id && item.userEmail === state.currentUserEmail
      );

      if (existing) {
        existing.quantity += quantity;
        // Recalculate price based on new quantity
        const newUnitPrice = getPriceForQuantity(existing.quantity, existing.basePrices);
        const priceWithMargin = newUnitPrice + existing.marginFlat;
        existing.price = priceWithMargin * (1 - existing.discountPct / 100);
        existing.totalPrice = existing.price * existing.quantity;
      } else {
        // Calculate initial price with margin and discount
        const unitPrice = getPriceForQuantity(quantity, basePrices);
        const priceWithMargin = unitPrice + marginFlat;
        const finalPrice = priceWithMargin * (1 - discountPct / 100);
        
        state.items.push({
          id,
          price: finalPrice,
          basePrices, // Store the price breaks for future calculations
          marginFlat,
          discountPct,
          totalPrice: finalPrice * quantity,
          setupFee,
          freightFee,
          quantity,
          userEmail: state.currentUserEmail, // Add user email to item
          ...rest,
        });
      }

      // Recalculate totals for current user only
      const userItems = state.items.filter(item => item.userEmail === state.currentUserEmail);
      state.totalQuantity = userItems.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = userItems.reduce((sum, item) => sum + item.totalPrice, 0);
    },

    incrementQuantity: (state, action) => {
      const { id } = action.payload;
      const item = state.items.find(item => 
        item.id === id && item.userEmail === state.currentUserEmail
      );
      
      if (item) {
        item.quantity += 1;
        // Recalculate price based on new quantity
        const newUnitPrice = getPriceForQuantity(item.quantity, item.basePrices);
        const priceWithMargin = newUnitPrice + (item.marginFlat || 0);
        item.price = priceWithMargin * (1 - (item.discountPct || 0) / 100);
        item.totalPrice = item.price * item.quantity;
      }
      
      // Recalculate totals for current user
      const userItems = state.items.filter(item => item.userEmail === state.currentUserEmail);
      state.totalQuantity = userItems.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = userItems.reduce((sum, item) => sum + item.totalPrice, 0);
    },

    multipleQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => 
        item.id === id && item.userEmail === state.currentUserEmail
      );
      
      if (item) {
        item.quantity = Math.max(quantity, 1);
        // Recalculate price based on new quantity
        const newUnitPrice = getPriceForQuantity(item.quantity, item.basePrices);
        const priceWithMargin = newUnitPrice + (item.marginFlat || 0);
        item.price = priceWithMargin * (1 - (item.discountPct || 0) / 100);
        item.totalPrice = item.price * item.quantity;
      }
      
      // Recalculate totals for current user
      const userItems = state.items.filter(item => item.userEmail === state.currentUserEmail);
      state.totalQuantity = userItems.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = userItems.reduce((sum, item) => sum + item.totalPrice, 0);
    },

    decrementQuantity: (state, action) => {
      const { id } = action.payload;
      const item = state.items.find(item => 
        item.id === id && item.userEmail === state.currentUserEmail
      );
      
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        // Recalculate price based on new quantity
        const newUnitPrice = getPriceForQuantity(item.quantity, item.basePrices);
        const priceWithMargin = newUnitPrice + (item.marginFlat || 0);
        item.price = priceWithMargin * (1 - (item.discountPct || 0) / 100);
        item.totalPrice = item.price * item.quantity;
      }
      
      // Recalculate totals for current user
      const userItems = state.items.filter(item => item.userEmail === state.currentUserEmail);
      state.totalQuantity = userItems.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = userItems.reduce((sum, item) => sum + item.totalPrice, 0);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => 
        !(item.id === action.payload && item.userEmail === state.currentUserEmail)
      );
      
      // Recalculate totals for current user
      const userItems = state.items.filter(item => item.userEmail === state.currentUserEmail);
      state.totalQuantity = userItems.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = userItems.reduce((sum, item) => sum + item.totalPrice, 0);
    },

    updateCartItemImage: (state, action) => {
      const { id, dragdrop } = action.payload;
      const item = state.items.find(item => 
        item.id === id && item.userEmail === state.currentUserEmail
      );
      if (item) item.dragdrop = dragdrop;
    },

    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => 
        item.id === id && item.userEmail === state.currentUserEmail
      );
      
      if (item) {
        item.quantity = Math.max(quantity, 1);
        // Recalculate price based on new quantity
        const newUnitPrice = getPriceForQuantity(item.quantity, item.basePrices);
        const priceWithMargin = newUnitPrice + (item.marginFlat || 0);
        item.price = priceWithMargin * (1 - (item.discountPct || 0) / 100);
        item.totalPrice = item.price * item.quantity + (item.setupFee || 0) + (item.freightFee || 0);
      }
      
      // Recalculate totals for current user
      const userItems = state.items.filter(item => item.userEmail === state.currentUserEmail);
      state.totalQuantity = userItems.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = userItems.reduce((sum, item) => sum + item.totalPrice, 0);
    },

    clearUserCart: (state) => {
      // Only clear current user's items
      state.items = state.items.filter(item => item.userEmail !== state.currentUserEmail);
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
      state.currentUserEmail = email;
      
      // Recalculate totals for current user
      const userItems = state.items.filter(item => item.userEmail === email);
      state.totalQuantity = userItems.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = userItems.reduce((sum, item) => sum + item.totalPrice, 0);
    },

    clearCart: () => initialState, // Keep this for complete reset if needed
  },
});

// Selector to get current user's cart items
export const selectCurrentUserCartItems = (state) => {
  const currentUserEmail = state.cart.currentUserEmail;
  if (!currentUserEmail) return [];
  return state.cart.items.filter(item => item.userEmail === currentUserEmail);
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
  initializeCartFromStorage
} = cartSlice.actions;  

export default cartSlice.reducer;