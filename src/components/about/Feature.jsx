import React from "react";
import {
  FaHeart,
  FaCogs,
  FaHandshake,
  FaAward,
  FaCheckCircle,
} from "react-icons/fa";
import useCmsData from "../../hooks/useCmsData";

const ICON_MAP = { FaHeart, FaCogs, FaHandshake, FaAward, FaCheckCircle };

const Feature = () => {
  const { data: cmsData } = useCmsData("/api/general-cms/by-slug/about-features");
  const cmsFeat = cmsData?.points?.features;
  const cmsAch = cmsData?.points?.nikeCertification?.achievements;

  const features = (Array.isArray(cmsFeat) ? cmsFeat : []).map((f) => ({
    ...f,
    icon: typeof f.icon === "string" ? (ICON_MAP[f.icon] || FaHeart) : f.icon,
  }));

  const achievements = Array.isArray(cmsAch) ? cmsAch : [];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="Mycontainer mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            Our Approach
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Grow Brand Love in{" "}
            <span className="bg-primary bg-clip-text text-transparent">
              Hearts & Markets
            </span>{" "}
            Around the World
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We believe in the power of authentic brand experiences that create
            lasting connections between businesses and their audiences.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 lg:gap-12 mb-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="group relative">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={feature.imageUrl}
                      alt={feature.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                    ></div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Gradient Accent */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        {features.length === 0 ? (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 lg:gap-12 mb-20 animate-pulse">
            <div className="h-80 rounded-2xl bg-slate-200"></div>
            <div className="h-80 rounded-2xl bg-slate-200"></div>
            <div className="h-80 rounded-2xl bg-slate-200"></div>
          </div>
        ) : null}

        {/* Nike Certification Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              <FaAward className="w-4 h-4" />
              Quality Certification
            </div>

            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Nike rates our decoration quality{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                3 million swooshes!
              </span>
            </h3>

            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Our decoration operations are one of a select few certified by
                Nike to reproduce its iconic "swoosh" trademark. Each year, they
                trust us to swoosh over 3 million pieces of retail collegiate
                apparel.
              </p>

              <p className="text-gray-600 leading-relaxed">
                Brands of all sizes get the same meticulous quality when their
                merchandise comes from our 500,000 square foot decoration and
                distribution center in Orange City, IA. It runs on 100%
                renewable energy and was awarded a silver medal for
                sustainability by EcoVadis.
              </p>
            </div>

            {/* Achievements List */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <FaCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">
                    {achievement}
                  </span>
                </div>
              ))}
            </div>
            {achievements.length === 0 ? (
              <div className="grid grid-cols-2 gap-3 pt-4 animate-pulse">
                <div className="h-4 rounded bg-slate-200"></div>
                <div className="h-4 rounded bg-slate-200"></div>
                <div className="h-4 rounded bg-slate-200"></div>
                <div className="h-4 rounded bg-slate-200"></div>
              </div>
            ) : null}
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/about4.png"
                alt="Nike Certification Facility"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg border border-gray-100">
              <FaAward className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feature;
