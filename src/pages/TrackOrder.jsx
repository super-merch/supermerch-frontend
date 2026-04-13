import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "@/context/AppContext";
import {
  FaBox,
  FaCheckCircle,
  FaCog,
  FaTruck,
  FaHome,
  FaClock,
  FaExternalLinkAlt,
} from "react-icons/fa";

const STATUS_STEPS = [
  { key: "PENDING", label: "Pending", icon: FaClock },
  { key: "CONFIRMED", label: "Confirmed", icon: FaCheckCircle },
  { key: "PROCESSING", label: "Processing", icon: FaCog },
  { key: "DISPATCHED", label: "Dispatched", icon: FaTruck },
  { key: "DELIVERED", label: "Delivered", icon: FaHome },
];

const normalizeStatus = (s) => (s || "").toUpperCase().replace(/\s+/g, "_");

const OrderStatusTimeline = ({ currentStatus, statusHistory = [] }) => {
  const normalized = normalizeStatus(currentStatus);
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === normalized);

  return (
    <div className="flex items-center justify-between w-full my-6">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i < currentIdx;
        const isCurrent = i === currentIdx;
        const Icon = step.icon;

        // Find the date this status was reached
        const historyEntry = statusHistory.find(
          (h) => normalizeStatus(h.status) === step.key
        );

        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {/* Connector line */}
            {i > 0 && (
              <div
                className={`absolute top-5 -left-1/2 w-full h-0.5 ${
                  i <= currentIdx ? "bg-green-500" : "bg-gray-300"
                }`}
                style={{ zIndex: 0 }}
              />
            )}
            {/* Icon circle */}
            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted
                  ? "bg-green-500 text-white"
                  : isCurrent
                    ? "bg-blue-500 text-white ring-4 ring-blue-200"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span
              className={`mt-2 text-xs font-medium text-center ${
                isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
            {historyEntry?.date && (
              <span className="text-[10px] text-gray-400">
                {new Date(historyEntry.date).toLocaleDateString()}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function TrackOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { backendUrl } = useContext(AppContext);
  const [orderId, setOrderId] = useState(searchParams.get("order") || "");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [autoTracked, setAutoTracked] = useState(false);

  // Auto-track if order param was provided in URL
  useEffect(() => {
    if (orderId && !autoTracked) {
      setAutoTracked(true);
      handleTrack(orderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrack = async (orderNum) => {
    setError("");
    setOrderData(null);
    if (!orderNum.trim()) {
      setError("Please enter your Order ID.");
      return;
    }
    setLoading(true);
    try {
      const params = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : "";
      const { data } = await axios.get(
        `${backendUrl}/api/user-orders/track/${orderNum.trim()}${params}`
      );
      if (data.success) {
        setOrderData(data.data);
      } else {
        setError(data.message || "Order not found");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Order not found. Please check your details.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleTrack(orderId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Search form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Track Your Order
            </h1>
            <p className="text-sm text-gray-500">
              Enter your order number to view its current status and tracking details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="order-id" className="block text-sm font-medium text-gray-700">
                  Order Number *
                </label>
                <input
                  id="order-id"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. SM000001"
                  className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email (optional)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition disabled:opacity-50"
              >
                {loading ? "Searching..." : "Track Order"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/contact")}
                className="px-4 py-2 border rounded hover:bg-gray-50 transition"
              >
                Need help?
              </button>
            </div>
          </form>
        </div>

        {/* Order result */}
        {orderData && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Order header */}
            <div className="flex flex-wrap justify-between items-start mb-6 pb-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Order #{orderData.orderNumber}
                </h2>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(orderData.orderDate).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  normalizeStatus(orderData.status) === "DELIVERED"
                    ? "bg-green-100 text-green-800"
                    : normalizeStatus(orderData.status) === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                }`}
              >
                {orderData.status}
              </span>
            </div>

            {/* Estimated delivery */}
            {orderData.estimatedDeliveryDate && (
              <p className="text-sm text-gray-600 mb-4">
                Estimated Delivery:{" "}
                <span className="font-medium">
                  {new Date(orderData.estimatedDeliveryDate).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </p>
            )}

            {/* Shipping address */}
            {orderData.shippingAddress && (
              <p className="text-sm text-gray-500 mb-4">
                Shipping to: {orderData.shippingAddress.city}, {orderData.shippingAddress.state}
              </p>
            )}

            {/* Status timeline (uses order-level status) */}
            <OrderStatusTimeline
              currentStatus={orderData.status}
              statusHistory={orderData.items?.[0]?.statusHistory || []}
            />

            {/* Items */}
            <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Items</h3>
            <div className="space-y-4">
              {orderData.items?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                    <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <span>Qty: {item.quantity}</span>
                      {item.size && item.size !== "None" && <span>Size: {item.size}</span>}
                      {item.color && item.color !== "None" && <span>Color: {item.color}</span>}
                      {item.print && item.print !== "None" && <span>Print: {item.print}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          normalizeStatus(item.status) === "DELIVERED"
                            ? "bg-green-100 text-green-700"
                            : normalizeStatus(item.status) === "DISPATCHED"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.trackingLink && (
                        <a
                          href={item.trackingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          Track Shipment <FaExternalLinkAlt className="w-3 h-3" />
                        </a>
                      )}
                      {item.trackingNumber && !item.trackingLink && (
                        <span className="text-xs text-gray-500">
                          Tracking #: {item.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
