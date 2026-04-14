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
import useCmsData from "../../hooks/useCmsData";

const ICON_MAP = { FaShoppingCart, FaChartLine, FaTag, FaCreditCard, FaClipboardList, FaHeadset };

export default function HowItWorks({ className = "" }) {
  const { data: cmsData } = useCmsData("/api/general-cms/by-slug/how-it-works");
  const cmsSteps = Array.isArray(cmsData?.points) ? cmsData.points : null;
  const heading = cmsData?.header || "Simple Steps to Success";
  const description =
    cmsData?.description ||
    "Our streamlined process makes it easy to get exactly what you need, when you need it. From browsing to delivery, we've got you covered every step of the way.";

  const steps = (cmsSteps || []).map((s) => ({
    ...s,
    icon: ICON_MAP[s.icon] || FaShoppingCart,
  }));

  return (
    <section
      className={`bg-primary/10 py-10 ${className}`}
      aria-labelledby="how-it-works-heading"
    >
      <div className="Mycontainer mx-auto px-4">
        {/* Header Section */}
        <Heading
          title={
            <>
              {heading.split(" to ")[0] || "Simple Steps"} to{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {heading.includes(" to ")
                  ? heading.split(" to ").slice(1).join(" to ")
                  : "Success"}
              </span>
            </>
          }
          align="center"
          size="default"
          titleClassName="uppercase"
          description={description}
          containerClassName="mb-12 py-0 !py-0"
          showUnderline={true}
        />
        {/* Steps Grid */}
        <div className="relative">
          {/* Desktop Connection Lines */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-teal-200"></div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.number} className="relative group">
                  {/* Step Card */}
                  <article className="relative bg-white rounded-2xl md:p-8 p-4 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 border border-gray-100">
                    {/* Step Number Badge */}
                    <div
                      className={`absolute -top-4 -left-4 md:w-12 md:h-12 w-8 h-8 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold md:text-lg text-sm shadow-lg group-hover:scale-110 transition-transform duration-300`}
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
          {steps.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-12 mt-4 animate-pulse">
              <div className="h-40 rounded-2xl bg-slate-200"></div>
              <div className="h-40 rounded-2xl bg-slate-200"></div>
              <div className="h-40 rounded-2xl bg-slate-200"></div>
            </div>
          ) : null}
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
            <Link to="/return-gifts">
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
