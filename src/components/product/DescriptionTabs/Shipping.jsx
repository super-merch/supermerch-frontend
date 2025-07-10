import React from "react";
// import { IoMdArrowForward } from "react-icons/io";

import { PiMedalLight } from "react-icons/pi";
import { PiTruckDuotone } from "react-icons/pi";
import { FaHandshake } from "react-icons/fa6";
import { FaHeadphones } from "react-icons/fa6";
// import { FaHeadphones } from "react-icons/fa6";
import { FaRadio } from "react-icons/fa6";

const features = [
  {
    icon: <PiMedalLight />,
    descrip: "Free 1 Year Warranty",
  },
  {
    icon: <PiTruckDuotone />,
    descrip: "Free 1 Year Warranty",
  },
  {
    icon: <FaHandshake />,
    descrip: "100% Money-back guarantee",
  },
  {
    icon: <FaHeadphones />,
    descrip: "24/7 Customer support",
  },
  {
    icon: <FaRadio />,
    descrip: "Secure payment method",
  },
];

const shipping = [
  {
    title: "Courier:",
    value: " 2 - 4 days, free shipping",
  },
  {
    title: "Local Shipping::",
    value: "  up to one week, $19.00",
  },
  {
    title: "UPS Ground Shipping::",
    value: "  4 - 6 days, $29.00",
  },
  {
    title: "Unishop Global Export::",
    value: " 3 - 4 days, $39.00",
  },
];
const Shipping = ({ activeTab }) => {
  return (
    <>
      {activeTab === "Shipping & Delivery" && (
        <div className="Mycontainer gap-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[46%_25%_25%]  pb-24">
          <div className=" ">
            <h1 className="font-semibold">Description</h1>
            <p className="text-sm text-gray-900 pt-3 max-w-[540px] ">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
            <p className="text-sm text-gray-900 pt-4 max-w-[540px]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
          </div>
          <div className="">
            <h1 className="text-brand pb-1">Feature</h1>
            {features.map((items, i) => {
              return (
                <div key={i} className="flex items-center pt-3 gap-2">
                  <p className="text-smallHeader text-xl ">{items.icon}</p>
                  <p className="text-brand text-sm">{items.descrip}</p>
                </div>
              );
            })}
          </div>
          {/* <div className="">
            <h1 className="text-brand pb-1">Shipping Information</h1>

            {shipping.map((ship, i) => {
              return (
                <div key={i} className="flex flex-wrap items-center pt-3 gap-1">
                  <p className="text-brand text-sm">{ship.title}</p>
                  <p className="text-tabsColor text-sm">{ship.value}</p>
                </div>
              );
            })}
          </div> */}
        </div>
      )}
    </>
  );
};

export default Shipping;
