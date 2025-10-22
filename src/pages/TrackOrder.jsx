import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TrackOrder() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!orderId.trim()) {
      setError("Please enter your Order ID.");
      return;
    }

    // Placeholder behaviour: we'll implement real tracking later
    // For now show a confirmation message and clear the field
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-sm text-gray-500">
            Enter your order ID below to view tracking information. (Feature
            coming soon)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="order-id"
              className="block text-sm font-medium text-gray-700"
            >
              Order ID
            </label>
            <input
              id="order-id"
              name="order-id"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. ORD-123456"
              className="mt-2 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-500 transition"
            >
              Check Status
            </button>

            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="px-4 py-2 border rounded hover:bg-gray-50 transition"
            >
              Need help? Contact us
            </button>
          </div>

          {submitted && (
            <div className="mt-4 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
              <p className="font-medium">Tracking feature coming soon</p>
              <p className="text-sm">
                We received your request for Order ID:{" "}
                <span className="font-mono">{orderId}</span>. We will add live
                tracking shortly — in the meantime use the Contact page for
                urgent order inquiries.
              </p>
            </div>
          )}
        </form>

        <div className="mt-6 text-sm text-gray-500">
          <p>
            Note: For re-ordering go to user admin and find the order you want
            to order again and click on re-order.
          </p>
        </div>
      </div>
    </div>
  );
}
