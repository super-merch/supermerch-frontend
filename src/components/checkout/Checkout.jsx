import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa6";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import CreditCard from "../creditcard/CreditCard";
import {
  clearCart,
  selectCurrentUserCartItems,
} from "@/redux/slices/cartSlice";
import { loadStripe } from "@stripe/stripe-js";
import { products } from "../shop/ProductData";
import AddressAutocomplete from "./AddessAutocomplete";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = useSelector(selectCurrentUserCartItems);
  console.log(items, "items");

  const { token, addressData, backednUrl,shippingAddressData, totalDiscount } =
    useContext(AppContext);

  const [checkoutTab, setCheckoutTab] = useState("billing");
  const dispatch = useDispatch();

  // Get coupon data from navigation state (passed from cart)
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    // Get coupon data from location state if available
    if (location.state?.appliedCoupon) {
      setAppliedCoupon(location.state.appliedCoupon);
      setCouponDiscount(location.state.couponDiscount || 0);
    }

    // Handle payment success from Success page redirect
    if (location.state?.paymentSuccess && location.state?.sessionId) {
      handlePaymentSuccess(location.state.sessionId);
    }
  }, [location.state]);
  // Add this state for shipping charges
  const [shippingCharges, setShippingCharges] = useState(0);

  // Add this useEffect to get shipping charges from location state or API
  useEffect(() => {
    // First try to get from location state (passed from cart)
    if (location.state?.shippingCharges) {
      setShippingCharges(location.state.shippingCharges);
    } else {
      // Fallback: fetch from API if not in location state
      const getShippingCharges = async () => {
        try {
          const response = await axios.get(`${backednUrl}/api/shipping/get`);
          setShippingCharges(response.data.shipping || 0);
        } catch (error) {
          console.error("Error fetching shipping charges:", error);
          setShippingCharges(0);
        }
      };
      getShippingCharges();
    }
  }, [location.state, backednUrl]);

  // Handle successful payment
  const handlePaymentSuccess = async (sessionId) => {
    try {
      // Get checkout data from localStorage
      const storedCheckoutData = localStorage.getItem("pendingCheckoutData");
      if (!storedCheckoutData) {
        toast.error("Order data not found. Please try again.");
        return;
      }

      const checkoutData = JSON.parse(storedCheckoutData);

      // Place the order
      const headers = token ? { headers: { token } } : {};
      const response = await axios.post(
        `${backednUrl}/api/checkout/checkout`,
        checkoutData,
        headers
      );

      // Clear the stored data
      localStorage.removeItem("pendingCheckoutData");

      // Success actions
      dispatch(clearCart());
      toast.success("Order placed successfully!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Order Failed:", error.response?.data || error.message);
      toast.error("Failed to place the order. Please try again.");
      // Clear the stored data even on error
      localStorage.removeItem("pendingCheckoutData");
    }
  };

  const { register, handleSubmit, watch, getValues, setValue } = useForm({
    defaultValues: {
      billing: {
        firstName: addressData?.firstName || "",
        lastName: addressData?.lastName || "",
        companyName: addressData?.companyName || "",
        address: addressData?.addressLine || "",
        country: addressData?.country || "",
        region: addressData?.state || "",
        city: addressData?.city || "",
        zip: addressData?.postalCode || "",
        email: addressData?.email || "",
        phone: addressData?.phone || "",
      },
      shipping: {
      // Update these to use shippingAddressData
      firstName: shippingAddressData?.firstName || "",
      lastName: shippingAddressData?.lastName || "",
      companyName: shippingAddressData?.companyName || "",
      address: shippingAddressData?.addressLine || "",
      country: shippingAddressData?.country || "",
      region: shippingAddressData?.state || "",
      city: shippingAddressData?.city || "",
      zip: shippingAddressData?.postalCode || "",
      email: shippingAddressData?.email || "",
      phone: shippingAddressData?.phone || "",
    },
      paymentMethod: "card",
    },
  });
  const paymentMethod = watch("paymentMethod");

  const totalDiscountPercent = items.reduce(
    (sum, item) => sum + (totalDiscount[item.id] || 0),
    0
  );

  // Base total calculation
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Apply the same calculation logic as cart page
  // Apply product discounts first
  const productDiscountedAmount =
    totalAmount - (totalAmount * totalDiscountPercent) / 100;

  // Apply coupon discount to the product-discounted amount
  const couponDiscountAmount = (productDiscountedAmount * couponDiscount) / 100;
  const finalDiscountedAmount = productDiscountedAmount - couponDiscountAmount;

  // Calculate GST and final total (same as cart)
  const gstAmount = (finalDiscountedAmount + shippingCharges) * 0.1; // 10%
  const total = finalDiscountedAmount + gstAmount + shippingCharges;
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data) => {
    setLoading(true);
    if (items.length === 0) {
      toast.error("Cart is empty");
      setLoading(false);
      return;
    }
    const resolvedEmail =
  (data?.billing?.email && data.billing.email.trim()) ||
  (data?.shipping?.email && data.shipping.email.trim()) ||
  addressData?.email ||
  "";

const resolvedPhone =
  (data?.billing?.phone && data.billing.phone.trim()) ||
  (data?.shipping?.phone && data.shipping.phone.trim()) ||
  addressData?.phone ||
  "";
    const checkoutData = {
      //orderId in format of "SM-(DATE)-(Random 5 digits)"
      orderId: `SM-${new Date()
        .toISOString()
        .slice(2, 10)
        .replace(/-/g, "")
        .slice(2)}-${Math.floor(Math.random() * 100000)}`,
      user: {
        firstName: data.billing.firstName || addressData.firstName,
        lastName: data.billing.lastName || addressData.lastName,
        email: resolvedEmail || addressData.email,
        phone: resolvedPhone || addressData.phone,
      },
      billingAddress: {
        country: data.billing.country || addressData.country,
        state: data.billing.region || addressData.state,
        city: data.billing.city || addressData.city,
        postalCode: data.billing.zip || addressData.postalCode,
        addressLine: data.billing.address || addressData.addressLine,
        companyName: data.billing.companyName || addressData.companyName,
      },
      shippingAddress: {
        firstName: data.shipping.firstName,
        lastName: data.shipping.lastName,
        country: data.shipping.country,
        state: data.shipping.region,
        city: data.shipping.city,
        postalCode: data.shipping.zip,
        addressLine: data.shipping.address,
        companyName: data.shipping.companyName,
        email: data.shipping.email,
        phone: data.shipping.phone,
      },
      products: items.map((item) => ({
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
        subTotal: item.price * item.quantity,
        color: item.color,
        print: item.print,
        logoColor: item.logoColor,
        logo: item.dragdrop,
        id: item.id,
        size: item.size,
        supplierName: item.supplierName,
      })),
      shipping: shippingCharges,
      discount: totalDiscountPercent,
      // Add coupon information to order data
      coupon: appliedCoupon
        ? {
            code: appliedCoupon.coupen,
            discount: couponDiscount,
            discountAmount: couponDiscountAmount,
          }
        : null,
      gst: gstAmount,
      total,
      paymentStatus: "Paid",
    };

    if (
      !data.shipping.firstName ||
      !data.shipping.lastName ||
      !data.shipping.address ||
      !data.shipping.country ||
      !data.shipping.region ||
      !data.shipping.city ||
      !data.shipping.zip ||
      !data.shipping.email ||
      !data.shipping.phone
    ) {
      setLoading(false);
      return toast.error("Please fill all the fields in shipping address");
    }
    if (
      !data.billing.firstName ||
      !data.billing.lastName ||
      !data.billing.address ||
      !data.billing.country ||
      !data.billing.region ||
      !data.billing.city ||
      !data.billing.zip
      // !data.billing.email ||
      // !data.billing.phone
    ) {
      setLoading(false);
      return toast.error("Please fill all the fields in billing address");
    }
    if (products.length === 0) {
      setLoading(false);
      return toast.error("Please add some products to checkout");
    }

    if (!token) {
      toast.info(
        "Proceeding as guest. Create an account later to view order history."
      );
    }

    try {
      // Store checkout data in localStorage before redirecting to Stripe
      localStorage.setItem("pendingCheckoutData", JSON.stringify(checkoutData));

      const stripe = await loadStripe(
        "pk_test_51RqoZXGaJ07cWJBqahLsX614YCqHKSaVwLcxxcYf9kYJbbX0Ww8tRrxfh8neqnoGkqh3ofUJ9qqA6tnavunDTJSY00ovkitoWt"
      );
      const body = {
        products: items,
        gst: gstAmount,
        shipping: shippingCharges,
        // Add coupon information to the request body
        coupon: appliedCoupon
          ? {
              code: appliedCoupon.coupen,
              discount: couponDiscount, // This should be the discount percentage
              discountAmount: couponDiscountAmount, // This should be the calculated discount amount
            }
          : null,
      };

      const resp = await axios.post(
        `${backednUrl}/create-checkout-session`,
        body
      );
      const session = await resp.data;

      if (!session.id) {
        setLoading(false);
        // Clear stored data on error
        localStorage.removeItem("pendingCheckoutData");
        return toast.error(
          "Failed to create payment session. Please try again."
        );
      }
      setLoading(false);
      // Redirect to Stripe Checkout
      await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      // Note: Code after this point will NOT execute due to the redirect
    } catch (error) {
      setLoading(false);
      console.error("Payment Failed:", error.response?.data || error.message);
      // Clear stored data on error
      localStorage.removeItem("pendingCheckoutData");
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  const isBillingComplete = () => {
    const billing = getValues("billing");
    return (
      billing.firstName &&
      billing.lastName &&
      billing.address &&
      billing.country &&
      billing.region &&
      billing.city &&
      billing.zip 
      // billing.email &&
      // billing.phone
    );
  };

  return (
    <div className="py-8 Mycontainer">
      <h2 className="mb-6 text-3xl font-bold">Checkout</h2>
      <div className="flex items-center">
        <div className="flex items-center p-1 space-x-1 overflow-x-auto text-sm text-black rtl:space-x-reverse bg-slate-300/50 rounded-xl">
          <button
            role="tab"
            type="button"
            className={`flex whitespace-nowrap items-center h-8 px-5 font-medium rounded-lg outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-inset text-yellow-600 transition-all
              ${
                checkoutTab === "billing" && "shadow bg-smallHeader text-white"
              }`}
            onClick={() => setCheckoutTab("billing")}
            aria-selected=""
          >
            Billing
          </button>

          <button
            role="tab"
            type="button"
            className={`flex whitespace-nowrap items-center h-8 px-5 font-medium rounded-lg outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-inset text-yellow-600 transition-all ${
              checkoutTab === "shipping" && "shadow bg-smallHeader text-white"
            }`}
            onClick={() => setCheckoutTab("shipping")}
          >
            Shipping
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-wrap items-start gap-5 lg:flex-nowrap">
          {checkoutTab === "billing" && (
            <div className="w-full lg:w-[70%] border lg:p-6 md:p-6 p-3">
              <h3 className="mb-4 text-xl font-medium">Billing Information</h3>
              <div className="grid items-center gap-4 lg:grid-cols-3 md:grid-cols-3">
                <div>
                  <p className="pb-1">
                    First Name <span className="text-red-600 ">*</span>{" "}
                  </p>
                  <input
                    type="text"
                    defaultValue={addressData?.firstName || ""}
                    placeholder="First Name"
                    {...register("billing.firstName", { required: true })}
                    className="w-full p-2 border"
                  />
                </div>
                <div>
                  <p className="pb-1">
                    Last name <span className="text-red-600 ">*</span>{" "}
                  </p>
                  <input
                    type="text"
                    placeholder="Last Name"
                    {...register("billing.lastName")}
                    className="w-full p-2 border"
                  />
                </div>
                <div>
                  <p className="pb-1">
                    Company Name <span className="text-red-600 ">*</span>{" "}
                  </p>
                  <input
                    type="text"
                    placeholder="Company Name"
                    {...register("billing.companyName")}
                    className="w-full p-2 border "
                  />
                </div>
              </div>
              <div className="mt-4">
                <p>
                  Address <span className="text-red-600 ">*</span>
                </p>

                {/* Autocomplete component (Nominatim) */}
                <AddressAutocomplete
                  placeholder="Start typing address..."
                  defaultValue={getValues("billing.address")}
                  countryCode="au"
                  onSelect={(place) => {
                    // place is a Nominatim result with .display_name, .lat, .lon and .address object
                    setValue("billing.address", place.display_name || "");
                    // populate structured fields if available
                    const addr = place.address || {};
                    // Nominatim keys: house_number, road, suburb, city, town, village, state, postcode, country
                    setValue(
                      "billing.city",
                      addr.city ||
                        addr.town ||
                        addr.village ||
                        addr.hamlet ||
                        ""
                    );
                    setValue("billing.region", addr.state || "");
                    setValue("billing.zip", addr.postcode || "");
                    setValue("billing.country", addr.country || "Australia");
                    // optionally keep lat/lng (not currently in form) — you could store to localStorage or hidden fields
                  }}
                />

                {/* keep a hidden input registered so react-hook-form validation works */}
                <input
                  type="hidden"
                  {...register("billing.address", { required: true })}
                  value={getValues("billing.address")}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-4 md::grid-cols-4 sm:grid-cols-3">
                <div className="flex flex-col">
                  <label htmlFor="country" className="mb-1 text-sm">
                    Country <span className="text-red-600 ">*</span>
                  </label>
                  <select
                    id="country"
                    {...register("billing.country", { required: true })}
                    className="p-2 border"
                  >
                    {addressData?.country && (
                      <option value={addressData?.country}>
                        {addressData?.country}
                      </option>
                    )}
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="region" className="mb-1 text-sm">
                    Region/State <span className="text-red-600 ">*</span>
                  </label>
                  <select
                    id="region"
                    {...register("billing.region", { required: true })}
                    className="p-2 border"
                  >
                    {addressData?.state && (
                      <option value={addressData?.state}>
                        {addressData?.state}
                      </option>
                    )}
                    <option value="New South Wales">New South Wales</option>
                    <option value="Victoria">Victoria</option>
                    <option value="Queensland">Queensland</option>
                    <option value="Western Australia">Western Australia</option>
                    <option value="South Australia">South Australia</option>
                    <option value="Tasmania">Tasmania</option>
                    <option value="Northern Territory">
                      Northern Territory
                    </option>
                    <option value="Australian Capital Territory">
                      Australian Capital Territory
                    </option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="city" className="mb-1 text-sm">
                    City <span className="text-red-600 ">*</span>
                  </label>
                  <select
                    id="city"
                    {...register("billing.city", { required: true })}
                    className="p-2 border"
                  >
                    {addressData?.city && (
                      <option value={addressData.city}>
                        {addressData?.city}
                      </option>
                    )}
                    <option value="Sydney">Sydney</option>
                    <option value="Melbourne">Melbourne</option>
                    <option value="Brisbane">Brisbane</option>
                    <option value="Perth">Perth</option>
                    <option value="Adelaide">Adelaide</option>
                    <option value="Gold Coast">Gold Coast</option>
                    <option value="Canberra">Canberra</option>
                    <option value="Newcastle">Newcastle</option>
                    <option value="Wollongong">Wollongong</option>
                    <option value="Hobart">Hobart</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="zip" className="mb-1 text-sm">
                    Postal Code <span className="text-red-600 ">*</span>
                  </label>
                  <input
                    id="zip"
                    type="text"
                    placeholder=""
                    {...register("billing.zip", { required: true })}
                    className="p-2 border"
                  />
                </div>
              </div>
              {/* <div className="grid gap-4 mt-4 lg:grid-cols-2 md:grid-cols-2">
                <div>
                  <p>
                    Email <span className="text-red-600 ">*</span>
                  </p>
                  <input
                    type="email"
                    placeholder="Email"
                    {...register("billing.email", { required: true })}
                    className="w-full p-2 mt-1 border"
                  />
                </div>
                <div>
                  <p>
                    Phone Number <span className="text-red-600 ">*</span>
                  </p>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    {...register("billing.phone", { required: true })}
                    className="w-full p-2 mt-1 border"
                  />
                </div>
              </div> */}
            </div>
          )}

          {checkoutTab === "shipping" && (
            <div className="w-full lg:w-[70%] border lg:p-6 md:p-6 p-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">Shipping Information</h3>
                <button
                  type="button"
                  onClick={() => {
                    const billingValues = getValues("billing");
                    Object.keys(billingValues).forEach((key) => {
                      setValue(`shipping.${key}`, billingValues[key]);
                    });
                  }}
                  disabled={!isBillingComplete()}
                  className={`inline-flex justify-center items-center gap-2 font-medium px-4 py-2 text-sm text-white rounded ${
                    isBillingComplete()
                      ? "bg-smallHeader"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  <FaCheck className="text-base" />
                  Copy Billing Details
                </button>
              </div>
              <div className="grid items-center gap-4 lg:grid-cols-3 md:grid-cols-3">
                <div>
                  <p className="pb-1">
                    First Name <span className="text-red-600 ">*</span>{" "}
                  </p>
                  <input
                    type="text"
                    placeholder="First Name"
                    {...register("shipping.firstName", { required: true })}
                    className="w-full p-2 border"
                  />
                </div>
                <div>
                  <p className="pb-1">
                    Last name <span className="text-red-600 ">*</span>{" "}
                  </p>
                  <input
                    type="text"
                    placeholder="Last Name"
                    {...register("shipping.lastName")}
                    className="w-full p-2 border"
                  />
                </div>
                <div>
                  <p className="pb-1">
                    Company Name <span className="text-red-600 ">*</span>{" "}
                  </p>
                  <input
                    type="text"
                    placeholder="Company Name"
                    {...register("shipping.companyName")}
                    className="w-full p-2 border "
                  />
                </div>
              </div>
              <div className="mt-4">
                <p>
                  Address <span className="text-red-600 ">*</span>
                </p>

                <AddressAutocomplete
                  placeholder="Start typing address..."
                  defaultValue={getValues("shipping.address")}
                  countryCode="au"
                  onSelect={(place) => {
                    setValue("shipping.address", place.display_name || "");
                    const addr = place.address || {};
                    setValue(
                      "shipping.city",
                      addr.city ||
                        addr.town ||
                        addr.village ||
                        addr.hamlet ||
                        ""
                    );
                    setValue("shipping.region", addr.state || "");
                    setValue("shipping.zip", addr.postcode || "");
                    setValue("shipping.country", addr.country || "Australia");
                  }}
                />

                <input
                  type="hidden"
                  {...register("shipping.address", { required: true })}
                  value={getValues("shipping.address")}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-4 md::grid-cols-4 sm:grid-cols-3">
                <div className="flex flex-col">
                  <label htmlFor="country" className="mb-1 text-sm">
                    Country <span className="text-red-600 ">*</span>
                  </label>
                  <select
                    id="country"
                    {...register("shipping.country", { required: true })}
                    className="p-2 border"
                  >
                    {addressData?.country && (
                      <option value={addressData?.country}>
                        {addressData?.country}
                      </option>
                    )}
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="region" className="mb-1 text-sm">
                    Region/State <span className="text-red-600 ">*</span>
                  </label>
                  <select
                    id="region"
                    {...register("shipping.region", { required: true })}
                    className="p-2 border"
                  >
                    {addressData?.state && (
                      <option value={addressData?.state}>
                        {addressData?.state}
                      </option>
                    )}
                    <option value="New South Wales">New South Wales</option>
                    <option value="Victoria">Victoria</option>
                    <option value="Queensland">Queensland</option>
                    <option value="Western Australia">Western Australia</option>
                    <option value="South Australia">South Australia</option>
                    <option value="Tasmania">Tasmania</option>
                    <option value="Northern Territory">
                      Northern Territory
                    </option>
                    <option value="Australian Capital Territory">
                      Australian Capital Territory
                    </option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="city" className="mb-1 text-sm">
                    City <span className="text-red-600 ">*</span>
                  </label>
                  <select
                    id="city"
                    {...register("shipping.city", { required: true })}
                    className="p-2 border"
                  >
                    {addressData?.city && (
                      <option value={addressData.city}>
                        {addressData?.city}
                      </option>
                    )}
                    <option value="Sydney">Sydney</option>
                    <option value="Melbourne">Melbourne</option>
                    <option value="Brisbane">Brisbane</option>
                    <option value="Perth">Perth</option>
                    <option value="Adelaide">Adelaide</option>
                    <option value="Gold Coast">Gold Coast</option>
                    <option value="Canberra">Canberra</option>
                    <option value="Newcastle">Newcastle</option>
                    <option value="Wollongong">Wollongong</option>
                    <option value="Hobart">Hobart</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="zip" className="mb-1 text-sm">
                    Postal Code <span className="text-red-600 ">*</span>
                  </label>
                  <input
                    id="zip"
                    type="text"
                    placeholder=""
                    {...register("shipping.zip", { required: true })}
                    className="p-2 border"
                  />
                </div>
              </div>
              <div className="grid gap-4 mt-4 lg:grid-cols-2 md:grid-cols-2">
                <div>
                  <p>
                    Email <span className="text-red-600 ">*</span>
                  </p>
                  <input
                    type="email"
                    placeholder="Email"
                    {...register("shipping.email", { required: true })}
                    className="w-full p-2 mt-1 border"
                  />
                </div>
                <div>
                  <p>
                    Phone Number <span className="text-red-600 ">*</span>
                  </p>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    {...register("shipping.phone", { required: true })}
                    className="w-full p-2 mt-1 border"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="w-full h-fit lg:w-[30%] border p-5 bg-line">
            <h3 className="mb-4 text-xl font-medium">Order Summary</h3>

            {/* Applied Coupon Display in Order Summary */}
            {appliedCoupon && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      ✅ Coupon Applied: {appliedCoupon.coupen}
                    </p>
                    <p className="text-xs text-green-600">
                      You saved {couponDiscount}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            <ul>
              {items.map((item) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <li key={item.id} className="flex justify-between py-2">
                    <div className="flex gap-4">
                      <div className="">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-12 h-12"
                        />
                      </div>

                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-600">
                            {item.quantity} x
                          </p>
                          <p className="text-sm font-medium text-smallHeader">
                            ${item.price}
                          </p>
                        </div>

                        <p className="py-1 text-sm font-medium ">
                          Color: {item.color || "No Color"}
                        </p>
                        <p className="text-sm font-medium">
                          Print: {item.print || "No print method selected"}
                        </p>
                        <p className="text-sm font-medium">
                          Size: {item.size || "No size"}
                        </p>
                        <p className="text-sm font-medium">
                          Logo Color: {item.logoColor || "No color selected"}
                        </p>
                        <p className="text-sm font-medium">
                          Est Delivery Date:{" "}
                          {item.deliveryDate || "No delivery date"}
                        </p>
                        <div className="flex gap-3 mt-1 text-sm font-medium">
                          <p>Logo:</p>
                          {item.dragdrop ? (
                            <img
                              src={item.dragdrop}
                              alt=""
                              className="w-8 h-8 rounded-md"
                            />
                          ) : (
                            "No Logo image"
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sub-total:</span>
                <span>
                  $
                  {totalAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>
                  {shippingCharges > 0
                    ? `$${shippingCharges.toFixed(2)}`
                    : "Free"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Product Discount:</span>
                <span>{totalDiscountPercent}%</span>
              </div>

              {/* Show coupon discount if applied */}
              {appliedCoupon && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span>Coupon ({appliedCoupon.coupen}):</span>
                    <span className="text-green-600">-{couponDiscount}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discounted Price:</span>
                    <span className="text-green-600">
                      ${finalDiscountedAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>GST(10%):</span>
                <span>${gstAmount.toFixed(2)}</span>
              </div>
            </div>
            <hr className="my-4" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <img
                  src="/stripe.png"
                  className="rounded-full w-6 h-6"
                  alt=""
                />
                <label htmlFor="credit-card" className="text-md font-semibold">
                  Pay Using Stripe
                </label>
              </div>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>
                $
                {total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            {items.length === 0 && (
              <div className="text-red-600">Your cart is empty</div>
            )}
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className={`w-full py-3 mt-4 font-medium text-white ${
                loading && "bg-opacity-25"
              } bg-smallHeader ${
                items.length === 0 && "bg-opacity-30 cursor-not-allowed"
              } `}
            >
              {loading
                ? "Please Wait...."
                : `Pay $${total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
