
import { createSlice,createSelector } from '@reduxjs/toolkit';

const initialState = {
  items: [], 
  totalQuantity: 0,
  totalAmount: 0,
  cachedBasePrices: {},
  currentUserEmail: null, 
};

const getPriceForQuantity = (quantity, priceBreaks) => {
  if (!priceBreaks || priceBreaks.length === 0) return 0;
  const sortedBreaks = [...priceBreaks].sort((a, b) => a.qty - b.qty);
  for (let i = sortedBreaks.length - 1; i >= 0; i--) {
    if (quantity >= sortedBreaks[i].qty) {
      return sortedBreaks[i].price;
    }
  }
  return sortedBreaks[0]?.price || 0;
};

const applyLineDiscount = (unitPrice, item) => {
  const clearanceType = norm(item?.clearanceInfo?.discountType);
  const clearanceAmount = Number(item?.clearanceInfo?.amount || 0);
  if (item?.clearanceInfo?.isActive && clearanceAmount > 0) {
    if (clearanceType === "flat") {
      return Math.max(unitPrice - clearanceAmount, 0);
    }
    return unitPrice * (1 - clearanceAmount / 100);
  }

  const pct = Number(item?.discountPct || 0);
  if (pct > 0) {
    return unitPrice * (1 - pct / 100);
  }
  return unitPrice;
};

const getCartUnitPrice = (item, quantity) => {
  const baseUnitPrice = getPriceForQuantity(quantity, item.basePrices);
  const methodUnitPrice = getPriceForQuantity(quantity, item.priceBreaks || []);
  const methodKey = norm(item.printMethodKey || item.print);
  const isBaseSelection =
    methodKey === "" ||
    methodKey === "none" ||
    methodKey.includes("base") ||
    !Array.isArray(item.priceBreaks) ||
    item.priceBreaks.length === 0;

  const undecoratedUnitPrice = isBaseSelection
    ? Number(baseUnitPrice || item.price || 0)
    : Number((baseUnitPrice || 0) + (methodUnitPrice || 0));

  return Number(applyLineDiscount(undecoratedUnitPrice, item));
};

const norm = (v) => String(v ?? "").trim().toLowerCase();
const isDealItem = (item) => norm(item?.itemType || item?.type) === "deal";

const getSelectedProductsSignature = (selectedProducts) => {
  const normalized = Array.isArray(selectedProducts)
    ? selectedProducts
    : Object.values(selectedProducts || {});

  return normalized
    .map((slot) => {
      const slotId = norm(slot?.slotId);
      const choiceId = norm(slot?.productChoiceId);
      const colorSelections = Array.isArray(slot?.colorSelections)
        ? slot.colorSelections
        : [];

      const colorSig = colorSelections
        .map((colorSel) => {
          const color = norm(colorSel?.colorName || colorSel?.colorId);
          const qty = Number(colorSel?.quantity || 0);
          const sizeSig = (Array.isArray(colorSel?.sizes)
            ? colorSel.sizes
            : []
          )
            .map((sizeItem) => `${norm(sizeItem?.size || sizeItem?.sizeId)}:${Number(sizeItem?.quantity || 0)}`)
            .sort()
            .join("|");
          return `${color}:${qty}:${sizeSig}`;
        })
        .sort()
        .join("~");

      return `${slotId}:${choiceId}:${colorSig}`;
    })
    .sort()
    .join("||");
};

const getCustomizationSignature = (customizationData) => {
  const entries = Object.entries(customizationData || {}).filter(
    ([key]) => key !== "pricing"
  );

  const slotSig = entries
    .map(([slotId, customization]) => {
      const methodId = norm(customization?.method?.id || customization?.methodId);
      const appMethod = norm(
        customization?.method?.applicationMethod || customization?.applicationMethod
      );
      const appType = norm(
        customization?.method?.applicationType || customization?.applicationType
      );
      const positionSig = (Array.isArray(customization?.positions)
        ? customization.positions
        : customization?.position
          ? [customization.position]
          : []
      )
        .map((position) => norm(position?.id || position?.positionId || position?._id || position?.positionName))
        .sort()
        .join("|");

      return `${norm(slotId)}:${methodId}:${appMethod}:${appType}:${positionSig}`;
    })
    .sort()
    .join("||");

  const setupFee = Number(customizationData?.pricing?.setupFee || 0);
  const positionTotal = Number(customizationData?.pricing?.positionTotal || 0);

  return `${slotSig}::setup:${setupFee}::position:${positionTotal}`;
};

