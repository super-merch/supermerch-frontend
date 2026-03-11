import React, { useState, useEffect, useContext, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { ProductsContext } from "../context/ProductsContext";
import { AuthContext } from "../context/AuthContext";
import { IoMdArrowRoundBack } from "react-icons/io";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { slugify } from "@/utils/utils";

const UserProducts = () => {
  const { userOrder, loading, user } = useContext(AuthContext);
  const { marginAdd, marginApi } = useContext(ProductsContext);
  const { newId, setActiveTab, backendUrl } = useContext(AppContext);
  useEffect(() => {
    if (!Object.keys(marginApi).length) {
      marginAdd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginApi]);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const reorderStorageKey = orderId
    ? `reorder_modal_open_${orderId}`
    : "reorder_modal_open";

  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderResolveLoading, setOrderResolveLoading] = useState(true);
  const [reOrderModal, setReOrderModal] = useState(false);
  const [reOrderLoading, setReOrderLoading] = useState(false);
  const [editableProducts, setEditableProducts] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const [popupLoading, setPopupLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const resolveOrder = async () => {
      if (!orderId) {
        if (!cancelled) {
          setSelectedOrder(null);
          setOrderResolveLoading(false);
        }
        return;
      }

      if (loading) {
        if (!cancelled) setOrderResolveLoading(true);
        return;
      }

      const localMatch = (userOrder || []).find(
        (order) => String(order?._id) === String(orderId),
      );

      if (localMatch) {
        if (!cancelled) {
          setSelectedOrder(localMatch);
          setOrderResolveLoading(false);
        }
        return;
      }

      if (!cancelled) setOrderResolveLoading(true);

      try {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { token } } : undefined;
        const { data } = await axios.get(
          `${backendUrl}/api/checkout/products/${orderId}`,
          config,
        );
        const fetchedOrder = data?.data?.[0] || null;
        if (!cancelled) setSelectedOrder(fetchedOrder);
      } catch (error) {
        if (!cancelled) setSelectedOrder(null);
      } finally {
        if (!cancelled) setOrderResolveLoading(false);
      }
    };

    resolveOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId, userOrder, loading, backendUrl]);

  const getPriceForQuantity = (quantity, priceBreaks) => {
    if (!priceBreaks?.length) return 0;
    const sorted = [...priceBreaks].sort((a, b) => a.qty - b.qty);
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (quantity >= sorted[i].qty) return sorted[i].price;
    }
    return sorted[0]?.price || 0;
  };

  const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

  const extractSizesFromProduct = (productData) => {
    const details = productData?.product?.details || [];
    const detailString =
      details.find((d) =>
        ["sizing", "sizes", "size", "product sizes"].includes(
          String(d?.name || "").toLowerCase()
        )
      )?.detail || "";

    const headerSizes = String(detailString)
      .split("\n")[0]
      .split(/[|, ;:]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (headerSizes.length) return headerSizes;

    const description = productData?.product?.description || "";
    const sizesMatch = description.match(/Sizes:\s*([^\n]+)/i);
    if (!sizesMatch) return [];

    const sizesString = sizesMatch[1].trim();
    if (sizesString.includes(" - ")) {
      const [start, end] = sizesString.split(" - ").map((s) => s.trim());
      const startIndex = SIZE_ORDER.indexOf(start);
      const endIndex = SIZE_ORDER.indexOf(end);
      if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
        return SIZE_ORDER.slice(startIndex, endIndex + 1);
      }
    }

    return sizesString
      .split(/[|, ;:]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };


  const getColorsFromProduct = (productData) => {
    if (!productData?.product?.colours?.list) return [];
    return productData.product.colours.list
      .flatMap((colorObj) => colorObj.colours)
      .filter((color, index, array) => array.indexOf(color) === index);
  };

  const getPrintMethods = (productData) => {
    const priceGroups = productData?.product?.prices?.price_groups || [];
    if (!priceGroups.length) return [];

    const appaTypes = Object.keys(
      productData?.product?.categorisation?.appa_product_type || {}
    ).map((k) => k.toLowerCase());

    const typeGroup = String(
      productData?.product?.categorisation?.promodata_product_type?.type_group_name || ""
    ).toLowerCase();

    const isClothingLike =
      appaTypes.includes("clothing") ||
      typeGroup.includes("cloth") ||
      typeGroup.includes("workwear");

    const supplier = String(productData?.supplier?.supplier || "");

    if (isClothingLike) {
      const methods = [
        { key: "pocket-size-front-print", description: "Pocket size Front print" },
        { key: "pocket-size-front-embroidery", description: "Pocket size Front embroidery" },
        { key: "big-print-in-back", description: "Big Print in Back" },
        { key: "pocket-front-big-back", description: "Pocket size front + Big print back" },
        { key: "unbranded", description: "Unbranded" },
      ];
      return supplier === "AS Colour"
        ? methods.filter((m) => m.key !== "unbranded")
        : methods;
    }

    const groupMethods = priceGroups
      .map((group, groupIndex) => {
        const label =
          group?.description?.trim() ||
          group?.promodata_decoration?.trim() ||
          "";
        if (!label) return null;
        return { key: group?.key || `group-${groupIndex}-${label}`, description: label };
      })
      .filter(Boolean);

    const additionMethods = priceGroups.flatMap((group, groupIndex) =>
      (group?.additions || []).map((add, addIndex) => {
        const label =
          add?.description?.trim() ||
          add?.promodata_decoration?.trim() ||
          "";
        if (!label) return null;
        return {
          key: add?.key || `add-${groupIndex}-${addIndex}-${label}`,
          description: label,
        };
      })
    ).filter(Boolean);

    const seen = new Set();
    return [...groupMethods, ...additionMethods].filter((m) => {
      const k = m.description.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

const openReOrderModal = useCallback(async () => {
  if (!selectedOrder?._id) return;

  sessionStorage.setItem(reorderStorageKey, "1");

  setReOrderModal(true);
  setPopupLoading(true);
  setEditableProducts((selectedOrder?.products || []).map((p) => ({ ...p })));

  try {
    const ids = [...new Set((selectedOrder?.products || []).map((p) => p.id))];
    const details = {};
    await Promise.all(
      ids.map(async (id) => {
        const { data } = await axios.get(`${backendUrl}/api/single-product/${id}`);
        details[id] = data.data;
      })
    );
    setProductDetails(details);
  } catch (err) {
    console.error("Failed to fetch product details:", err);
    toast.error("Failed to load product details.")
  }
  setPopupLoading(false);
}, [selectedOrder, backendUrl, reorderStorageKey]);

const closeReOrderModal = useCallback(() => {
  sessionStorage.removeItem(reorderStorageKey);
  setReOrderModal(false);
}, [reorderStorageKey]);

useEffect(() => {
  if (
    selectedOrder?._id &&
    !reOrderModal &&
    !popupLoading &&
    sessionStorage.getItem(reorderStorageKey) === "1"
  ) {
    openReOrderModal();
  }
}, [
  selectedOrder?._id,
  reOrderModal,
  popupLoading,
  openReOrderModal,
  reorderStorageKey,
]);


const updateEditableProduct = (index, field, value) => {
  setEditableProducts((prev) => {
    const updated = [...prev];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "quantity") {
      const detail = productDetails[updated[index].id];
      if (detail) {
        const baseGroup = detail.product?.prices?.price_groups?.find(
          (g) => g.base_price
        );
        const priceBreaks = baseGroup?.base_price?.price_breaks || [];
        const unitPrice = getPriceForQuantity(Number(value), priceBreaks);
        updated[index].price = unitPrice;
        updated[index].subTotal = unitPrice * Number(value);
      }
    }
    return updated;
  });
};

const removeEditableProduct = (index) => {
  setEditableProducts((prev) => prev.filter((_, i) => i !== index));
};

const getEditableProductTotal = () => {
  const subtotal = editableProducts.reduce((sum, p) => sum + (p.subTotal || 0), 0);
  return subtotal;
};


const handleReOrder = async () => {
  if (editableProducts.length === 0) {
    return toast.error("No products to re-order.")
  }
  setReOrderLoading(true);
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/signup");
    return toast.error("Please login to re-order.");
  }
  try {
    localStorage.setItem(
      "pendingCheckoutData", JSON.stringify({ ...selectedOrder, products: editableProducts }),
    );
    const stripe = await loadStripe(
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    );
    const body = {
      products: editableProducts.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        quantity: p.quantity,
        price: p.price,
        subTotal: p.subTotal,
        discount: p.discount || 0,
        color: p.color,
        print: p.print,
        logoColor: p.logoColor,
        logo: p.logo,
      })),
      gst: selectedOrder.gst,
      shipping: selectedOrder.shipping,
      setupFee: selectedOrder.setupFee,
      coupon: null,
      gstPercent: selectedOrder.gstPercent || 10,
    };

    const resp = await axios.post(
      `${backendUrl}/api/create-checkout-session`,
      body,
    );
    const session = await resp.data;
    if (!session.id) {
      setReOrderLoading(false);
      localStorage.removeItem("pendingCheckoutData");
      return toast.error(
        "Failed to create payment session. Please try again."
      );
    }
    setReOrderLoading(false);
    await stripe.redirectToCheckout({ sessionId: session.id });
  } catch (err) {
    console.error("Re-order failed:", err.response?.data || err.message);
    toast.error("Re-order failed. Try again.")
  } finally {
    setReOrderLoading(false);
    closeReOrderModal();
  }
};


