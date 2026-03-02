import React, { useState, useEffect, useContext } from "react";
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
  const { userOrder, loading } = useContext(AuthContext);
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

  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState({});
  const [reOrderModal, setReOrderModal] = useState(false);
  const [reOrderLoading, setReOrderLoading] = useState(false);
  useEffect(() => {
    const order = userOrder.filter((order) => order._id === orderId);
    setSelectedOrder(order[0]);
  }, [userOrder]);
  const handleReOrder = async () => {
    setReOrderLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signup");
      return toast.error("Please login to re-order.");
    }
    try {
      localStorage.setItem(
        "pendingCheckoutData",
        JSON.stringify(selectedOrder),
      );
      const stripe = await loadStripe(
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      );
      const body = {
        products: selectedOrder.products.map((p) => ({
          id: p.id,
          name: p.name,
          image: p.image,
          quantity: p.quantity,
          price: p.price,
          subTotal: p.subTotal,
          discount: p.discount,
          color: p.color,
          print: p.print,
          logoColor: p.logoColor,
          logo: p.logo,
        })),
        gst: selectedOrder.gst,
        shipping: selectedOrder.shipping,
        setupFee: selectedOrder.setupFee,
        coupon: null,
        gstPercent: selectedOrder.gst,
      };

      const resp = await axios.post(
        `${backendUrl}/api/create-checkout-session`,
        body,
      );
      const session = await resp.data;

      if (!session.id) {
        setReOrderLoading(false);
        // Clear stored data on error
        localStorage.removeItem("pendingCheckoutData");
        return toast.error(
          "Failed to create payment session. Please try again.",
        );
      }
      setReOrderLoading(false);
      // Redirect to Stripe Checkout
      await stripe.redirectToCheckout({
        sessionId: session.id,
      });
    } catch (err) {
      console.error("Re-order failed:", err.response?.data || err.message);
      toast.error("Re-order failed. Try again.");
    } finally {
      setReOrderLoading(false);
      setReOrderModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        <p className="ml-4 text-lg font-semibold">Loading checkout data...</p>
      </div>
    );
  }

  if (!selectedOrder) {
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
          onClick={() => setReOrderModal(true)}
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
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                selectedOrder.status === "Cancelled"
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
                    -$
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
      {/* Re-order confirmation modal */}
      {reOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !reOrderLoading && setReOrderModal(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 pt-6 pb-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirm Re-order
              </h2>
              <button
                onClick={() => !reOrderLoading && setReOrderModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close re-order modal"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                This will create a new checkout session with the same items,
                quantities and configuration as this order.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setReOrderModal(false)}
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
        </div>
      )}
    </div>
  );
};

export default UserProducts;
