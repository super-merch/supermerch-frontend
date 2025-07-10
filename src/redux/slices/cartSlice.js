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
import { getPriceForQuantity } from '../helper';

// cartSlice.js (top of file)
function findPriceBreak(priceBreaks, quantity) {
  const sorted = [...priceBreaks].sort((a, b) => a.qty - b.qty);
  let selected = sorted[0];
  for (const br of sorted) {
    if (quantity >= br.qty) selected = br;
    else break;
  }
  return selected;
}
function getBasePrice(id, quantity, state) {
  const cached = state.cachedBasePrices || {};
  if (!cached[id]) return 0;
  const selectedBreak = findPriceBreak(cached[id], quantity);
  return selectedBreak ? selectedBreak.price : 0;
}

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
      const {
        id,
        price,          // per unit price (after discount)
        totalPrice,      // total for the quantity (including setup + freight)
        setupFee = 0,
        freightFee = 0,
        quantity = 1,
        basePrices,
        marginFlat = 0,
        discountPct = 0,
        printMethodType,
        priceBreaks = [],
        ...rest
      } = action.payload;

      // Cache basePrices for recalculation
      if (basePrices) {
        state.cachedBasePrices[id] = basePrices;
      }

      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        // Increase quantity
        const newQuantity = existingItem.quantity + quantity;

        // Determine correct price break
        const selectedBreak = findPriceBreak(
          existingItem.priceBreaks || priceBreaks,
          newQuantity
        );

        // Get base product price
        const basePrice = getBasePrice(id, newQuantity, state);

        // Calculate unit price
        let unitPrice =
          printMethodType === 'base'
            ? selectedBreak.price
            : basePrice + selectedBreak.price;
        unitPrice = (unitPrice + marginFlat) * (1 - discountPct / 100);

        // Update item fields
        existingItem.quantity = newQuantity;
        existingItem.price = unitPrice;
        existingItem.totalPrice =
          unitPrice * newQuantity + setupFee + freightFee;
      } else {
        // New item
        state.items.push({
          id,
          price,
          totalPrice: totalPrice || price * quantity,
          setupFee,
          freightFee,
          quantity,
          marginFlat,
          discountPct,
          printMethodType,
          priceBreaks,
          ...rest,
        });
      }

      // Recalculate cart totals
      state.totalQuantity = state.items.reduce(
        (sum, it) => sum + it.quantity,
        0
      );
      state.totalAmount = state.items.reduce(
        (sum, it) => sum + it.totalPrice,
        0
      );
    },
incrementQuantityWithRecalculation: (state, action) => {
  const { id } = action.payload;
  const item = state.items.find(item => item.id === id);
  if (item) {
    const newQuantity = item.quantity + 1;
    const selectedBreak = findPriceBreak(item.priceBreaks, newQuantity);

    const basePrice = getBasePrice(id, newQuantity, state);
    let unitPrice = item.printMethodType === 'base'
      ? selectedBreak.price
      : basePrice + selectedBreak.price;

    unitPrice = (unitPrice + item.marginFlat) * (1 - item.discountPct / 100);

    item.quantity = newQuantity;
    item.price = unitPrice;
    item.totalPrice = (unitPrice * newQuantity) + (item.freightFee || 0);
  }
},

decrementQuantityWithRecalculation: (state, action) => {
  const { id } = action.payload;
  const item = state.items.find(item => item.id === id);
  if (item) {
    const newQuantity = Math.max(item.quantity - 1, 1);
    const selectedBreak = findPriceBreak(item.priceBreaks, newQuantity);

    const basePrice = getBasePrice(id, newQuantity, state);
    let unitPrice = item.printMethodType === 'base'
      ? selectedBreak.price
      : basePrice + selectedBreak.price;

    unitPrice = (unitPrice + item.marginFlat) * (1 - item.discountPct / 100);

    item.quantity = newQuantity;
    item.price = unitPrice;
    item.totalPrice = (unitPrice * newQuantity) + (item.freightFee || 0);
  }
},
    
    
    removeFromCart: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) {
        state.totalQuantity -= item.quantity;
        state.totalAmount -= item.price * item.quantity;
        state.items = state.items.filter((item) => item.id !== action.payload);
      }
    },
    updateCartItemImage: (state, action) => {
      const { id, dragdrop } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.dragdrop = dragdrop;
      }
    },
    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);

      if (item) {
        const newQty = Math.max(quantity, 1);
        item.quantity = newQty;
        let base = getPriceForQuantity(newQty, item.priceBreaks || []);
        base += item.marginFlat || 0;
        item.price = base * (1 - (item.discountPct || 0) / 100);
        state.totalAmount = state.items.reduce(
          (sum, it) => sum + it.price * it.quantity,
          0
        );
      }
    },
  },
});

export const {
  addToCart,
  incrementQuantityWithRecalculation,
  decrementQuantityWithRecalculation,
  removeFromCart,
  updateCartItemImage,
  updateCartItemQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;
