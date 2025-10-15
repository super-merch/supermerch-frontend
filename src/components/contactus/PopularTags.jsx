import React from "react";
import { FaQuestionCircle, FaSearch, FaTag } from "react-icons/fa";

const popularTopics = [
  {
    title: "How do I return my item?",
    category: "Returns & Exchanges",
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "What is SuperMerch Returns Policy?",
    category: "Policies",
    color: "from-green-500 to-green-600",
  },
  {
    title: "How long is the refund process?",
    category: "Payments",
    color: "from-purple-500 to-purple-600",
  },
  {
    title: "What are the Delivery Timelines?",
    category: "Shipping",
    color: "from-orange-500 to-orange-600",
  },
  {
    title: "What is the Promotional Campaign?",
    category: "Promotions",
    color: "from-pink-500 to-pink-600",
  },
  {
    title: "What is the Voucher & Gift Offer?",
    category: "Rewards",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    title: "How to cancel SuperMerch Order",
    category: "Orders",
    color: "from-teal-500 to-teal-600",
  },
  {
    title: "Ask the Community",
    category: "Community",
    color: "from-red-500 to-red-600",
  },
  {
    title: "How to change my account settings?",
    category: "Account",
    color: "from-yellow-500 to-yellow-600",
  },
];

const PopularTags = () => {
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <div className="Mycontainer mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FaQuestionCircle className="w-4 h-4" />
            Help Topics
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Popular{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Help Topics
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find quick answers to the most commonly asked questions. Browse our
            help topics or search for specific information.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search help topics..."
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {popularTopics.map((topic, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* Category Icon */}
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${topic.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                >
                  <FaTag className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium mb-3">
                    {topic.category}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {topic.title}
                  </h3>
                </div>
              </div>

              {/* Hover Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${topic.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
              ></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-3">Still Need Help?</h3>
            <p className="text-blue-100 mb-6">
              Can't find what you're looking for? Our support team is here to
              help you 24/7.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularTags;
