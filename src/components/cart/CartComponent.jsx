import { selectCurrentUserCartItems } from "@/redux/slices/cartSlice";
import { useContext, useEffect, useMemo, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { FiMinus, FiPlus } from "react-icons/fi";
import { IoArrowBack } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { toProductUrl } from "@/utils/utils";
import { AppContext } from "../../context/AppContext";
import { ProductsContext } from "../../context/ProductsContext";
import RecommendationsStrip from "../Common/RecommendationsStrip";
import useRecommendations from "@/hooks/useRecommendations";
import {
  clearCart,
  decrementQuantity,
  incrementQuantity,
  multipleQuantity,
  removeFromCart,
  updateCartItemQuantity,
} from "../../redux/slices/cartSlice";

const getSetupChargeKey = (item) => {
  const productId = String(item?.id || "").trim();
  if (!productId) return "";
  const printKey = String(item?.printMethodKey || item?.print || "")
    .trim()
    .toLowerCase();
  return `${productId}::${printKey}`;
};

const isDealCartItem = (item) => String(item?.itemType || item?.type || "").toUpperCase() === "DEAL";

const normalizeDealSelectedProducts = (rawSelectedProducts = {}) => {
  if (Array.isArray(rawSelectedProducts)) {
    return rawSelectedProducts.reduce((acc, slot) => {
      acc[slot.slotId] = slot;
      return acc;
    }, {});
  }
  return rawSelectedProducts || {};
};

const getRecommendationSeedIds = (cartItems = []) => {
  const seedIds = [];

  cartItems.forEach((item) => {
    if (isDealCartItem(item)) {
      const selectedProducts = normalizeDealSelectedProducts(item.selectedProducts || {});
      Object.values(selectedProducts).forEach((slotSelection) => {
        const productId = Number(slotSelection?.productId);
        if (Number.isFinite(productId)) seedIds.push(String(productId));
      });
      return;
    }

    const productId = Number(item?.id);
    if (Number.isFinite(productId)) seedIds.push(String(productId));
  });

  return [...new Set(seedIds)];
};

const formatDealSizeSummary = (slotSelection) => {
  const selectedSizes = Array.isArray(slotSelection?.sizes) ? slotSelection.sizes.filter((sizeItem) => Number(sizeItem.quantity || 0) > 0) : [];
  if (selectedSizes.length > 0) {
    return selectedSizes.map((sizeItem) => `${sizeItem.size}: ${sizeItem.quantity}`).join(", ");
  }

  const totalQty = Number(slotSelection?.quantity || 0);
  const fallbackSize = slotSelection?.size || "";
  if (!fallbackSize) return "";
  return `${fallbackSize}: ${totalQty}`;
};

const resolveCartImageUrl = (url) => {
  if (!url) return "/placeholder-product.png";
  if (url.startsWith("http")) return url;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  return `${backendUrl}/${url}`;
};

const CartComponent = () => {
  const { totalDiscount } = useContext(ProductsContext);
  const { shippingCharges, setupFee, gstCharges } = useContext(AppContext);
  const dispatch = useDispatch();
  const items = useSelector(selectCurrentUserCartItems);
  const [value, setValue] = useState("");

  // Coupon states
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [customQuantities, setCustomQuantities] = useState({});

  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const cartProductIds = getRecommendationSeedIds(items);
  const { recommendations: cartRecommendations, recommendationsLoading } =
    useRecommendations({
      backendUrl: API_BASE,
      type: "cart",
      cartProductIds,
      limit: 8,
      enabled: items.length > 0,
    });

  useEffect(() => {
    const quantities = {};
    items.forEach((item) => {
      quantities[item.cartItemId] = item.quantity;
    });
    setCustomQuantities(quantities);
  }, [items]);

  const totalDiscountPercent = items.reduce(
    (sum, item) => sum + (totalDiscount[item.id] || 0),
    0,
  );

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const setupFeeByCartItemId = useMemo(() => {
    const seen = new Set();
    const feeMap = {};

    for (const item of items) {
      const fee = Number(item?.setupFee || item?.customizationData?.pricing?.setupFee || 0);
      if (fee <= 0) {
        feeMap[item.cartItemId] = 0;
        continue;
      }
      const key = getSetupChargeKey(item);
      if (!key || seen.has(key)) {
        feeMap[item.cartItemId] = 0;
        continue;
      }
      seen.add(key);
      feeMap[item.cartItemId] = fee;
    }
    return feeMap;
  }, [items]);

  const normalizedSetupFee = Number(setupFee) || 0;
  const normalizedShipping = Number(shippingCharges) || 0;
  const normalizedGstRate = Number(gstCharges) || 0;
  const normalizedCouponPercent = Number(couponDiscount) || 0;

  const couponBaseAmount = Math.max(totalAmount + normalizedSetupFee, 0);
  const calculatedCouponDiscount =
    (couponBaseAmount * normalizedCouponPercent) / 100;

  const couponDiscountExceedsLimit =
    appliedCoupon?.maxLimitAmount &&
    calculatedCouponDiscount > Number(appliedCoupon.maxLimitAmount);

  const couponDiscountAmount = appliedCoupon?.maxLimitAmount
    ? Math.min(calculatedCouponDiscount, Number(appliedCoupon.maxLimitAmount))
    : calculatedCouponDiscount;

  const amountAfterDiscount = Math.max(
    couponBaseAmount - couponDiscountAmount,
    0,
  );
  const preTaxAmount = amountAfterDiscount + normalizedShipping;

  const gstAmount = (preTaxAmount * normalizedGstRate) / 100;
  const total = preTaxAmount + gstAmount;

  const handleChange = (e) => {
    setValue(e.target.value.toUpperCase());
  };

  // Apply coupon function
  const handleApplyCoupon = async () => {
    if (!value.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (appliedCoupon) {
      toast.error(
        "A coupon is already applied. Remove it first to apply a new one.",
      );
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await fetch(`${API_BASE}/api/coupen/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coupen: value.trim() }),
      });

      const result = await response.json();

      if (response.ok && result.valid) {
        setAppliedCoupon(result.coupon);
        setCouponDiscount(result.discount);

        // Check if the discount will exceed the limit
        const calculatedDiscount = (couponBaseAmount * result.discount) / 100;
        if (
          result.coupon.maxLimitAmount &&
          calculatedDiscount > result.coupon.maxLimitAmount
        ) {
          toast.success(
            `Coupon applied! Discount capped at maximum limit of $${result.coupon.maxLimitAmount.toFixed(
              2,
            )}`,
          );
        } else {
          toast.success(`Coupon applied! You saved ${result.discount}%`);
        }
      } else {
        toast.error(result.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };
  //check if user is logged in
  const [token, setToken] = useState(localStorage.getItem("token"));
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  });

  // Remove coupon function
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setValue("");
    toast.success("Coupon removed successfully");
  };

  // Handle direct input changes
  const handleQuantityChange = (e, cartItemId) => {
    const value = e.target.value;
    setCustomQuantities({
      ...customQuantities,
      [cartItemId]: value === "" ? "" : parseInt(value, 10),
    });
  };

  const handleUpdateCart = () => {
    Object.entries(customQuantities).forEach(([cartItemId, quantity]) => {
      dispatch(
        updateCartItemQuantity({
          cartItemId,
          quantity: Math.max(quantity, 1),
        }),
      );
    });
  };

  const [openModel, setOpenModel] = useState(false);
  const [id, setId] = useState(null);
  const handleRemovefromCart = (item) => {
    setOpenModel(true);
    setId({ cartItemId: item.cartItemId });
  };
  const navigate = useNavigate();

  const slugify = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      // replace any sequence of non-alphanumeric chars with a single hyphen
      .replace(/[^a-z0-9]+/g, "-")
      // remove leading/trailing hyphens
      .replace(/(^-|-$)/g, "");

  const handleViewProduct = (productId, name) => {
    navigate(toProductUrl(name));
  };

  const renderDealSelections = (item) => {
    const deal = item.deal || {};
    const dealSlots = deal?.productSlots || [];
    const selectedProducts = normalizeDealSelectedProducts(item.selectedProducts || {});

    return (
      <div className="space-y-3">
        {dealSlots.map((slot) => {
          const slotSelection = selectedProducts[slot.id] || selectedProducts[String(slot.id)];
          if (!slotSelection) return null;

          const colorSelections = Array.isArray(slotSelection.colorSelections) ? slotSelection.colorSelections : [];
          const totalSelected = colorSelections.reduce((sum, colorSel) => {
            const sizes = Array.isArray(colorSel.sizes) && colorSel.sizes.length > 0
              ? colorSel.sizes
              : [{ size: colorSel.size || "", quantity: colorSel.quantity || 0 }];
            return sum + sizes.reduce((sizeSum, sizeItem) => sizeSum + Number(sizeItem.quantity || 0), 0);
          }, 0);

          return (
            <div key={slot.id} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-800 truncate">{slot.slotName}</span>
                <span className="text-xs font-medium text-gray-500 shrink-0">{totalSelected} selected</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {colorSelections.map((colorSel, index) => {
                  const sizeSummary = formatDealSizeSummary(colorSel);
                  return (
                    <div key={`${slot.id}-${index}`} className="flex flex-wrap items-center gap-2 leading-6">
                      <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 shadow-sm">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorSel.colorHex || "#9ca3af" }} />
                        {colorSel.colorName}
                      </span>
                      {sizeSummary && <span className="text-sm">{sizeSummary}</span>}
                      {colorSel.artwork && colorSel.artwork !== "None" && <span className="text-sm">{colorSel.artwork}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const checkIfLowerThanMoQ = (item) => {
    const lowerMoQ =
      item?.basePrices?.length > 0 ? item?.basePrices?.[0]?.qty : null;
    if (lowerMoQ) {
      return { lowerThanMoQ: item.quantity < lowerMoQ, lowerMoQ: lowerMoQ };
    }
    return { lowerThanMoQ: false, lowerMoQ: null };
  };

  console.log(items);

  return (
    <div className="Mycontainer !mb-10 mt-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-col md:flex-row">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Shopping Cart ({items?.length})
        </h1>
        <div className="flex items-center gap-3 justify-between md:justify-end w-full md:w-auto">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-3 py-2 text-smallHeader border border-smallHeader rounded-lg hover:bg-primary hover:text-white transition-colors font-medium"
          >
            <IoArrowBack className="w-4 h-4" />
            Continue Shopping
          </Link>{" "}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear the cart?")) {
                dispatch(clearCart());
                toast.success("Cart cleared successfully");
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-medium"
          >
            <MdDelete className="w-4 h-4" />
            Clear Cart
          </button>
        </div>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-col gap-6">
          {/* Cart Table - Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Product
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Setup Fee
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Price (per unit)
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Quantity
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Total
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item) => {
                        if (isDealCartItem(item)) {
                          const deal = item.deal || {};
                          const dealName = deal?.title || item.name || "Deal Bundle";
                          const dealImage = resolveCartImageUrl(deal?.bannerImage || item.image);
                          const dealSetupFee = Number(item?.setupFee || item?.customizationData?.pricing?.setupFee || 0);
                          const dealQuantity = Number(item.quantity || 1);
                          const dealUnitPrice = Number(item.price || 0);
                          const dealTotal = (dealUnitPrice * dealQuantity) + dealSetupFee;
                          const selectedProducts = normalizeDealSelectedProducts(item.selectedProducts || {});
                          const totalDealItems = Object.values(selectedProducts).reduce((total, slot) => {
                            return total + (slot?.colorSelections || []).reduce((slotTotal, colorSel) => {
                              const sizes = Array.isArray(colorSel.sizes) && colorSel.sizes.length > 0
                                ? colorSel.sizes
                                : [{ quantity: colorSel.quantity || 0 }];
                              return slotTotal + sizes.reduce((sizeTotal, sizeItem) => sizeTotal + Number(sizeItem.quantity || 0), 0);
                            }, 0);
                          }, 0);

                          return (
                            <tr
                              key={item.cartItemId}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-start space-x-4">
                                  <img
                                    src={dealImage}
                                    alt={dealName}
                                    className="w-40 h-40 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1 capitalize">
                                      {dealName}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                      {deal?.dealCode || item.dealSource?.dealCode || ""}
                                      {totalDealItems > 0 ? ` • ${totalDealItems} items selected` : ""}
                                    </p>
                                    {renderDealSelections(item)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-2xl font-bold text-smallHeader">
                                  ${dealSetupFee.toFixed(2)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-2xl font-bold text-smallHeader">
                                  ${dealUnitPrice.toFixed(2)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center justify-center max-w-[200px]">
                                  <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                    <div className="flex items-center">
                                      <button
                                        onClick={() =>
                                          dispatch(
                                            decrementQuantity({
                                              cartItemId: item.cartItemId,
                                            }),
                                          )
                                        }
                                        className="p-2 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                      >
                                        <FiMinus className="w-4 h-4" />
                                      </button>
                                      <input
                                        type="number"
                                        value={customQuantities[item.cartItemId] || item.quantity}
                                        onChange={(e) =>
                                          dispatch(
                                            multipleQuantity({
                                              cartItemId: item.cartItemId,
                                              quantity: parseInt(e.target.value, 10) || 1,
                                            }),
                                          )
                                        }
                                        className="w-32 py-2 text-center outline-none border-0 bg-transparent font-bold text-2xl"
                                        min="1"
                                      />
                                      <button
                                        onClick={() =>
                                          dispatch(
                                            incrementQuantity({
                                              cartItemId: item.cartItemId,
                                            }),
                                          )
                                        }
                                        className="p-2 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                      >
                                        <FiPlus className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-2xl font-bold text-smallHeader">
                                  ${(dealTotal || 0).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => handleRemovefromCart(item)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                  title="Remove from cart"
                                >
                                  <MdDelete className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        }

                        const subTotal = item.price * item.quantity;
                        const lineSetupFee =
                          setupFeeByCartItemId[item.cartItemId] || 0;
                        const isLowerThanMoQ = checkIfLowerThanMoQ(item);
                        const lowerMoQ = isLowerThanMoQ.lowerMoQ;
                        const lowerThanMoQ = isLowerThanMoQ.lowerThanMoQ;
                        return (
                          <tr
                            key={item.cartItemId}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            {/* Product Info */}
                            <td className="px-6 py-4">
                              <div className="flex items-start space-x-4">
                                <img
                                  onClick={() =>
                                    handleViewProduct(
                                      item.id,
                                      item.slug || item.originalName || item.name
                                    )
                                  }
                                  src={item.image}
                                  alt={item.name}
                                  className="w-40 h-40 cursor-pointer object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3
                                    className="text-xl font-semibold text-gray-900 mb-1 cursor-pointer hover:text-smallHeader transition-colors capitalize"
                                    onClick={() =>
                                        handleViewProduct(
                                          item.id,
                                          item.slug || item.originalName || item.name
                                        )
                                    }
                                  >
                                    {item.name} {item.sample ? "(Sample)" : ""}
                                  </h3>
                                  {item.sku_number && (
                                    <p className="text-sm text-gray-600">
                                      SKU: {item.sku_number}
                                    </p>
                                  )}
                                  <div className="space-y-1 text-sm text-gray-600">
                                    {item.color && (
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        <span>
                                          Color:{" "}
                                          <span className="font-medium text-gray-900">
                                            {item.color}
                                          </span>
                                        </span>
                                      </div>
                                    )}
                                    {item.print && (
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>
                                          Print:{" "}
                                          <span className="font-medium text-gray-900">
                                            {item.print}
                                          </span>
                                        </span>
                                      </div>
                                    )}
                                    {item.adminCustomization && (
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span>
                                          Customization:{" "}
                                          <span className="font-medium text-gray-900">
                                            {item.adminCustomization.applicationMethod}
                                            {" — "}
                                            {item.adminCustomization.applicationType}
                                            {item.adminCustomization.position && (
                                              <> ({item.adminCustomization.position.positionName})</>
                                            )}
                                          </span>
                                        </span>
                                      </div>
                                    )}
                                    {item.size && item.size !== "None" && (
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>
                                          Size:{" "}
                                          <span className="font-medium text-gray-900">
                                            {item.size}
                                          </span>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-6 py-4 text-center">
                              <div className="text-2xl font-bold text-smallHeader">
                                ${lineSetupFee.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-2xl font-bold text-smallHeader">
                                ${item.price.toFixed(2)}
                              </div>
                            </td>

                            {/* Quantity */}
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center justify-center max-w-[200px]">
                                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                  <div className="flex items-center">
                                    <button
                                      onClick={() =>
                                        dispatch(
                                          decrementQuantity({
                                            cartItemId: item.cartItemId,
                                          }),
                                        )
                                      }
                                      disabled={item.sample}
                                      className={`p-2 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors ${item.sample && "cursor-not-allowed"}`}
                                    >
                                      <FiMinus className="w-4 h-4" />
                                    </button>
                                    <input
                                      type="number"
                                      value={
                                        customQuantities[item.cartItemId] ||
                                        item.quantity
                                      }
                                      disabled={item.sample}
                                      onChange={(e) =>
                                        dispatch(
                                          multipleQuantity({
                                            cartItemId: item.cartItemId,
                                            quantity:
                                              parseInt(e.target.value, 10) || 1,
                                          }),
                                        )
                                      }
                                      className={`w-32 py-2 text-center outline-none border-0 bg-transparent font-bold text-2xl ${item.sample && "cursor-not-allowed"}`}
                                      min="1"
                                    />
                                    <button
                                      onClick={() =>
                                        dispatch(
                                          incrementQuantity({
                                            cartItemId: item.cartItemId,
                                          }),
                                        )
                                      }
                                      disabled={item.sample}
                                      className={`p-2 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors ${item.sample && "cursor-not-allowed"}`}
                                    >
                                      <FiPlus className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                {!item?.sample && lowerThanMoQ && (
                                  <div className="text-xs text-red-500 mt-2">
                                    This product has a minimum order quantity of{" "}
                                    {lowerMoQ}. For lower MOQ, please place an
                                    order and we will get back to you.
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Total */}
                            <td className="px-6 py-4 text-center">
                              <div className="text-2xl font-bold text-smallHeader">
                                $
                                {(subTotal + lineSetupFee || 0).toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )}
                              </div>
                            </td>

                            {/* Delete Action */}
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleRemovefromCart(item)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                title="Remove from cart"
                              >
                                <MdDelete className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {items.map((item) => {
                    if (isDealCartItem(item)) {
                      const deal = item.deal || {};
                      const dealName = deal?.title || item.name || "Deal Bundle";
                      const dealImage = resolveCartImageUrl(deal?.bannerImage || item.image);
                      const dealSetupFee = Number(item?.setupFee || item?.customizationData?.pricing?.setupFee || 0);
                      const dealQuantity = Number(item.quantity || 1);
                      const dealUnitPrice = Number(item.price || 0);
                      const dealTotal = (dealUnitPrice * dealQuantity) + dealSetupFee;
                      const selectedProducts = normalizeDealSelectedProducts(item.selectedProducts || {});
                      const totalDealItems = Object.values(selectedProducts).reduce((total, slot) => {
                        return total + (slot?.colorSelections || []).reduce((slotTotal, colorSel) => {
                          const sizes = Array.isArray(colorSel.sizes) && colorSel.sizes.length > 0
                            ? colorSel.sizes
                            : [{ quantity: colorSel.quantity || 0 }];
                          return slotTotal + sizes.reduce((sizeTotal, sizeItem) => sizeTotal + Number(sizeItem.quantity || 0), 0);
                        }, 0);
                      }, 0);

                      return (
                        <div
                          key={item.cartItemId}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                          <div className="flex space-x-3">
                            <img
                              src={dealImage}
                              alt={dealName}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 capitalize">
                                {dealName}
                              </h3>
                              <p className="text-xs text-gray-500 mb-3">
                                {deal?.dealCode || item.dealSource?.dealCode || ""}
                                {totalDealItems > 0 ? ` • ${totalDealItems} items selected` : ""}
                              </p>

                              <div className="space-y-3 mb-4">{renderDealSelections(item)}</div>

                              <div className="flex items-center justify-between">
                                <div className="text-left">
                                  <div className="text-sm font-bold text-smallHeader">
                                    ${dealUnitPrice.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-500">per bundle</div>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                    <div className="flex items-center">
                                      <button
                                        onClick={() =>
                                          dispatch(
                                            decrementQuantity({
                                              cartItemId: item.cartItemId,
                                            }),
                                          )
                                        }
                                        className="p-3 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                      >
                                        <FiMinus className="w-4 h-4" />
                                      </button>
                                      <input
                                        type="number"
                                        value={customQuantities[item.cartItemId] || item.quantity}
                                        onChange={(e) =>
                                          dispatch(
                                            multipleQuantity({
                                              cartItemId: item.cartItemId,
                                              quantity: parseInt(e.target.value, 10) || 1,
                                            }),
                                          )
                                        }
                                        className="w-16 py-2 text-center outline-none border-0 bg-transparent font-bold text-base"
                                        min="1"
                                      />
                                      <button
                                        onClick={() =>
                                          dispatch(
                                            incrementQuantity({
                                              cartItemId: item.cartItemId,
                                            }),
                                          )
                                        }
                                        className="p-3 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                      >
                                        <FiPlus className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleRemovefromCart(item)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                    title="Remove from cart"
                                  >
                                    <MdDelete className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">Total:</span>
                                  <span className="text-lg font-bold text-smallHeader">
                                    ${(dealTotal || 0).toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const subTotal = item.price * item.quantity;
                    const lineSetupFee =
                      setupFeeByCartItemId[item.cartItemId] || 0;
                    return (
                      <div
                        key={item.cartItemId}
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex space-x-3">
                          {/* Product Image */}
                          <img
                            onClick={() =>
                              handleViewProduct(
                                item.id,
                                item.slug || item.originalName || item.name
                              )
                            }
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 cursor-pointer object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex-shrink-0"
                          />

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-base font-semibold text-gray-900 mb-2 cursor-pointer hover:text-smallHeader transition-colors line-clamp-2"
                              onClick={() =>
                                handleViewProduct(
                                  item.id,
                                  item.slug || item.originalName || item.name
                                )
                              }
                            >
                              {item.name}
                            </h3>
                            {item.sku_number && (
                              <p className="text-xs text-gray-500 mb-1">
                                SKU: {item.sku_number}
                              </p>
                            )}

                            {/* Product Attributes */}
                            <div className="space-y-1 text-xs text-gray-600 mb-3">
                              {item.color && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  <span>
                                    Color:{" "}
                                    <span className="font-medium text-gray-900">
                                      {item.color}
                                    </span>
                                  </span>
                                </div>
                              )}
                              {item.print && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>
                                    Print:{" "}
                                    <span className="font-medium text-gray-900">
                                      {item.print}
                                    </span>
                                  </span>
                                </div>
                              )}
                              {Number(item.discountPct || 0) > 0 && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                  <span>
                                    Product Discount:{" "}
                                    <span className="font-medium text-emerald-700">
                                      {Number(item.discountPct).toFixed(2)}%
                                    </span>
                                  </span>
                                </div>
                              )}
                              {item.adminCustomization && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                  <span>
                                    Customization:{" "}
                                    <span className="font-medium text-gray-900">
                                      {item.adminCustomization.applicationMethod}
                                      {" — "}
                                      {item.adminCustomization.applicationType}
                                      {item.adminCustomization.position && (
                                        <> ({item.adminCustomization.position.positionName})</>
                                      )}
                                    </span>
                                  </span>
                                </div>
                              )}
                              {item.size && item.size !== "None" && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span>
                                    Size:{" "}
                                    <span className="font-medium text-gray-900">
                                      {item.size}
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Price and Quantity Row */}
                            <div className="flex items-center justify-between">
                              <div className="text-left">
                                <div className="text-sm font-bold text-smallHeader">
                                  ${item.price.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  per unit
                                </div>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-3">
                                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                  <div className="flex items-center">
                                    <button
                                      onClick={() =>
                                        dispatch(
                                          decrementQuantity({
                                            cartItemId: item.cartItemId,
                                          }),
                                        )
                                      }
                                      className="p-2 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                    >
                                      <FiMinus className="w-3 h-3" />
                                    </button>
                                    <input
                                      type="number"
                                      value={
                                        customQuantities[item.cartItemId] ||
                                        item.quantity
                                      }
                                      onChange={(e) =>
                                        dispatch(
                                          multipleQuantity({
                                            cartItemId: item.cartItemId,
                                            quantity:
                                              parseInt(e.target.value, 10) || 1,
                                          }),
                                        )
                                      }
                                      className="w-12 py-1 text-center outline-none border-0 bg-transparent font-bold text-xs"
                                      min="1"
                                    />
                                    <button
                                      onClick={() =>
                                        dispatch(
                                          incrementQuantity({
                                            cartItemId: item.cartItemId,
                                          }),
                                        )
                                      }
                                      className="p-2 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                    >
                                      <FiPlus className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleRemovefromCart(item)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                  title="Remove from cart"
                                >
                                  <MdDelete className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Total */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">
                                  Total:
                                </span>
                                <span className="text-lg font-bold text-smallHeader">
                                  $
                                  {(
                                    subTotal + lineSetupFee || 0
                                  ).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Checkout Summary */}
            <div className="md:w-1/3 ml-auto mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4">
                <div className="mb-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">
                      Subtotal
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      $
                      {(totalAmount + normalizedSetupFee || 0).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">
                      Shipping
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {items.length > 0
                        ? shippingCharges > 0
                          ? `$${shippingCharges.toFixed(2)}`
                          : "-"
                        : "$0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">
                      Tax (GST {gstCharges}%)
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ${(gstAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  {items.some((item) => Number(item.discountPct || 0) > 0) && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-emerald-700">
                        Product Discounts
                      </span>
                      <span className="text-sm font-semibold text-emerald-700">
                        Included in unit prices
                      </span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-green-600">
                          Coupon Discount
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          -${(couponDiscountAmount || 0).toFixed(2)}
                        </span>
                      </div>

                      {couponDiscountExceedsLimit && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                          <p className="text-xs text-blue-800">
                            ℹ️ Discount capped at maximum limit of $
                            {appliedCoupon.maxLimitAmount.toFixed(2)}{" "}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">
                        Grand Total
                      </span>
                      <span className="text-2xl font-bold text-smallHeader">
                        $
                        {items.length > 0
                          ? (total || 0).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "0.00"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      Coupon Code:
                    </span>
                    {appliedCoupon && (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            couponDiscountExceedsLimit
                              ? "text-blue-600"
                              : "text-green-600"
                          }`}
                        >
                          {appliedCoupon.coupen}{" "}
                          {couponDiscountExceedsLimit
                            ? "(Capped at Max Limit)"
                            : "Applied"}
                        </span>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-red-500 hover:text-red-700 text-sm font-medium underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {!appliedCoupon && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={value}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-smallHeader focus:border-transparent"
                        onChange={handleChange}
                        disabled={isApplyingCoupon}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !value.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
                      >
                        {isApplyingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Checkout Button */}
                <div className="flex justify-end">
                  {total > shippingCharges ? (() => {
                    const allHaveAdminCustomization = items.length > 0 && items.every(
                      (item) => item.adminCustomization
                    );
                    return (
                      <Link
                        to={allHaveAdminCustomization ? "/checkout" : "/upload-artwork"}
                        state={{
                          cartTotal: total,
                          appliedCoupon: appliedCoupon,
                          couponDiscount: couponDiscount,
                          shippingCharges: shippingCharges,
                          setupFee: setupFee,
                          ...(allHaveAdminCustomization && {
                            artworkOption: "admin_customization",
                          }),
                        }}
                        className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center space-x-2"
                      >
                        <span>{allHaveAdminCustomization ? "Proceed to Checkout" : "Proceed to Artwork"}</span>
                        <FaArrowRight className="w-4 h-4" />
                      </Link>
                    );
                  })()
                  : (
                    <button
                      onClick={() => toast.error("Your cart is empty")}
                      className="bg-gray-400 text-white px-8 py-3 rounded-lg font-bold cursor-not-allowed opacity-50"
                    >
                      Check out
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <RecommendationsStrip
            title="Complete Your Order"
            products={cartRecommendations}
            loading={recommendationsLoading}
            maxItems={4}
            keepVisibleWhenEmpty={items.length > 0}
            emptyMessage="No recommendations are available yet for this cart."
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Looks like you haven't added any items to your cart yet. Start
            shopping to fill it up!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      )}
      {openModel && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setOpenModel(false)}
            ></div>

            {/* Modal */}
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Remove Item
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to remove this item from your
                        cart? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={() => {
                    dispatch(removeFromCart(id));
                    setOpenModel(false);
                    setId(null);
                  }}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  Remove Item
                </button>
                <button
                  type="button"
                  onClick={() => setOpenModel(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartComponent;
