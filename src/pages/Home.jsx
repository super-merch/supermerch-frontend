import React, { useEffect, useState } from "react";
import Hero from "../components/Home/Hero";

import Sale from "../components/Home/Sales";
import Brands from "../components/Home/Brands";
import TabsCategory from "../components/Home/TabsCategory";
import Promotional from "../components/Home/Promotional";
import TabsButtons from "../components/Home/ProducsTabs/TabsButtons";
import Blogs from "../components/Home/Blogs";
import { motion } from "framer-motion";
import bgImg from "/bg-img.png";
import { toast } from "react-toastify";
import WhyUs from "@/components/Home/WhyUs";
import HowItWorks from "@/components/Home/HowItWorks";
import RecentProducts from "@/components/Home/RecentProducts";

const Home = () => {
  const [emailModal, setEmailModal] = useState(false);
  const [discountModal, setDiscountModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  
  // useEffect(() => {
  //   setDiscountModal(true)
  // }, [])
  const [loading, setLoading] = useState(false);
  const [cookieModal, setCookieModal] = useState(false);

  useEffect(() => {
    const cookieShown = sessionStorage.getItem("cookieModalShown");
    if (!cookieShown) {
      setCookieModal(true);
      sessionStorage.setItem("cookieModalShown", "true");
    }
  }, []);

  useEffect(() => {
    const modalShown = sessionStorage.getItem("discountModalShown");
    if (!modalShown) {
      setDiscountModal(true);
      sessionStorage.setItem("discountModalShown", "true");
    }
  }, []);
  const [error, setError] = useState("");
  const handleSubmit = async (coupon, discount) => {
    setLoading(true);
    if (!emailInput) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailInput)) {
      setError("Invalid email");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscription/add-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailInput,
            coupon: coupon,
            discount: discount,
          }),
        }
      );

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response not OK:", response.status, errorText);
        toast.error(`Server error: ${response.status}`);
        setError(`Server error: ${response.status}`);
        setLoading(false);
        return;
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("Non-JSON response:", responseText);
        toast.error("Server returned invalid response");
        setError("Server returned invalid response");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setEmailModal(false);
        setEmailInput("");
        setError("");
        toast.success(
          "You have successfully subscribed. Go get your code from your email."
        );
        setDiscountModal(false);
        setLoading(false);
      } else {
        toast.error(data.message);
        setError(data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Network/Parse error:", error);
      toast.error("Connection failed. Please check if the server is running.");
      setError("Connection failed. Please check if the server is running.");
      setLoading(false);
    }
  };
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [coupenLoading, setCoupenLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  const fetchCurrentCoupon = async () => {
    try {
      setCoupenLoading(true);
      const response = await fetch(`${API_BASE}/api/coupen/get`);
      const data = await response.json();
      if (response.ok && data.length > 0) {
        const coupons = data.filter((coupon) => coupon.isActive == true);
        setCoupons(coupons);

        // Strategy 1: Show the coupon with highest discount
        const bestCoupon = coupons.reduce((best, current) =>
          current.discount > best.discount ? current : best
        );

        // Strategy 2: Show a random coupon
        // const randomCoupon = data[Math.floor(Math.random() * data.length)];

        // Strategy 3: Show the first coupon
        // const firstCoupon = data[0];

        setSelectedCoupon(bestCoupon);
        setCoupenLoading(false);
      } else {
        setCoupons([]);
        setSelectedCoupon(null);
        setCoupenLoading(false);
      }
    } catch (error) {
      setCoupenLoading(false);
      setCoupons([]);
      setSelectedCoupon(null);
      console.error("Error fetching current coupon:", error);
    }
  };

  useEffect(() => {
    if (!coupons.length) {
      fetchCurrentCoupon();
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
      <RecentProducts />

      <div className="">
        <Sale />
      </div>
      {/* <TabsButtons /> */}
      {/* <div className="lg:mb-60 md:mb-60 mb-72">
        <Promotional />
      </div> */}
      <Blogs />
      <WhyUs />
      <HowItWorks />

      {discountModal && (
        <motion.div className="fixed top-0 bottom-0 right-0 left-0 inset-0 bg-black backdrop-blur-sm bg-opacity-50 z-50 flex justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0.2, z: 50 }}
            transition={{ duration: 0.3 }}
            whileInView={{ opacity: 1, z: 0 }}
            viewport={{ once: true }}
            className="flex w-[90%] md:max-w-[30%] sm:w-full text-gray-800 justify-center bg-white rounded-[15px] relative"
          >
            <div className="fixed inset-0 z-[1000] flex items-center justify-center">
              <div className="absolute" />
              <div className="relative w-full max-w-md mx-4">
                <div className="absolute -inset-2 -z-10 rotate-2 rounded-3xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 opacity-30 blur-2xl" />
                <div className="relative rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-slate-100">
                  <p
                    className="absolute max-sm:top-[0] right-[20px] top-4 text-lg font-semibold cursor-pointer"
                    onClick={() => setDiscountModal(false)}
                  >
                    x
                  </p>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-900">
                      Celebrate Savings
                    </h3>
                    <p className="mt-1 text-slate-600">Your reward is ready</p>
                    <div
                      className={`mt-5 ${
                        coupenLoading || !selectedCoupon?.discount
                          ? "text-xl font-semibold"
                          : "text-5xl font-extrabold"
                      }  text-slate-900`}
                    >
                      {coupenLoading
                        ? "Loading..."
                        : `${
                            selectedCoupon?.discount
                              ? selectedCoupon.discount + " % OFF"
                              : "No discount available"
                          } `}
                    </div>
                    {/* <div className="mt-5 rounded-xl text-2xl bg-slate-50 px-5 py-4 text-slate-900 ring-1 ring-slate-200">
             CODE:{" "}
             <span className="font-semibold text-2xl tracking-wider">
               {code}
             </span>
           </div> */}
                    <button
                      onClick={() => setEmailModal(true)}
                      disabled={!selectedCoupon?.discount}
                      className={`mt-6 inline-flex w-max items-center justify-center rounded-xl ${
                        selectedCoupon?.discount
                          ? "bg-blue-600"
                          : "bg-gray-600 cursor-not-allowed"
                      } bg-blue-600 px-5 py-3 text-white font-semibold ${
                        selectedCoupon?.discount
                          ? "hover:bg-blue-800"
                          : "hover:bg-gray-800"
                      }`}
                    >
                      Subscribe & Redeem
                    </button>
                    <p className="mt-3 text-xs text-slate-500">
                      Limited time offer.
                    </p>
                    <p className="mt-1 italic text-xs text-slate-500">
                      * Terms & conditions applies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      {cookieModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
              <h3 className="text-base font-medium text-gray-900">
                🍪 Cookies
              </h3>
              <button
                onClick={() => setCookieModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
              <p className="text-gray-600 text-sm mb-4">
                We use cookies to improve your experience. Accept to continue or
                decline to opt out.
              </p>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setCookieModal(false)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => setCookieModal(false)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {emailModal && (
        <motion.div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 z-50 flex justify-center items-center p-4">
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
                  handleSubmit(selectedCoupon.coupen, selectedCoupon.discount);
                }}
                className={`px-4 py-2 rounded bg-blue-600 ${
                  loading && "opacity-50 cursor-not-allowed"
                } text-white font-medium`}
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
