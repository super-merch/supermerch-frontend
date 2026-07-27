import {
  FaHeart,
  FaCogs,
  FaHandshake,
  FaCheckCircle,
  FaTruck,
  FaTags,
} from "react-icons/fa";
import useCmsData from "../../hooks/useCmsData";

const ICON_MAP = {
  FaHeart,
  FaCogs,
  FaHandshake,
  FaCheckCircle,
  FaTruck,
  FaTags,
};

const FALLBACK_FEATURES = [
  {
    title: "Merchandise for Every Brief",
    description:
      "Choose from promotional products, uniforms, workwear, corporate gifts, signage and awards for Australian organisations.",
    imageUrl: "/about1.png",
    icon: FaTags,
    color: "from-teal-500 to-emerald-600",
  },
  {
    title: "Flexible Turnaround Options",
    description:
      "Select express products for urgent campaigns or use longer lead times when value and customisation are the priority.",
    imageUrl: "/about2.png",
    icon: FaTruck,
    color: "from-blue-500 to-cyan-600",
  },
  {
    title: "Practical Branding Support",
    description:
      "Our team helps with product selection, artwork, decoration methods and delivery so your merchandise suits its intended use.",
    imageUrl: "/about3.png",
    icon: FaHandshake,
    color: "from-violet-500 to-purple-600",
  },
];

const Feature = () => {
  const { data: cmsData } = useCmsData("/api/general-cms/by-slug/about-features");
  const cmsFeat = cmsData?.points?.features;
  const featureSource =
    Array.isArray(cmsFeat) && cmsFeat.length > 0
      ? cmsFeat
      : FALLBACK_FEATURES;
  const features = featureSource.map((f) => ({
    ...f,
    icon: typeof f.icon === "string" ? (ICON_MAP[f.icon] || FaHeart) : f.icon,
  }));

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
        <div className="max-w-4xl mx-auto rounded-2xl bg-primary px-8 py-10 text-white">
          <h3 className="text-3xl lg:text-4xl font-bold mb-4">
            Local support, nationwide delivery
          </h3>
          <p className="text-lg text-white/90 leading-relaxed">
            Super Merch works with Australian businesses, clubs, schools and
            community organisations to source and brand merchandise for
            campaigns, events, teams and everyday operations.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 pt-8">
            {[
              "Clear tier pricing",
              "Express options on selected products",
              "Artwork and branding guidance",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <FaCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feature;
