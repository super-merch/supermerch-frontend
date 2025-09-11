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

const Home = () => {
  const [emailModal, setEmailModal] = useState(false);
  const [discountModal, setDiscountModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  // useEffect(() => {
  //   setDiscountModal(true)
  // }, [])
  const [loading, setLoading] = useState(false);
  const [cookieModal, setCookieModal] = useState(false);
  const [couponModal, setCouponModal] = useState(false);

  useEffect(() => {
    const cookieShown = sessionStorage.getItem("cookieModalShown");
    if (!cookieShown) {
      setCookieModal(true);
      sessionStorage.setItem("cookieModalShown", "true");
    }
  }, []);

  // useEffect(() => {
  //   const modalShown = sessionStorage.getItem("discountModalShown");
  //   if (!modalShown) {
  //     setDiscountModal(true);
  //     sessionStorage.setItem("discountModalShown", "true");
  //   }
  // }, []);
  const [error, setError] = useState("");
  const handleSubmit = async (coupon, discount) => {
    console.log(coupon, discount);
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
        setCoupons(data);

        // Strategy 1: Show the coupon with highest discount
        const bestCoupon = data.reduce((best, current) =>
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
    fetchCurrentCoupon();
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

      {discountModal && (
        <motion.div className="fixed top-0 bottom-0 right-0 left-0 inset-0 bg-black backdrop-blur-sm bg-opacity-50 z-50 flex justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0.2, z: 50 }}
            transition={{ duration: 0.3 }}
            whileInView={{ opacity: 1, z: 0 }}
            viewport={{ once: true }}
            className="flex w-[90%] md:max-w-[30%] sm:w-full text-gray-800 justify-center bg-white rounded-md relative"
          >
            <div className="fixed inset-0 z-[1000] flex items-center justify-center">
              <div className="absolute" />
              <div className="relative w-full max-w-md mx-4">
                <div className="absolute -inset-2 -z-10 rotate-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 opacity-30 blur-2xl" />
                <div className="relative rounded-xl bg-white p-4 shadow-2xl ring-1 ring-slate-100">
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
                        coupenLoading
                          ? "text-xl font-semibold"
                          : "text-5xl font-extrabold"
                      }  text-slate-900`}
                    >
                      {coupenLoading
                        ? "Loading..."
                        : `${selectedCoupon?.discount} % OFF`}
                    </div>
                    {/* <div className="mt-5 rounded-xl text-2xl bg-slate-50 px-5 py-4 text-slate-900 ring-1 ring-slate-200">
             CODE:{" "}
             <span className="font-semibold text-2xl tracking-wider">
               {code}
             </span>
           </div> */}
                    <button
                      onClick={() => setEmailModal(true)}
                      className="mt-6 inline-flex w-max items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-800"
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
        <>
          {/* Backdrop overlay */}
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"></div>

          {/* Modal */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Content */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 text-lg font-semibold mb-2">
                      Cookie Preferences
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed mb-3">
                      We use cookies to enhance your browsing experience,
                      provide personalized content, and analyze our traffic. By
                      continuing to use our site, you consent to our use of
                      cookies.
                    </p>
                    <p className="text-gray-600 text-sm">
                      You can manage your preferences at any time.{" "}
                      <a
                        href="/privacy"
                        className="text-blue-600 underline hover:text-blue-700 font-medium"
                      >
                        View our Privacy Policy
                      </a>
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0 w-full lg:w-auto">
                  <button
                    onClick={() => {
                      setCookieModal(false);
                      setTimeout(() => setDiscountModal(true), 500);
                    }}
                    className="px-6 py-3 text-gray-700 hover:text-gray-900 text-base font-medium transition-colors duration-200 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Decline All
                  </button>

                  <button
                    onClick={() => {
                      setCookieModal(false);
                      setTimeout(() => setDiscountModal(true), 500);
                    }}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-semibold transition-colors duration-200 shadow-lg"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={() => {
                      setCookieModal(false);
                      setTimeout(() => setDiscountModal(true), 500);
                    }}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 self-center sm:self-auto"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
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
