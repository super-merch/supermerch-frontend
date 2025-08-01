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
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  cachedBasePrices: {},
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    cachedBasePrices: {},
  },
  reducers: {
    addToCart: (state, action) => {
      const { id, price, totalPrice, setupFee = 0, freightFee = 0, quantity = 1, ...rest } = action.payload;

      // Push new item or update existing
      const existing = state.items.find(item => item.id === id);
      if (existing) {
        existing.quantity += quantity;
        existing.totalPrice = existing.price * existing.quantity;
      } else {
        state.items.push({
          id,
          price,
          totalPrice: totalPrice || price * quantity ,
          setupFee,
          freightFee,
          quantity,
          ...rest,
        });
      }

      // Recalculate totals
      state.totalQuantity = state.items.reduce((sum, it) => sum + it.quantity, 0);
      state.totalAmount = state.items.reduce((sum, it) => sum + it.totalPrice, 0);
    },

    // Increment uses current unit price
    incrementQuantity: (state, action) => {
      const { id } = action.payload;
      const item = state.items.find(it => it.id === id);
      if (item) {
        item.quantity += 1;
        item.totalPrice = item.price * item.quantity 
      }
      state.totalQuantity = state.items.reduce((sum, it) => sum + it.quantity, 0);
      state.totalAmount = state.items.reduce((sum, it) => sum + it.totalPrice, 0);
    },

    // Decrement uses current unit price, min quantity =1
    decrementQuantity: (state, action) => {
      const { id } = action.payload;
      const item = state.items.find(it => it.id === id);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        item.totalPrice = item.price * item.quantity 
      }
      state.totalQuantity = state.items.reduce((sum, it) => sum + it.quantity, 0);
      state.totalAmount = state.items.reduce((sum, it) => sum + it.totalPrice, 0);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(it => it.id !== action.payload);
      state.totalQuantity = state.items.reduce((sum, it) => sum + it.quantity, 0);
      state.totalAmount = state.items.reduce((sum, it) => sum + it.totalPrice, 0);
    },

    updateCartItemImage: (state, action) => {
      const { id, dragdrop } = action.payload;
      const item = state.items.find(it => it.id === id);
      if (item) item.dragdrop = dragdrop;
    },

    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(it => it.id === id);
      if (item) {
        item.quantity = Math.max(quantity, 1);
        item.totalPrice = item.price * item.quantity + (item.setupFee || 0) + (item.freightFee || 0);
      }
      state.totalQuantity = state.items.reduce((sum, it) => sum + it.quantity, 0);
      state.totalAmount = state.items.reduce((sum, it) => sum + it.totalPrice, 0);
    },
    clearCart: () => initialState,
  },
});

export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  updateCartItemImage,
  updateCartItemQuantity,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
