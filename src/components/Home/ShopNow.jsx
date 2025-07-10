import React from "react";
import { IoIosArrowRoundForward } from "react-icons/io";
import { Link } from "react-router-dom";
import Sale from "./Sales";

const ShopNow = () => {
  return (
    // <div>

    <>
      {/* {" "} */}
      <div className="Mycontainer2">
        <div className="bg-shop-now bg-center bg-cover w-full">
          <div className="Mycontainer pb-8">
            <h1 className="lg:text-5xl md:text-5xl text-3xl text-brand font-semibold pt-8">
              More Ways to Shop
            </h1>
            <p className="text-brand lg:text-xl md:text-xl text-lg max-w-[490px] pt-3">
              Explore curated selections, from our top deals to the best gifts
              for your industry.
            </p>
            <Link
              to={"/shop"}
              className="flex items-center rounded text-sm font-bold lg:gap-2 md:gap-2 gap-1 justify-center mt-8  bg-smallHeader text-white lg:w-[190px] md:w-[190px] w-[150px] lg:h-[56px] md:h-[56px] h-[50px]  "
            >
              <button className="uppercase">Shop now</button>
              <IoIosArrowRoundForward className="text-3xl font-bold" />
            </Link>
          </div>
        </div>
      </div>
      {/* </div> */}

      {/* <Sale /> */}
    </>
  );
};

export default ShopNow;