const sanitizeSerializableValue = (value, depth = 0) => {
  if (depth > 6) return null;
  if (value == null) return value;

  const valueType = typeof value;
  if (valueType === "string" || valueType === "number" || valueType === "boolean") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeSerializableValue(item, depth + 1));
  }

  if (valueType === "object") {
    if (
      Object.prototype.hasOwnProperty.call(value, "nativeEvent") ||
      typeof value.preventDefault === "function" ||
      typeof value.stopPropagation === "function" ||
      (typeof value.nodeType === "number" && typeof value.tagName === "string")
    ) {
      return null;
    }

    const sanitized = {};
    Object.entries(value).forEach(([key, child]) => {
      if (["nativeEvent", "target", "currentTarget", "srcElement", "view", "path", "composedPath"].includes(key)) {
        return;
      }
      sanitized[key] = sanitizeSerializableValue(child, depth + 1);
    });
    return sanitized;
  }

  return null;
};

const sanitizeDealCustomizationData = (customizationData) => {
  const sanitized = sanitizeSerializableValue(customizationData, 0);
  return sanitized && typeof sanitized === "object" ? sanitized : {};
};

const getDealCartLineKey = (item) =>
[
  norm(item.id),
  norm(item.userEmail),
  norm(item.dealSource?.dealId || item.deal?.id),
  norm(item.dealSource?.dealCode || item.deal?.dealCode),
  norm(item.multiplier || item.quantity || 1),
  getSelectedProductsSignature(item.selectedProducts),
  getCustomizationSignature(item.customizationData),
].join("::");
const getCartLineKey = (item) =>
[
  norm(item.id),
  norm(item.userEmail),
  norm(item.size),
  norm(item.color),
  norm(item.printMethodKey || item.print),
  norm(item.logoColor),
  item.sample ? "sample" : "regular",
  norm(item.adminCustomization?.methodId || "none"),
  norm(item.adminCustomization?.position?.positionId || "none"),
].join("::");


