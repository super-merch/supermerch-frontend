import React from "react";
import { Link } from "react-router-dom";

const BannerSection = () => {
  const banners = [
    {
      id: 1,
      image: "/BANNER/b4.jpeg",
      alt: "Banner 1",
      link: "/banner1",
    },
    {
      id: 2,
      image: "/BANNER/b2.jpeg",
      alt: "Banner 2",
      link: "/banner2",
    },
  ];

  return (
    <div className="w-full py-4">
      <div className="Mycontainer">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <Link
              key={banner.id}
              to={banner.link}
              className="group block overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative w-full h-48 md:h-56 lg:h-64 overflow-hidden">
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "/noimage.png";
                  }}
                />
                {/* Dynamic gradient overlay that complements the image */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-pink-500/20 group-hover:from-blue-600/30 group-hover:via-purple-600/25 group-hover:to-pink-600/30 transition-all duration-500"></div>
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-30 group-hover:opacity-40">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-transparent via-white/5 to-transparent transform skew-x-12"></div>
                </div>
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerSection;
