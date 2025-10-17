import React from "react";
import {
  FaQuoteLeft,
  FaUsers,
  FaHeart,
  FaLightbulb,
  FaHandshake,
} from "react-icons/fa";

const Stable = () => {
  const inclusionValues = [
    {
      icon: FaUsers,
      title: "Diverse Workforce",
      description:
        "Superior innovation through diverse perspectives and experiences",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: FaHeart,
      title: "Inclusive Culture",
      description: "Industry-leading inclusion resources and support systems",
      color: "from-green-500 to-green-600",
    },
    {
      icon: FaLightbulb,
      title: "Innovation Focus",
      description: "Better business results through diverse talent and ideas",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: FaHandshake,
      title: "Community Partnership",
      description:
        "Collaboration with Village Northwest Unlimited for neurodivergent talent",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <div className="Mycontainer mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Section */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/about5.png"
                alt="Inclusive Workplace at SuperMerch"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Floating Quote */}
            <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <FaQuoteLeft className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-700 italic">
                "Diverse workforces produce superior innovation and business
                results."
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <FaUsers className="w-4 h-4" />
                Inclusion & Diversity
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                At SuperMerch,{" "}
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  inclusion is a verb
                </span>
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                Diverse workforces produce superior innovation and business
                results. We support diverse talent with industry-leading
                inclusion resources, such as a Social Justice Resource Center
                and ten Business Resource Groups.
              </p>

              <p className="text-gray-600 leading-relaxed">
                We also work with Village Northwest Unlimited to employ
                neurodivergent talent in our operations. Learn more about our
                welcoming culture in our latest CSR report.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-2 gap-4">
              {inclusionValues.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <div
                    key={index}
                    className="group bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
                  >
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${value.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                      {value.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Read Our CSR Report
              </button>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">10</div>
              <div className="text-sm text-gray-600">
                Business Resource Groups
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">100%</div>
              <div className="text-sm text-gray-600">Equal Opportunity</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">50+</div>
              <div className="text-sm text-gray-600">Diversity Initiatives</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                24/7
              </div>
              <div className="text-sm text-gray-600">Support Network</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stable;
