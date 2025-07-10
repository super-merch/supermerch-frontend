import React, { useState } from "react";

import { FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import AllProducts from "./AllProducts";
import Clothing from "./Clothing";
import Headwear from "./Headwear";
import Bags from "./Bags";
import Stationery from "./Stationery";
// import Promotional from './Promotional';

const TabsButtons = () => {
  const [activeTab, setActiveTab] = useState("All Product");
  return (
    <div>
      <div className="">
        <div className="flex flex-wrap items-center justify-between gap-6 pb-16  Mycontainer">
          <div>
            <h1 className="text-2xl font-semibold text-brand">
              Trending product
            </h1>
          </div>
          <div className="flex flex-wrap justify-between gap-4 ">
            <button
              type="button"
              className={` py-1    focus:outline-none text-sm font-semibold ${
                activeTab === "All Product"
                  ? " text-brand border-b-2 border-smallHeader "
                  : "text-tabsColor"
              }`}
              onClick={() => setActiveTab("All Product")}
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
              onClick={() => setActiveTab("Clothing")}
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
              onClick={() => setActiveTab("Headwear")}
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
              onClick={() => setActiveTab("Bags")}
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
              onClick={() => setActiveTab("Stationery")}
            >
              Stationery & Office
            </button>
            <Link to={'/shop'} className="flex items-center gap-2">
              <button className="text-sm font-semibold text-smallHeader">
                Browse All Product
              </button>
              <FaArrowRight className="text-lg font-semibold text-smallHeader" />
            </Link>
          </div>
        </div>
      </div>
      <div>
        <AllProducts activeTab={activeTab} />
        <Clothing activeTab={activeTab} />
        <Headwear activeTab={activeTab} />
        <Bags activeTab={activeTab} />
        <Stationery activeTab={activeTab} />
      </div>
    </div>
  );
};

export default TabsButtons;
