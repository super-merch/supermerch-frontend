import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaQuestionCircle,
  FaSearch,
} from "react-icons/fa";

const faqItems = [
  {
    question: "How do I track my order?",
    answer:
      "You can track your order by logging into your account and visiting the 'My Orders' section. You'll also receive email updates with tracking information once your order ships. For real-time updates, you can use our order tracking tool on the website.",
    category: "Orders",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers. All payments are processed securely through our encrypted payment gateway to ensure your financial information is protected.",
    category: "Payments",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping typically takes 3-5 business days within Australia and 7-14 business days internationally. Express shipping options are available for faster delivery. You'll receive a shipping confirmation email with tracking details once your order is dispatched.",
    category: "Shipping",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Custom or personalized items may have different return terms. Please contact our customer service team to initiate a return, and we'll provide you with a return label and instructions.",
    category: "Returns",
  },
  {
    question: "How do I reset my password?",
    answer:
      "Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a secure link to reset your password. Make sure to check your spam folder if you don't receive the email within a few minutes.",
    category: "Account",
  },
  {
    question: "Can I cancel my order after placing it?",
    answer:
      "Orders can be cancelled within 1 hour of placement if they haven't entered the processing stage. After this time, you'll need to wait for the order to arrive and then use our return process. Contact customer service immediately if you need to cancel an order.",
    category: "Orders",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. You can calculate shipping costs and estimated delivery times during checkout. Please note that customs duties and taxes may apply for international orders.",
    category: "Shipping",
  },
  {
    question: "How do I contact customer service?",
    answer:
      "You can reach our customer service team through live chat (available 24/7), email at support@supermerch.com.au, or by calling our toll-free number. We also have a comprehensive help center with detailed guides and tutorials.",
    category: "Support",
  },
  {
    question: "What if my item arrives damaged?",
    answer:
      "If your item arrives damaged, please contact us immediately with photos of the damage. We'll arrange for a replacement or full refund at no cost to you. We take quality seriously and will resolve any issues quickly.",
    category: "Quality",
  },
  {
    question: "Are there any discounts for bulk orders?",
    answer:
      "Yes, we offer quantity discounts for bulk orders. The discount varies by product and quantity. Contact our sales team for custom pricing on large orders. We also have special rates for businesses and resellers.",
    category: "Business",
  },
];

const categories = [
  "All",
  "Orders",
  "Payments",
  "Shipping",
  "Returns",
  "Account",
  "Support",
  "Quality",
  "Business",
];

const FAQS = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const filteredFAQs = faqItems.filter((faq) => {
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="Mycontainer mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FaQuestionCircle className="w-4 h-4" />
            Help Center
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find quick answers to common questions about our products, services,
            and policies. Can't find what you're looking for? Contact our
            support team.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Search Bar */}
          <div className="relative mb-8">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white shadow-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {filteredFAQs.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {item.question}
                      </h3>
                    </div>
                    <div className="flex-shrink-0">
                      {activeFAQ === index ? (
                        <FaChevronUp className="w-5 h-5 text-primary" />
                      ) : (
                        <FaChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {activeFAQ === index && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4">
                      <p className="text-gray-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaQuestionCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No FAQs Found
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any FAQs matching your search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Still Have Questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is available 24/7 to help you with any questions
              or concerns. Get in touch with us and we'll get back to you as
              soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Contact Support
              </button>
              <button className="border-2 border-blue-600 text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300">
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQS;
