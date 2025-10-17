import { selectCurrentUserCartItems } from "@/redux/slices/cartSlice";
import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { FiMinus, FiPlus } from "react-icons/fi";
import { IoArrowBack } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import {
  clearCart,
  decrementQuantity,
  incrementQuantity,
  multipleQuantity,
  removeFromCart,
  updateCartItemImage,
  updateCartItemQuantity,
} from "../../redux/slices/cartSlice";

const CartComponent = () => {
  const { totalDiscount,shippingCharges,userData,setupFee } = useContext(AppContext);
  const dispatch = useDispatch();
  const items = useSelector(selectCurrentUserCartItems);
  const { totalQuantity } = useSelector((state) => state.cart);
  const [value, setValue] = useState("");

  // Coupon states
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [customQuantities, setCustomQuantities] = useState({});

  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  // useEffect(() => {
  //   const checkUserAuth = async () => {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       setCurrentUserEmail("guest@gmail.com");
  //       return;
  //     }

  //     try {
  //       const { data } = await axios.get(`${API_BASE}/api/auth/user`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (data.success) {
  //         setCurrentUserEmail(data.email);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user:", error);
  //       setCurrentUserEmail("guest@gmail.com");
  //     }
  //   };

  //   checkUserAuth();
  // }, []);


  useEffect(() => {
    const quantities = {};
    items.forEach((item) => {
      quantities[item.id] = item.quantity;
    });
    setCustomQuantities(quantities);
    console.log(items);
    const email = userData?.email || "guest@gmail.com";
    setCurrentUserEmail(email);
  }, [items]);

  const totalDiscountPercent = items.reduce(
    (sum, item) => sum + (totalDiscount[item.id] || 0),
    0
  );

  // Base total calculation
  const totalAmount =  items.reduce(
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
  const total = finalDiscountedAmount + gstAmount + shippingCharges + (setupFee || 0);

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
  const navigate = useNavigate();

  const slugify = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      // replace any sequence of non-alphanumeric chars with a single hyphen
      .replace(/[^a-z0-9]+/g, "-")
      // remove leading/trailing hyphens
      .replace(/(^-|-$)/g, "");

  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId); // base64 encode
    const slug = slugify(name);
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`);
  };

  return (
    <div className="Mycontainer !mb-10 mt-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-col md:flex-row">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Shopping Cart ({items?.length})
        </h1>
        <div className="flex items-center gap-3">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-4 py-2 text-smallHeader border border-smallHeader rounded-lg hover:bg-smallHeader hover:text-white transition-colors font-medium"
          >
            <IoArrowBack className="w-4 h-4" />
            Continue Shopping
          </Link>{" "}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear the cart?")) {
                dispatch(clearCart());
                toast.success("Cart cleared successfully");
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-medium"
          >
            <MdDelete className="w-4 h-4" />
            Clear Cart
          </button>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-6">
          {/* Cart Table - Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Product
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Setup Fee
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Price
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Quantity
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Total
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item) => {
                        const subTotal =
                          item.totalPrice || item.price * item.quantity;
                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            {/* Product Info */}
                            <td className="px-6 py-4">
                              <div className="flex items-start space-x-4">
                                <img
                                  onClick={() =>
                                    handleViewProduct(item.id, item.name)
                                  }
                                  src={item.image}
                                  alt={item.name}
                                  className="w-40 h-40 cursor-pointer object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3
                                    className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-smallHeader transition-colors"
                                    onClick={() =>
                                      handleViewProduct(item.id, item.name)
                                    }
                                  >
                                    {item.name}
                                  </h3>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    {item.color && (
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-smallHeader rounded-full"></div>
                                        <span>
                                          Color:{" "}
                                          <span className="font-medium text-gray-900">
                                            {item.color}
                                          </span>
                                        </span>
                                      </div>
                                    )}
                                    {item.print && (
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>
                                          Print:{" "}
                                          <span className="font-medium text-gray-900">
                                            {item.print}
                                          </span>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-6 py-4 text-center">
                              <div className="text-2xl font-bold text-smallHeader">
                                ${item.setupFee.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-2xl font-bold text-smallHeader">
                                ${item.price.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                per unit
                              </div>
                            </td>

                            {/* Quantity */}
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center">
                                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                  <div className="flex items-center">
                                    <button
                                      onClick={() =>
                                        dispatch(
                                          decrementQuantity({ id: item.id })
                                        )
                                      }
                                      className="p-2 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                    >
                                      <FiMinus className="w-4 h-4" />
                                    </button>
                                    <input
                                      type="number"
                                      value={
                                        customQuantities[item.id] ||
                                        item.quantity
                                      }
                                      onChange={(e) =>
                                        dispatch(
                                          multipleQuantity({
                                            id: item.id,
                                            quantity:
                                              parseInt(e.target.value, 10) || 1,
                                          })
                                        )
                                      }
                                      className="w-32 py-2 text-center outline-none border-0 bg-transparent font-bold text-2xl"
                                      min="1"
                                    />
                                    <button
                                      onClick={() =>
                                        dispatch(
                                          incrementQuantity({ id: item.id })
                                        )
                                      }
                                      className="p-2 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                    >
                                      <FiPlus className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Total */}
                            <td className="px-6 py-4 text-center">
                              <div className="text-2xl font-bold text-smallHeader">
                                $
                                {(subTotal || 0).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </td>

                            {/* Delete Action */}
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleRemovefromCart(item.id)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                title="Remove from cart"
                              >
                                <MdDelete className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {items.map((item) => {
                    const subTotal =
                      item.totalPrice || item.price * item.quantity;
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex space-x-3">
                          {/* Product Image */}
                          <img
                            onClick={() =>
                              handleViewProduct(item.id, item.name)
                            }
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 cursor-pointer object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex-shrink-0"
                          />

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-base font-semibold text-gray-900 mb-2 cursor-pointer hover:text-smallHeader transition-colors line-clamp-2"
                              onClick={() =>
                                handleViewProduct(item.id, item.name)
                              }
                            >
                              {item.name}
                            </h3>

                            {/* Product Attributes */}
                            <div className="space-y-1 text-xs text-gray-600 mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-smallHeader rounded-full"></div>
                                <span>
                                  Color:{" "}
                                  <span className="font-medium text-gray-900">
                                    {item.color}
                                  </span>
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>
                                  Print:{" "}
                                  <span className="font-medium text-gray-900">
                                    {item.print}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {/* Price and Quantity Row */}
                            <div className="flex items-center justify-between">
                              <div className="text-left">
                                <div className="text-sm font-bold text-smallHeader">
                                  ${item.price.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  per unit
                                </div>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-3">
                                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                  <div className="flex items-center">
                                    <button
                                      onClick={() =>
                                        dispatch(
                                          decrementQuantity({ id: item.id })
                                        )
                                      }
                                      className="p-2 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                    >
                                      <FiMinus className="w-3 h-3" />
                                    </button>
                                    <input
                                      type="number"
                                      value={
                                        customQuantities[item.id] ||
                                        item.quantity
                                      }
                                      onChange={(e) =>
                                        dispatch(
                                          multipleQuantity({
                                            id: item.id,
                                            quantity:
                                              parseInt(e.target.value, 10) || 1,
                                          })
                                        )
                                      }
                                      className="w-12 py-1 text-center outline-none border-0 bg-transparent font-bold text-xs"
                                      min="1"
                                    />
                                    <button
                                      onClick={() =>
                                        dispatch(
                                          incrementQuantity({ id: item.id })
                                        )
                                      }
                                      className="p-2 text-gray-600 hover:text-smallHeader hover:bg-gray-50 transition-colors"
                                    >
                                      <FiPlus className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleRemovefromCart(item.id)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                  title="Remove from cart"
                                >
                                  <MdDelete className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Total */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">
                                  Total:
                                </span>
                                <span className="text-lg font-bold text-smallHeader">
                                  $
                                  {(subTotal || 0).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Checkout Summary */}
            <div className="md:w-1/3 ml-auto mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4">
                <div className="mb-3">
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

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">
                      Total Setup Charges
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      { setupFee > 0 ? `$${setupFee.toFixed(2)}` : "-" }
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">
                      Tax (GST 10%)
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ${(gstAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-green-600">
                        Coupon Discount
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        -${(couponDiscountAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">
                      Shipping
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {items.length > 0
                        ? shippingCharges > 0
                          ? `$${shippingCharges.toFixed(2)}`
                          : "-"
                        : "$0.00"}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">
                        Grand Total
                      </span>
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

                {/* Coupon Code Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      Coupon Code:
                    </span>
                    {appliedCoupon && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">
                          {appliedCoupon.coupen} Applied
                        </span>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-red-500 hover:text-red-700 text-sm font-medium underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {!appliedCoupon && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={value}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-smallHeader focus:border-transparent"
                        onChange={handleChange}
                        disabled={isApplyingCoupon}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !value.trim()}
                        className="px-4 py-2 bg-smallHeader text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
                      >
                        {isApplyingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Checkout Button */}
                <div className="flex justify-end">
                  {total > shippingCharges ? (
                    <Link
                      to="/upload-artwork"
                      state={{
                        cartTotal: total,
                        appliedCoupon: appliedCoupon,
                        couponDiscount: couponDiscount,
                        shippingCharges: shippingCharges,
                        setupFee: setupFee
                      }}
                      className="bg-smallHeader text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center space-x-2"
                    >
                      <span>Proceed to Artwork</span>
                      <FaArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => toast.error("Your cart is empty")}
                      className="bg-gray-400 text-white px-8 py-3 rounded-lg font-bold cursor-not-allowed opacity-50"
                    >
                      Check out
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
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
            className="inline-flex items-center px-6 py-3 bg-smallHeader text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      )}
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
