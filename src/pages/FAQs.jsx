import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

// Simple, accessible FAQ accordion for Super Merch
// - Only one item opens at a time
// - Tailwind styling to match your PrivacyPolicy page look
// - framer-motion used for smooth height/opacity transition

const FAQS = [
  {
    q: "How many product categories do you have?",
    a: "We carry hundreds of categories across many departments — from groceries to electronics. Use the category menu or the search bar to quickly find the area you need.",
  },
  {
    q: "How do I filter products by price, supplier or other attributes?",
    a: "Use the filters on the left (desktop) or the filter button (mobile). You can filter by price range, supplier, brand, rating, and more. Combine multiple filters to narrow results instantly.",
  },
  {
    q: "Can I buy samples or small quantities?",
    a: "Yes — many suppliers offer sample or small-quantity options. Look for the 'Buy Sample' button on the product page. Sample pricing and availability depend on the supplier.",
  },
  {
    q: "How do shipping charges work?",
    a: "Shipping charges are fixed and vary time to time.",
  },
  {
    q: "What is your returns & refund policy?",
    a: "We accept returns for most items within 14 days of delivery, provided the product is unused and in original packaging. Visit our Returns page for step-by-step instructions and exceptions (like perishables).",
  },
  {
    q: "Do you support bulk orders or wholesale pricing?",
    a: "Yes — for bulk purchases we offer tiered pricing. Contact the supplier directly from the product page or reach out to our Sales team for personalized quotes.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept major credit and debit cards, trusted payment gateways (Stripe/PayPal or others configured), and sometimes bank transfers for large orders. All payment data is handled securely by our processors.",
  },
  {
    q: "How can I track my order?",
    a: "After dispatch you can track you order from our website in 'Track Order' page and adding the order id.",
  },
  {
    q: "I can't find a product or supplier — what now?",
    a: "Use the global search (type keywords), try different filters, or contact our support team with the product name — we'll help locate it or suggest alternatives.",
  },
  {
    q: "How do coupons and discounts work?",
    a: "Apply coupon codes at checkout. You can add coupon and get the discount applied for that coupon.",
  },
  {
    q: "How do you protect my personal and payment data?",
    a: "We never store full card details on our servers. Payments are processed via secure, PCI-compliant gateways and data transmissions use SSL/TLS encryption. For more details, refer to our Privacy Policy.",
  },
  {
    q: "How can I contact support?",
    a: "You can reach us via the Contact page, email at Info@supermerch.com.au, or through the in-app chat. Typical response time is within 48 hours.",
  },
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

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
          {FAQS.map((item, idx) => {
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
                      {item.q}
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
                    <p>{item.a}</p>
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
