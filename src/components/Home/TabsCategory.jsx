import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heading } from "../Common";
import { FaArrowRight } from "react-icons/fa";

import business from "../../assets/business.jpg";
import tradie from "../../assets/bag.jpg";
import tracksuit from "../../assets/trouser.png";
import corporate from "../../assets/laptop.jpg";
import cap from "../../assets/cap.png";
import lanyard from "../../assets/lanyard.jpg";
import packing from "../../assets/packing.jpg";
import notebook from "../../assets/category-notebook.webp";
import jersey from "../../assets/shirt2.png";

// More ways to shop — Industry
import industryTrades from "../../assets/mwts-industry-trades.jpg";
import industryRealEstate from "../../assets/mwts-industry-realestate.jpg";
import industryIT from "../../assets/mwts-industry-it.jpg";
import industryHospitality from "../../assets/mwts-industry-hospitality.png";

// More ways to shop — Recipient
import recipientExecutives from "../../assets/mwts-recipient-executives.png";
import recipientConference from "../../assets/mwts-recipient-conference.png";
import recipientStaff from "../../assets/mwts-recipient-staff.jpg";
import recipientCustomer from "../../assets/mwts-recipient-customer.jpg";

const shopTabs = [
  {
    id: "industry",
    label: "Industry",
    subCategories: [
      { label: "Trades", image: industryTrades, path: "/collections/trades?page=1" },
      { label: "Real Estate", image: industryRealEstate, path: "/collections/real-estate?page=1" },
      { label: "IT", image: industryIT, path: "/promotional?categoryName=Phone+%26+Technology&category=PS&type=Promotional&page=1" },
      { label: "Hospitality", image: industryHospitality, path: "/collections/hospitality?page=1" },
    ],
  },
  {
    id: "recipient",
    label: "Recipient",
    subCategories: [
      { label: "Executives & Top Clients", image: recipientExecutives, path: "/return-gifts?page=1" },
      { label: "Conference Attendee", image: recipientConference, path: "/collections/conference?page=1" },
      { label: "Staff & Employees", image: recipientStaff, path: "/promotional?categoryName=Office+%26+Business&category=PR&type=Promotional&page=1" },
      { label: "Customers", image: recipientCustomer, path: "/promotional?categoryName=Exhibitions+%26+Events&category=PF&type=Promotional&page=1" },
    ],
  },
  {
    id: "bundles",
    label: "Bundles",
    subCategories: [
      { label: "Tradie", image: tradie, path: "/contact" },
      { label: "Workwear", image: tracksuit, path: "/contact" },
      { label: "Corporate", image: corporate, path: "/contact" },
      { label: "Headwear", image: cap, path: "/contact" },
    ],
  },
  {
    id: "overseas",
    label: "Overseas Sourcing",
    subCategories: [
      { label: "Lanyards", image: lanyard, path: "/contact" },
      { label: "Gift Packs", image: packing, path: "/contact" },
      { label: "Notebooks", image: notebook, path: "/contact" },
      { label: "Sportswear", image: jersey, path: "/contact" },
    ],
  },
];

const TabsCategory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(shopTabs[0].id);
  const [isAnimating, setIsAnimating] = useState(false);

  const activeCategory = shopTabs.find((t) => t.id === activeTab);

  const handleCategoryClick = (id) => {
    if (id !== activeTab) {
      setIsAnimating(true);
      setActiveTab(id);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleSubCategoryClick = (subCategory) => {
    if (subCategory.path) {
      navigate(subCategory.path);
    } else {
      navigate(
        `/category?categoryName=${encodeURIComponent(activeCategory.label)}&subCategory=${encodeURIComponent(subCategory.label)}`
      );
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="bg-primary/10 py-10">
        <div className="Mycontainer">
          {/* Header */}
          <div className="mb-0 flex items-center justify-center">
            <Heading
              title="More ways to shop"
              align="center"
              size="default"
              titleClassName="uppercase py-0"
              containerClassName=""
              description="Explore our wide range of promotional products"
              showUnderline={true}
            />
          </div>

          {/* Tab Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {shopTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleCategoryClick(tab.id)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px] ${
                  tab.id === activeTab
                    ? "bg-primary text-white shadow-md"
                    : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Subcategory Cards */}
          <div
            className={`mt-4 sm:mt-6 grid grid-cols-2 xl:grid-cols-4 md:grid-cols-3 text-center xl:gap-6 md:gap-6 gap-3 sm:gap-4 transition-all duration-300 ${
              isAnimating
                ? "opacity-0 transform translate-y-4"
                : "opacity-100 transform translate-y-0"
            }`}
          >
            {activeCategory &&
              activeCategory.subCategories.map((subCategory, index) => (
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
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      New
                    </span>
                  </div>

                  <div className="overflow-hidden">
                    <img
                      src={subCategory.image}
                      alt={subCategory.label}
                      className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-secondary text-base font-semibold group-hover:text-primary transition-colors duration-300 mb-1">
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
        </div>
      </div>
    </>
  );
};

export default TabsCategory;
