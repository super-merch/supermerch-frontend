import React, { useRef, useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiDelete, FiPlus } from "react-icons/fi";
import { FiMinus } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { IoArrowBack } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";
import { toast } from "react-toastify";
import { selectCurrentUserCartItems } from "@/redux/slices/cartSlice";
import {
  updateCartItemQuantity,
  removeFromCart,
  updateCartItemImage,
  incrementQuantity,
  decrementQuantity,
  multipleQuantity,
} from "../../redux/slices/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { Check, CheckCheckIcon, Delete, DeleteIcon } from "lucide-react";
import { FaDeleteLeft, FaRecycle } from "react-icons/fa6";
import { LuDelete } from "react-icons/lu";
import { MdDelete } from "react-icons/md";

const CartComponent = () => {
  const { totalDiscount } = useContext(AppContext);
  const dispatch = useDispatch();
  const items = useSelector(selectCurrentUserCartItems);
  const { totalQuantity } = useSelector((state) => state.cart);
  console.log(items);
  const [value, setValue] = useState("");

  // Coupon states
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [customQuantities, setCustomQuantities] = useState({});

  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    const checkUserAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUserEmail("guest@gmail.com");
        return;
      }

      try {
        const { data } = await axios.get(`${API_BASE}/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data.success) {
          setCurrentUserEmail(data.email);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setCurrentUserEmail("guest@gmail.com");
      }
    };

    checkUserAuth();
  }, []);

  const [shippingCharges, setShippingCharges] = useState(0);
  const getShippingCharges = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/shipping/get`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add authorization headers if needed
          },
        }
      );

      const data = await response.json();
      console.log("Shipping Charges Data:", data);
      setShippingCharges(data.shipping || 0);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch shipping charges");
      }

      return { data };
    } catch (error) {
      throw error;
    }
  };
  useEffect(() => {
    getShippingCharges();
  }, []);

  useEffect(() => {
    const quantities = {};
    items.forEach((item) => {
      quantities[item.id] = item.quantity;
    });
    setCustomQuantities(quantities);
  }, [items]);

  const totalDiscountPercent = items.reduce(
    (sum, item) => sum + (totalDiscount[item.id] || 0),
    0
  );

  // Base total calculation
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.totalPrice || item.price * item.quantity),
    0
  );

  // Apply product discounts first
  const productDiscountedAmount =
    totalAmount - (totalAmount * totalDiscountPercent) / 100;

  // Apply coupon discount to the product-discounted amount
  const couponDiscountAmount = (productDiscountedAmount * couponDiscount) / 100;
  const finalDiscountedAmount = productDiscountedAmount - couponDiscountAmount;

  // Calculate GST and final total
  const gstAmount = (finalDiscountedAmount + shippingCharges) * 0.1; // 10%
  const total = finalDiscountedAmount + gstAmount + shippingCharges;

  const [uploadedImage, setUploadedImage] = useState("/drag.png");
  const fileInputRef = useRef(null);

  const handleFileChange = (e, productId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        dispatch(
          updateCartItemImage({ id: productId, dragdrop: reader.result })
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value.toUpperCase());
  };

  // Apply coupon function
  const handleApplyCoupon = async () => {
    if (!value.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (appliedCoupon) {
      toast.error(
        "A coupon is already applied. Remove it first to apply a new one."
      );
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await fetch(`${API_BASE}/api/coupen/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coupen: value.trim() }),
      });

      const result = await response.json();

      if (response.ok && result.valid) {
        setAppliedCoupon(result.coupon);
        setCouponDiscount(result.discount);
        toast.success(`Coupon applied! You saved ${result.discount}%`);
      } else {
        toast.error(result.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };
  //check if user is logged in
  const [token, setToken] = useState(localStorage.getItem("token"));
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  });

  // Remove coupon function
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setValue("");
    toast.success("Coupon removed successfully");
  };

  // Handle direct input changes
  const handleQuantityChange = (e, id) => {
    const value = e.target.value;
    setCustomQuantities({
      ...customQuantities,
      [id]: value === "" ? "" : parseInt(value, 10),
    });
  };

  const handleUpdateCart = () => {
    Object.entries(customQuantities).forEach(([id, quantity]) => {
      dispatch(
        updateCartItemQuantity({
          id: Number(id),
          quantity: Math.max(quantity, 1),
        })
      );
    });
  };

  const [openModel, setOpenModel] = useState(false);
  const [id, setId] = useState(null);
  const handleRemovefromCart = (id) => {
    setOpenModel(true);
    setId(id);
  };
  const Navigate = useNavigate();
  const handleViewProduct = (id, name) => {
    Navigate(`/product/${name}`, { state: id });
  };

  return (
    <div className="flex flex-wrap justify-between gap-4 Mycontainer md:flex-wrap lg:flex-nowrap !mb-10 mt-5">
      <div className="w-full max-w-5xl">
        <div className="overflow-x-auto">
          {/* Desktop and Medium Screen Layout */}
          <div className="hidden sm:block">
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => {
                  const subTotal =
                    item.totalPrice || item.price * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-3">
                        <div className="flex items-center space-x-4">
                          {/* Remove Button */}
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img
                              onClick={() =>
                                handleViewProduct(item.id, item.name)
                              }
                              src={item.image}
                              alt={item.name}
                              className="w-32 h-32 cursor-pointer object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                          {/* Product Details */}
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() =>
                              handleViewProduct(item.id, item.name)
                            }
                          >
                            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                              {item.name}
                            </h3>
                            <div className="grid gap-2 text-xs text-gray-600">
                              <div className="flex items-center space-x-1">
                                <div className="">
                                  <CheckCheckIcon className="w-4 h-4 text-green-500" />
                                </div>
                                <span>
                                  Color:{" "}
                                  <span className="font-medium text-gray-900">
                                    {item.color}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="">
                                  <CheckCheckIcon className="w-4 h-4 text-green-500" />
                                </div>
                                <span>
                                  Print:{" "}
                                  <span className="font-medium text-gray-900">
                                    {item.print}
                                  </span>
                                </span>
                              </div>
                              {/* <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>
                                  Logo:{" "}
                                  <span className="font-medium text-gray-900">
                                    {item.logoColor}
                                  </span>
                                </span>
                              </div> */}
                              {/* <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span>
                                  Delivery:{" "}
                                  <span className="font-medium text-gray-900">
                                    {item.deliveryDate}
                                  </span>
                                </span>
                              </div> */}
                            </div>
                          </div>
                          {/* Price & Quantity Controls */}
                          <div className="flex-shrink-0">
                            <div className="flex items-center space-x-12">
                              {/* Unit Price */}
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">
                                  Unit Price
                                </p>
                                <div className=" rounded-lg px-3 py-2  min-w-[80px]">
                                  <p className="text-lg font-bold text-smallHeader">
                                    ${item.price.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {/* Quantity Controls */}
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">
                                  Quantity
                                </p>
                                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                  <div className="flex items-center justify-center">
                                    <button
                                      onClick={() =>
                                        dispatch(
                                          decrementQuantity({
                                            id: item.id,
                                          })
                                        )
                                      }
                                      className="p-2 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                    >
                                      <FiMinus className="w-3 h-3" />
                                    </button>
                                    <input
                                      type="number"
                                      value={customQuantities[item.id]}
                                      onChange={(e) =>
                                        dispatch(
                                          multipleQuantity({
                                            id: item.id,
                                            quantity: parseInt(
                                              e.target.value,
                                              10
                                            ),
                                          })
                                        )
                                      }
                                      className="w-12 py-4 text-center outline-none border-0 bg-transparent font-bold text-sm"
                                      placeholder="0"
                                    />
                                    <button
                                      onClick={() =>
                                        dispatch(
                                          incrementQuantity({
                                            id: item.id,
                                          })
                                        )
                                      }
                                      className="p-2 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                    >
                                      <FiPlus className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Subtotal */}
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">
                                  Subtotal
                                </p>
                                <div className="px-3 py-2 in-w-[100px]">
                                  <p className="text-lg font-bold text-smallHeader">
                                    $
                                    {(subTotal || 0).toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>{" "}
                          <div className="flex-shrink-0">
                            <MdDelete
                              className="w-6 h-6 text-gray-400 rounded-full"
                              onClick={() => handleRemovefromCart(item.id)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Looks like you haven't added any items to your cart yet. Start
                  shopping to fill it up!
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center px-6 py-3 bg-smallHeader text-white rounded-lg hover:opacity-90 transition-opacity font-medium mb-4"
                >
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Card Layout */}
          <div className="block sm:hidden">
            {items.length > 0 ? (
              <div className="space-y-4 p-4">
                {items.map((item) => {
                  const subTotal =
                    item.totalPrice || item.price * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-4">
                        {/* Header with Remove Button */}
                        <div className="flex items-start space-x-3 mb-3">
                          {/* Remove Button */}
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => handleRemovefromCart(item.id)}
                              className="w-7 h-7  text-white rounded-full flex items-center justify-center  transition-colors shadow-sm"
                              title="Remove from cart"
                            >
                              <DeleteIcon className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-start space-x-3 flex-1">
                            <img
                              onClick={() =>
                                handleViewProduct(item.id, item.name)
                              }
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 cursor-pointer object-cover rounded-lg border border-gray-200"
                            />
                            <div
                              className="cursor-pointer flex-1 min-w-0"
                              onClick={() =>
                                handleViewProduct(item.id, item.name)
                              }
                            >
                              <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                {item.name}
                              </h3>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-smallHeader rounded-full"></div>
                                  <span>
                                    Color:{" "}
                                    <span className="font-medium text-gray-900">
                                      {item.color}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>
                                    Print:{" "}
                                    <span className="font-medium text-gray-900">
                                      {item.print}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                  <span>
                                    Logo:{" "}
                                    <span className="font-medium text-gray-900">
                                      {item.logoColor}
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span>
                                    Delivery:{" "}
                                    <span className="font-medium text-gray-900">
                                      {item.deliveryDate}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price, Quantity, and Subtotal */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 space-x-2">
                          {/* Unit Price */}
                          <div className="text-center flex-1">
                            <p className="text-xs font-medium text-gray-600 mb-1">
                              Unit Price
                            </p>
                            <div className="bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200">
                              <p className="text-sm font-bold text-smallHeader">
                                ${item.price.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">per unit</p>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="text-center flex-1">
                            <p className="text-xs font-medium text-gray-600 mb-1">
                              Quantity
                            </p>
                            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() =>
                                    dispatch(
                                      decrementQuantity({
                                        id: item.id,
                                      })
                                    )
                                  }
                                  className="p-1.5 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                >
                                  <FiMinus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  value={customQuantities[item.id]}
                                  onChange={(e) =>
                                    dispatch(
                                      multipleQuantity({
                                        id: item.id,
                                        quantity: parseInt(e.target.value, 10),
                                      })
                                    )
                                  }
                                  className="w-10 text-center outline-none border-0 bg-transparent font-bold text-xs"
                                  placeholder="0"
                                />
                                <button
                                  onClick={() =>
                                    dispatch(
                                      incrementQuantity({
                                        id: item.id,
                                      })
                                    )
                                  }
                                  className="p-1.5 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                >
                                  <FiPlus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="text-center flex-1">
                            <p className="text-xs font-medium text-gray-600 mb-1">
                              Subtotal
                            </p>
                            <div className="bg-smallHeader/10 rounded-lg px-2 py-1.5 border border-smallHeader/20">
                              <p className="text-sm font-bold text-smallHeader">
                                $
                                {(subTotal || 0).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mx-4">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-6">
                  Start shopping to add items to your cart
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center px-4 py-2 bg-smallHeader text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-start my-6">
          <Link
            to={"/shop"}
            className="inline-flex items-center gap-2 px-4 py-2 text-smallHeader border border-smallHeader rounded-lg hover:bg-smallHeader hover:text-white transition-colors font-medium text-sm"
          >
            <IoArrowBack className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
      <div className="w-full max-sm:mx-auto max-w-96">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-smallHeader to-smallHeader/80 px-6 py-4">
            <h3 className="text-lg font-bold text-white">Order Summary</h3>
            <p className="text-sm text-white/90">
              {items.length} item{items.length !== 1 ? "s" : ""} in cart
            </p>
          </div>

          <div className="p-6">
            {/* Order Breakdown */}
            <div className="space-y-1 mb-6">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">
                  Subtotal
                </span>
                <span className="text-lg font-bold text-gray-900">
                  $
                  {(totalAmount || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {appliedCoupon && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-800">
                      Coupon ({appliedCoupon.coupen})
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      -{couponDiscount}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">
                      Discounted Amount
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      ${finalDiscountedAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">
                  Shipping
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {items.length > 0
                    ? shippingCharges > 0
                      ? `$${shippingCharges.toFixed(2)}`
                      : "Free"
                    : "$0.00"}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">
                  Product Discount
                </span>
                <span className="text-sm font-bold text-smallHeader">
                  {totalDiscountPercent}%
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">
                  GST (10%)
                </span>
                <span className="text-sm font-bold text-gray-900">
                  ${(gstAmount || 0).toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-smallHeader">
                    $
                    {items.length > 0
                      ? (total || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "0.00"}
                  </span>
                </div>
              </div>
            </div>

            {/* Applied Coupon Display */}
            {appliedCoupon && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-green-800">
                      ✅ Coupon Applied: {appliedCoupon.coupen}
                    </p>
                    <p className="text-xs text-green-600">
                      You saved {couponDiscount}% on your order
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-700 text-sm font-medium underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Coupon Input - Only show if no coupon is applied */}
            {!appliedCoupon && (
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={value}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-smallHeader focus:border-transparent text-sm"
                    onChange={handleChange}
                    disabled={isApplyingCoupon}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !value.trim()}
                    className="px-6 py-3 bg-smallHeader text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-opacity"
                  >
                    {isApplyingCoupon ? "Applying..." : "Apply"}
                  </button>
                </div>
              </div>
            )}

            {/* Checkout Button */}
            {total > shippingCharges ? (
              <Link
                to={"/upload-artwork"}
                state={{
                  cartTotal: total,
                  appliedCoupon: appliedCoupon,
                  couponDiscount: couponDiscount,
                  shippingCharges: shippingCharges,
                }}
                className="w-full bg-smallHeader text-white py-4 px-6 rounded-lg font-bold text-center hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <FaArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={() => toast.error("Your cart is empty")}
                className="w-full bg-gray-400 text-white py-4 px-6 rounded-lg font-bold cursor-not-allowed opacity-50"
              >
                Proceed to Checkout
              </button>
            )}
          </div>
        </div>
      </div>
      {openModel && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setOpenModel(false)}
            ></div>

            {/* Modal */}
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      Remove Item
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to remove this item from your
                        cart? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={() => {
                    dispatch(removeFromCart(id));
                    setOpenModel(false);
                    setId(null);
                  }}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  Remove Item
                </button>
                <button
                  type="button"
                  onClick={() => setOpenModel(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartComponent;
