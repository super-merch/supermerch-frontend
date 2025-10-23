import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

const TOPICS = [
  {
    title: "Ordering & Checkout",
    desc: "How to place orders, payment methods, and checkout tips.",
  },
  {
    title: "Shipping & Delivery",
    desc: "Estimated delivery times, tracking, and shipping charges.",
  },
  {
    title: "Returns & Refunds",
    desc: "How to request returns, refunds, and eligibility rules.",
  },
  {
    title: "Payment & Security",
    desc: "Accepted payment methods and security practices.",
  },
  {
    title: "Artwork & Print Files",
    desc: "File requirements, proofs, and templates for custom items.",
  },
  {
    title: "Wholesale & Bulk Orders",
    desc: "Pricing, minimums, and how to request a quote.",
  },
  {
    title: "Suppliers & Product Sourcing",
    desc: "How suppliers are listed and how to contact them.",
  },
  {
    title: "Account Settings",
    desc: "Managing your profile, addresses, and order history.",
  },
];

export default function HelpCenter() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const results = TOPICS.filter((t) => {
    if (!query.trim()) return true;
    return (
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.desc.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Help Center
          </h1>
          <p className="text-sm text-gray-500">
            Find answers to common questions or contact us if you need more
            help.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <label htmlFor="help-search" className="sr-only">
            Search help
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <FiSearch className="text-gray-400" />
            </span>
            <input
              id="help-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help topics, e.g. 'refunds', 'shipping'..."
              className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {results.map((t, idx) => (
            <div key={idx} className="p-4 border rounded hover:shadow-sm">
              <h3 className="font-medium text-gray-900">{t.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{t.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-700">Can\'t find what you need?</p>
            <p className="text-sm text-gray-500">
              We don\'t include a message form here — please use the Contact
              page so we can route your request to the right team.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/contact")}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary transition"
            >
              Go to Contact Page
            </button>

            <button
              onClick={() => navigate("/faqs")}
              className="px-4 py-2 border rounded hover:bg-gray-50 transition"
            >
              Browse FAQs
            </button>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <strong>Response time:</strong> Our team typically responds within 48
          hours. For urgent order issues include your order number in the
          Contact form.
        </div>
      </div>
    </div>
  );
}
