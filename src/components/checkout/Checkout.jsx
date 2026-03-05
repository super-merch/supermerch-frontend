import {
  clearCart,
  selectCurrentUserCartItems,
} from "@/redux/slices/cartSlice";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { AuthContext } from "../../context/AuthContext";
import { ProductsContext } from "../../context/ProductsContext";
import BillingStep from "./CheckoutSteps/BillingStep";
import CustomerStep from "./CheckoutSteps/CustomerStep";
import OrderSummarySidebar from "./CheckoutSteps/OrderSummarySidebar";
import PaymentStep from "./CheckoutSteps/PaymentStep";
import ShippingStep from "./CheckoutSteps/ShippingStep";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = useSelector(selectCurrentUserCartItems);
  const { token, setToken, addressData, shippingAddressData, userData, loadUserOrder } =
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
            `${
              import.meta.env.VITE_BACKEND_URL
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
      const storedCheckoutData = localStorage.getItem("pendingCheckoutData");
      if (!storedCheckoutData) {
        toast.error("Order data not found. Please try again.");
        throw new Error("No pending checkout data");
      }

      const checkoutData = JSON.parse(storedCheckoutData);
      checkoutData.stripeSessionId = sessionId;
      const headers = token ? { headers: { token } } : {};
      const response = await axios.post(
        `${backendUrl}/api/checkout/checkout`,
        checkoutData,
        headers,
      );

      localStorage.removeItem("pendingCheckoutData");
      dispatch(clearCart());
      toast.success("Order placed successfully!");
      navigate("/", { replace: true });
      await loadUserOrder();

      return response.data;
    } catch (error) {
      console.error("Order Failed:", error.response?.data || error.message);
      toast.error("Failed to place the order. Please try again.");
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

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const normalizedSetupFee = Number(setupFee) || 0;
  const normalizedShipping = Number(shippingCharges) || 0;
  const normalizedGstRate = Number(gstCharges) || 0;
  const normalizedCouponPercent = Number(couponDiscount) || 0;

  const couponBaseAmount = Math.max(totalAmount + normalizedSetupFee, 0);
  const calculatedCouponDiscount =
    (couponBaseAmount * normalizedCouponPercent) / 100;

  const couponDiscountExceedsLimit =
    appliedCoupon?.maxLimitAmount &&
    calculatedCouponDiscount > Number(appliedCoupon.maxLimitAmount);

  const couponDiscountAmount = appliedCoupon?.maxLimitAmount
    ? Math.min(calculatedCouponDiscount, Number(appliedCoupon.maxLimitAmount))
    : calculatedCouponDiscount;

  const amountAfterDiscount = Math.max(
    couponBaseAmount - couponDiscountAmount,
    0,
  );
  const preTaxAmount = amountAfterDiscount + normalizedShipping;

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
  const gstAmount = (preTaxAmount * normalizedGstRate) / 100;
  const total = preTaxAmount + gstAmount;
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
    if (items.length === 0) {
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
        print: item.print || item.printMethodKey,
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
              <CustomerStep
                open={openCustomer}
                setOpen={setOpenCustomer}
                token={token}
                openLoginModal={openLoginModal}
                setOpenLoginModal={setOpenLoginModal}
                loginModalRef={loginModalRef}
                loginEmail={loginEmail}
                setLoginEmail={setLoginEmail}
                loginPassword={loginPassword}
                setLoginPassword={setLoginPassword}
                loginError={loginError}
                setLoginError={setLoginError}
                loginLoading={loginLoading}
                handleInlineLogin={handleInlineLogin}
                register={register}
                watch={watch}
                onContinue={() => {
                  setOpenCustomer(false);
                  setOpenShipping(true);
                }}
              />

              {/* Step 2: Shipping Information */}
              <ShippingStep
                open={openShipping}
                setOpen={setOpenShipping}
                addressData={addressData}
                register={register}
                onContinue={() => {
                  setOpenShipping(false);
                  setOpenBilling(true);
                }}
              />

              <BillingStep
                open={openBilling}
                setOpen={setOpenBilling}
                billingSameAsShipping={billingSameAsShipping}
                setBillingSameAsShipping={setBillingSameAsShipping}
                addressData={addressData}
                register={register}
                getValues={getValues}
                setValue={setValue}
                onContinue={() => {
                  setOpenBilling(false);
                  setOpenPayment(true);
                }}
              />


              <PaymentStep
                open={openPayment}
                setOpen={setOpenPayment}
                loading={loading}
                items={items}
                total={total}
              />
            </div>

            <OrderSummarySidebar
              items={items}
              appliedCoupon={appliedCoupon}
              couponDiscount={couponDiscount}
              couponDiscountAmount={couponDiscountAmount}
              couponDiscountExceedsLimit={couponDiscountExceedsLimit}
              totalAmount={totalAmount}
              shippingCharges={shippingCharges}
              setupFee={setupFee}
              gstCharges={gstCharges}
              gstAmount={gstAmount}
              total={total}
              artworkFile={artworkFile}
              artworkInstructions={artworkInstructions}
              loading={loading}
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default Checkout;
