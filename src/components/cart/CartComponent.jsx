import React, { useRef, useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiPlus } from "react-icons/fi";
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
  const gstAmount = finalDiscountedAmount * 0.1; // 10%
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
  })

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
  const handleViewProduct = (id) => {
    Navigate(`/product/${id}`, { state: "Cart" });
  };

  return (
    <div className="flex flex-wrap justify-between gap-4 Mycontainer md:flex-wrap lg:flex-nowrap">
      <div className="w-full max-w-5xl">
        <h2 className="mt-2 mb-3 text-base font-medium">Shopping Cart</h2>
        {openModel && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md">
              <p className="text-lg font-semibold mb-4">
                Are you sure you want to remove this item from your cart?
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setOpenModel(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    dispatch(removeFromCart(id));
                    setOpenModel(false);
                    setId(null);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="flex flex-col lg:table-header-group md:table-header-group sm:table-header-group">
              <tr className="flex bg-activeFilter lg:table-row md:table-row sm:table-row">
                <th className="flex-1 p-3 pl-4 text-xs font-medium text-left lg:pl-20 md:pl-20 lg:table-cell">
                  PRODUCTS
                </th>
                <th className="flex-1 p-3 text-xs font-medium lg:table-cell">
                  LOGO UPDATE
                </th>
                <th className="flex-1 p-3 text-xs font-medium lg:table-cell">
                  PRICE
                </th>
                <th className="flex-1 p-3 text-xs font-medium lg:table-cell">
                  QUANTITY
                </th>
                <th className="flex-1 p-3 text-xs font-medium lg:table-cell">
                  SUB-TOTAL
                </th>
              </tr>
            </thead>
            <tbody className="flex flex-col lg:table-header-group md:table-header-group sm:table-header-group">
              {items.length > 0 ? (
                items.map((item) => {
                  const subTotal =
                    item.totalPrice || item.price * item.quantity;

                  return (
                    <tr key={item.id}>
                      <td className="flex items-start p-3 space-x-3">
                        <button
                          onClick={() => handleRemovefromCart(item.id)}
                          className="p-1 text-lg border rounded-full border-category"
                        >
                          <IoClose className="text-category" />
                        </button>
                        <img
                          onClick={() => handleViewProduct(item.id)}
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 cursor-pointer"
                        />
                        <div
                          className="cursor-pointer"
                          onClick={() => handleViewProduct(item.id)}
                        >
                          <p className="text-sm cursor-pointer font-medium">
                            {item.name}
                          </p>
                          <p className="text-xs cursor-pointer font-normal">
                            COLOUR: {item.color}
                          </p>
                          <p className="text-xs cursor-pointer font-normal">
                            PRINT METHOD: {item.print}
                          </p>
                          <p className="text-xs font-normal cursor-pointer">
                            LOGO COLOUR: {item.logoColor}
                          </p>
                          <p className="text-xs font-normal cursor-pointer">
                            Est Delivery Date: {item.deliveryDate}
                          </p>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div
                          onClick={() => fileInputRef.current.click()}
                          className="cursor-pointer"
                        >
                          <img
                            key={item.dragdrop || uploadedImage}
                            src={item.dragdrop || uploadedImage}
                            alt="Upload"
                            className="flex w-10 h-10 p-2 m-auto lg:w-16 md:w-16 lg:h-16 md:h-16 bg-drag"
                          />
                        </div>
                        <input
                          type="file"
                          id="fileUpload"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={(e) => handleFileChange(e, item.id)}
                          accept="image/*"
                        />
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-center">
                          ${item.price.toFixed(2)}
                        </p>
                      </td>

                      <td className="p-3">
                        <div className="flex w-28 m-auto justify-center gap-3 bg-line border border-border2 items-center py-2.5">
                          <button
                            onClick={() =>
                              dispatch(
                                decrementQuantity({
                                  id: item.id,
                                })
                              )
                            }
                          >
                            <FiMinus />
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
                            className="w-10 text-center outline-none no-arrows"
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
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-center">
                        $
                        {(subTotal || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <div className=" text-red-500 text-base text-center pt-6 px-5">
                  <p className=" ">
                    Your Cart is empty Your shopping cart lives to serve. Give
                    it purpose – fill it with what you are looking for.
                  </p>
                </div>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
          <Link
            to={"/shop"}
            className="flex items-center px-6 justify-center gap-2 py-3.5 text-heading border-4 border-heading"
          >
            <IoArrowBack className="text-xl" />
            <button className="text-sm font-bold">RETURN TO SHOP</button>
          </Link>
        </div>
      </div>
      <div className="w-full mt-10 max-w-96">
        <div className="p-6 bg-white border">
          <h3 className="pb-2 mb-4 text-lg font-medium border-b-4 text-brand">
            Cart Totals
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-normal text-stock">Sub-total:</span>
              <span className="text-sm font-medium text-brand">
                $
                {(totalAmount || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-sm font-normal text-stock">Shipping:</span>
              <span className="text-sm font-medium text-brand">
                {items.length > 0 ? (shippingCharges > 0
                  ? `$${shippingCharges.toFixed(2)}`
                  : "Free"): "$0.00"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-normal text-stock">
                Product Discount:
              </span>
              <span className="text-sm font-medium text-brand">
                {totalDiscountPercent}%
              </span>
            </div>
            {appliedCoupon && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-sm font-normal text-stock">
                    Coupon ({appliedCoupon.coupen}):
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    -{couponDiscount}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-normal text-stock">
                    Discounted Price:
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {finalDiscountedAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-between pb-2">
              <span className="text-sm font-normal text-stock">GST(10%):</span>
              <span className="text-sm font-medium text-brand">
                ${(gstAmount || 0).toFixed(2)}
              </span>
            </div>
            <hr />
          </div>

          {/* Applied Coupon Display */}
          {appliedCoupon && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    ✅ Coupon Applied: {appliedCoupon.coupen}
                  </p>
                  <p className="text-xs text-green-600">
                    You saved {couponDiscount}%
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-red-500 hover:text-red-700 text-sm underline"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Coupon Input - Only show if no coupon is applied */}
          {!appliedCoupon && (
            <div>
              <input
                type="text"
                value={value}
                placeholder="Enter coupon code"
                className="w-full p-3 mt-4 border outline-none uppercase"
                onChange={handleChange}
                disabled={isApplyingCoupon}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon || !value.trim()}
                className="w-full py-4 mt-4 text-sm font-bold text-white bg-pink disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isApplyingCoupon ? "APPLYING..." : "APPLY COUPON"}
              </button>
            </div>
          )}

          <div className="flex justify-between mt-8 text-lg font-bold">
            <span className="font-normal text-brand">Total:</span>
            <span className="font-semibold text-brand">
              $
              {items.length>0?(total || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }):"0.00"}
            </span>
          </div>
              {!currentUserEmail || currentUserEmail === "guest@gmail.com" ? (
                <button
              onClick={() => {
                toast.error("Please login to proceed")
                Navigate("/signup");}}
              className="flex items-center justify-center w-full gap-2 py-4 mt-8 text-white bg-smallHeader "
            >
              PROCEED TO CHECKOUT
              <FaArrowRight />
            </button>
              ):
          (total > shippingCharges ? (
            <Link
              to={"/checkout"}
              state={{
                cartTotal: total,
                appliedCoupon: appliedCoupon,
                couponDiscount: couponDiscount,
                shippingCharges: shippingCharges,
              }}
              className="flex items-center justify-center w-full gap-2 py-4 mt-8 text-white bg-smallHeader"
            >
              <button>PROCEED TO CHECKOUT</button>
              <FaArrowRight />
            </Link>
          ) : (
            <button
              onClick={() => toast.error("Your cart is empty")}
              className="flex items-center justify-center w-full gap-2 py-4 mt-8 text-white bg-gray-400 cursor-not-allowed opacity-50"
            >
              PROCEED TO CHECKOUT
              <FaArrowRight />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CartComponent;
