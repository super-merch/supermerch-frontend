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
        <div className="flex flex-wrap  items-center justify-between gap-6 pb-8 Mycontainer ">
          <Heading
            title="SHOP OUR BEST SELLERS"
            align="left"
            size="default"
            titleClassName="uppercase"
            containerClassName=""
          />
          <div className="flex flex-wrap justify-between gap-4 ">
            <button
              type="button"
              className={` py-1    focus:outline-none text-sm font-semibold ${
                activeTab === "All Product"
                  ? " text-brand border-b-2 border-smallHeader "
                  : "text-tabsColor"
              }`}
              onClick={() => handleTabChange("All Product")}
            >
              All Product
            </button>
            <button
              type="button"
              className={` py-1  focus:outline-none text-sm font-semibold ${
                activeTab === "Clothing"
                  ? " text-brand border-b-2 border-smallHeader"
                  : " text-tabsColor "
              }`}
              onClick={() => handleTabChange("Clothing")}
            >
              Clothing
            </button>
            <button
              type="button"
              className={` py-1  focus:outline-none text-sm font-semibold ${
                activeTab === "Headwear"
                  ? " text-brand border-b-2 border-smallHeader"
                  : "text-tabsColor"
              }`}
              onClick={() => handleTabChange("Headwear")}
            >
              Headwear
            </button>
            <button
              type="button"
              className={` py-1  focus:outline-none text-sm font-semibold ${
                activeTab === "Bags"
                  ? " text-brand border-b-2 border-smallHeader"
                  : "text-tabsColor"
              }`}
              onClick={() => handleTabChange("Bags")}
            >
              Bags
            </button>
            <button
              type="button"
              className={` py-1  focus:outline-none text-sm font-semibold ${
                activeTab === "Stationery"
                  ? " text-brand border-b-2 border-smallHeader"
                  : "text-tabsColor"
              }`}
              onClick={() => handleTabChange("Stationery")}
            >
              Stationery & Office
            </button>
            <Link
              to={"/shop"}
              className="flex items-center gap-2 text-sm font-semibold text-smallHeader"
            >
              Browse All Product
              <FaArrowRight className="text-lg" />
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
