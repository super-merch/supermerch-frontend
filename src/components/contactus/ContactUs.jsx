import React from "react";
import { Link } from "react-router-dom";
import {
  FaTruck,
  FaLockOpen,
  FaCreditCard,
  FaUser,
  FaList,
  FaBook,
  FaGift,
  FaShoppingCart,
  FaWallet,
} from "react-icons/fa";
import { MdHomeFilled, MdKeyboardDoubleArrowRight } from "react-icons/md";

const serviceCards = [
  {
    icon: FaTruck,
    title: "Track Order",
    description: "Monitor your order status and delivery updates",
    color: "from-blue-500 to-blue-600",
    href: "/track-order",
  },
  {
    icon: FaLockOpen,
    title: "Reset Password",
    description: "Recover access to your account securely",
    color: "from-green-500 to-green-600",
    href: "/reset-password",
  },
  {
    icon: FaCreditCard,
    title: "Payment Options",
    description: "Learn about our secure payment methods",
    color: "from-purple-500 to-purple-600",
    href: "/payment-options",
  },
  {
    icon: FaUser,
    title: "User & Account",
    description: "Manage your profile and account settings",
    color: "from-orange-500 to-orange-600",
    href: "/account",
  },
  {
    icon: FaList,
    title: "Wishlist & Compare",
    description: "Save and compare your favourite products",
    color: "from-pink-500 to-pink-600",
    href: "/wishlist",
  },
  {
    icon: FaBook,
    title: "Shipping & Billing",
    description: "Information about delivery and billing",
    color: "from-indigo-500 to-indigo-600",
    href: "/shipping-info",
  },
  {
    icon: FaShoppingCart,
    title: "Shopping Cart",
    description: "Manage your cart and checkout process",
    color: "from-teal-500 to-teal-600",
    href: "/cart",
  },
  {
    icon: FaGift,
    title: "Sell on SuperMerch",
    description: "Start selling your products with us",
    color: "from-red-500 to-red-600",
    href: "/sell-with-us",
  },
];

const ContactUs = () => {
  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 lg:py-20">
      <div className="Mycontainer mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <nav
          className="flex items-center gap-2 text-sm mb-8"
          aria-label="Breadcrumb"
        >
          <Link
            to={"/"}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
          >
            <MdHomeFilled className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-medium">Home</span>
          </Link>
          <MdKeyboardDoubleArrowRight className="text-gray-400 w-4 h-4" />
          <div className="flex items-center gap-2 text-blue-600">
            <span className="font-semibold">Contact Us</span>
          </div>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Support Center
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How can we{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              help you today?
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get instant answers to common questions or connect with our support
            team. We're here to make your experience with SuperMerch
            exceptional.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {serviceCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Link
                key={index}
                to={card.href}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 block"
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${card.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {card.description}
                </p>

                {/* Hover Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                ></div>

                {/* Arrow */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <MdKeyboardDoubleArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Need Immediate Help?
            </h2>
            <p className="text-gray-600">
              Choose the quickest way to get assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTruck className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Track Your Order
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Check delivery status and get real-time updates
              </p>
              <Link
                to="/track-order"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Track Now
              </Link>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUser className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Live Chat Support
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Chat with our support team instantly
              </p>
              <button className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                Start Chat
              </button>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBook className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Help Center</h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse our comprehensive help articles
              </p>
              <Link
                to="/help"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Browse Help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
