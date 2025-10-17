import React, { useEffect, useState } from "react";
import {
  FaGlobe,
  FaUsers,
  FaBuilding,
  FaFlag,
  FaBox,
  FaProjectDiagram,
} from "react-icons/fa";

const MetricSec = () => {
  const metrics = [
    {
      value: "75+",
      label: "Trusted Brands",
      icon: FaBuilding,
      color: "from-blue-500 to-blue-600",
      description: "Global brands trust us",
    },
    {
      value: "100",
      label: "Core Team Members",
      icon: FaUsers,
      color: "from-green-500 to-green-600",
      description: "Expert professionals",
    },
    {
      value: "40",
      label: "Distribution Centers",
      icon: FaBox,
      color: "from-purple-500 to-purple-600",
      description: "Worldwide locations",
    },
    {
      value: "95",
      label: "Countries Served",
      icon: FaGlobe,
      color: "from-orange-500 to-orange-600",
      description: "Global reach",
    },
    {
      value: "1000+",
      label: "Projects Completed",
      icon: FaProjectDiagram,
      color: "from-pink-500 to-pink-600",
      description: "Successful deliveries",
    },
    {
      value: "15+",
      label: "Years Experience",
      icon: FaFlag,
      color: "from-teal-500 to-teal-600",
      description: "Industry expertise",
    },
  ];

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById("metrics-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <section
      id="metrics-section"
      className="py-16 lg:py-20 bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50"></div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse delay-500"></div>

      <div className="Mycontainer mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Our Impact
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Numbers That <span className="text-white">Speak Volumes</span>
          </h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Our achievements reflect our commitment to excellence and the trust
            our clients place in us to deliver outstanding results.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 border border-white/20"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${metric.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Value */}
                <div className="mb-2">
                  <span
                    className={`text-3xl lg:text-4xl font-bold text-white transition-all duration-500 ${
                      isVisible ? "animate-pulse" : ""
                    }`}
                  >
                    {isVisible ? metric.value : "0"}
                  </span>
                  <span className="text-2xl lg:text-3xl font-bold text-white/70">
                    +
                  </span>
                </div>

                {/* Label */}
                <h3 className="text-sm lg:text-base font-semibold text-white mb-1 leading-tight">
                  {metric.label}
                </h3>

                {/* Description */}
                <p className="text-xs text-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {metric.description}
                </p>

                {/* Hover Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${metric.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to Join Our Success Story?
            </h3>
            <p className="text-blue-100 mb-6">
              Be part of our growing community of satisfied clients and
              experience the difference that quality and expertise make.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Start Your Project
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetricSec;
