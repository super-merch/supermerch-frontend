import React, { useContext, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import AllProducts from "./AllProducts";
import Clothing from "./Clothing";
import Headwear from "./Headwear";
import Bags from "./Bags";
import Stationery from "./Stationery";
import CategoryGrid from "./CategoryGrid";
import { Heading } from "../../Common";
import { AppContext } from "../../../context/AppContext";
// import Promotional from './Promotional';

const TabsButtons = ({ changeBg = false }) => {
  const [activeTab, setActiveTab] = useState("All Product");
  const { setProducts, setProductsCategory } = useContext(AppContext);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setProducts([]);
    setProductsCategory([]);
  };

  return (
    <div className={`${changeBg && "bg-gray-100  py-5"}`}>
      <div className="">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 Mycontainer">
          <Heading title="SHOP OUR BEST SELLERS" align="left" size="default" titleClassName="uppercase" containerClassName="" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                type="button"
                className={`px-3 py-2 sm:py-1 focus:outline-none text-xs sm:text-sm font-semibold min-h-[44px] transition-colors duration-200 ${
                  activeTab === "All Product" ? " text-brand border-b-2 border-smallHeader " : "text-tabsColor hover:text-brand"
                }`}
                onClick={() => setActiveTab("All Product")}
              >
                All Product
              </button>
              <button
                type="button"
                className={`px-3 py-2 sm:py-1 focus:outline-none text-xs sm:text-sm font-semibold min-h-[44px] transition-colors duration-200 ${
                  activeTab === "Clothing" ? " text-brand border-b-2 border-smallHeader" : " text-tabsColor hover:text-brand"
                }`}
                onClick={() => setActiveTab("Clothing")}
              >
                Clothing
              </button>
              <button
                type="button"
                className={`px-3 py-2 sm:py-1 focus:outline-none text-xs sm:text-sm font-semibold min-h-[44px] transition-colors duration-200 ${
                  activeTab === "Headwear" ? " text-brand border-b-2 border-smallHeader" : "text-tabsColor hover:text-brand"
                }`}
                onClick={() => setActiveTab("Headwear")}
              >
                Headwear
              </button>
              <button
                type="button"
                className={`px-3 py-2 sm:py-1 focus:outline-none text-xs sm:text-sm font-semibold min-h-[44px] transition-colors duration-200 ${
                  activeTab === "Bags" ? " text-brand border-b-2 border-smallHeader" : "text-tabsColor hover:text-brand"
                }`}
                onClick={() => setActiveTab("Bags")}
              >
                Bags
              </button>
              <button
                type="button"
                className={`px-3 py-2 sm:py-1 focus:outline-none text-xs sm:text-sm font-semibold min-h-[44px] transition-colors duration-200 ${
                  activeTab === "Stationery" ? " text-brand border-b-2 border-smallHeader" : "text-tabsColor hover:text-brand"
                }`}
                onClick={() => setActiveTab("Stationery")}
              >
                <span className="hidden sm:inline">Stationery & Office</span>
                <span className="sm:hidden">Stationery</span>
              </button>
            </div>
            <Link
              to={"/shop"}
              className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-smallHeader min-h-[44px] px-3 py-2 border border-smallHeader rounded-lg hover:bg-smallHeader hover:text-white transition-colors duration-200"
            >
              Browse All Product
              <FaArrowRight className="text-sm sm:text-lg" />
            </Link>
          </div>
        </div>
              Browse All Product
              <FaArrowRight className="text-sm sm:text-lg" />
            </Link>
          </div>
        </div>
      </div>
      <div>
        <CategoryGrid activeTab={activeTab} handleTabChange={handleTabChange} />
      </div>
    </div>
  );
};

export default TabsButtons;
