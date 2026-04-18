import React, { useState, useRef, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaUpload,
  FaTimes,
  FaArrowRight,
  FaShoppingCart,
  FaCheckCircle,
} from "react-icons/fa";
import { GiSewingNeedle } from "react-icons/gi";
import { FaPrint } from "react-icons/fa";
import { toast } from "react-toastify";
import { AppContext } from "@/context/AppContext";
import { ProductsContext } from "@/context/ProductsContext";
import { selectCurrentUserCartItems } from "@/redux/slices/cartSlice";

const UploadArtwork = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { totalDiscount } = useContext(ProductsContext);
  const { shippingCharges, setupFee, gstCharges } = useContext(AppContext);

  // Get cart data from Redux
  const items = useSelector(selectCurrentUserCartItems);
  // Get data passed from cart page
  const { cartTotal, appliedCoupon, couponDiscount, fromDeal, dealData } = location.state || {};

  const roundToTwo = (value) =>
    Math.round((Number(value) + Number.EPSILON) * 100) / 100;

  // Helper: get artwork preview for an item — try Redux first, then localStorage fallback
  const getArtworkPreview = (item) => {
    const ac = item.adminCustomization;
    if (!ac) return null;
    // Try Redux data first
    if (ac.customizationFile?.preview) return ac.customizationFile;
    // Fallback: read from dedicated localStorage key
    const artworkKey = `sm_artwork_${item.id}_${ac.methodId}`;
    try {
      const stored = localStorage.getItem(artworkKey);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore parse errors */ }
    return null;
  };

  // An item "has customization" if it has admin-defined customization OR a promodata print method with a logo
  const itemHasAnyCustomization = (item) => {
    if (item.adminCustomization) return true;
    if (item.dragdrop && item.dragdrop !== "None") return true;
    return false;
  };
  const itemsWithCustomization = items.filter(itemHasAnyCustomization);
  const itemsWithoutCustomization = items.filter((item) => !itemHasAnyCustomization(item));
  const itemsNeedingArtworkInput = itemsWithoutCustomization.filter((item) => {
    const printLabel = String(item.print || "").trim().toLowerCase();
    return printLabel !== "" && printLabel !== "none";
  });
  const hasPendingArtworkInputs = itemsNeedingArtworkInput.length > 0;
  const allItemsHaveCustomization = itemsWithoutCustomization.length === 0 && itemsWithCustomization.length > 0;
  const dealItems = items.filter((item) => item.dealSource?.dealId);
  const activeDealTitle = dealData?.dealTitle || dealItems[0]?.dealSource?.dealTitle || null;

  // Check if any item has an uploaded customization file (admin customization with file)
  const hasUploadedArtwork = itemsWithCustomization.some(
    (item) => getArtworkPreview(item) !== null
  );

  // State for artwork uploads — auto-select "upload" if items already have artwork uploaded
  const [artworkFilesByTarget, setArtworkFilesByTarget] = useState({});
  const [artworkInstructions, setArtworkInstructions] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [artworkOption, setArtworkOption] = useState(
    allItemsHaveCustomization ? "no_artwork" : "no_artwork"
  ); // 'upload' | 'text' | 'on_file' | 'no_artwork'
  const [artworkTarget, setArtworkTarget] = useState("all");
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const currentArtworkTargetKey = artworkTarget === "all" ? "all" : artworkTarget;
  const artworkFile = artworkFilesByTarget[currentArtworkTargetKey] || null;
  const hasAnyUploadedArtworkFile = Object.keys(artworkFilesByTarget).length > 0;

  const getArtworkTargetLabel = (targetKey) => {
    if (targetKey === "all") {
      return "All products in this order";
    }
    const targetItem = itemsNeedingArtworkInput.find((item) => (item.cartItemId || item.id) === targetKey);
    if (!targetItem) {
      return "All products in this order";
    }
    return `${targetItem.name}${targetItem.color ? ` - ${targetItem.color}` : ""}${targetItem.size ? ` / ${targetItem.size}` : ""}`;
  };

  // Auto-select appropriate artwork option based on cart items
  useEffect(() => {
    if (allItemsHaveCustomization && hasUploadedArtwork) {
      // All items already have customization with uploaded files — default to "no_artwork" (they're covered)
      setArtworkOption("no_artwork");
    }
  }, [allItemsHaveCustomization, hasUploadedArtwork]);

  useEffect(() => {
    if (!hasPendingArtworkInputs) {
      setArtworkTarget("all");
      setArtworkOption("no_artwork");
      return;
    }

    if (
      artworkTarget !== "all" &&
      !itemsNeedingArtworkInput.some((item) => (item.cartItemId || item.id) === artworkTarget)
    ) {
      setArtworkTarget("all");
    }
  }, [hasPendingArtworkInputs, itemsNeedingArtworkInput, artworkTarget]);

  const totalDiscountPercent = items.reduce(
    (sum, item) => sum + (totalDiscount[item.id] || 0),
    0
  );

  // Base total calculation
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const dealRawSubtotal = dealItems.reduce(
    (sum, item) => sum + (Number(item.rawUnitPrice ?? item.price) * Number(item.quantity || 0)),
    0
  );
  const dealAppliedSubtotal = dealItems.reduce(
    (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)),
    0
  );
  const dealDiscountAmount = roundToTwo(Math.max(dealRawSubtotal - dealAppliedSubtotal, 0));

  const normalizedSetupFee = Number(setupFee) || 0;
  const normalizedShipping = Number(shippingCharges) || 0;
  const normalizedGstRate = Number(gstCharges) || 0;
  const normalizedCouponPercent = Number(couponDiscount) || 0;

  const couponBaseAmount = Math.max(totalAmount + normalizedSetupFee, 0);
  const calculatedCouponDiscount = (couponBaseAmount * normalizedCouponPercent) / 100;

  const couponDiscountExceedsLimit =
    appliedCoupon?.maxLimitAmount &&
    calculatedCouponDiscount > Number(appliedCoupon.maxLimitAmount);

  const couponDiscountAmount = appliedCoupon?.maxLimitAmount
    ? Math.min(calculatedCouponDiscount, Number(appliedCoupon.maxLimitAmount))
    : calculatedCouponDiscount;

  const amountAfterDiscount = Math.max(couponBaseAmount - couponDiscountAmount, 0);
  const preTaxAmount = amountAfterDiscount + normalizedShipping;
  const gstAmount = (preTaxAmount * normalizedGstRate) / 100;
  const total = preTaxAmount + gstAmount;

  const handleFileUpload = (file) => {
    // file size less then 5 mb
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }
    if (
      file &&
      (file.type.startsWith("image/") || file.type === "application/pdf")
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const uploadedArtwork = {
          file,
          preview: e.target.result,
          name: file.name,
        };
        setArtworkFilesByTarget((prev) => ({
          ...prev,
          [currentArtworkTargetKey]: uploadedArtwork,
        }));
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
    setArtworkFilesByTarget((prev) => {
      const next = { ...prev };
      delete next[currentArtworkTargetKey];
      return next;
    });
  };

  const handleProceedToCheckout = () => {
    if (setupFee === undefined) {
      toast.error("Invalid amount please go back to cart page and proceed.");
      return;
    }

    // If all items have admin customization, skip validation for hardcoded artwork
    if (hasPendingArtworkInputs) {
      // Validate based on selected option
      if (artworkOption === "upload") {
        if (!hasAnyUploadedArtworkFile && !artworkInstructions.trim()) {
          toast.error("Upload a file or add instructions for your artwork");
          return;
        }
      }

      if (artworkOption === "text") {
        if (!artworkInstructions.trim()) {
          toast.error("Please enter the text you want on the product");
          return;
        }
      }
    }

    // Navigate to checkout with artwork data
    navigate("/checkout", {
      state: {
        cartTotal: total,
        appliedCoupon,
        couponDiscount,
        shippingCharges,
        artworkFile: artworkFile || artworkFilesByTarget.all || null,
        artworkFilesByTarget,
        artworkInstructions,
        artworkOption: allItemsHaveCustomization && artworkOption === "no_artwork"
          ? "admin_customization"
          : (hasPendingArtworkInputs ? artworkOption : "no_artwork"),
        artworkTarget,
        dealDiscountAmount,
        dealRawSubtotal: roundToTwo(dealRawSubtotal),
        dealAppliedSubtotal: roundToTwo(dealAppliedSubtotal),
        setupFee,
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
        {(fromDeal || dealItems.length > 0) && (
          <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <p className="font-semibold">Deal pricing active{activeDealTitle ? `: ${activeDealTitle}` : ""}</p>
            <p>
              Your order summary includes the bundle discount.
              {dealDiscountAmount > 0 ? ` Applied deal discount: $${dealDiscountAmount.toFixed(2)}` : ""}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-start gap-6 lg:flex-nowrap">
        {/* Left Side - Artwork Upload */}
        <div className="w-full lg:w-[70%]">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-primary px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  {allItemsHaveCustomization ? (
                    <FaCheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <FaUpload className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {allItemsHaveCustomization
                      ? "Artwork Already Configured"
                      : "Tell us about your artwork"}
                  </h3>
                  <p className="text-sm text-white/90">
                    {allItemsHaveCustomization
                      ? "Your customization details are saved — review below and proceed"
                      : "Choose one option below and add any comments"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Per-Item Customization Summary (admin-defined OR promodata with logo) */}
              {itemsWithCustomization.length > 0 && (
                <div className="mb-6">
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    Customization Already Configured
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    These items already have customization details from the product page. They will be sent to our team for proof creation.
                  </p>
                  <div className="space-y-3">
                    {itemsWithCustomization.map((item) => {
                      const ac = item.adminCustomization;
                      const hasLogo = item.dragdrop && item.dragdrop !== "None";
                      const artworkFile = ac ? getArtworkPreview(item) : null;
                      return (
                        <div key={item.cartItemId || item.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-gray-900">
                                  {item.name}
                                  {item.color && item.color !== "None" && <span className="text-gray-500 font-normal"> — {item.color}</span>}
                                  {item.size && item.size !== "None" && <span className="text-gray-500 font-normal"> / {item.size}</span>}
                                </h4>
                                <FaCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              </div>

                              <div className="flex flex-wrap gap-2 text-xs mt-1">
                                {/* Admin-defined customization info */}
                                {ac && (
                                  <>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-gray-200">
                                      {ac.applicationMethod === "EMBROIDERY" ? (
                                        <GiSewingNeedle className="w-3 h-3 text-primary" />
                                      ) : (
                                        <FaPrint className="w-3 h-3 text-primary" />
                                      )}
                                      {ac.applicationMethod}
                                    </span>
                                    <span className="px-2 py-1 bg-white rounded-full border border-gray-200">
                                      {ac.applicationType}
                                    </span>
                                    {ac.position?.positionName && (
                                      <span className="px-2 py-1 bg-white rounded-full border border-gray-200">
                                        {ac.position.positionName}
                                      </span>
                                    )}
                                  </>
                                )}
                                {/* Promodata print method info */}
                                {!ac && item.print && item.print !== "None" && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-gray-200">
                                    <FaPrint className="w-3 h-3 text-primary" />
                                    {item.print}
                                  </span>
                                )}
                              </div>

                              {/* Show artwork preview */}
                              {(hasLogo || artworkFile) && (
                                <div className="flex items-center gap-2 mt-2">
                                  {hasLogo && typeof item.dragdrop === "string" && item.dragdrop.startsWith("data:") && (
                                    <img
                                      src={item.dragdrop}
                                      alt="Logo"
                                      className="w-10 h-10 object-contain rounded border border-gray-200 bg-white cursor-pointer hover:ring-2 hover:ring-primary/40"
                                      onClick={() => setPreviewImageUrl(item.dragdrop)}
                                      title="Click to preview"
                                    />
                                  )}
                                  {artworkFile?.preview && (
                                    <img
                                      src={artworkFile.preview}
                                      alt={artworkFile.name || "Artwork"}
                                      className="w-10 h-10 object-contain rounded border border-gray-200 bg-white cursor-pointer hover:ring-2 hover:ring-primary/40"
                                      onClick={() => setPreviewImageUrl(artworkFile.preview)}
                                      title="Click to preview"
                                    />
                                  )}
                                  <span className="text-xs text-green-700">Artwork uploaded</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {itemsNeedingArtworkInput.length > 0 && (
                    <div className="border-t border-gray-200 mt-4 pt-4">
                      <p className="text-sm text-gray-600">
                        The remaining {itemsNeedingArtworkInput.length} item(s) below still need artwork instructions:
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Artwork Choice — shown only for items WITHOUT admin customization */}
              {hasPendingArtworkInputs && (
                <div className="mb-6 space-y-4">
                  <label className="block text-lg font-bold text-gray-900">
                    Tell us about your artwork
                  </label>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        className="mt-1"
                        checked={artworkOption === "upload"}
                        onChange={() => setArtworkOption("upload")}
                      />
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          Upload artwork
                        </div>
                        <div className="text-sm text-gray-600">
                          Upload an image or PDF of your artwork.
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        className="mt-1"
                        checked={artworkOption === "text"}
                        onChange={() => setArtworkOption("text")}
                      />
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          I only need text
                        </div>
                        <div className="text-sm text-gray-600">
                          Tell us the text you want printed and any styling.
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        className="mt-1"
                        checked={artworkOption === "on_file"}
                        onChange={() => setArtworkOption("on_file")}
                      />
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          You have my artwork on file
                        </div>
                        <div className="text-sm text-gray-600">
                          We’ll use your artwork from a previous order.
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        className="mt-1"
                        checked={artworkOption === "no_artwork"}
                        onChange={() => setArtworkOption("no_artwork")}
                      />
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          I don’t have artwork right now or blank product
                        </div>
                        <div className="text-sm text-gray-600">
                          Please send your artwork to{" "}
                          <span className="font-medium">
                            artwork@promotionalproducts.com.au
                          </span>{" "}
                          with your company name in the subject and a sales member
                          will be in touch.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {hasPendingArtworkInputs && (
                <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Artwork applies to
                  </label>
                  <select
                    value={artworkTarget}
                    onChange={(e) => setArtworkTarget(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="all">All products in this order</option>
                    {itemsNeedingArtworkInput.map((item) => {
                      const key = item.cartItemId || item.id;
                      return (
                        <option key={key} value={key}>
                          {item.name}
                          {item.color ? ` - ${item.color}` : ""}
                          {item.size ? ` / ${item.size}` : ""}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-gray-600 mt-2">
                    Current selection: {getArtworkTargetLabel(artworkTarget)}
                  </p>
                </div>
              )}

              {!hasPendingArtworkInputs && (
                <div className="mb-6 space-y-4 border-t border-gray-200 pt-4">
                  <label className="block text-lg font-bold text-gray-900">
                    Additional Comments (Optional)
                  </label>
                  <p className="text-sm text-gray-500 -mt-2">
                    No pending artwork upload is required for this order. Add any extra notes for our design team, or proceed directly to checkout.
                  </p>
                </div>
              )}

              {artworkOption === "upload" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Artwork
                  </label>
                  <p className="text-xs text-gray-600 mb-2">
                    Current upload target: {getArtworkTargetLabel(artworkTarget)}
                  </p>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                        ? "border-smallHeader bg-primary/5"
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
                            className="w-48 h-48 object-cover rounded-lg mx-auto border border-gray-200 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-shadow"
                            onClick={(e) => { e.stopPropagation(); setPreviewImageUrl(artworkFile.preview); }}
                            title="Click to preview"
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

                  {hasAnyUploadedArtworkFile && (
                    <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Uploaded artwork by target</p>
                      <div className="space-y-1">
                        {Object.entries(artworkFilesByTarget).map(([targetKey, fileObj]) => (
                          <div key={targetKey} className="text-xs text-gray-700 flex items-center justify-between gap-2">
                            <span className="truncate">{getArtworkTargetLabel(targetKey)}: {fileObj?.name || "File"}</span>
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                setArtworkFilesByTarget((prev) => {
                                  const next = { ...prev };
                                  delete next[targetKey];
                                  return next;
                                });
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  Artwork comments
                </label>
                <textarea
                  value={artworkInstructions}
                  onChange={(e) => setArtworkInstructions(e.target.value)}
                  placeholder={
                    artworkOption === "text"
                      ? "Type the exact text you want printed and any styling (font, size, color)."
                      : "Add any notes for our design team (placement, colors, sizing, etc.)."
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors resize-none text-lg"
                  rows={5}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Cart Summary */}
        <div className="w-full lg:w-[30%]">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
            <div className="bg-primary px-6 py-4">
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
                    <li
                      key={item.id}
                      className="flex items-center space-x-3 text-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1 min-w-0 text-lg">
                        <p className="text-lg font-medium text-gray-900 truncate">
                          {item.quantity} x {item.name}
                        </p>
                        <p className="text-base text-gray-600">
                          ${item.price.toFixed(2)} each
                        </p>
                        <p className="text-base text-gray-600">
                          {item.color} • {item.size}
                        </p>
                        {item.adminCustomization && (
                          <p className="text-sm text-purple-700 font-medium">
                            {item.adminCustomization.applicationMethod}
                            {" — "}
                            {item.adminCustomization.applicationType}
                            {item.adminCustomization.position && (
                              <> ({item.adminCustomization.position.positionName})</>
                            )}
                          </p>
                        )}
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

              {/* Pricing Breakdown */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-lg">
                  <span>Sub-total:</span>
                  <span>
                    $
                    {totalAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Total Setup Charges:</span>
                  <span>{setupFee > 0 ? `$${setupFee.toFixed(2)}` : "-"}</span>
                </div>
                {dealDiscountAmount > 0 && (
                  <div className="flex justify-between text-lg text-green-700">
                    <span>Deal Discount:</span>
                    <span>-${dealDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                {/* <div className="flex justify-between text-lg">
                  <span>Product Discount:</span>
                  <span>{totalDiscountPercent}%</span>
                </div> */}

                {appliedCoupon && (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-lg">
                      <span className="text-base">
                        Coupon ({appliedCoupon.coupen}):
                      </span>
                      <span className="text-green-600 text-base">
                        -{couponDiscount}%{" "}
                        {couponDiscountExceedsLimit && "(Capped at Max Limit)"}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span>Discounted Price:</span>
                      <span className="text-green-600">
                        ${couponDiscountAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-lg">
                  <span>Shipping:</span>
                  <span>
                    {shippingCharges > 0
                      ? `$${shippingCharges.toFixed(2)}`
                      : "-"}
                  </span>
                </div>

                <div className="flex justify-between text-lg">
                  <span>GST({gstCharges}%):</span>
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
                  className="w-full bg-primary text-white py-4 px-6 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Image Preview Lightbox ── */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 cursor-zoom-out"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={previewImageUrl}
              alt="Artwork preview"
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={(e) => { e.stopPropagation(); setPreviewImageUrl(null); }}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadArtwork;