const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      const { email } = action.payload;
      state.currentUserEmail = email;
      const userItems = state.items.filter((item) => item.userEmail === email);
      state.totalQuantity = userItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      state.totalAmount = userItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
    },

    addToCart: (state, action) => {
      const {
        id,
        price,
        basePrices = [], 
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
        ...rest
      } = action.payload;

      const effectiveUserEmail = userEmail || "guest@gmail.com";
      if (!state.currentUserEmail) {
        state.currentUserEmail = effectiveUserEmail;
      }

      if (norm(rest.itemType || rest.type) === "deal") {
        const sanitizedCustomizationData = sanitizeDealCustomizationData(
          rest.customizationData || null
        );
        const incomingDealLine = {
          id,
          userEmail: effectiveUserEmail,
          itemType: "DEAL",
          type: "deal",
          dealSource: rest.dealSource,
          deal: rest.deal,
          multiplier: rest.multiplier || quantity || 1,
          quantity: quantity || rest.multiplier || 1,
          selectedProducts: rest.selectedProducts || {},
          customizationData: sanitizedCustomizationData,
        };

        const incomingDealKey = getDealCartLineKey(incomingDealLine);
        const existingDeal = state.items.find(
          (item) => isDealItem(item) && getDealCartLineKey(item) === incomingDealKey
        );

        if (existingDeal) {
          existingDeal.quantity += quantity || 1;
          existingDeal.multiplier = existingDeal.quantity;
          existingDeal.price = Number(rest.price ?? existingDeal.price ?? 0);
          existingDeal.totalPrice = existingDeal.price * existingDeal.quantity;
          existingDeal.selectedProducts = rest.selectedProducts || existingDeal.selectedProducts;
          existingDeal.customizationData = sanitizedCustomizationData || existingDeal.customizationData;
          existingDeal.dealSource = rest.dealSource || existingDeal.dealSource;
          existingDeal.deal = rest.deal || existingDeal.deal;
        } else {
          state.items.push({
            cartItemId: `${Date.now()}-${Math.random()}`,
            id,
            userEmail: effectiveUserEmail,
            itemType: "DEAL",
            type: "deal",
            dealSource: rest.dealSource || null,
            deal: rest.deal || null,
            multiplier: rest.multiplier || quantity || 1,
            quantity: quantity || rest.multiplier || 1,
            price: Number(rest.price ?? price ?? 0),
            unitPrice: Number(rest.price ?? price ?? 0),
            totalPrice: Number(rest.totalPrice ?? (Number(rest.price ?? price ?? 0) * (quantity || rest.multiplier || 1))),
            basePrices,
            setupFee,
            freightFee,
            sample: false,
            selectedProducts: rest.selectedProducts || {},
            customizationData: sanitizedCustomizationData,
            customizationCharge: rest.customizationCharge || 0,
            customizationGroupId: rest.customizationGroupId || null,
            hasCustomization: rest.hasCustomization || false,
            addLogoLater: rest.addLogoLater || false,
            rawUnitPrice: rest.rawUnitPrice || rest.price || price || 0,
            rawLineTotal: rest.rawLineTotal || Number(rest.price ?? price ?? 0) * (quantity || rest.multiplier || 1),
            lineDealDiscountAmount: rest.lineDealDiscountAmount || 0,
            ...rest,
          });
        }

        const currentUserItems =
          state.currentUserEmail === "guest@gmail.com"
            ? state.items.filter((item) => item.userEmail === "guest@gmail.com")
            : [
                ...state.items.filter(
                  (item) => item.userEmail === "guest@gmail.com"
                ),
                ...state.items.filter(
                  (item) =>
                    item.userEmail === state.currentUserEmail &&
                    item.userEmail !== "guest@gmail.com"
                ),
              ];

        state.totalQuantity = currentUserItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        state.totalAmount = currentUserItems.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        );
        return;
      }

      const color = rest.color || "";
      const incomingLine = {
        id,
        userEmail: effectiveUserEmail,
        size,
        color,
        printMethodKey: rest.printMethodKey,
        print,
        logoColor: rest.logoColor,
        sample: rest.sample,
        adminCustomization: rest.adminCustomization,
      };

      const incomingKey = getCartLineKey(incomingLine);
      const existing = state.items.find(
        (item) => getCartLineKey(item) === incomingKey
      );

      if (existing) {
        existing.quantity += quantity;
        const newUnitPrice = getCartUnitPrice(existing, existing.quantity);
        existing.price = newUnitPrice;
        existing.totalPrice = existing.price * existing.quantity;
        if (dragdrop) {
          existing.dragdrop = dragdrop;
        }
        // Update admin customization if provided
        if (rest.adminCustomization) {
          existing.adminCustomization = rest.adminCustomization;
        }
        if (rest.addLogoLater !== undefined) {
          existing.addLogoLater = rest.addLogoLater;
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
          ...rest,
        });
      }

      // Recalculate totals for current user (including guest items if applicable)
      const currentUserItems =
        state.currentUserEmail === "guest@gmail.com"
          ? state.items.filter((item) => item.userEmail === "guest@gmail.com")
          : [
              ...state.items.filter(
                (item) => item.userEmail === "guest@gmail.com"
              ),
              ...state.items.filter(
                (item) =>
                  item.userEmail === state.currentUserEmail &&
                  item.userEmail !== "guest@gmail.com"
              ),
            ];

      state.totalQuantity = currentUserItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      state.totalAmount = currentUserItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
    },

    incrementQuantity: (state, action) => {
      const { cartItemId } = action.payload;
      const item = state.items.find((item) => item.cartItemId === cartItemId);

      if (item) {
        item.quantity += 1;
        if (isDealItem(item)) {
          item.multiplier = item.quantity;
          item.totalPrice = Number(item.price || 0) * item.quantity;
        } else {
          // Recalculate from backend-finalized tier prices
          const newUnitPrice = getCartUnitPrice(item, item.quantity);
          item.price = newUnitPrice;
          item.totalPrice = item.price * item.quantity;
        }
      }

      // Recalculate totals for current user
      const userItems = state.items.filter(
        (item) => item.userEmail === state.currentUserEmail
      );
      state.totalQuantity = userItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      state.totalAmount = userItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
    },

    multipleQuantity: (state, action) => {
      const { cartItemId, quantity } = action.payload;
      const item = state.items.find((item) => item.cartItemId === cartItemId);

      if (item) {
        item.quantity = Math.max(quantity, 1);
        if (isDealItem(item)) {
          item.multiplier = item.quantity;
          item.totalPrice = Number(item.price || 0) * item.quantity;
        } else {
          // Recalculate from backend-finalized tier prices
          const newUnitPrice = getCartUnitPrice(item, item.quantity);
          item.price = newUnitPrice;
          item.totalPrice = item.price * item.quantity;
        }
      }

      // Recalculate totals for current user
      const userItems = state.items.filter(
        (item) => item.userEmail === state.currentUserEmail
      );
      state.totalQuantity = userItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      state.totalAmount = userItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
    },

    decrementQuantity: (state, action) => {
      const { cartItemId } = action.payload;
      const item = state.items.find((item) => item.cartItemId === cartItemId);

      if (item && item.quantity > 1) {
        item.quantity -= 1;
        if (isDealItem(item)) {
          item.multiplier = item.quantity;
          item.totalPrice = Number(item.price || 0) * item.quantity;
        } else {
          // Recalculate from backend-finalized tier prices
          const newUnitPrice = getCartUnitPrice(item, item.quantity);
          item.price = newUnitPrice;
          item.totalPrice = item.price * item.quantity;
        }
      }

      // Recalculate totals for current user
      const userItems = state.items.filter(
        (item) => item.userEmail === state.currentUserEmail
      );
      state.totalQuantity = userItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      state.totalAmount = userItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
    },

    removeFromCart: (state, action) => {
      // Get the current email (could be actual user email or "guest")
      const currentEmail = state.currentUserEmail || "guest@gmail.com";
      const { cartItemId } = action.payload;

      state.items = state.items.filter((item) => item.cartItemId !== cartItemId);

      // Recalculate totals for current user OR guest items
      const userItems = state.items.filter(
        (item) =>
          item.userEmail === currentEmail ||
          (state.currentUserEmail && item.userEmail === "guest@gmail.com")
      );
      state.totalQuantity = userItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      state.totalAmount = userItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
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
        if (isDealItem(item)) {
          item.multiplier = item.quantity;
          item.totalPrice = Number(item.price || 0) * item.quantity;
        } else {
          // Recalculate price based on new quantity
          const baseUnitPrice = getPriceForQuantity(item.quantity, item.basePrices);
          const priceWithMargin = baseUnitPrice + ((item.marginFlat || 0) * baseUnitPrice) / 100;
          item.price = applyLineDiscount(priceWithMargin, item);
          item.totalPrice =
            item.price * item.quantity +
            (item.setupFee || 0) +
            (item.freightFee || 0);
        }
      }

      // Recalculate totals for current user
      const userItems = state.items.filter(
        (item) => item.userEmail === state.currentUserEmail
      );
      state.totalQuantity = userItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      state.totalAmount = userItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
    },

    clearUserCart: (state) => {
      // Only clear current user's items
      state.items = state.items.filter(
        (item) => item.userEmail !== state.currentUserEmail
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
      const userItems = state.items.filter(item => item.userEmail === email);
      state.totalQuantity = userItems.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = userItems.reduce((sum, item) => sum + item.totalPrice, 0);
    },

    clearCart: () => initialState, // Keep this for complete reset if needed
  },
});

const EMPTY_ITEMS = [];
const selectCartItems = (state) => state.cart?.items || EMPTY_ITEMS;
const selectCurrentUserEmail = (state) => state.cart?.currentUserEmail || "guest@gmail.com";

// Selector to get current user's cart items
export const selectCurrentUserCartItems = createSelector(
  [selectCartItems, selectCurrentUserEmail],
  (items, currentUserEmail) => {
    const guestItems = items.filter((item) => item.userEmail === "guest@gmail.com");

    if (currentUserEmail === "guest@gmail.com") {
      return guestItems;
    }

    const userItems = items.filter((item) => item.userEmail === currentUserEmail);
    return [...guestItems, ...userItems];
  }
);
export const currentUserCartAmount = (state) => {
  const currentUserEmail = state.cart.currentUserEmail || "guest@gmail.com";
  
  // Always include guest items along with user-specific items
  const guestItems = state.cart?.items?.filter(item => item.userEmail === "guest@gmail.com");

    if (currentUserEmail === "guest@gmail.com") {
      return guestItems.length;
    }

    const userItems = state?.cart?.items.filter(
      (item) => item.userEmail === currentUserEmail
    );
    return guestItems.length+userItems.length;
  }

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
