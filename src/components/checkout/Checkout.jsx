import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa6";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { AppContext } from "../../context/AppContext";
import { ProductsContext } from "../../context/ProductsContext";
import { toast } from "react-toastify";
import CreditCard from "../creditcard/CreditCard";
import {
  clearCart,
  selectCurrentUserCartItems,
} from "@/redux/slices/cartSlice";
import { loadStripe } from "@stripe/stripe-js";
import { products } from "../shop/ProductData";
import AddressAutocomplete from "./AddressAutocomplete";
import { User } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = useSelector(selectCurrentUserCartItems);
  const { token, addressData, shippingAddressData, userData, loadUserOrder } =
    useContext(AuthContext);
  const { totalDiscount } = useContext(ProductsContext);
  const {
    backendUrl,
    openLoginModal,
    setOpenLoginModal,
    shippingCharges,
    setupFee,
    gstCharges,
  } = useContext(AppContext);
  console.log(gstCharges);
  // Collapsible step states
  const [openCustomer, setOpenCustomer] = useState(true);
  const [openShipping, setOpenShipping] = useState(false);
  const [openBilling, setOpenBilling] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(false);
  // Legacy tab state removed in favor of collapsible steps
  const dispatch = useDispatch();

  // Get coupon data from navigation state (passed from cart)
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Get artwork data from upload artwork page
  const [artworkFile, setArtworkFile] = useState(null);
  const [artworkInstructions, setArtworkInstructions] = useState("");
  const [artworkOption, setArtworkOption] = useState("");

  // Login modal states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginModalRef, setLoginModalRef] = useState(null);
  const [processLoading, setProcessLoading] = useState(false);
  const saveUser = async (shippingAddressData, addressData) => {
    if (userData) {
      if (!userData?.defaultShippingAddress) {
        try {
          const response = await axios.put(
            `${import.meta.env.VITE_BACKEND_URL
            }/api/auth/update-shipping-address`,
            { defaultShippingAddress: shippingAddressData },
            {
              headers: {
                token,
              },
            },
          );

          if (response.data.success) {
            toast.success("Shipping address saved successfully!");
          } else {
            toast.error("Failed to save shipping address.");
          }
          const resp = await axios.put(
            `${backendUrl}/api/auth/update-address`,
            { defaultAddress: addressData },
            {
              headers: {
                token,
              },
            },
          );

          if (resp.data.success) {
            toast.success("Address saved successfully!");
          } else {
            toast.error("Failed to save address.");
          }
        } catch (error) {
          console.error("Error saving shipping address:", error);
          toast.error("An error occurred while saving the shipping address.");
        }
      }
    }
  };

  useEffect(() => {
    // Get coupon data from location state if available
    if (location.state?.appliedCoupon) {
      setAppliedCoupon(location.state.appliedCoupon);
      setCouponDiscount(location.state.couponDiscount || 0);
    }

    // Get artwork data from upload artwork page
    if (location.state?.artworkFile) {
      setArtworkFile(location.state.artworkFile);
    }
    if (location.state?.artworkInstructions) {
      setArtworkInstructions(location.state.artworkInstructions);
    }
    if (location.state?.artworkOption) {
      setArtworkOption(location.state.artworkOption);
    }

    // Handle payment success from Success page redirect
    if (location.state?.paymentSuccess && location.state?.sessionId) {
      const sessionId = location.state.sessionId;
      const processedKey = `stripe_session_processed_${sessionId}`;

      // If already done or currently processing, skip
      const status = sessionStorage.getItem(processedKey);
      if (status === "done") {
        return;
      }
      if (status === "processing") {
        return;
      }

      // mark as processing to avoid duplicate runs (will be updated on success/error)
      sessionStorage.setItem(processedKey, "processing");
      handlePaymentSuccess(sessionId)
        .then(() => {
          sessionStorage.setItem(processedKey, "done");
        })
        .catch((err) => {
          console.error(
            "handlePaymentSuccess failed, clearing processing flag",
            err,
          );
          sessionStorage.removeItem(processedKey);
        });
    }
  }, [location.state]);

  // Handle click outside login modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        loginModalRef &&
        !loginModalRef.contains(event.target) &&
        openLoginModal
      ) {
        setOpenLoginModal(false);
        setLoginError("");
        setLoginEmail("");
        setLoginPassword("");
      }
    };

    if (openLoginModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openLoginModal, loginModalRef]);

  // Handle successful payment
  const handlePaymentSuccess = async (sessionId) => {
    try {
      setProcessLoading(true);
      // Get checkout data from localStorage
      const storedCheckoutData = localStorage.getItem("pendingCheckoutData");
      if (!storedCheckoutData) {
        toast.error("Order data not found. Please try again.");
        throw new Error("No pending checkout data");
      }

      const checkoutData = JSON.parse(storedCheckoutData);

      // Add sessionId to checkoutData so backend can store it (optional but recommended)
      checkoutData.stripeSessionId = sessionId;

      // Place the order
      const headers = token ? { headers: { token } } : {};
      const response = await axios.post(
        `${backendUrl}/api/checkout/checkout`,
        checkoutData,
        headers,
      );

      // Clear the stored data only after success
      localStorage.removeItem("pendingCheckoutData");

      // Success actions
      dispatch(clearCart());
      toast.success("Order placed successfully!");
      // Optionally redirect somewhere safe
      navigate("/", { replace: true });
      await loadUserOrder();

      return response.data;
    } catch (error) {
      console.error("Order Failed:", error.response?.data || error.message);
      toast.error("Failed to place the order. Please try again.");
      // Clear the stored data on error? only if you want to avoid stuck data.
      // localStorage.removeItem("pendingCheckoutData");
      throw error;
    } finally {
      setProcessLoading(false);
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
        // email: addressData?.email || "",
        // phone: addressData?.phone || "",
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
  const shippingEmail = watch("shipping.email");
  const shippingPhone = watch("shipping.phone");

  const totalDiscountPercent = items.reduce(
    (sum, item) => sum + (totalDiscount[item.id] || 0),
    0,
  );

  // Base total calculation
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Apply product discounts first
  const productDiscountedAmount =
    totalAmount - (totalAmount * totalDiscountPercent) / 100;

  // Calculate coupon discount amount
  const calculatedCouponDiscount =
    (productDiscountedAmount * couponDiscount) / 100;

  // Check if discount exceeds max limit
  const couponDiscountExceedsLimit =
    appliedCoupon?.maxLimitAmount &&
    calculatedCouponDiscount > appliedCoupon.maxLimitAmount;

  // Cap the discount at maxLimitAmount if it exceeds the limit
  const couponDiscountAmount = appliedCoupon?.maxLimitAmount
    ? Math.min(calculatedCouponDiscount, appliedCoupon.maxLimitAmount)
    : calculatedCouponDiscount;

  // Apply coupon discount to the product-discounted amount
  const finalDiscountedAmount = productDiscountedAmount - couponDiscountAmount;

  const uploadLogo = async () => {
    try {
      if (artworkOption !== "upload") return null;

      // Use the preview property which contains the base64 string
      const logoPayload = artworkFile?.preview;

      if (!logoPayload) {
        throw new Error("No logo data found to upload");
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/upload-logo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logo: logoPayload }),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Upload logo failed:", errText);
        toast.error("Logo upload failed");
        return null;
      }

      const json = await response.json();
      const newLogo = json?.data || json;
      const logoId = newLogo?._id || newLogo?.id;

      if (!logoId) {
        console.warn("uploadLogo: response did not include id", json);
        return null;
      }

      return logoId;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Error uploading logo");
      return null;
    }
  };
  // Calculate GST and final total (same as cart)
  const gstAmount =
    ((finalDiscountedAmount + shippingCharges + setupFee) * gstCharges) / 100; // 10%
  const total = finalDiscountedAmount + gstAmount + shippingCharges + setupFee;
  const [loading, setLoading] = useState(false);
  const onSubmit = async (data) => {
    if (setupFee === undefined) {
      toast.error("Invalid amount please go back to cart page and proceed.");
      return;
    }
    setLoading(true);
    if (items.length === 0) {
      toast.error("Cart is empty");
      setLoading(false);
      return;
    }
    if (
      !data.shipping.firstName ||
      !data.shipping.lastName ||
      !data.shipping.country ||
      !data.shipping.region ||
      !data.shipping.city ||
      !data.shipping.zip
      // !data.shipping.email ||
      // !data.shipping.phone
    ) {
      setLoading(false);
      return toast.error("Please fill all the fields in shipping address");
    }
    if (
      !data.billing.firstName ||
      !data.billing.lastName ||
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
        "Proceeding as guest. Create an account later to view order history.",
      );
    }
    let logoId;
    if (artworkOption == "upload") {
      logoId = await uploadLogo();
      if (!logoId) {
        setLoading(false);
        return;
      }
    }
    const resolvedEmail =
      userData?.email ||
      data?.shipping?.email ||
      addressData?.email ||
      "guest@gmail.com";

    const resolvedPhone =
      userData?.phone ||
      data?.shipping?.phone ||
      addressData?.phone ||
      "1234567890";
    const checkoutData = {
      user: {
        firstName:
          userData?.name || data.billing.firstName || addressData.firstName,
        lastName: userData?.name
          ? ""
          : data.billing.lastName || addressData.lastName,
        email: resolvedEmail || addressData.email,
        phone: resolvedPhone || addressData.phone,
      },
      billingAddress: {
        firstName: data.billing.firstName || addressData.firstName,
        lastName: data.billing.lastName || addressData.lastName,
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
        email: data.shipping.email || userData?.email,
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
        supplierName: item?.supplierName,
      })),
      shipping: shippingCharges,
      setupFee: setupFee,
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
      gstPercent: gstCharges,
      total,
      paymentStatus: "Paid",
      // Add order-level artwork information
      artworkMessage: artworkInstructions,
      artworkOption: artworkOption,
      logoId: logoId,
    };
    try {
      // Store checkout data in localStorage before redirecting to Stripe
      localStorage.setItem("pendingCheckoutData", JSON.stringify(checkoutData));
      saveUser(
        {
          firstName: data.shipping.firstName,
          lastName: data.shipping.lastName,
          country: data.shipping.country,
          state: data.shipping.region,
          city: data.shipping.city,
          postalCode: data.shipping.zip,
          addressLine: data.shipping.address,
          companyName: data.shipping.companyName,
          email: data.shipping.email || userData?.email,
          phone: data.shipping.phone,
        },
        {
          firstName: data.billing.firstName || addressData.firstName,
          lastName: data.billing.lastName || addressData.lastName,
          country: data.billing.country || addressData.country,
          state: data.billing.region || addressData.state,
          city: data.billing.city || addressData.city,
          postalCode: data.billing.zip || addressData.postalCode,
          addressLine: data.billing.address || addressData.addressLine,
          companyName: data.billing.companyName || addressData.companyName,
        },
      );

      const stripe = await loadStripe(
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      );
      const body = {
        products: items,
        gst: gstAmount,
        shipping: shippingCharges,
        setupFee: setupFee,
        // Add coupon information to the request body
        coupon: appliedCoupon
          ? {
            code: appliedCoupon.coupen,
            discount: couponDiscount, // This should be the discount percentage
            discountAmount: couponDiscountAmount, // This should be the calculated discount amount
          }
          : null,
        gstPercent: gstCharges,
      };

      const resp = await axios.post(
        `${backendUrl}/api/create-checkout-session`,
        body,
      );
      const session = await resp.data;

      if (!session.id) {
        setLoading(false);
        // Clear stored data on error
        localStorage.removeItem("pendingCheckoutData");
        return toast.error(
          "Failed to create payment session. Please try again.",
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

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Email and password are required");
      setTimeout(() => setLoginError(""), 2000);
      return;
    }
    setLoginLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, {
        email: loginEmail,
        password: loginPassword,
      });

      if (response.data?.success) {
        const { token } = response.data;
        setToken(token);
        localStorage.setItem("token", token);
        toast.success("Login successful!");
        setOpenLoginModal(false);
        // Clear form
        setLoginEmail("");
        setLoginPassword("");
        setLoginError("");
        // Reload to refresh the page with authenticated state
        window.location.reload();
      }
    } catch (err) {
      setLoginError(err?.response?.data?.message || "Login failed");
      setTimeout(() => setLoginError(""), 2500);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="py-8 Mycontainer">
      <div className="mb-0">
        <h2 className="text-lg text-smallHeader mb-2">
          {`Home  >  Cart  >  ${" "} Checkout`}
        </h2>
        <p className="text-gray-600">Complete your order with secure payment</p>
      </div>

      {/* Collapsible Steps */}
      <div className="mb-4"></div>
      {processLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Processing your payment...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-wrap items-start gap-5 lg:flex-nowrap">
            <div className="w-full lg:w-2/3 space-y-6">
              {/* Step 1: Customer Details */}
              {!token && (
                <div className="relative">
                  <span>
                    Already have an account?{" "}
                    <span
                      onClick={() => {
                        setOpenLoginModal(true);
                      }}
                      className="text-primary hover:text-blue-500 hover:underline cursor-pointer"
                    >
                      Login
                    </span>
                  </span>

                  {/* Login Modal */}
                  {openLoginModal && (
                    <div
                      ref={setLoginModalRef}
                      className="absolute top-8 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
                    >
                      <form onSubmit={handleInlineLogin} className="space-y-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Quick Login
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenLoginModal(false);
                              setLoginError("");
                              setLoginEmail("");
                              setLoginPassword("");
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="you@example.com"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="••••••••"
                            required
                          />
                        </div>

                        {loginError && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {loginError}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Link
                            to="/login"
                            onClick={() => setOpenLoginModal(false)}
                            className="text-sm text-primary hover:underline"
                          >
                            Full login page
                          </Link>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenLoginModal(false);
                                setLoginError("");
                                setLoginEmail("");
                                setLoginPassword("");
                              }}
                              className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={loginLoading}
                              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loginLoading ? "Logging in..." : "Login"}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="px-4 py-3 cursor-pointer flex items-center justify-between border-b border-gray-200 bg-white"
                  onClick={() => setOpenCustomer(!openCustomer)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Customer Details
                      </h3>
                      <p className="text-sm text-gray-500">
                        Basic contact info
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Toggle customer"
                    className={`transition-transform ${openCustomer ? "rotate-180" : "rotate-0"
                      }`}
                  >
                    <svg
                      className="w-8 h-8 text-gray-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                {openCustomer && (
                  <div className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="Enter email address"
                          {...register("shipping.email")}
                          value={shippingEmail}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <input
                          type="tel"
                          placeholder="Enter phone number"
                          {...register("shipping.phone")}
                          value={shippingPhone}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenCustomer(false);
                          setOpenShipping(true);
                        }}
                        disabled={!shippingEmail || !shippingPhone}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue to Shipping
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Shipping Information */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="px-4 py-3 cursor-pointer flex items-center justify-between border-b border-gray-200 bg-white"
                  onClick={() => setOpenShipping(!openShipping)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Shipping Information
                      </h3>
                      <p className="text-sm text-gray-500">
                        Enter your shipping details
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Toggle shipping"
                    className={`transition-transform ${openShipping ? "rotate-180" : "rotate-0"
                      }`}
                  >
                    <svg
                      className="w-8 h-8 text-gray-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                {openShipping && (
                  <div className="p-6">
                    {/* Shipping FIELDS START */}
                    <div className="bg-white rounded-xl  border-gray-200 shadow-sm overflow-hidden">
                      <div className="grid gap-6 lg:grid-cols-2 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            Company Name
                          </label>
                          <input
                            type="text"
                            placeholder="Enter company name"
                            {...register("shipping.companyName")}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                          />
                        </div>
                        <div className="space-y-2"></div>
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            First Name{" "}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            defaultValue={addressData?.firstName || ""}
                            placeholder="Enter first name"
                            {...register("shipping.firstName", {
                              required: true,
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Last Name{" "}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter last name"
                            {...register("shipping.lastName")}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg
                            className="w-8 h-8 mr-2 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Address <span className="text-red-500 ml-1">*</span>
                        </label>

                        {/* Autocomplete component (Nominatim) */}
                        <AddressAutocomplete
                          placeholder="Start typing your address..."
                          defaultValue={getValues("shipping.address")}
                          countryCode="au"
                          onSelect={(place) => {
                            setValue(
                              "shipping.address",
                              place.display_name || "",
                            );
                            const addr = place.address || {};
                            setValue(
                              "shipping.city",
                              addr.city ||
                              addr.town ||
                              addr.village ||
                              addr.hamlet ||
                              "",
                            );
                            setValue("shipping.region", addr.state || "");
                            setValue("shipping.zip", addr.postcode || "");
                            setValue(
                              "shipping.country",
                              addr.country || "Australia",
                            );
                          }}
                          onChange={(val) =>
                            setValue("shipping.address", val, {
                              shouldValidate: true,
                            })
                          }
                          className="rounded-lg"
                        />

                        <input
                          type="hidden"
                          {...register("shipping.address", { required: true })}
                          value={getValues("shipping.address")}
                        />
                      </div>

                      <div className="grid gap-6 mt-6 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Country <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            {...register("shipping.country", {
                              required: true,
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                          >
                            {addressData?.country && (
                              <option value={addressData?.country}>
                                {addressData?.country}
                              </option>
                            )}
                            <option value="Australia">Australia</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            State <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            {...register("shipping.region", { required: true })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                          >
                            {addressData?.state && (
                              <option value={addressData?.state}>
                                {addressData?.state}
                              </option>
                            )}
                            <option value="New South Wales">
                              New South Wales
                            </option>
                            <option value="Victoria">Victoria</option>
                            <option value="Queensland">Queensland</option>
                            <option value="Western Australia">
                              Western Australia
                            </option>
                            <option value="South Australia">
                              South Australia
                            </option>
                            <option value="Tasmania">Tasmania</option>
                            <option value="Northern Territory">
                              Northern Territory
                            </option>
                            <option value="Australian Capital Territory">
                              Australian Capital Territory
                            </option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            City <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            {...register("shipping.city", { required: true })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
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

                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M7 4a2 2 0 012-2h6a2 2 0 012 2"
                              />
                            </svg>
                            Postal Code{" "}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter postal code"
                            {...register("shipping.zip", { required: true })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenShipping(false);
                          setOpenBilling(true);
                        }}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                      >
                        Continue to Billing
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* Step 3: Billing Information */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="px-4 py-3 cursor-pointer flex items-center justify-between border-b border-gray-200 bg-white"
                  onClick={() => setOpenBilling(!openBilling)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Billing Information
                      </h3>
                      <p className="text-sm text-gray-500">
                        Enter your billing details
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      aria-label="Toggle billing"
                      className={`transition-transform ${openBilling ? "rotate-180" : "rotate-0"
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenBilling(!openBilling);
                      }}
                    >
                      <svg
                        className="w-8 h-8 text-gray-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                {openBilling && (
                  <div className="p-6">
                    {/* Reuse existing billing fields already bound to billing.* below */}
                    {/* Since the fields above exist under shipping by mistake, we provide a minimal guard */}
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 mb-4">
                      <input
                        type="checkbox"
                        name="billing_copy"
                        checked={billingSameAsShipping}
                        onChange={(e) => {
                          const next = e.target.checked;
                          setBillingSameAsShipping(next);

                          if (next) {
                            // Copy only the common fields from shipping to billing
                            const shippingVals = getValues("shipping");
                            const billingFields = [
                              "firstName",
                              "lastName",
                              "companyName",
                              "address",
                              "country",
                              "region",
                              "city",
                              "zip",
                            ];

                            billingFields.forEach((field) => {
                              if (shippingVals[field] !== undefined) {
                                setValue(
                                  `billing.${field}`,
                                  shippingVals[field] || "",
                                );
                              }
                            });
                          } else {
                            console.log("Billing same as shipping disabled");
                          }
                        }}
                        className="h-4 w-4 text-smallHeader"
                      />
                      Same as shipping
                    </label>
                    {!billingSameAsShipping &&(
                      <div className="bg-white rounded-xl  border-gray-200 shadow-sm overflow-hidden">
                      <div className="grid gap-6 lg:grid-cols-2 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            Company Name
                          </label>
                          <input
                            type="text"
                            placeholder="Enter company name"
                            {...register("billing.companyName")}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                          />
                        </div>
                        <div className="space-y-2"></div>
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            First Name{" "}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            defaultValue={addressData?.firstName || ""}
                            placeholder="Enter first name"
                            {...register("billing.firstName", {
                              required: true,
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Last Name{" "}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter last name"
                            {...register("billing.lastName")}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <svg
                            className="w-8 h-8 mr-2 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Address <span className="text-red-500 ml-1">*</span>
                        </label>

                        {/* Autocomplete component (Nominatim) */}
                        <AddressAutocomplete
                          placeholder="Start typing your address..."
                          defaultValue={getValues("billing.address")}
                          value={watch("billing.address")}
                          countryCode="au"
                          onSelect={(place) => {
                            setValue(
                              "billing.address",
                              place.display_name || "",
                            );
                            const addr = place.address || {};
                            setValue(
                              "billing.city",
                              addr.city ||
                              addr.town ||
                              addr.village ||
                              addr.hamlet ||
                              "",
                            );
                            setValue("billing.region", addr.state || "");
                            setValue("billing.zip", addr.postcode || "");
                            setValue(
                              "billing.country",
                              addr.country || "Australia",
                            );
                          }}
                          onChange={(val) =>
                            setValue("billing.address", val, {
                              shouldValidate: true,
                            })
                          }
                        />

                        <input
                          type="hidden"
                          {...register("billing.address", { required: true })}
                          value={getValues("billing.address")}
                        />
                      </div>

                      <div className="grid gap-6 mt-6 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Country <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            {...register("billing.country", { required: true })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                          >
                            {addressData?.country && (
                              <option value={addressData?.country}>
                                {addressData?.country}
                              </option>
                            )}
                            <option value="Australia">Australia</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            State <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            {...register("billing.region", { required: true })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                          >
                            {addressData?.state && (
                              <option value={addressData?.state}>
                                {addressData?.state}
                              </option>
                            )}
                            <option value="New South Wales">
                              New South Wales
                            </option>
                            <option value="Victoria">Victoria</option>
                            <option value="Queensland">Queensland</option>
                            <option value="Western Australia">
                              Western Australia
                            </option>
                            <option value="South Australia">
                              South Australia
                            </option>
                            <option value="Tasmania">Tasmania</option>
                            <option value="Northern Territory">
                              Northern Territory
                            </option>
                            <option value="Australian Capital Territory">
                              Australian Capital Territory
                            </option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            City <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            {...register("billing.city", { required: true })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
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

                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <svg
                              className="w-8 h-8 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M7 4a2 2 0 012-2h6a2 2 0 012 2"
                              />
                            </svg>
                            Postal Code{" "}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter postal code"
                            {...register("billing.zip", { required: true })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                    )}
                    <div className="flex justify-end mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenBilling(false);
                          setOpenPayment(true);
                        }}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 4: Payment */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                  className="px-4 py-3 cursor-pointer flex items-center justify-between border-b border-gray-200 bg-white"
                  onClick={() => setOpenPayment(!openPayment)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Payment
                      </h3>
                      <p className="text-sm text-gray-500">
                        Review your total and pay securely
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Toggle payment"
                    className={`transition-transform ${openPayment ? "rotate-180" : "rotate-0"
                      }`}
                  >
                    <svg
                      className="w-8 h-8 text-gray-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                {openPayment && (
                  <div className="p-6 md:w-1/2 mx-auto">
                    {" "}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src="/stripe.png"
                          className="w-8 h-8 rounded-full"
                          alt="Stripe"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            Secure Payment
                          </p>
                          <p className="text-sm text-gray-600">
                            Powered by Stripe
                          </p>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <button
                      type="submit"
                      disabled={loading || items.length === 0}
                      className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${loading || items.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-primary hover:opacity-90 shadow-lg hover:shadow-xl"
                        }`}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                          <span>
                            Pay $
                            {total.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full h-fit lg:w-[35%]">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
                <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Order Summary
                      </h3>
                      <p className="text-sm text-gray-500">
                        {items?.length} item{items?.length !== 1 ? "s" : ""} in
                        order
                      </p>
                    </div>
                  </div>{" "}
                  <button
                    type="submit"
                    disabled={loading || items?.length === 0}
                    className={`w-max py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${loading || items?.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary hover:opacity-90 shadow-lg hover:shadow-xl"
                      }`}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        <span>
                          Pay $
                          {total.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-6">
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
                        <li key={item.id} className="flex justify-between py-1">
                          <div className="flex gap-3">
                            <div className="">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="object-cover w-10 h-10 rounded"
                              />
                            </div>

                            <div className="flex-1">
                              <p className="font-medium text-lg">
                                {item.quantity} * {item.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-base font-medium text-smallHeader">
                                  ${item.price?.toFixed(2)} each
                                </p>
                              </div>

                              <div className="mt-1 space-y-0.5">
                                <p className="text-base text-gray-600">
                                  Color: {item.color || "No Color"}
                                </p>
                                <p className="text-base text-gray-600">
                                  Print:{" "}
                                  {item.print || "No print method selected"}
                                </p>
                                {item?.size && (
                                  <p className="text-base text-gray-600">
                                    Size: {item.size || "No size"}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ${itemTotal.toFixed(2)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Artwork Information Section */}
                  {(artworkFile || artworkInstructions) && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <svg
                          className="w-5 h-5 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <h4 className="text-base font-semibold text-blue-800">
                          Order Artwork
                        </h4>
                      </div>

                      {artworkFile && (
                        <div className="mb-3">
                          <p className="text-base text-blue-700 font-medium mb-2">
                            Uploaded File:
                          </p>
                          <div className="flex items-center space-x-3">
                            {artworkFile.file.type.startsWith("image/") ? (
                              <img
                                src={artworkFile.preview}
                                alt="Artwork preview"
                                className="w-16 h-16 object-cover rounded-lg border border-blue-300"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg border border-blue-300 flex items-center justify-center">
                                <svg
                                  className="w-8 h-8 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="text-base font-medium text-blue-900">
                                {artworkFile.name}
                              </p>
                              <p className="text-xs text-primary">
                                {artworkFile.file.type.startsWith("image/")
                                  ? "Image File"
                                  : "PDF Document"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {artworkInstructions && (
                        <div>
                          <p className="text-base text-blue-700 font-medium mb-1">
                            Instructions:
                          </p>
                          <p className="text-sm text-blue-800 italic bg-white p-2 rounded border border-blue-200">
                            "{artworkInstructions}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-0 space-y-2 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-base">
                      <span>Sub-total:</span>
                      <span>
                        $
                        {totalAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span>Shipping:</span>
                      <span>
                        {shippingCharges > 0
                          ? `$${shippingCharges.toFixed(2)}`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span>Setup Fee:</span>
                      <span>
                        {setupFee > 0 ? `$${setupFee.toFixed(2)}` : "-"}
                      </span>
                    </div>
                    {/* <div className="flex justify-between text-base">
                    <span>Product Discount:</span>
                    <span>{totalDiscountPercent}%</span>
                  </div> */}

                    {/* Show coupon discount if applied */}
                    {appliedCoupon && (
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-base">
                          <span>Coupon ({appliedCoupon.coupen}):</span>
                          <span className="text-green-600">
                            -{couponDiscount}%
                            {couponDiscountExceedsLimit &&
                              "(Capped at Max Limit)"}
                          </span>
                        </div>
                        <div className="flex justify-between text-base">
                          <span>Discounted Price:</span>
                          <span className="text-green-600">
                            ${couponDiscountAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-base">
                      <span>GST({gstCharges}%):</span>
                      <span>${gstAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  {/* <hr className="my-4" /> */}
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <img
                          src="/stripe.png"
                          className="w-8 h-8 rounded-full"
                          alt="Stripe"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            Secure Payment
                          </p>
                          <p className="text-sm text-gray-600">
                            Powered by Stripe
                          </p>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-smallHeader">
                        $
                        {total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {items?.length === 0 && (
                      <div className="text-center py-3 text-red-600 bg-red-50 rounded-lg border border-red-200 my-3">
                        Your cart is empty
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Checkout;
