import React from "react";
import useCmsData from "../../hooks/useCmsData";

const Brands = () => {
  const { data: apiData } = useCmsData("/api/partner-brands/active");
  const brands = Array.isArray(apiData)
    ? apiData.map((b) => ({ id: b._id, img: b.logo, name: b.name, url: b.websiteUrl }))
    : [];

  const skeletons = Array.from({ length: 8 });

  return (
    <section className="w-full bg-primary py-14 px-6">
      <p className="text-center text-white text-xs font-semibold tracking-[0.2em] uppercase mb-10">
        Trusted by Leading Australian Brands
      </p>

      {brands.length > 0 ? (
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-10 gap-y-10 items-center justify-items-center">
          {brands.map((brand) => {
            const inner = (
              <img
                key={brand.id}
                src={brand.img}
                alt={brand.name}
                className="max-h-10 md:max-h-12 max-w-[130px] object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity duration-200"
                draggable="false"
              />
            );
            return brand.url ? (
              <a
                key={brand.id}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                {inner}
              </a>
            ) : (
              <div key={brand.id} className="flex items-center justify-center">
                {inner}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-10 gap-y-10">
          {skeletons.map((_, i) => (
            <div key={i} className="h-8 rounded bg-white/10 animate-pulse" />
          ))}
        </div>
      )}
    </section>
  );
};

export default Brands;
