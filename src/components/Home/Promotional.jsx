import React from "react";
import tracksuit from "../../assets/tracksuit.png";
import ShopNow from "./ShopNow";
const Promotional = () => {
  const list = [
    {
      name: "A FREE virtual proof to review your design before you order.",
    },
    {
      name: "FREE samples of select items, just cover shipping.",
    },
    {
      name: "Friendly, expert service with over 40,000+ positive reviews.",
    },
    {
      name: "Over 5,000+ items with 1-day rush production.",
    },
    {
      name: "An Extended 100-day return policy.",
    },
  ];
  return (
    <div className="relative">
      <div className="bg-smallHeader relative text-white h-[100%] lg:pb-72 md:pb-72 pb-16">
        <div className="Mycontainer flex flex-wrap items-center justify-between">
          <div className=" lg:hidden md:hidden block mt-24">
            <img src="/curcle.png" alt="" className="    " />
            <div>
              <img
                src={tracksuit}
                alt=""
                className="absolute right-[0%] w-[100%] top-[9%] "
              />
            </div>
          </div>
          <div className="lg:pt-36 md:pt-36 pt-16 w-full ">
            <h1 className="leading-tight lg:text-4xl md:text-3xl text-3xl font-semibold lg:max-w-[43%] md:max-w-[43%] max-w-full	">
              Shop AnyPromo’s Promotional Products & Receive
            </h1>
            <div className="lg:mt-8 md:mt-8 mt-4">
              {list.map((list, i) => {
                return (
                  <div key={i} className="flex items-center gap-4 pt-2 ">
                    <div className="w-2 h-2 bg-white rounded-[50%]"></div>
                    <p className="max-w-[410px] font-normal text-lg text-list">
                      {list.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-pink-color bg-cover hidden lg:block md:block  w-[45%] absolute right-[0%] top-[0%] h-[100%] ">
            <div className=" ">
              <img
                src="/curcle.png"
                alt=""
                className="absolute lg:right-[9%] md:right-[7%] lg:top-[10%] md:top-[20%]  "
              />
              <div>
                <img
                  src={tracksuit}
                  alt=""
                  className="absolute lg:right-[20%]  md:right-[10%]  md:top-[27%] lg:top-[16%] "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute right-0 left-0 lg:top-[88%] md:top-[88%]  ">
        <ShopNow />
      </div>
    </div>
  );
};

export default Promotional;
