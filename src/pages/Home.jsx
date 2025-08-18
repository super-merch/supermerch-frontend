import React, { useEffect, useState } from "react";
import Hero from "../components/Home/Hero";

import Sale from "../components/Home/Sales";
import Brands from "../components/Home/Brands";
import TabsCategory from "../components/Home/TabsCategory";
import Promotional from "../components/Home/Promotional";
import TabsButtons from "../components/Home/ProducsTabs/TabsButtons";
import Blogs from "../components/Home/Blogs";
import { motion } from 'framer-motion'
import bgImg from "/bg-img.png";
import { toast } from "react-toastify";


const Home = () => {
  const [emailModal, setEmailModal] = useState(false)
  const [discountModal, setDiscountModal] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  // useEffect(() => {
  //   setDiscountModal(true)
  // }, [])
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const modalShown = sessionStorage.getItem("discountModalShown");
    if (!modalShown) {
      setDiscountModal(true);
      sessionStorage.setItem("discountModalShown", "true");
    }
  }, []);
  const [error,setError] = useState('')
  const handleSubmit = async() => {
    setLoading
    if(!emailInput){
        setError('Email is required')
        setLoading(false)
        return
    }
    if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailInput)){
        setError('Invalid email')
        setLoading(false)
        return
    }
    
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/add-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: emailInput }),
        });

        // Check if response is OK before parsing JSON
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response not OK:', response.status, errorText);
            toast.error(`Server error: ${response.status}`);
            setError(`Server error: ${response.status}`)
            setLoading(false)
            return;
        }

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const responseText = await response.text();
            console.error('Non-JSON response:', responseText);
            toast.error('Server returned invalid response');
            setError('Server returned invalid response')
            setLoading(false)
            return;
        }

        const data = await response.json();
        
        if (data.success) {
            setEmailModal(false)
            setEmailInput('')
            setError('')
            toast.success("You have successfully subscribed.")
            setDiscountModal(false)
            setLoading(false)
        } else {
            toast.error(data.message)
            setError(data.message)
            setLoading(false)
        }
    } catch (error) {
        console.error("Network/Parse error:", error);
        toast.error("Connection failed. Please check if the server is running.");
        setError("Connection failed. Please check if the server is running.")
        setLoading(false)
    }
}
const [coupen, setCoupen] = useState('')
const [discount, setDiscount] = useState('')
const [coupenLoading, setCoupenLoading] = useState(false)
const API_BASE = import.meta.env.VITE_BACKEND_URL
  const fetchCurrentCoupon = async () => {
    try {
      setCoupenLoading(true)
      const response = await fetch(`${API_BASE}/api/coupen/get`);
      const data = await response.json();
      if(response.ok){
        setCoupen(data[0].coupen);
        setDiscount(data[0].discount);
        setCoupenLoading(false)
      }
      setCoupenLoading(false)
      
    } catch (error) {
      setCoupenLoading(false)
      console.error('Error fetching current coupon:', error);
    }
  };
  useEffect(() => {
    fetchCurrentCoupon()
  }, [])


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
            className='flex w-[90%] md:max-w-[30%]  sm:w-full text-gray-800 justify-center bg-white rounded-[15px] relative'>
            {/* <div className="min-h-full w-full">
              <img src="https://img66.anypromo.com/frontimg/2022/Popup/exit-intent-lft-1.svg"
                className="h-full rounded-tl-2xl rounded-bl-2xl w-full object-cover" alt="" />
            </div> */}
            {/* <div className="bg-[url(https://img66.anypromo.com/frontimg/2022/Popup/exit-intent-lft-1.svg)] bg-cover bg-no-repeat" /> */}
                <p className="absolute max-sm:top-[0] right-[20px] top-4 text-lg font-semibold cursor-pointer" onClick={() => setDiscountModal(false)}>x</p>
            <div className="p-5 flex justify-center flex-col text-center space-y-3">
              <div className="relative">
              </div>
              <h1 className="text-[18px] font-medium to-gray-200">We know you will be happy when you get</h1>
              <p className="text-2xl font-extrabold text-[#5D8EF9]">
                {coupenLoading ? 'Loading...' : discount ? discount+"% OFF" : "No Discount Available"}
              </p>
              {/* Set coupon here */}
              <p className="text-[#474747] font-medium p-2 text-sm bg-[#EAEAEA] rounded-md">Use Code: <span className="text-sm font-semibold">{coupenLoading ? 'Loading...' : coupen || "No Coupen Available"}</span></p>
              <button onClick={() => {
                setDiscountModal(false)
                setEmailModal(true)
              }} className='w-full bg-smallHeader px-2 py-1 mt-2 rounded-md font-semibold text-sm text-white'>Subscribe</button>
              <p className="text-sm font-medium text-gray-500">Exclusions may apply.</p>
            </div>
          </motion.div>
        </motion.div>
       } 
      {emailModal && (
        <motion.div
          className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 z-50 flex justify-center items-center p-4"
        >
          <motion.div
            initial={{ opacity: 0.3, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm bg-white rounded-2xl p-6 relative"
          >
            {/* Close X */}
            <button
              className="absolute top-4 right-4 text-xl font-bold"
              onClick={() => setEmailModal(false)}
            >
              ×
            </button>

            <h2 className="text-lg font-semibold mb-4">Enter your email</h2>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none"
            />
            {error && <p className="text-red-500">{error}</p>}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEmailModal(false)}
                className="px-4 py-2 rounded bg-gray-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSubmit()
                }}
                className={`px-4 py-2 rounded bg-blue-600 ${loading && "opacity-50 cursor-not-allowed"} text-white font-medium`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
