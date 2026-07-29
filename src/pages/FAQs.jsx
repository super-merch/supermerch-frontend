import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/faqs/active`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setFaqs(data.data);
          setError(null);
        } else {
          throw new Error("Invalid response format from server");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("FAQ Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-red-900 mb-4">Error Loading FAQs</h1>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900">Loading FAQs...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Quick answers for shopping, orders and suppliers
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                  className="w-full flex items-center justify-between text-left focus:outline-none"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.question}
                    </h3>
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiChevronDown size={20} className="text-gray-600" />
                    </motion.div>
                  </div>
                </button>

                <motion.div
                  id={`faq-panel-${idx}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 text-gray-700 prose max-w-none">
                    <p>{item.answer}</p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Can\'t find your question? Reach out at{" "}
          <button
            onClick={() => window.open("mailto:Info@supermerch.com.au")}
            className="text-primary hover:underline"
          >
            Info@supermerch.com.au
          </button>
        </div>
      </div>
    </div>
  );
}
