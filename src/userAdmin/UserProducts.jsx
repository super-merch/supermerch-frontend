import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import { IoMdArrowRoundBack } from "react-icons/io";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";

const UserProducts = () => {
  const {
    userOrder,
    loading
  } = useContext(AuthContext);
  const {newId, setActiveTab, backendUrl, marginApi, marginAdd} = useContext(AppContext);
  useEffect(() => {
    if (!Object.keys(marginApi).length) {
      marginAdd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginApi]);
  
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState({});
  const [reOrderModal, setReOrderModal] = useState(false);
  const [reOrderLoading, setReOrderLoading] = useState(false);
  useEffect(() => {
    console.log(newId);
    const order = userOrder.filter((order) => order._id === newId);
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
      localStorage.setItem("pendingCheckoutData", JSON.stringify(selectedOrder));
      const stripe = await loadStripe(
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
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
        `${backendUrl}/create-checkout-session`,
        body
      );
      const session = await resp.data;

      if (!session.id) {
        setReOrderLoading(false);
        // Clear stored data on error
        localStorage.removeItem("pendingCheckoutData");
        return toast.error(
          "Failed to create payment session. Please try again."
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
    <div className="w-full px-2 lg:px-8 md:px-8">
      {reOrderModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-4 rounded shadow-lg z-50">
            <h2 className="text-lg font-semibold mb-4">Re-order</h2>
            <p className="mb-4">
              Are you sure you want to re-order this order?
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setReOrderModal(false)}
                disabled={reOrderLoading}
                className="px-4 py-2 font-semibold text-white bg-gray-500 rounded hover:bg-gray-600 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleReOrder}
                disabled={reOrderLoading}
                className={`px-4 py-2 font-semibold text-white bg-primary rounded hover:bg-primary/90 ${
                  reOrderLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {reOrderLoading ? "Re-ordering..." : "Re-order"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab("dashboard")}
          className="bg-black flex items-center gap-1 mt-6 text-white w-fit px-3 text-lg py-1.5 hover:bg-red-600 transition duration-75 rounded cursor-pointer uppercase"
        >
          <IoMdArrowRoundBack />
          Back
        </button>
        <div className="mt-6">
          <button
            onClick={() => setReOrderModal(true)}
            className="px-4 py-2 font-semibold text-white bg-primary rounded hover:bg-primary/90"
          >
            Re-order
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="my-8">
        <p className="flex flex-wrap items-center gap-2 font-medium text-gray-800">
          Order{" "}
          <span className="px-2 font-semibold text-black bg-yellow">
            {selectedOrder.orderId}
          </span>{" "}
          was placed on{" "}
          <span className="px-2 font-semibold text-black bg-yellow">
            {new Date(selectedOrder.orderDate).toLocaleDateString()}
          </span>{" "}
          and is currently{" "}
          <span
            className={`${
              selectedOrder.status === "Cancelled"
                ? "text-red-600"
                : "bg-yellow text-black"
            } font-semibold px-2`}
          >
            {selectedOrder.status}
          </span>
        </p>
      </div>

      {/* Order Details Table */}
      <div className="px-3 py-3 border rounded shadow lg:px-6 md:px-6 ">
        <div className="overflow-x-auto ">
          <h2 className="mb-4 text-lg font-semibold">Order Details</h2>
          <table className="w-full border-gray-300">
            <thead className="text-left ">
              <tr>
                <th className="border-gray-300 ">Product</th>
                <th className="text-right border-gray-300 ">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {selectedOrder?.products?.map((product, index) => (
                <tr key={index}>
                  <td>
                    <span className="text-blue-500">{product?.name}</span>{" "}
                    <span className="font-medium text-gray-800">
                      x {product?.quantity}
                    </span>
                    <span className="">
                      <img src={product.image} className="w-20" alt="" />
                    </span>
                  </td>
                  <td className="py-2 text-right border-gray-300">
                    <p>${product?.subTotal?.toFixed(2)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-2 text-gray-600">Sub Total:</td>
                <td className="py-2 font-medium text-right">
                  ${selectedOrder?.total?.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Shipping:</td>
                <td className="py-2 font-medium text-right">
                  ${selectedOrder?.shipping}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Gst:</td>
                <td className="py-2 font-medium text-right">
                  ${selectedOrder?.gst}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Discount:</td>
                <td className="py-2 font-medium text-right">
                  ${selectedOrder?.discount}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Total:</td>
                <td className="py-2 text-lg font-bold text-right">
                  ${selectedOrder?.total?.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ✅ Re-order Button */}
      </div>

      {/* Address Section */}
      <div className="flex flex-wrap justify-between gap-8 px-2 mt-6 mb-8 lg:justify-around md:justify-around sm:justify-around">
        {/* Billing Address */}
        <div>
          <h2 className="mb-2 font-semibold">Billing Address</h2>
          <p className="pb-1">
            {selectedOrder?.user?.firstName} {selectedOrder?.user?.lastName}
          </p>
          <p className="pb-1">{selectedOrder.billingAddress?.companyName}</p>
          <p className="pb-1">{selectedOrder.billingAddress?.addressLine}</p>
          <p className="pb-1">
            {selectedOrder.billingAddress?.city},{" "}
            {selectedOrder.billingAddress?.state}
          </p>
          <p className="pb-1">{selectedOrder.billingAddress?.country}</p>
          <p className="pb-1">{selectedOrder.billingAddress?.postalCode}</p>
          <p className="pb-1">{selectedOrder.user?.email}</p>
          <p>{selectedOrder.user?.phone}</p>
        </div>

        {/* Shipping Address */}
        <div>
          <h2 className="mb-2 font-semibold">Shipping Address</h2>
          <p className="pb-1">
            {selectedOrder?.user?.firstName} {selectedOrder?.user?.lastName}
          </p>
          <p className="pb-1">{selectedOrder?.shippingAddress?.companyName}</p>
          <p className="pb-1">{selectedOrder?.shippingAddress?.addressLine}</p>
          <p className="pb-1">
            {selectedOrder?.shippingAddress?.city},{" "}
            {selectedOrder?.shippingAddress?.state}
          </p>
          <p className="pb-1">{selectedOrder?.shippingAddress?.country}</p>
          <p className="pb-1">{selectedOrder?.shippingAddress?.postalCode}</p>
          <p className="pb-1">{selectedOrder?.user?.email}</p>
          <p>{selectedOrder?.user?.phone}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProducts;
