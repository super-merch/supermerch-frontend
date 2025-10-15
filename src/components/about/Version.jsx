import React from "react";
import {
  FaEye,
  FaRocket,
  FaGlobe,
  FaHeart,
  FaUsers,
  FaLightbulb,
} from "react-icons/fa";

const Version = () => {
  const visionPillars = [
    {
      icon: FaGlobe,
      title: "Global Reach",
      description: "Making quality products accessible to everyone, everywhere",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: FaLightbulb,
      title: "Innovation",
      description: "Cutting-edge technology and creative solutions",
      color: "from-green-500 to-green-600",
    },
    {
      icon: FaHeart,
      title: "Sustainability",
      description: "Environmental responsibility in everything we do",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: FaUsers,
      title: "Community",
      description: "Building lasting relationships and trust",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg- opacity-50"></div>
      <div className="absolute top-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>

      <div className="Mycontainer mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Section */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
                <FaEye className="w-4 h-4" />
                Our Vision
              </div>

              <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
                Our Vision for the{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Future
                </span>
              </h2>

              <div className="space-y-4">
                <p className="text-lg text-blue-100 leading-relaxed">
                  At SuperMerch, our vision is to revolutionize the online
                  shopping experience by making it seamless, personalized, and
                  accessible to everyone, everywhere. We aim to empower our
                  customers with a curated selection of high-quality products,
                  cutting-edge technology, and unparalleled service.
                </p>

                <p className="text-blue-200 leading-relaxed">
                  Our goal is to create a global community where every
                  transaction fosters trust, every product delivers value, and
                  every interaction inspires delight. By prioritizing
                  innovation, sustainability, and inclusivity, we strive to be
                  the most loved and trusted e-commerce destination worldwide.
                </p>
              </div>
            </div>

            {/* Vision Pillars */}
            <div className="grid grid-cols-2 gap-4">
              {visionPillars.map((pillar, index) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={index}
                    className="group bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${pillar.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-1 text-sm">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-blue-200 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2">
                <FaRocket className="w-4 h-4" />
                Join Our Journey
              </button>
            </div>
          </div>

          {/* Image Section */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/group.png"
                alt="SuperMerch Vision"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 shadow-xl">
              <FaRocket className="w-8 h-8 text-white" />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">2024</div>
                <div className="text-sm text-gray-600">Vision Year</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-lg text-blue-100 leading-relaxed">
              "To deliver exceptional promotional products and custom
              merchandise solutions that help businesses build stronger
              connections with their audiences, while maintaining the highest
              standards of quality, sustainability, and customer service."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Version;
