import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// RedeemMailOffer.jsx
// Simple page where users can enter a code received by email to redeem an offer.
// - Minimal UI
// - Shows success / error messages
// - If user has issues they can navigate to the Contact page

export default function MailOffer() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); // 'success' | 'error' | null

  const handleRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setMessageType("error");
      setMessage("Please enter your offer code.");
      return;
    }

    // Simulate API call - replace with your real endpoint
    try {
      setLoading(true);
      setMessage(null);
      setMessageType(null);

      // Example API call:
      // const res = await fetch(`/api/redeem?code=${encodeURIComponent(trimmed)}`, { method: 'POST' });
      // const json = await res.json();
      // if (!res.ok) throw new Error(json?.message || 'Failed to redeem');

      // For demo purposes we accept codes that start with "SM-" as valid
      await new Promise((r) => setTimeout(r, 800));
      if (trimmed.toUpperCase().startsWith("SM-")) {
        setMessageType("success");
        setMessage(
          "Offer redeemed successfully! The discount has been applied to your account."
        );
        setCode("");
      } else {
        setMessageType("error");
        setMessage(
          "Invalid or expired code. Please check the email and try again."
        );
      }
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage(
        "An error occurred while redeeming the code. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Redeem Your Mail Offer
          </h1>
          <p className="text-sm text-gray-500">
            Have an offer code from our email? Enter it below to apply the
            discount to your account.
          </p>
        </div>

        <div className="mt-6">
          <label
            htmlFor="offer-code"
            className="block text-sm font-medium text-gray-700"
          >
            Offer Code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="offer-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code, e.g. SM-2025-ABC"
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleRedeem}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-blue-500"
              }`}
            >
              {loading ? "Redeeming..." : "Redeem"}
            </button>
          </div>

          {message && (
            <div
              className={`mt-4 p-3 rounded-md ${
                messageType === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-6 text-sm text-gray-600">
            <p>
              <strong>Note:</strong> Offer codes are case-insensitive and may be
              valid for a limited time or specific products only.
            </p>
            <p className="mt-2">
              If you have trouble redeeming your code, please visit our{" "}
              <button
                onClick={() => navigate("/contact")}
                className="text-primary hover:underline"
              >
                Contact page
              </button>{" "}
              so our support team can assist.
            </p>
          </div>

          <div className="mt-6 border-t pt-4 text-sm text-gray-500">
            <p>
              By redeeming an offer, you agree to any terms associated with that
              promotion. Some offers may be single-use or restricted to certain
              customer accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
