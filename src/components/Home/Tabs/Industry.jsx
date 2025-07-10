import React from "react";
import collection1 from "../../../assets/collection1.png";
import collection2 from "../../../assets/collection2.png";
import collection3 from "../../../assets/collection3.png";
import collection4 from "../../../assets/collection4.png";
import { Link } from "react-router-dom";

const Industry = ({ activeTab }) => {
  const tabData = [
    {
      pic: collection1,
      description: "Holiday Gift Guide2",
    },
    {
      pic: collection2,
      description: "Alpha Pens2",
    },
    {
      pic: collection3,
      description: "Full Color2",
    },
    {
      pic: collection4,
      description: "Design Wrap2",
    },
  ];
  return (
    <div className="">
      {activeTab === "industry" && (
        <div className="  mt-4 grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 text-center lg:gap-6 md:gap-6 gap-3 ">
          {tabData.map((item, ind) => {
            return (
              <Link to={"/category"} key={ind} className="bg-white lg:p-5 md:p-5 p-2 ">
                <img src={item.pic} alt="" className="w-full" />
                <p className="text-brand lg:pt-3 md:pt-3 sm:pt-3 pt-1 lg:text-lg md:text-lg sm:text-lg text-xs font-medium">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Industry;
