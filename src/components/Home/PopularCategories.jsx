import { Link } from "react-router-dom";

import { popularCategories } from "./popularCategoriesData";

const PopularCategories = () => {
  return (
    <div className="Mycontainer py-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6 md:mb-8 text-center">
        POPULAR PRODUCT CATEGORIES
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 xl:gap-6">
        {popularCategories.map((category) => (
          <Link
            key={category.name}
            to={category.path}
            aria-label={`Shop ${category.name}`}
            className="relative bg-white rounded-2xl overflow-hidden cursor-pointer border border-secondary/10 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary group"
          >
            <div className="overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                decoding="async"
                width="800"
                height="800"
                className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = "/noimage.png";
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-secondary text-base font-semibold text-center group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[2.5rem]">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularCategories;
