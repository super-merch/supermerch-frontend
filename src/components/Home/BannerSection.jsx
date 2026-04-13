import React from "react";
import { Link } from "react-router-dom";
import useCmsData from "../../hooks/useCmsData";

const BannerSection = () => {
  const { data: apiData } = useCmsData("/api/home-page-banners/active");
  const banners = Array.isArray(apiData)
    ? apiData.map((b) => ({ id: b._id, image: b.imageUrl, alt: b.content, link: b.linkUrl }))
    : [];

  return (
    <div className="w-full py-0">
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {banners.map((banner) => (
            // <Link
            //   key={banner.id}
            //   to={banner.link}
            //   className="group block overflow-hidden shadow-lg transition-all duration-300"
            // >
            <div className="relative w-full h-48 md:h-56 lg:h-96 overflow-hidden" key={banner.id}>
              <img
                src={banner.image}
                alt={banner.alt}
                className="w-full h-full object-cover transition-transform duration-300 group"
                onError={(e) => {
                  e.target.src = "/noimage.png";
                }}
              />
              {/* Dynamic gradient overlay that complements the image */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-pink-500/20  transition-all duration-500"></div>
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-30 group-hover:opacity-40">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-transparent via-white/5 to-transparent transform skew-x-12"></div>
              </div>
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
            </div>
            // </Link>
          ))}
        </div>
        {banners.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 animate-pulse">
            <div className="h-48 md:h-56 lg:h-96 rounded-lg bg-slate-200"></div>
            <div className="h-48 md:h-56 lg:h-96 rounded-lg bg-slate-200"></div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BannerSection;
