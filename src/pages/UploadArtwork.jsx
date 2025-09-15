import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaUpload,
  FaTimes,
  FaArrowRight,
  FaShoppingCart,
} from "react-icons/fa";
import { toast } from "react-toastify";

const UploadArtwork = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Get cart data from Redux
  const items = useSelector((state) => state.cart.items);

  // Get data passed from cart page
  const { cartTotal, appliedCoupon, couponDiscount, shippingCharges } =
    location.state || {};

  // State for artwork uploads
  const [artworkFile, setArtworkFile] = useState(null);
  const [artworkInstructions, setArtworkInstructions] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Calculate totals
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalDiscountPercent =
    items.length > 0 ? Math.min(items.length * 5, 50) : 0;
  const discountedAmount = totalAmount * (1 - totalDiscountPercent / 100);
  const finalDiscountedAmount = appliedCoupon
    ? discountedAmount * (1 - couponDiscount / 100)
    : discountedAmount;
  const gstAmount = finalDiscountedAmount * 0.1;
  const total = finalDiscountedAmount + gstAmount + (shippingCharges || 0);

  const handleFileUpload = (file) => {
    if (
      file &&
      (file.type.startsWith("image/") || file.type === "application/pdf")
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setArtworkFile({
          file,
          preview: e.target.result,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a valid image or PDF file");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const removeArtwork = () => {
    setArtworkFile(null);
    setArtworkInstructions("");
  };

  const handleProceedToCheckout = () => {
    // Validate that artwork or instructions are provided
    if (!artworkFile && !artworkInstructions.trim()) {
      toast.error(
        "Please upload artwork or provide instructions for your order"
      );
      return;
    }

    // Navigate to checkout with artwork data
    navigate("/checkout", {
      state: {
        cartTotal: total,
        appliedCoupon,
        couponDiscount,
        shippingCharges,
        artworkFile,
        artworkInstructions,
      },
    });
  };

  const handleBackToCart = () => {
    navigate("/cart");
  };

  return (
    <div className="py-8 Mycontainer">
      <div className="mb-8">
        <h2 className="text-lg text-smallHeader mb-2">
          <Link to="/" className="text-smallHeader">
            Home
          </Link>{" "}
          &gt;{" "}
          <Link to="/cart" className="text-smallHeader">
            Cart
          </Link>{" "}
          &gt; Upload Artwork
        </h2>
        <p className="text-gray-600">
          Upload artwork and provide instructions for your products
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-6 lg:flex-nowrap">
        {/* Left Side - Artwork Upload */}
        <div className="w-full lg:w-[70%]">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-smallHeader px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <FaUpload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Upload Artwork
                  </h3>
                  <p className="text-sm text-white/90">
                    Upload artwork for each product in your order
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Single Upload Area */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Artwork (Optional)
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? "border-smallHeader bg-smallHeader/5"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {artworkFile ? (
                    <div className="space-y-4">
                      {artworkFile.file.type.startsWith("image/") ? (
                        <img
                          src={artworkFile.preview}
                          alt="Artwork preview"
                          className="w-48 h-48 object-cover rounded-lg mx-auto border border-gray-200"
                        />
                      ) : (
                        <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <svg
                              className="w-12 h-12 text-gray-400 mx-auto mb-2"
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
                            <p className="text-sm text-gray-600">
                              PDF Document
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {artworkFile.name}
                        </span>
                        <button
                          onClick={removeArtwork}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FaUpload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg text-gray-600 mb-2">
                          Drag and drop your artwork here, or{" "}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-smallHeader hover:underline font-medium"
                          >
                            browse files
                          </button>
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports PNG, JPG, PDF files up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artwork Instructions (Required if no file uploaded)
                </label>
                <textarea
                  value={artworkInstructions}
                  onChange={(e) => setArtworkInstructions(e.target.value)}
                  placeholder="Describe how you want your artwork to look, any specific requirements, colors, text, positioning, etc. This will apply to all products in your order."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors resize-none"
                  rows={5}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Cart Summary */}
        <div className="w-full lg:w-[30%]">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
            <div className="bg-smallHeader px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <FaShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Order Summary
                  </h3>
                  <p className="text-sm text-white/90">
                    {items.length} item{items.length !== 1 ? "s" : ""} in order
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Applied Coupon Display */}
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

              {/* Cart Items */}
              <ul className="space-y-3 mb-6">
                {items.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  return (
                    <li key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.quantity} x ${item.price}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.color} • {item.size}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ${itemTotal.toFixed(2)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Pricing Breakdown */}
              <div className="space-y-2 mb-6">
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

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-smallHeader">
                    $
                    {total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBackToCart}
                  className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back to Cart
                </button>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-smallHeader text-white py-4 px-6 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadArtwork;
