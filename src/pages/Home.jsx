import React, { useEffect, useState } from "react";
import Hero from "../components/Home/Hero";

import Sale from "../components/Home/Sales";
import Brands from "../components/Home/Brands";
// import LatestDeals from "../components/Home/LatestDeals";
import TabsCategory from "../components/Home/TabsCategory";
import Promotional from "../components/Home/Promotional";
import TabsButtons from "../components/Home/ProducsTabs/TabsButtons";
import Blogs from "../components/Home/Blogs";
import { motion } from 'framer-motion'
import bgImg from "/bg-img.png";


const Home = () => {

  const [discountModal, setDiscountModal] = useState(false)
  // useEffect(() => {
  //   setDiscountModal(true)
  // }, [])

  useEffect(() => {
    const modalShown = sessionStorage.getItem("discountModalShown");
    if (!modalShown) {
      setDiscountModal(true);
      sessionStorage.setItem("discountModalShown", "true");
    }
  }, []);




  return (
    <div>
      <Hero />
      {/* <AboutSliders /> */}
      <div className="lg:mt-28 max-md:mt-6">
        <Brands />
      </div>
      <div className="lg:mt-14 md:mt-14 sm:mt-14 mt-4">
        {/* <LatestDeals /> */}
        <TabsButtons />
      </div>
      <TabsCategory />
      <div className="">
        <Sale />
      </div>
      {/* <TabsButtons /> */}
      {/* <div className="lg:mb-60 md:mb-60 mb-72">
        <Promotional />
      </div> */}
      <Blogs />

      {discountModal &&
        <motion.div
          className="fixed top-0 bottom-0 right-0 left-0 inset-0 bg-black backdrop-blur-sm bg-opacity-50 z-50 flex justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0.2, z: 50 }}
            transition={{ duration: 0.3 }}
            whileInView={{ opacity: 1, z: 0 }}
            viewport={{ once: true }}
            className='flex w-[100%] sm:max-w-[40%] sm:grid sm:grid-cols-[1fr_2fr] sm:w-full text-gray-800 justify-center bg-white rounded-[15px] relative'>
            <div className="min-h-full w-full">
              <img src="https://img66.anypromo.com/frontimg/2022/Popup/exit-intent-lft-1.svg"
                className="h-full w-full object-cover" alt="" />
            </div>
            {/* <div className="bg-[url(https://img66.anypromo.com/frontimg/2022/Popup/exit-intent-lft-1.svg)] bg-cover bg-no-repeat" /> */}
                <p className="absolute max-sm:top-[0] right-[20px] top-4 text-lg font-semibold cursor-pointer" onClick={() => setDiscountModal(false)}>x</p>
            <div className="p-5 flex justify-center flex-col text-center space-y-3">
              <div className="relative">
              </div>
              <h1 className="text-[12px] font-medium to-gray-200">We know you will be happy when you get</h1>
              <p className="text-2xl font-extrabold text-[#5D8EF9]">
                5% OFF
              </p>
              <p className="text-[#474747] font-medium p-2 text-sm bg-[#EAEAEA] rounded-md">Use Code: <span className="text-sm font-semibold">40KREVIEWS5PU</span></p>
              <button onClick={() => {
                setDiscountModal(false)
              }} className='w-full bg-smallHeader px-2 py-1 mt-2 rounded-md font-semibold text-sm text-white'>Subscribe</button>
              <p className="text-sm font-medium text-gray-500">Exclusions may apply.</p>
            </div>
          </motion.div>
        </motion.div>
      }
    </div>
  );
};

export default Home;
