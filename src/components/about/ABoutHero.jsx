import React from "react";
import {
  FaCheckCircle,
  FaHeadset,
  FaUsers,
  FaGlobe,
  FaBoxes,
} from "react-icons/fa";
import useCmsData from "../../hooks/useCmsData";

const ICON_MAP = { FaHeadset, FaUsers, FaGlobe, FaBoxes };

const ABoutHero = () => {
  const { data: cmsData } = useCmsData("/api/general-cms/by-slug/about-hero");
  const cmsFeatures = cmsData?.points?.features;
  const featuresData = Array.isArray(cmsFeatures) ? cmsFeatures : [];

  const features = featuresData.map((f) => ({
    ...f,
    icon: typeof f.icon === "string" ? (ICON_MAP[f.icon] || FaHeadset) : f.icon,
  }));

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 lg:py-24">
      <div className="Mycontainer mx-auto px-4">
        {/* Hero Image Section */}
        <div className="relative mb-16">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/group2.png"
              alt="Super Merch Team"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Floating Stats Cards */}
          <div className="absolute -bottom-8 left-4 right-4 lg:left-8 lg:right-auto lg:w-80">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">15+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">99%</div>
                  <div className="text-sm text-gray-600">
                    Customer Satisfaction
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Features List */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Our Strengths
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="group flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300"
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {features.length === 0 ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 rounded-xl bg-slate-200"></div>
                <div className="h-16 rounded-xl bg-slate-200"></div>
                <div className="h-16 rounded-xl bg-slate-200"></div>
              </div>
            ) : null}
          </div>

          {/* About Content */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary to-primary/70 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 "></div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <FaCheckCircle className="w-4 h-4" />
                  WHO WE ARE
                </div>

                <h1 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
                  Welcome to <span className="text-white">Super Merch</span>
                </h1>

                <p className="text-lg text-blue-100 leading-relaxed mb-6">
                  We're Australia's leading provider of premium promotional
                  products and custom merchandise. With over 15 years of
                  experience, we've helped thousands of businesses build
                  stronger brand connections through quality products and
                  exceptional service.
                </p>

                <p className="text-base text-blue-200 leading-relaxed">
                  From small startups to enterprise corporations, we deliver
                  innovative solutions that make your brand unforgettable. Our
                  commitment to quality, sustainability, and customer
                  satisfaction sets us apart in the competitive promotional
                  products industry.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300">
                    Learn More
                  </button>
                  <button className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-primary transition-colors duration-300">
                    Get Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ABoutHero;
