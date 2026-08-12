import { useNavigate } from "react-router-dom";

import awardsImage from "@/assets/category-awards.jpg";
import bagsImage from "@/assets/category-bags.jpg";
import waterBottleImage from "@/assets/category-water-bottle.png";
import notebookImage from "@/assets/category-notebook.jpg";
import poloImage from "@/assets/category-polo.jpeg";
import corporateGiftsImage from "@/assets/category-corporate-gifts.jpg";
import pensImage from "@/assets/category-pens.jpeg";
import rushOrderImage from "@/assets/category-rush-order.jpeg";

const categories = [
  {
    name: "Corporate Hampers",
    image: corporateGiftsImage,
    path: "/promotional?categoryName=Office+%26+Business&category=PR-07&subCategory=Gift+Sets&type=Promotional&page=1",
  },
  {
    name: "Notebooks",
    image: notebookImage,
    path: "/promotional?categoryName=Office+%26+Business&category=PR-11&subCategory=Notebooks&type=Promotional&page=1",
  },
  {
    name: "Water Bottles",
    image: waterBottleImage,
    path: "/promotional?categoryName=Drinkware&category=PE&type=Promotional&page=1",
  },
  {
    name: "Pens",
    image: pensImage,
    path: "/promotional?categoryName=Writing&category=PY&type=Promotional&page=1",
  },
  {
    name: "Polo Shirts",
    image: poloImage,
    path: "/promotional?categoryName=Shirts+%26+Tee&category=PU-03&subCategory=Polo+Shirts&type=Promotional&page=1",
  },
  {
    name: "Bags",
    image: bagsImage,
    path: "/promotional?categoryName=Bags&category=PA&type=Promotional&page=1",
  },
  {
    name: "Awards",
    image: awardsImage,
    path: "/promotional?categoryName=Exhibitions+%26+Events&category=PF-01&subCategory=Awards+%26+Trophies&type=Promotional&page=1",
  },
  {
    name: "Rush Order",
    image: rushOrderImage,
    path: "/24hr-production?expressWindow=sameday&page=1",
  },
];

const PopularCategories = () => {
  const navigate = useNavigate();

  return (
    <div className="Mycontainer py-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6 md:mb-8 text-center">
        POPULAR PRODUCT CATEGORIES
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 xl:gap-6">
        {categories.map((category) => (
          <div
            key={category.name}
            onClick={() => navigate(category.path)}
            className="relative bg-white rounded-2xl overflow-hidden cursor-pointer border border-secondary/10 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary group"
          >
            <div className="overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularCategories;
