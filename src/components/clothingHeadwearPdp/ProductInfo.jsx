import { useState, useEffect } from "react";
import { Heart, Share2, Truck, Clock, CheckCheck } from "lucide-react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { formatAud } from "@/utils/formatAud";
import { findNearestColor } from "@/utils/utils";

/** Clothing PDP: do not cap quantities from supplier stock in the size picker. */
const MAX_SIZE_LINE_QTY = 999_999;

export default function ProductInfo({
    uploadsBaseUrl = "",
    product,
    selectedColor,
    colorVariants,
    loadingVariants,
    sizeQuantities,
    onColorChange,
    onSizeQuantitiesChange,
    onAddToCart,
    onCustomize,
    customization,
    addingToCart = false,
    deliveryOptions = [],
    loadingDeliveryOptions = false,
    deliveryEstimate = null,
    loadingDeliveryEstimate = false,
    isInWishlist = false,
    wishlistLoading = false,
    onToggleWishlist,
    onViewPricing,
    onGetExpressQuote = () => {},
    onBuySample = () => {},
    onHeadingClick = () => {},
}) {
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [selectedColors, setSelectedColors] = useState([]);
    const [showAllPricingTiers, setShowAllPricingTiers] = useState(false);

    // Sync selectedColors with parent's selectedColor prop
    useEffect(() => {
        if (selectedColor) {
            setSelectedColors([selectedColor]);
        } else {
            setSelectedColors([]);
        }
    }, [selectedColor]);

    // Helper to update a specific size quantity safely
    const updateQuantity = (sizeId, newQty) => {
        // Guard against negative values
        const safeQty = Math.max(0, newQty);
        onSizeQuantitiesChange((prev) => ({
            ...prev,
            [sizeId]: safeQty,
        }));
    };


    // Use price tiers from product data
    const pricingTiers = product.priceTiers || [];
    const visiblePricingTiers = showAllPricingTiers
        ? pricingTiers
        : pricingTiers.slice(0, 1);

    // Calculate total quantity from all sizes
    const totalQuantity = Object.values(sizeQuantities).reduce(
        (sum, qty) => sum + qty,
        0
    );

    const getCurrentTier = (qty = totalQuantity) => {
        // Find the tier that matches given quantity
        for (let i = pricingTiers.length - 1; i >= 0; i--) {
            const tier = pricingTiers[i];
            const maxQty = tier.maxQuantity || Infinity;
            if (qty >= tier.minQuantity && qty <= maxQty) {
                return tier;
            }
        }
        return pricingTiers[0]; // Default to first tier
    };

    const currentTier = getCurrentTier();
    const currentPrice = currentTier?.unitPrice || 0;
    const basePrice = pricingTiers[0]?.unitPrice || 0;

    const handleShare = async () => {
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!", {
                duration: 3000,
                icon: "🔗",
            });
        } catch (err) {
            toast.error("Failed to copy link");
            console.error("Failed to copy:", err);
        }
    };

    /** Accept #RGB / vendor hex from API. */
    const normalizeHex = (value) => {
        if (value == null || typeof value !== "string") return null;
        const s = value.trim();
        if (/^#[0-9a-fA-F]{3,8}$/i.test(s)) return s;
        if (/^[0-9a-fA-F]{6}$/i.test(s) || /^[0-9a-fA-F]{3}$/i.test(s))
            return `#${s}`;
        return null;
    };

    /**
     * Same idea as legacy ProductDetails: API hex/swatch first, then
     * color-name-list via findNearestColor (Olive, Sandstone, etc.).
     */
    const swatchColorsFor = (color) => {
        const raw = color?._raw || {};
        const parts = Array.isArray(raw.colours)
            ? raw.colours.map((x) => String(x || "").trim()).filter(Boolean)
            : [];
        const nameStr = String(color?.name || "").trim();
        const splitFromName = nameStr.includes("/")
            ? nameStr.split("/").map((x) => x.trim()).filter(Boolean)
            : [];
        const first =
            parts[0] ||
            splitFromName[0] ||
            nameStr ||
            "gray";
        const second = parts[1] || splitFromName[1] || "";

        const apiPrimary = normalizeHex(color?.primaryHexCode);
        const apiSecond = normalizeHex(color?.secondaryHexCode);
        const n1 = findNearestColor(first);
        const n2 = second ? findNearestColor(second) : null;

        const primaryColor = apiPrimary || n1?.hex || "#9ca3af";
        const secondaryColorRaw = apiSecond || (n2?.hex !== primaryColor ? n2?.hex : null);
        const secondaryColor =
            secondaryColorRaw && secondaryColorRaw !== primaryColor
                ? secondaryColorRaw
                : null;
        const hasTwoColors = Boolean(secondaryColor);

        return { primaryColor, secondaryColor, hasTwoColors };
    };

    return (
        <div className="space-y-4">
            <h1
                className="text-[#1E2328] mb-4 w-full whitespace-nowrap cursor-pointer"
                style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "700",
                    fontSize: "clamp(18px, 5vw, 24px)",
                    lineHeight: "1.3",
                }}
                onClick={onHeadingClick}
                onKeyDown={(e) => {
                    if (e.shiftKey && e.key.toLowerCase() === "a") {
                        onHeadingClick(e);
                    }
                }}
                tabIndex={0}
                role="button"
                aria-label="Product name - Press Shift+A to view supplier information"
            >
                {product.name}
            </h1>

            <div className="flex items-start justify-between gap-4 mb-2">
                {/* Left Column - Stock, Brand/SKU */}
                <div className="flex-1">

                        {/* Brand and SKU */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span
                                className="text-[#6B7380]"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "12px",
                                }}
                            >
                                {product.brandSlug ? (
                                    <a
                                        href={`/products?brand=${encodeURIComponent(
                                            product.brandSlug
                                        )}`}
                                        className="text-[#1E2328] font-medium hover:underline"
                                        style={{ cursor: "pointer" }}
                                    >
                                        {product.brand}
                                    </a>
                                ) : (
                                    <span className="text-[#1E2328] font-medium">
                                        {product.brand}
                                    </span>
                                )}
                            </span>
                            <span className="text-[#E8ECF2] hidden sm:inline">
                                •
                            </span>
                            {product.sku && (
                                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 ring-1 ring-inset ring-gray-200">
                                    SKU: {product.sku}
                                </span>
                            )}
                        </div>

                </div>

                    {/* Right Column - Brand Logo & Action Buttons */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {product.brandLogo && (
                            <a
                                href={
                                    product.brandSlug
                                        ? `/products?brand=${encodeURIComponent(
                                              product.brandSlug
                                          )}`
                                        : "#"
                                }
                                className="block p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-[#009688]/50 transition-all duration-200 group"
                                title={`View all ${product.brand} products`}
                            >
                                <img
                                    src={`${uploadsBaseUrl}/uploads/brandMaster/${product.brandLogo}`}
                                    alt={`${product.brand} Logo`}
                                    className="h-10 sm:h-12 max-w-[120px] sm:max-w-[150px] object-contain group-hover:scale-105 transition-transform duration-200"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.parentElement.style.display =
                                            "none";
                                    }}
                                />
                            </a>
                        )}
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={onToggleWishlist}
                                disabled={wishlistLoading}
                                className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isInWishlist
                                        ? "bg-[#FF4D4F] text-white shadow-md"
                                        : "bg-[#F8F9FA] text-[#6B7380] hover:text-[#FF4D4F] hover:bg-[#FFF0F0]"
                                } ${
                                    wishlistLoading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                title={
                                    isInWishlist
                                        ? "Remove from Wishlist"
                                        : "Add to Wishlist"
                                }
                            >
                                {wishlistLoading ? (
                                    <i className="ri-loader-4-line w-4 h-4 animate-spin"></i>
                                ) : (
                                    <Heart
                                        className="w-4 h-4"
                                        fill={
                                            isInWishlist
                                                ? "currentColor"
                                                : "none"
                                        }
                                    />
                                )}
                            </button>
                            <button
                                onClick={handleShare}
                                className="w-9 h-9 sm:w-8 sm:h-8 bg-[#F8F9FA] rounded-full flex items-center justify-center text-[#6B7380] hover:text-[#009688] hover:bg-[#e0f2f1] transition-colors"
                                title="Share"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="w-full flex items-center justify-end gap-1.5 sm:gap-2">
                            <button
                                type="button"
                                onClick={onGetExpressQuote}
                                className="px-2.5 sm:px-3 h-8 sm:h-9 text-[10px] sm:text-xs font-bold border-2 border-[#009688] text-[#009688] rounded-lg hover:bg-[#009688] hover:text-white transition-all whitespace-nowrap"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                Get Express Quote
                            </button>
                            <button
                                type="button"
                                onClick={onBuySample}
                                className="px-2.5 sm:px-3 h-8 sm:h-9 text-[10px] sm:text-xs font-bold text-white bg-[#009688] rounded-lg hover:bg-[#00796B] transition-all whitespace-nowrap"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                BUY 1 SAMPLE
                            </button>
                        </div>
                    </div>
                </div>
                {/* Dynamic Product Tags (Special Tags) */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3">
                    {(product.specialTags || []).map((tag, idx) => {
                        const getTagStyle = (tagName) => {
                            const t = tagName.toLowerCase();
                            if (t.includes("trending")) return { bg: "#FEF3C7", border: "rgba(245, 158, 11, 0.3)", text: "#B45309", icon: "ri-fire-fill" };
                            if (t.includes("arrival")) return { bg: "#EEF2FF", border: "rgba(99, 102, 241, 0.3)", text: "#4338CA", icon: "ri-sparkling-fill" };
                            if (t.includes("best seller")) return { bg: "#FEF3C7", border: "rgba(245, 158, 11, 0.3)", text: "#B45309", icon: "ri-medal-fill" };
                            if (t.includes("24 hour")) return { bg: "#ECFEFF", border: "rgba(6, 182, 212, 0.3)", text: "#0E7490", icon: "ri-time-line" };
                            if (t.includes("australia")) return { bg: "#FFF1F2", border: "rgba(244, 63, 94, 0.3)", text: "#BE123C", icon: "ri-map-pin-user-fill" };
                            if (t.includes("clothing")) return { bg: "#F0FDF4", border: "rgba(34, 197, 94, 0.3)", text: "#15803D", icon: "ri-t-shirt-2-fill" };
                            if (t.includes("headwear")) return { bg: "#F0FDFA", border: "rgba(20, 184, 166, 0.3)", text: "#0F766E", icon: "ri-mickey-fill" };
                            if (t.includes("promotional")) return { bg: "#FAF5FF", border: "rgba(168, 85, 247, 0.3)", text: "#7E22CE", icon: "ri-poker-stars-fill" };
                            // Default
                            return { bg: "#F3F4F6", border: "#D1D5DB", text: "#374151", icon: "ri-price-tag-3-line" };
                        };
                        const style = getTagStyle(tag);
                        return (
                            <div 
                                key={`special-${idx}`}
                                className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border text-[10px] sm:text-xs font-semibold shadow-sm"
                                style={{ 
                                    backgroundColor: style.bg, 
                                    borderColor: style.border, 
                                    color: style.text 
                                }}
                            >
                                <i className={`${style.icon} text-[10px] sm:text-xs`}></i>
                                <span>{tag}</span>
                            </div>
                        );
                    })}

                    {/* Embroidery Available Badge */}
                    {product.customizationMethods?.some((m) =>
                        m.customizationMethod?.applicationMethod
                            ?.toLowerCase()
                            .includes("embroidery")
                    ) && (
                        <div className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-[#ECFDF5] border border-[#10B981]/30 text-[#047857] text-[10px] sm:text-xs font-semibold">
                            <i className="ri-thread-line text-[10px] sm:text-xs"></i>
                            <span>Embroidery</span>
                        </div>
                    )}

                    {/* Print Available Badge */}
                    {product.customizationMethods?.some((m) =>
                        m.customizationMethod?.applicationMethod
                            ?.toLowerCase()
                            .includes("print")
                    ) && (
                        <div className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-[#ECFEFF] border border-[#06B6D4]/30 text-[#0E7490] text-[10px] sm:text-xs font-semibold">
                            <i className="ri-printer-line text-[10px] sm:text-xs"></i>
                            <span>Print</span>
                        </div>
                    )}
                </div>

            {/* Color Selection - Palette UI (Full Width) */}

            {product.colors && product.colors.length > 0 && (
                <div className="mt-2 mb-4">
                    <div className="flex flex-wrap gap-2 mt-2">
                        {product.colors.map((color) => {
                            const {
                                primaryColor,
                                secondaryColor,
                                hasTwoColors,
                            } = swatchColorsFor(color);
                            const isSelected =
                                selectedColors.includes(color.id);

                            return (
                                <div
                                    key={color.id}
                                    className="relative inline-flex items-center justify-center w-9 h-9"
                                >
                                    {/* Outer selection ring */}
                                    {isSelected && (
                                        <div className="absolute inset-[3px] rounded-full border-2 border-[#009688]" />
                                    )}

                                    <div
                                        className={`relative rounded-full cursor-pointer transition-all duration-300 ${
                                            isSelected
                                                ? "w-6 h-6 border-2 border-white shadow-sm"
                                                : "w-6 h-6 hover:scale-110 border border-gray-200"
                                        } overflow-hidden`}
                                        style={
                                            !hasTwoColors
                                                ? {
                                                      backgroundColor:
                                                          primaryColor,
                                                  }
                                                : {
                                                      background: `linear-gradient(135deg, ${primaryColor} 50%, ${secondaryColor} 50%)`,
                                                  }
                                        }
                                        onClick={() =>
                                            onColorChange(color.id)
                                        }
                                        title={color.name}
                                        aria-label={`Color: ${
                                            color.name
                                        }${
                                            isSelected
                                                ? " (Selected)"
                                                : ""
                                        }`}
                                    />

                                    {/* Checkmark badge for selected */}
                                    {isSelected && (
                                        <div className="absolute top-[2px] right-[2px] w-[16px] h-[16px] bg-[#009688] rounded-full flex items-center justify-center border-2 border-white z-10 shadow-sm">
                                            <CheckCheck
                                                className="w-2.5 h-2.5 text-white"
                                                strokeWidth={4}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Price Tiers Display */}
            <div className="border-t-2 border-[#E5E7EB] pt-3 sm:pt-4">
                {/* Main Price Display */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
                    <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                        <span
                            className="text-[#059669] font-bold text-xl sm:text-2xl md:text-[28px]"
                            style={{
                                fontFamily: "Inter, sans-serif",
                            }}
                        >
                            {formatAud(currentPrice)}
                        </span>
                        {currentPrice < basePrice && (
                            <span
                                className="text-[#9CA3AF] line-through text-sm sm:text-base"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                {formatAud(basePrice)}
                            </span>
                        )}
                        {currentTier?.discountPercent > 0 && (
                            <span
                                className="bg-[#FEE2E2] text-[#DC2626] px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                {currentTier.discountPercent}% OFF
                            </span>
                        )}
                    </div>
                </div>

                {/* Bulk Pricing Table - Professional */}
                <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden mb-2 sm:mb-3">
                    {visiblePricingTiers.map((tier, index) => {
                        const maxQty = tier.maxQuantity || Infinity;
                        const isCurrentTier =
                            totalQuantity >= tier.minQuantity &&
                            totalQuantity <= maxQty;

                        return (
                            <div
                                key={index}
                                className={`flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 border-b border-[#E5E7EB] last:border-b-0 transition-all duration-200 ${
                                    isCurrentTier
                                        ? "bg-[#F0FDF4] border-l-3 sm:border-l-4 border-l-[#10B981]"
                                        : "bg-white hover:bg-[#F9FAFB]"
                                }`}
                            >
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    {isCurrentTier && (
                                        <div className="flex-shrink-0">
                                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#10B981] rounded-full flex items-center justify-center">
                                                <i className="ri-check-line text-white text-xs sm:text-sm"></i>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center space-x-1.5 sm:space-x-2 mb-0.5">
                                            <span
                                                className={`font-bold text-sm sm:text-base ${
                                                    isCurrentTier
                                                        ? "text-[#059669]"
                                                        : "text-[#1E2328]"
                                                }`}
                                                style={{
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                }}
                                            >
                                                {formatAud(tier.unitPrice)}
                                            </span>
                                            {tier.discountPercent > 0 && (
                                                <span
                                                    className="bg-[#FEE2E2] text-[#DC2626] px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold"
                                                    style={{
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                    }}
                                                    title="Automatic discount applied at checkout"
                                                >
                                                    -{tier.discountPercent}%
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className="text-[#9CA3AF] text-[9px] sm:text-[10px]"
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            per unit
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div
                                        className={`font-semibold mb-0.5 text-xs sm:text-sm ${
                                            isCurrentTier
                                                ? "text-[#059669]"
                                                : "text-[#374151]"
                                        }`}
                                        style={{
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        {tier.tierLabel}
                                    </div>
                                    <div
                                        className={`text-[9px] sm:text-[10px] font-medium ${
                                            isCurrentTier
                                                ? "text-[#6B7280]"
                                                : "text-[#9CA3AF]"
                                        }`}
                                        style={{
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        {tier.minQuantity === tier.maxQuantity
                                            ? `${tier.minQuantity} ${
                                                  tier.minQuantity === 1
                                                      ? "item"
                                                      : "items"
                                              }`
                                            : maxQty === Infinity
                                            ? `${tier.minQuantity}+ items`
                                            : `${tier.minQuantity}-${maxQty} items`}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {pricingTiers.length > 1 && (
                    <div className="flex justify-end mb-2 sm:mb-3">
                        <button
                            type="button"
                            onClick={() => setShowAllPricingTiers((prev) => !prev)}
                            className="inline-flex items-center gap-1 text-[#6B7280] hover:text-[#009688] text-xs sm:text-sm font-medium transition-colors"
                            style={{ fontFamily: "Inter, sans-serif" }}
                            aria-expanded={showAllPricingTiers}
                            aria-label={showAllPricingTiers ? "Collapse pricing tiers" : "Expand pricing tiers"}
                        >
                            <i
                                className={
                                    showAllPricingTiers
                                        ? "ri-arrow-up-s-line text-base"
                                        : "ri-arrow-down-s-line text-base"
                                }
                            />
                            {showAllPricingTiers ? "Show less" : "Show all tiers"}
                        </button>
                    </div>
                )}
            </div>

            {/* Size & Quantities Section - Redesigned */}
            <div className="border-t border-[#E5E7EB] pt-3 sm:pt-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3
                        className="text-[#1E2328] text-sm sm:text-[15px] font-semibold"
                        style={{
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        Select Size & Quantity
                    </h3>
                    {product.sizeGuide && (
                        <a
                            href={`${uploadsBaseUrl}/uploads/brandMaster/${product.sizeGuide}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-[#6B7280] hover:text-[#374151] transition-colors group"
                            style={{ fontFamily: "Inter, sans-serif" }}
                        >
                            <i className="ri-ruler-line group-hover:scale-110 transition-transform text-xs sm:text-sm"></i>
                            <span className="text-[10px] sm:text-xs font-medium">
                                Size Guide
                            </span>
                        </a>
                    )}
                </div>

                {/* Dispatch Countdown Badge */}
                {deliveryEstimate && (
                    <div
                        className={`flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border mb-3 sm:mb-4 ${
                            deliveryEstimate.isBeforeCutoff
                                ? "bg-[#F0FDF4] border-[#10B981]/30"
                                : "bg-[#FFFBEB] border-[#F59E0B]/30"
                        }`}
                    >
                        <div
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                deliveryEstimate.isBeforeCutoff
                                    ? "bg-[#10B981]"
                                    : "bg-[#F59E0B]"
                            }`}
                        >
                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                        </div>
                        <p
                            className={`font-medium text-[11px] sm:text-xs ${
                                deliveryEstimate.isBeforeCutoff
                                    ? "text-[#047857]"
                                    : "text-[#B45309]"
                            }`}
                            style={{
                                fontFamily: "Inter, sans-serif",
                            }}
                        >
                            {deliveryEstimate.countdownMessage}
                        </p>
                    </div>
                )}

                {/* Size Grid with Quantities */}
                {selectedColors.length === 0 && (
                    <div className="text-center py-6 sm:py-8 bg-[#F9FAFB] rounded-lg border border-dashed border-[#E5E7EB]">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm">
                            <i className="ri-palette-line text-[#9CA3AF] text-lg sm:text-xl"></i>
                        </div>
                        <p
                            className="text-[#374151] font-medium mb-0.5 text-xs sm:text-sm"
                            style={{
                                fontFamily: "Inter, sans-serif",
                            }}
                        >
                            Select colors first
                        </p>
                        <p
                            className="text-[#9CA3AF] text-[10px] sm:text-xs"
                            style={{ fontFamily: "Inter, sans-serif" }}
                        >
                            Choose colors above to see sizes
                        </p>
                    </div>
                )}

                {selectedColors.length > 0 && loadingVariants && (
                    <div className="text-center py-8">
                        <div className="w-10 h-10 border-3 border-[#009688] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p
                            className="text-[#1E2328] font-medium text-sm"
                            style={{ fontFamily: "Inter, sans-serif" }}
                        >
                            Loading sizes...
                        </p>
                    </div>
                )}

                {selectedColors.length > 0 &&
                    !loadingVariants &&
                    colorVariants && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {colorVariants.sizesWithStock.map((variant) => {
                                const qty =
                                    sizeQuantities[variant.size.id] || 0;
                                return (
                                <div
                                    key={variant.variantId}
                                    className={`relative bg-[#F3F4F6] border-2 rounded-xl p-2.5 sm:p-3 transition-all duration-300 ${
                                        qty > 0
                                            ? "border-[#009688] bg-[#e0f2f1] shadow-md"
                                            : "border-[#9CA3AF] hover:border-[#009688] hover:shadow-md"
                                    }`}
                                >
                                    {/* Size Header */}
                                    <div className="flex items-center justify-between mb-2">
                                        <h4
                                            className="text-[#1E2328] font-bold"
                                            style={{
                                                fontFamily:
                                                    "Poppins, sans-serif",
                                                fontSize: "13px",
                                            }}
                                        >
                                            {variant.size.name}
                                        </h4>
                                        {qty > 0 && (
                                                <div className="w-5 h-5 bg-[#009688] rounded-full flex items-center justify-center">
                                                    <i className="ri-check-line text-white text-xs font-bold"></i>
                                                </div>
                                            )}
                                    </div>

                                    <div className="flex items-center justify-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            variant.size.id,
                                                            Math.max(
                                                                0,
                                                                qty - 1
                                                            )
                                                        )
                                                    }
                                                    className="w-8 h-8 sm:w-7 sm:h-7 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg flex items-center justify-center hover:bg-[#009688] hover:border-[#009688] hover:text-white transition-all active:scale-95"
                                                >
                                                    <i className="ri-subtract-line text-sm"></i>
                                                </button>

                                                <div className="w-12 h-8 sm:w-10 sm:h-7 bg-white border-2 border-[#CBD5E1] rounded-lg flex items-center justify-center">
                                                    <span
                                                        className="text-[#1E2328] font-bold"
                                                        style={{
                                                            fontFamily:
                                                                "Inter, sans-serif",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        {qty}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            variant.size.id,
                                                            Math.min(
                                                                MAX_SIZE_LINE_QTY,
                                                                qty + 1
                                                            )
                                                        )
                                                    }
                                                    disabled={qty >= MAX_SIZE_LINE_QTY}
                                                    className="w-8 h-8 sm:w-7 sm:h-7 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg flex items-center justify-center hover:bg-[#009688] hover:border-[#009688] hover:text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#F8FAFC] disabled:hover:border-[#CBD5E1] disabled:hover:text-[#1E2328]"
                                                >
                                                    <i className="ri-add-line text-sm"></i>
                                                </button>
                                            </div>
                                </div>
                                );
                            })}
                        </div>
                    )}

                {selectedColors.length > 0 &&
                    !loadingVariants &&
                    colorVariants &&
                    colorVariants.sizesWithStock.length === 0 && (
                        <div className="text-center py-6">
                            <i className="ri-error-warning-line text-[#FF4D4F] text-3xl mb-2"></i>
                            <p
                                className="text-[#6B7380] text-sm"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                No sizes available for the selected colors
                            </p>
                        </div>
                    )}
            </div>

            {/* Customization Section - Only show if product is customizable */}
            {onCustomize && product.isCustomizable && (
                <div className="border-t-2 border-[#9CA3AF] pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3
                            className="text-[#1E2328]"
                            style={{
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "15px",
                                fontWeight: "600",
                            }}
                        >
                            Add Customization
                        </h3>
                        <div className="flex items-center gap-2">
                            {onViewPricing && (
                                <button
                                    onClick={onViewPricing}
                                    className="text-[#009688] hover:text-[#00796B] text-xs font-medium transition-colors flex items-center gap-1"
                                    style={{ fontFamily: "Inter, sans-serif" }}
                                >
                                    <i className="ri-calculator-line text-sm"></i>
                                    View Pricing
                                </button>
                            )}
                        </div>
                    </div>

                    {customization ? (
                        // Show customization summary
                        <div className="bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB] border-2 border-[#10B981] rounded-lg p-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-2">
                                    <div className="w-8 h-8 bg-[#10B981] rounded-md flex items-center justify-center flex-shrink-0">
                                        <i className="ri-check-line text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <h4
                                            className="text-[#1E2328] font-semibold text-sm mb-0.5"
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            Customization Added
                                        </h4>
                                        <p
                                            className="text-[#6B7380] text-xs"
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            {
                                                customization.applicationMethodName
                                            }{" "}
                                            •{" "}
                                            {customization.applicationTypeName}
                                        </p>
                                        <p
                                            className="text-[#6B7380] text-xs"
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            {customization.positions
                                                .map((p) => p.name)
                                                .join(", ")}
                                        </p>
                                        {customization.pricing?.setupFee > 0 && (
                                            <div className="mt-1">
                                                <p
                                                    className="text-[10px] text-[#6B7380]"
                                                    style={{
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                    }}
                                                >
                                                    +{" "}
                                                    {formatAud(
                                                        customization.pricing.setupFee,
                                                    )}{" "}
                                                    setup (one-time)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={onCustomize}
                                    className="text-[#009688] hover:text-[#00796B] transition-colors"
                                    title="Edit customization"
                                >
                                    <i className="ri-edit-line text-base"></i>
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Show add customization button
                        <button
                            onClick={onCustomize}
                            disabled={
                                selectedColors.length === 0 ||
                                Object.values(sizeQuantities).reduce(
                                    (sum, qty) => sum + qty,
                                    0
                                ) === 0
                            }
                            className="w-full p-3 border-2 border-dashed border-[#CBD5E1] rounded-lg hover:border-[#009688] transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#CBD5E1]"
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-9 h-9 bg-[#F8F9FA] rounded-lg flex items-center justify-center group-hover:bg-[#009688] group-hover:text-white transition-all">
                                    <i className="ri-palette-line text-base text-[#6B7380] group-hover:text-white"></i>
                                </div>
                                <div className="text-left">
                                    <p
                                        className="text-[#1E2328] font-medium"
                                        style={{
                                            fontFamily: "Inter, sans-serif",
                                            fontSize: "13px",
                                        }}
                                    >
                                        Add Logo or Text
                                    </p>
                                    <p
                                        className="text-[#6B7380] text-xs"
                                        style={{
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        Personalize with printing or embroidery
                                    </p>
                                </div>
                                <i className="ri-arrow-right-line text-[#009688] text-base ml-auto"></i>
                            </div>
                        </button>
                    )}

                    {(selectedColors.length === 0 ||
                        Object.values(sizeQuantities).reduce(
                            (sum, qty) => sum + qty,
                            0
                        ) === 0) &&
                        !customization && (
                            <p
                                className="text-[#6B7380] text-xs mt-1.5 text-center"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                <i className="ri-information-line mr-1"></i>
                                Select colors and quantity first to add
                                customization
                            </p>
                        )}
                </div>
            )}

            {/* Add to Cart - Enhanced for mobile */}
            <div className="border-t border-[#E5E7EB] pt-3 sm:pt-4 space-y-2 sm:space-y-2.5">
                {(() => {
                    const totalQty = Object.values(sizeQuantities).reduce(
                        (sum, qty) => sum + qty,
                        0
                    );
                    const hasSelection = totalQty > 0;

                    // Customization pricing breakdown:
                    // - positionTotal: scales with quantity (already calculated for current qty)
                    // - setupFee: one-time, does NOT scale
                    const customizationPricing = customization?.pricing || {};
                    const customizationPositionTotal =
                        customizationPricing.positionTotal || 0;
                    const customizationSetupFee =
                        customizationPricing.setupFee || 0;
                    const customizationPrice =
                        customizationPositionTotal + customizationSetupFee;

                    const productPrice =
                        hasSelection && colorVariants
                            ? Object.entries(sizeQuantities).reduce(
                                  (sum, [sizeId, qty]) => {
                                      if (qty > 0) {
                                          const variant =
                                              colorVariants.sizesWithStock.find(
                                                  (v) =>
                                                      v.size.id ===
                                                      parseInt(sizeId)
                                              );
                                          if (variant) {
                                              // Calculate tier price
                                              let tierPrice =
                                                  pricingTiers[0]?.unitPrice ||
                                                  0;
                                              for (
                                                  let i =
                                                      pricingTiers.length - 1;
                                                  i >= 0;
                                                  i--
                                              ) {
                                                  const tier = pricingTiers[i];
                                                  const maxQty =
                                                      tier.maxQuantity ||
                                                      Infinity;
                                                  if (
                                                      qty >= tier.minQuantity &&
                                                      qty <= maxQty
                                                  ) {
                                                      tierPrice =
                                                          tier.unitPrice;
                                                      break;
                                                  }
                                              }
                                              return (
                                                  sum +
                                                  (tierPrice +
                                                      variant.priceAdjustment) *
                                                      qty
                                              );
                                          }
                                      }
                                      return sum;
                                  },
                                  0
                              )
                            : 0;
                    const totalPrice = productPrice + customizationPrice;

                    return (
                        <>
                            <button
                                onClick={onAddToCart}
                                disabled={
                                    !product.inStock ||
                                    !hasSelection ||
                                    selectedColors.length === 0 ||
                                    addingToCart
                                }
                                className="w-full px-4 sm:px-6 py-3 sm:py-3.5 bg-[#1E2328] text-white rounded-lg font-semibold hover:bg-[#374151] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none relative overflow-hidden group"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base">
                                    {addingToCart ? (
                                        <>
                                            <i className="ri-loader-4-line text-base sm:text-lg animate-spin"></i>
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-shopping-cart-2-line text-base sm:text-lg"></i>
                                            <span className="truncate">
                                                {!product.inStock
                                                    ? "Out of Stock"
                                                    : selectedColors.length ===
                                                      0
                                                    ? "Select Colors"
                                                    : !hasSelection
                                                    ? "Select Size & Qty"
                                                    : `Add ${totalQty} item${
                                                          totalQty > 1
                                                              ? "s"
                                                              : ""
                                                      } • ${formatAud(totalPrice)}`}
                                            </span>
                                        </>
                                    )}
                                </span>
                            </button>

                            <button
                                onClick={onCustomize}
                                disabled={
                                    !product.inStock ||
                                    !hasSelection ||
                                    selectedColors.length === 0 ||
                                    addingToCart
                                }
                                className="w-full px-4 sm:px-6 py-3 sm:py-3.5 border-2 border-[#009688] text-[#009688] rounded-lg font-semibold hover:bg-[#009688] hover:text-white disabled:border-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed transition-all duration-200 group"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                <span className="flex items-center justify-center gap-2 text-sm sm:text-base">
                                    <i className="ri-palette-line text-base sm:text-lg"></i>
                                    <span>Add Logo</span>
                                </span>
                            </button>
                        </>
                    );
                })()}
            </div>

            {/* Delivery Options Section */}
            {deliveryOptions.length > 0 && (
                <div className="border-t border-[#E5E7EB] pt-3 sm:pt-4">
                    <h3
                        className="text-[#1E2328] mb-2 sm:mb-3 text-sm sm:text-[15px] font-semibold"
                        style={{
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        Delivery Options
                    </h3>

                    {loadingDeliveryOptions ? (
                        <div className="flex items-center justify-center py-3">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#6B7280] border-t-transparent rounded-full animate-spin"></div>
                            <span
                                className="ml-2 text-[#9CA3AF] text-[11px] sm:text-xs"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                Loading...
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {deliveryOptions.map((option) => {
                                const deliveryType =
                                    option.deliveryType || option;
                                const effectiveCharge =
                                    option.priceOverride !== null &&
                                    option.priceOverride !== undefined
                                        ? option.priceOverride
                                        : deliveryType.deliveryCharge;
                                const isFree =
                                    !deliveryType.isChargeable ||
                                    effectiveCharge === 0;

                                // Regular delivery days
                                const regularMinDays =
                                    deliveryType.estimatedDaysMin ||
                                    deliveryType.estimatedDays ||
                                    3;
                                const regularMaxDays =
                                    deliveryType.estimatedDaysMax ||
                                    deliveryType.estimatedDays ||
                                    5;

                                // Customized delivery days
                                const customMinDays =
                                    deliveryType.estimatedDaysCustomizedMin ||
                                    7;
                                const customMaxDays =
                                    deliveryType.estimatedDaysCustomizedMax ||
                                    10;

                                // Check if product is customizable or has customization delivery days
                                // Show "With customization" row if:
                                // 1. Product is marked as customizable, OR
                                // 2. Delivery type has customized timeline days set, OR
                                // 3. User already has customization applied
                                const hasCustomizedDays =
                                    deliveryType.estimatedDaysCustomizedMin ||
                                    deliveryType.estimatedDaysCustomizedMax;
                                const isCustomizable =
                                    product?.isCustomizable ||
                                    hasCustomizedDays;
                                const hasCustomization = customization !== null;

                                // Calculate actual delivery dates using the estimate data
                                // Format dates helper
                                const formatDateRange = (minDays, maxDays) => {
                                    if (!deliveryEstimate) return null;

                                    // Use dispatch date from estimate
                                    const dispatchDate = new Date(
                                        deliveryEstimate.dispatchDate
                                    );

                                    // Add business days (simplified - not accounting for holidays here, backend does that)
                                    const addDays = (date, days) => {
                                        const result = new Date(date);
                                        let added = 0;
                                        while (added < days) {
                                            result.setDate(
                                                result.getDate() + 1
                                            );
                                            const dayOfWeek = result.getDay();
                                            if (
                                                dayOfWeek !== 0 &&
                                                dayOfWeek !== 6
                                            ) {
                                                added++;
                                            }
                                        }
                                        return result;
                                    };

                                    const minDate = addDays(
                                        dispatchDate,
                                        minDays
                                    );
                                    const maxDate = addDays(
                                        dispatchDate,
                                        maxDays
                                    );

                                    const formatDate = (date) => {
                                        const days = [
                                            "Sun",
                                            "Mon",
                                            "Tue",
                                            "Wed",
                                            "Thu",
                                            "Fri",
                                            "Sat",
                                        ];
                                        const months = [
                                            "Jan",
                                            "Feb",
                                            "Mar",
                                            "Apr",
                                            "May",
                                            "Jun",
                                            "Jul",
                                            "Aug",
                                            "Sep",
                                            "Oct",
                                            "Nov",
                                            "Dec",
                                        ];
                                        return `${
                                            days[date.getDay()]
                                        } ${date.getDate()} ${
                                            months[date.getMonth()]
                                        }`;
                                    };

                                    if (
                                        minDate.getTime() === maxDate.getTime()
                                    ) {
                                        return formatDate(minDate);
                                    }
                                    return `${formatDate(
                                        minDate
                                    )} – ${formatDate(maxDate)}`;
                                };

                                const regularDateRange = formatDateRange(
                                    regularMinDays,
                                    regularMaxDays
                                );
                                const customDateRange = formatDateRange(
                                    customMinDays,
                                    customMaxDays
                                );

                                return (
                                    <div
                                        key={deliveryType.id}
                                        className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                                            isFree
                                                ? "bg-gradient-to-br from-[#ECFDF5] via-[#D1FAE5] to-[#A7F3D0] border-[#10B981]/40 hover:border-[#10B981] hover:shadow-lg hover:shadow-[#10B981]/20"
                                                : "bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D]/50 border-[#F59E0B]/40 hover:border-[#F59E0B] hover:shadow-lg hover:shadow-[#F59E0B]/20"
                                        }`}
                                    >
                                        {/* Background decoration */}
                                        <div
                                            className={`absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 rounded-full blur-3xl opacity-30 ${
                                                isFree
                                                    ? "bg-[#10B981]"
                                                    : "bg-[#F59E0B]"
                                            }`}
                                        ></div>

                                        {/* Header row */}
                                        <div className="relative flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center space-x-2 sm:space-x-3">
                                                <div
                                                    className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md ${
                                                        isFree
                                                            ? "bg-gradient-to-br from-[#10B981] to-[#059669] text-white"
                                                            : "bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white"
                                                    }`}
                                                >
                                                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4
                                                        className="text-[#1E2328] font-bold text-sm sm:text-[15px] truncate"
                                                        style={{
                                                            fontFamily:
                                                                "Poppins, sans-serif",
                                                        }}
                                                    >
                                                        {deliveryType.name}
                                                    </h4>
                                                    {deliveryType.description && (
                                                        <p
                                                            className="text-[#6B7380] text-[10px] sm:text-xs mt-0.5 line-clamp-1"
                                                            style={{
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                            }}
                                                        >
                                                            {
                                                                deliveryType.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center ml-auto sm:ml-0">
                                                {isFree ? (
                                                    <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-full shadow-md">
                                                        <i className="ri-gift-line text-xs sm:text-sm"></i>
                                                        <span
                                                            className="font-bold text-xs sm:text-[13px]"
                                                            style={{
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                            }}
                                                        >
                                                            FREE
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-[#F59E0B]/30">
                                                        <span
                                                            className="text-[#D97706] font-bold text-sm sm:text-base"
                                                            style={{
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                            }}
                                                        >
                                                            {formatAud(effectiveCharge)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delivery dates grid */}
                                        <div className="relative space-y-2">
                                            {/* Regular delivery */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-2 sm:p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center shadow-sm flex-shrink-0">
                                                        <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span
                                                            className="text-[#1E2328] font-semibold block text-[11px] sm:text-xs"
                                                            style={{
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                            }}
                                                        >
                                                            Standard Delivery
                                                        </span>
                                                        <span className="text-[#6B7380] text-[9px] sm:text-[10px] hidden xs:inline">
                                                            Without
                                                            customization
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-left sm:text-right ml-9 sm:ml-0">
                                                    {regularDateRange ? (
                                                        <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] rounded-md sm:rounded-lg shadow-sm">
                                                            <i className="ri-calendar-check-line text-white text-[10px] sm:text-xs"></i>
                                                            <span
                                                                className="text-white font-bold text-[10px] sm:text-[11px]"
                                                                style={{
                                                                    fontFamily:
                                                                        "Inter, sans-serif",
                                                                }}
                                                            >
                                                                {
                                                                    regularDateRange
                                                                }
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span
                                                            className="text-[#4F46E5] font-semibold bg-[#EEF2FF] px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px]"
                                                            style={{
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                            }}
                                                        >
                                                            {regularMinDays}-
                                                            {regularMaxDays}{" "}
                                                            days
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Customized delivery */}
                                            {isCustomizable && (
                                                <div
                                                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-2 sm:p-3 rounded-lg border shadow-sm ${
                                                        hasCustomization
                                                            ? "bg-gradient-to-r from-[#FFF7ED] to-[#FFEDD5] border-[#FB923C]/40"
                                                            : "bg-white/60 backdrop-blur-sm border-white/50"
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 ${
                                                                hasCustomization
                                                                    ? "bg-gradient-to-br from-[#F97316] to-[#EA580C]"
                                                                    : "bg-gradient-to-br from-[#9CA3AF] to-[#6B7280]"
                                                            }`}
                                                        >
                                                            <i className="ri-palette-line text-white text-xs sm:text-sm"></i>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                                                                <span
                                                                    className={`font-semibold text-[11px] sm:text-xs ${
                                                                        hasCustomization
                                                                            ? "text-[#C2410C]"
                                                                            : "text-[#4B5563]"
                                                                    }`}
                                                                    style={{
                                                                        fontFamily:
                                                                            "Inter, sans-serif",
                                                                    }}
                                                                >
                                                                    With
                                                                    Customization
                                                                </span>
                                                                {hasCustomization && (
                                                                    <span className="text-[8px] sm:text-[9px] bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white px-1 sm:px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                                                                        ACTIVE
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span
                                                                className={`text-[9px] sm:text-[10px] hidden xs:inline ${
                                                                    hasCustomization
                                                                        ? "text-[#9A3412]"
                                                                        : "text-[#6B7380]"
                                                                }`}
                                                            >
                                                                Logo/text
                                                                printing or
                                                                embroidery
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-left sm:text-right ml-9 sm:ml-0">
                                                        {customDateRange ? (
                                                            <div
                                                                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-sm ${
                                                                    hasCustomization
                                                                        ? "bg-gradient-to-r from-[#F97316] to-[#EA580C]"
                                                                        : "bg-gradient-to-r from-[#9CA3AF] to-[#6B7280]"
                                                                }`}
                                                            >
                                                                <i className="ri-calendar-check-line text-white text-[10px] sm:text-xs"></i>
                                                                <span
                                                                    className="text-white font-bold text-[10px] sm:text-[11px]"
                                                                    style={{
                                                                        fontFamily:
                                                                            "Inter, sans-serif",
                                                                    }}
                                                                >
                                                                    {
                                                                        customDateRange
                                                                    }
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span
                                                                className={`font-semibold px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] ${
                                                                    hasCustomization
                                                                        ? "text-[#EA580C] bg-[#FFEDD5]"
                                                                        : "text-[#6B7380] bg-[#F3F4F6]"
                                                                }`}
                                                                style={{
                                                                    fontFamily:
                                                                        "Inter, sans-serif",
                                                                }}
                                                            >
                                                                {customMinDays}-
                                                                {customMaxDays}{" "}
                                                                days
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Free delivery threshold */}
                                        {deliveryType.isChargeable &&
                                            deliveryType.freeDeliveryMinOrder && (
                                                <div className="relative mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-dashed border-[#D1D5DB]">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-[#ECFDF5] to-[#D1FAE5] rounded-lg">
                                                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
                                                            <i className="ri-gift-2-line text-white text-[10px] sm:text-xs"></i>
                                                        </div>
                                                        <span
                                                            className="text-[#059669] font-semibold text-[10px] sm:text-xs leading-tight"
                                                            style={{
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                            }}
                                                        >
                                                            🎉 FREE delivery over{" "}
                                                            {formatAud(
                                                                deliveryType.freeDeliveryMinOrder,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Size Guide Modal */}
            {showSizeGuide && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#FEFEFE] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3
                                    className="text-[#1E2328] font-bold"
                                    style={{
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "24px",
                                    }}
                                >
                                    Size Guide
                                </h3>
                                <button
                                    onClick={() => setShowSizeGuide(false)}
                                    className="w-8 h-8 flex items-center justify-center text-[#6B7380] hover:text-[#009688] transition-colors"
                                >
                                    <i className="ri-close-line text-xl"></i>
                                </button>
                            </div>

                            {product.sizeChart && (
                                <div className="space-y-4">
                                    {Object.entries(product.sizeChart).map(
                                        ([size, measurements]) => (
                                            <div
                                                key={size}
                                                className="flex items-center justify-between py-2 border-b border-[#CBD5E1]"
                                            >
                                                <span
                                                    className="font-medium text-[#1E2328]"
                                                    style={{
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                    }}
                                                >
                                                    {size}
                                                </span>
                                                <span
                                                    className="text-[#6B7380]"
                                                    style={{
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                    }}
                                                >
                                                    {measurements}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

ProductInfo.propTypes = {
    uploadsBaseUrl: PropTypes.string,
    product: PropTypes.object.isRequired,
    selectedColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    colorVariants: PropTypes.object,
    loadingVariants: PropTypes.bool,
    sizeQuantities: PropTypes.object,
    onColorChange: PropTypes.func.isRequired,
    onSizeQuantitiesChange: PropTypes.func.isRequired,
    onAddToCart: PropTypes.func.isRequired,
    onCustomize: PropTypes.func,
    customization: PropTypes.object,
    addingToCart: PropTypes.bool,
    deliveryOptions: PropTypes.array,
    loadingDeliveryOptions: PropTypes.bool,
    deliveryEstimate: PropTypes.object,
    loadingDeliveryEstimate: PropTypes.bool,
    isInWishlist: PropTypes.bool,
    wishlistLoading: PropTypes.bool,
    onToggleWishlist: PropTypes.func,
    onViewPricing: PropTypes.func,
    onGetExpressQuote: PropTypes.func,
    onBuySample: PropTypes.func,
};
