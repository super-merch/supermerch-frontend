import { megaMenu } from "@/assets/assets";
import { AppContext } from "@/context/AppContext";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heading } from "../Common";
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
    navigate(`/category?categoryName=${encodedMain}&subCategory=${subCategory.label}&category=${activeCategory.id}`);
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
    <div>
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
      <div style={{ backgroundColor: "#e3f2fd" }}>
        <div className="Mycontainer pb-16">
          <Heading title="MORE WAY'S TO SHOP" align="center" size="default" titleClassName="uppercase" />
          {/* <div className="TabsCategory"> */}
          {/* Main Category Tabs */}
          <div className="mt-4 flex justify-between lg:grid md:grid sm:grid lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-4 items-center lg:gap-6 md:gap-6 sm:gap-4 gap-1 border-b-4 border-blue-300">
            {megaMenu.slice(0, 4).map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`py-4 max-sm:pb-1 text-start focus:outline-none text-xs sm:text-sm lg:text-xl md:text-xl font-medium transition-colors duration-300 ${
                  category.id === activeTab
                    ? "border-b-2 max-sm:border-b-[2px] border-blue-600 text-blue-600 px-2"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Subcategories for the active main category */}
          <div
            className={`mt-4 grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 text-center lg:gap-6 md:gap-6 gap-4 transition-all duration-300 ${
              isAnimating ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"
            }`}
          >
            {activeCategory &&
              activeCategory.subTypes.slice(0, 4).map((subCategory, index) => (
                <div
                  key={`${activeTab}-${subCategory.label}`}
                  onClick={() => handleSubCategoryClick(subCategory)}
                  className="bg-white rounded-xl lg:p-5 md:p-5 p-3 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  style={{
                    animation: isAnimating ? "none" : `fadeInUp 0.4s ease-out ${index * 50}ms both`,
                  }}
                >
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={
                        (subCategory.label === "Pens" && collection2) ||
                        (subCategory.label === "Highlighter" && highlight) ||
                        (subCategory.label === "Pencils" && pencils) ||
                        (subCategory.label === "Misc" && misc) ||
                        (activeCategory.name == "Writing" && misc) ||
                        (subCategory.label === "Misc" && activeCategory.name == "Bags" && bag) ||
                        (subCategory.label == "Tote Bag" && tote) ||
                        (subCategory.label == "Business Bag" && business) ||
                        (subCategory.label == "Outdoor Bag" && outdoor) ||
                        (subCategory.label == "Bottles" && bottle) ||
                        (subCategory.label == "Thumblers" && thumbler) ||
                        (subCategory.label == "Glasses" && glass) ||
                        (subCategory.label == "Mugs" && mug) ||
                        (subCategory.label == "WristBands" && wrist) ||
                        (subCategory.label == "Lanyards, Bagdes and Pins" && laynard) ||
                        (subCategory.label == "Awards & Trophies" && trophy) ||
                        (subCategory.label == "Keyrings" && keyring)
                      }
                      alt=""
                      className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-blue-800 lg:pt-3 md:pt-3 sm:pt-3 pt-2 lg:text-lg md:text-lg sm:text-lg text-sm font-medium group-hover:text-blue-600 transition-colors duration-300">
                    {subCategory.label}
                  </h3>
                </div>
              ))}
          </div>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default TabsCategory;
