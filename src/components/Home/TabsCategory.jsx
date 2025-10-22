import { megaMenu } from "@/assets/assets";
import { AppContext } from "@/context/AppContext";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heading } from "../Common";
import { FaArrowRight, FaBoxOpen } from "react-icons/fa";
// Assume megaMenu is imported or defined somewhere in your code
// import megaMenu from './megaMenuData';
import collection2 from "../../assets/pen.jpg";
import highlight from "../../assets/highlighter.jpg";
import pencils from "../../assets/pencil.jpg";
import misc from "../../assets/images.jpeg";
import keyring from "../../assets/keyring.jpg";
import tote from "../../assets/tote.jpg";
import glass from "../../assets/glass.jpg";
import bottle from "../../assets/bollte.jpg";
import bag from "../../assets/bag.jpg";
import business from "../../assets/business.jpg";
import outdoor from "../../assets/outdoor.jpg";
import laynard from "../../assets/laynard.jpg";
import thumbler from "../../assets/thumbler.jpg";
import wrist from "../../assets/wrist.jpg";
import trophy from "../../assets/trophy.jpg";
import mug from "../../assets/mug.jpg";

const TabsCategory = () => {
  const navigate = useNavigate();
  const { shopCategory, setShopCategory } = useContext(AppContext);
  // Set the first category (Writing) as default active tab
  const [activeTab, setActiveTab] = useState(megaMenu[0].id);
  const [isAnimating, setIsAnimating] = useState(false);

  // Find the active category object from megaMenu array
  const activeCategory = megaMenu.find((category) => category.id === activeTab);

  // Handle switching the main category tab
  const handleCategoryClick = (id) => {
    if (id !== activeTab) {
      setIsAnimating(true);
      setActiveTab(id);
      // Reset animation state after animation completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  // Handler for when a user clicks on a subcategory (like Pens, Pencils, etc.)
  const handleSubCategoryClick = (subCategory) => {
    const encodedMain = encodeURIComponent(activeCategory.name);
    // Navigate with query parameters: you can adjust the route as needed
    navigate(
      `/category?categoryName=${encodedMain}&subCategory=${subCategory.label}&category=${activeCategory.id}`
    );
    setShopCategory(subCategory.label);
  };

  // Optional: Handler for clicking on a sub-item (e.g., Metal Pens)
  const handleSubItemClick = (subItem) => {
    const encodedMain = encodeURIComponent(activeCategory.name);
    const encodedSubItem = encodeURIComponent(subItem.name);
    // Navigate to a more detailed page (for example, listing products for this sub-item)
    navigate(`/category?main=${encodedMain}&item=${encodedSubItem}`);
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="bg-primary/10 py-4 pb-12">
        <div className="Mycontainer">
          {/* Header Section */}
          <div className="mb-0 flex items-center justify-center">
            <Heading
              title="Top Selling Categories"
              align="center"
              size="default"
              titleClassName="uppercase py-0"
              containerClassName=""
              description="Explore our wide range of promotional products"
              showUnderline={true}
            />
          </div>

          {/* Main Category Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {megaMenu.slice(0, 4).map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px] ${
                  category.id === activeTab
                    ? "bg-primary text-white shadow-md"
                    : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Subcategories for the active main category */}
          <div
            className={`mt-4 sm:mt-6 grid grid-cols-2 xl:grid-cols-4 md:grid-cols-3 text-center xl:gap-6 md:gap-6 gap-3 sm:gap-4 transition-all duration-300 ${
              isAnimating
                ? "opacity-0 transform translate-y-4"
                : "opacity-100 transform translate-y-0"
            }`}
          >
            {activeCategory &&
              activeCategory.subTypes.slice(0, 4).map((subCategory, index) => (
                <div
                  key={`${activeTab}-${subCategory.label}`}
                  onClick={() => handleSubCategoryClick(subCategory)}
                  className="relative bg-white rounded-2xl overflow-hidden cursor-pointer border border-secondary/10 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary group min-h-[44px]"
                  style={{
                    animation: isAnimating
                      ? "none"
                      : `fadeInUp 0.4s ease-out ${index * 50}ms both`,
                  }}
                >
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      New
                    </span>
                  </div>

                  <div className="overflow-hidden">
                    <img
                      src={
                        (subCategory.label === "Pens" && collection2) ||
                        (subCategory.label === "Highlighter" && highlight) ||
                        (subCategory.label === "Pencils" && pencils) ||
                        (subCategory.label === "Misc" && misc) ||
                        (activeCategory.name == "Writing" && misc) ||
                        (subCategory.label === "Misc" &&
                          activeCategory.name == "Bags" &&
                          bag) ||
                        (subCategory.label == "Tote Bag" && tote) ||
                        (subCategory.label == "Business Bag" && business) ||
                        (subCategory.label == "Outdoor Bag" && outdoor) ||
                        (subCategory.label == "Bottles" && bottle) ||
                        (subCategory.label == "Thumblers" && thumbler) ||
                        (subCategory.label == "Glasses" && glass) ||
                        (subCategory.label == "Mugs" && mug) ||
                        (subCategory.label == "WristBands" && wrist) ||
                        (subCategory.label == "Lanyards, Bagdes and Pins" &&
                          laynard) ||
                        (subCategory.label == "Awards & Trophies" && trophy) ||
                        (subCategory.label == "Keyrings" && keyring)
                      }
                      alt=""
                      className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-secondary text-base font-semibold group-hover:text-primary transition-colors duration-300 mb-2">
                      {subCategory.label}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary/60">
                        Explore collection
                      </span>
                      <div className="w-7 h-7 rounded-full bg-primary/10 group-hover:bg-primary flex items-center justify-center transition-colors duration-300">
                        <FaArrowRight className="w-3 h-3 text-primary group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          {/* </div> */}
        </div>
      </div>
    </>
  );
};

export default TabsCategory;