if (loading || orderResolveLoading) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      <p className="ml-4 text-lg font-semibold">Loading checkout data...</p>
    </div>
  );
}

if (!selectedOrder?._id) {
  return <div>No checkout data available for this order.</div>;
}

return (
  <div className="w-full px-3 lg:px-8 md:px-6 py-4 space-y-6">
    {/* Header: Back + Re-order */}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        onClick={() => setActiveTab("dashboard")}
        className="inline-flex items-center gap-2 px-3 py-2 mt-2 text-sm font-semibold text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <IoMdArrowRoundBack className="w-4 h-4" />
        Back to dashboard
      </button>
      <button
        onClick={openReOrderModal}
        className="inline-flex items-center gap-2 px-4 py-2 mt-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
      >
        Re-order this order
      </button>
    </div>

    {/* Order summary card */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Order Summary
          </p>
          <p className="text-sm text-gray-700">
            Order{" "}
            <span className="font-semibold text-gray-900">
              #{selectedOrder.orderId?.slice(-8)?.toUpperCase()}
            </span>{" "}
            placed on{" "}
            <span className="font-semibold text-gray-900">
              {selectedOrder.orderDate
                ? new Date(selectedOrder.orderDate).toLocaleDateString()
                : "-"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status</span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedOrder.status === "Cancelled"
              ? "bg-red-100 text-red-700"
              : selectedOrder.status === "completed" ||
                selectedOrder.status === "delivered"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-800"
              }`}
          >
            {selectedOrder.status || "Pending"}
          </span>
        </div>
      </div>
    </div>

    {/* Main content: Order details + totals + addresses */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: products + totals */}
      <div className="lg:col-span-2 space-y-6">
        {/* Order items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Items in this order
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">
                    Product
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">
                    Details
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-gray-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedOrder?.products?.map((product, index) => {
                  const encodedId = btoa(product?.id);
                  const slug = slugify(product?.name);
                  return (
                    <tr key={index} className="align-top">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              className="w-16 h-16 rounded border object-cover"
                              alt={product?.name || "Product image"}
                            />
                          )}
                          <div>
                            <Link
                              to={`/product/${encodeURIComponent(slug)}?ref=${encodedId}`}
                            >
                              <p className="font-medium text-gray-900 hover:text-primary cursor-pointer">
                                {product?.name}
                              </p>
                            </Link>
                            {product?.color && (
                              <p className="text-xs text-gray-500">
                                Color: {product.color}
                              </p>
                            )}
                            {product?.print && (
                              <p className="text-xs text-gray-500">
                                Print: {product.print}
                              </p>
                            )}
                            {product?.size && (
                              <p className="text-xs text-gray-500">
                                Size: {product.size}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700">
                        <p>
                          Quantity:{" "}
                          <span className="font-semibold">
                            {product?.quantity}
                          </span>
                        </p>
                        {product?.logoColor && (
                          <p className="text-xs text-gray-500">
                            Artwork: {product.logoColor}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-medium text-gray-900">
                        ${product?.subTotal?.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Artwork Information
          </h2>
          <p className="text-sm text-gray-700">
            <span className="font-semibold capitalize">
              {selectedOrder?.artworkOption}
            </span>{" "}
            : {selectedOrder?.artworkMessage}
          </p>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Payment summary (
            <span className="text-green-500">
              {selectedOrder?.paymentStatus === "Paid" ? "paid" : "pending"}
            </span>
            )
          </h2>
          <table className="w-full text-sm">
            <tbody className="text-gray-700">
              <tr>
                <td className="py-1.5">Subtotal</td>
                <td className="py-1.5 text-right font-medium">
                  ${selectedOrder?.total?.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-1.5">Shipping</td>
                <td className="py-1.5 text-right font-medium">
                  $
                  {selectedOrder?.shipping?.toFixed?.(2) ??
                    selectedOrder?.shipping}
                </td>
              </tr>
              <tr>
                <td className="py-1.5">GST</td>
                <td className="py-1.5 text-right font-medium">
                  ${selectedOrder?.gst?.toFixed?.(2) ?? selectedOrder?.gst}
                </td>
              </tr>
              <tr>
                <td className="py-1.5">Discount</td>
                <td className="py-1.5 text-right font-medium">
                  $
                  {selectedOrder?.discount?.toFixed?.(2) ??
                    selectedOrder?.discount}
                </td>
              </tr>
              <tr>
                <td className="pt-2 text-sm font-semibold text-gray-900">
                  Total paid
                </td>
                <td className="pt-2 text-right text-lg font-bold text-gray-900">
                  ${selectedOrder?.total?.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: addresses */}
      <div className="space-y-6">
        {/* Billing Address */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Billing address
          </h2>
          <address className="not-italic text-sm text-gray-700 space-y-1">
            <p>
              <span className="text-gray-500">Name:</span>{" "}
              {selectedOrder?.user?.firstName} {selectedOrder?.user?.lastName}
            </p>
            {selectedOrder.billingAddress?.companyName && (
              <p>
                <span className="text-gray-500">Company Name:</span>{" "}
                {selectedOrder.billingAddress.companyName}
              </p>
            )}
            {selectedOrder.billingAddress?.addressLine && (
              <p>
                <span className="text-gray-500">Address:</span>{" "}
                {selectedOrder.billingAddress.addressLine}
              </p>
            )}
            {selectedOrder.billingAddress?.city && (
              <p>
                <span className="text-gray-500">City:</span>{" "}
                {selectedOrder.billingAddress.city}
              </p>
            )}
            {selectedOrder.billingAddress?.state && (
              <p>
                <span className="text-gray-500">State:</span>{" "}
                {selectedOrder.billingAddress.state}
              </p>
            )}
            {selectedOrder.billingAddress?.postalCode && (
              <p>
                <span className="text-gray-500">Postal Code:</span>{" "}
                {selectedOrder.billingAddress.postalCode}
              </p>
            )}
            {selectedOrder.billingAddress?.country && (
              <p>
                <span className="text-gray-500">Country:</span>{" "}
                {selectedOrder.billingAddress.country}
              </p>
            )}
            {selectedOrder.user?.email && (
              <p>
                <span className="text-gray-500">Email:</span>{" "}
                {selectedOrder.user.email}
              </p>
            )}
            {selectedOrder.user?.phone && (
              <p>
                <span className="text-gray-500">Phone:</span>{" "}
                {selectedOrder.user.phone}
              </p>
            )}
          </address>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Shipping address
          </h2>
          <address className="not-italic text-sm text-gray-700 space-y-1">
            <p>
              <span className="text-gray-500">Name:</span>{" "}
              {selectedOrder?.user?.firstName} {selectedOrder?.user?.lastName}
            </p>
            {selectedOrder.shippingAddress?.companyName && (
              <p>
                <span className="text-gray-500">Company Name:</span>{" "}
                {selectedOrder.shippingAddress.companyName}
              </p>
            )}
            {selectedOrder.shippingAddress?.addressLine && (
              <p>
                <span className="text-gray-500">Address:</span>{" "}
                {selectedOrder.shippingAddress.addressLine}
              </p>
            )}
            {selectedOrder.shippingAddress?.city && (
              <p>
                <span className="text-gray-500">City:</span>{" "}
                {selectedOrder.shippingAddress.city}
              </p>
            )}
            {selectedOrder.shippingAddress?.state && (
              <p>
                <span className="text-gray-500">State:</span>{" "}
                {selectedOrder.shippingAddress.state}
              </p>
            )}
            {selectedOrder.shippingAddress?.postalCode && (
              <p>
                <span className="text-gray-500">Postal Code:</span>{" "}
                {selectedOrder.shippingAddress.postalCode}
              </p>
            )}
            {selectedOrder.shippingAddress?.country && (
              <p>
                <span className="text-gray-500">Country:</span>{" "}
                {selectedOrder.shippingAddress.country}
              </p>
            )}
            {selectedOrder.user?.email && (
              <p>
                <span className="text-gray-500">Email:</span>{" "}
                {selectedOrder.user.email}
              </p>
            )}
            {selectedOrder.user?.phone && (
              <p>
                <span className="text-gray-500">Phone:</span>{" "}
                {selectedOrder.user.phone}
              </p>
            )}
          </address>
        </div>
      </div>
    </div>
    {/* Re-order editable modal */}
    {reOrderModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => !reOrderLoading && !popupLoading && closeReOrderModal()}
          aria-hidden="true"
        />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 pt-6 pb-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Edit & Re-order
            </h2>
            <button
              onClick={() => !reOrderLoading && !popupLoading && closeReOrderModal()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close re-order modal"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 overflow-y-auto flex-1">
            {popupLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-gray-500">Loading product details...</p>
              </div>
            ) : editableProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No products in this order.</p>
            ) : (
              <div className="space-y-4">
                {editableProducts.map((product, index) => {
                  const detail = productDetails[product.id];
                  const colors = detail ? getColorsFromProduct(detail) : [];
                  const parsedSizes = detail ? extractSizesFromProduct(detail) : [];
                  const sizes =
                    parsedSizes.length > 0 ? parsedSizes : product.size ? [product.size] : [];

                  const parsedPrintMethods = detail ? getPrintMethods(detail) : [];
                  const printMethods =
                    parsedPrintMethods.length > 0
                      ? parsedPrintMethods
                      : product.print
                        ? [{ key: "existing-print", description: product.print }]
                        : [];

                  return (
                    <div key={index} className="border rounded-lg p-4 relative">
                      {/* Remove button */}
                      {editableProducts.length > 1 && (
                        <button
                          onClick={() => removeEditableProduct(index)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove product"
                        >
                          ✕
                        </button>
                      )}

                      {/* Product header */}
                      <div className="flex items-center gap-3 mb-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-14 h-14 rounded border object-cover"
                          />
                        )}
                        <p className="font-medium text-gray-900 text-sm pr-6">{product.name}</p>
                      </div>

                      {/* Editable fields */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Quantity */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => updateEditableProduct(index, "quantity", e.target.value)}
                            className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>

                        {/* Color */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Color</label>
                          {colors.length > 0 ? (
                            <select
                              value={product.color || ""}
                              onChange={(e) => updateEditableProduct(index, "color", e.target.value)}
                              className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                              {!colors.includes(product.color) && (
                                <option value={product.color}>{product.color || "None"}</option>
                              )}
                              {colors.map((color) => (
                                <option key={color} value={color}>{color}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={product.color || "None"}
                              disabled
                              className="w-full border rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-400"
                            />
                          )}
                        </div>

                        {/* Print Method */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Print</label>
                          {printMethods.length > 0 ? (
                            <select
                              value={product.print || ""}
                              onChange={(e) => updateEditableProduct(index, "print", e.target.value)}
                              className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                              {product.print &&
                                !printMethods.some((m) => m.description === product.print) && (
                                  <option value={product.print}>{product.print}</option>
                                )}
                              {printMethods.map((method) => (
                                <option key={method.key || method.description} value={method.description}>
                                  {method.description}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={product.print || "None"}
                              disabled
                              className="w-full border rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-400"
                            />
                          )}
                        </div>

                        {/* Size */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Size</label>
                          {sizes.length > 0 ? (
                            <select
                              value={product.size || ""}
                              onChange={(e) => updateEditableProduct(index, "size", e.target.value)}
                              className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                              {!sizes.includes(product.size) && product.size && (
                                <option value={product.size}>{product.size}</option>
                              )}
                              {sizes.map((size) => (
                                <option key={size} value={size}>{size}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={product.size || "None"}
                              disabled
                              className="w-full border rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-400"
                            />
                          )}
                        </div>
                      </div>

                      {/* Price row */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          Unit: ${product.price?.toFixed(2)} × {product.quantity}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ${product.subTotal?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with totals */}
          {!popupLoading && editableProducts.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${getEditableProductTotal().toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">${selectedOrder?.shipping?.toFixed?.(2) ?? selectedOrder?.shipping}</span>
              </div>
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-gray-600">GST</span>
                <span className="font-medium">${selectedOrder?.gst?.toFixed?.(2) ?? selectedOrder?.gst}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  ${(getEditableProductTotal() + (selectedOrder?.shipping || 0) + (selectedOrder?.gst || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={closeReOrderModal}
                  disabled={reOrderLoading}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReOrder}
                  disabled={reOrderLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {reOrderLoading ? "Re-ordering..." : "Confirm Re-order"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
};

export default UserProducts;
