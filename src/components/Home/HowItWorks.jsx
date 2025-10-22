import React from "react";
import {
  FaShoppingCart,
  FaChartLine,
  FaTag,
  FaCreditCard,
  FaClipboardList,
  FaHeadset,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { Heading } from "../Common";

export default function HowItWorks({ className = "" }) {
  const steps = [
    {
      number: "01",
      icon: FaShoppingCart,
      title: "Browse & Add to Cart",
      description:
        "Explore our extensive catalog and add your favourite products to your cart. Choose quantities and variations that suit your needs.",
      color: "from-blue-500 to-blue-600",
    },
    {
      number: "02",
      icon: FaChartLine,
      title: "Quantity Price Breaks",
      description:
        "Save more when you buy more! Our automatic quantity-based pricing gives you better rates for larger orders.",
      color: "from-green-500 to-green-600",
    },
    {
      number: "03",
      icon: FaTag,
      title: "Apply Coupon Codes",
      description:
        "Have a discount code? Enter it at checkout to unlock special savings and promotional offers.",
      color: "from-purple-500 to-purple-600",
    },
    {
      number: "04",
      icon: FaCreditCard,
      title: "Secure Checkout",
      description:
        "Complete your purchase with our secure payment system powered by Stripe. Your data is always protected.",
      color: "from-orange-500 to-orange-600",
    },
    {
      number: "05",
      icon: FaClipboardList,
      title: "Track Your Orders",
      description:
        "Monitor your order status, view shipping details, and manage your purchase history all in one place.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      number: "06",
      icon: FaHeadset,
      title: "Bulk & Custom Orders",
      description:
        "Need special pricing or large quantities? Our support team is here to help with custom solutions.",
      color: "from-teal-500 to-teal-600",
    },
  ];

  return (
    <section
      className={`bg-primary/10 py-16 lg:py-20 ${className}`}
      aria-labelledby="how-it-works-heading"
    >
      <div className="Mycontainer mx-auto px-4">
        {/* Header Section */}
        <Heading
          title={
            <>
              Simple Steps to{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Success
              </span>
            </>
          }
          align="center"
          size="default"
          titleClassName="uppercase"
          description={
            <>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Our streamlined process
              </span>
              {` `}
              makes it easy to get exactly what you need, when you need it.{" "}
              <br /> From browsing to delivery, we've got you covered every step
              of the way.
            </>
          }
          containerClassName="mb-12 py-0 !py-0"
          showUnderline={true}
        />

        {/* Steps Grid */}
        <div className="relative">
          {/* Desktop Connection Lines */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-purple-200 via-orange-200 via-indigo-200 to-teal-200"></div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.number} className="relative group">
                  {/* Step Card */}
                  <article className="relative bg-white rounded-2xl md:p-8 p-4 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 border border-gray-100">
                    {/* Step Number Badge */}
                    <div
                      className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div
                      className={`md:w-16 w-12 md:h-16 h-12 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto md:mx-0`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="md:text-xl text-sm font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                      {step.title}
                    </h3>
                    <p className="md:text-sm text-xs text-gray-600 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Hover Effect Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                    ></div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of satisfied customers who trust us with their
              promotional product needs.
            </p>
            <Link to="/Spromotional">
              <button className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Start Shopping Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
