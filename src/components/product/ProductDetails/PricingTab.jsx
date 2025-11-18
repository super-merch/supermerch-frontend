import {
  getProductCategory,
  isProductCategory,
  getClothingAdditionalCost,
  getClothingPricing,
} from "@/utils/utils";
import React, { useEffect } from "react";
import { IoCartOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { FaInfoCircle } from "react-icons/fa";

const PricingTab = ({
  productId,
  selectedPrintMethod,
  selectedSize,
  currentQuantity,
  availablePriceGroups,
  parseSizing,
  setSelectedPrintMethod,
  setCurrentQuantity,
  setActiveIndex,
  handleAddToCart,
  setShowSizeGuide,
  getPriceForQuantity,
  discountMultiplier,
  setSelectedSize,
  single_product,
  setShowQuoteForm,
  setQuantity,
  selectedLeadTimeAddition,
  setSelectedLeadTimeAddition,
}) => {
  const getTrimmedDescription = (description) => {
    return description?.trim()?.split(" (")[0];
  };
  const uniquePriceGroups = availablePriceGroups.filter(
    (group, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.promodata_decoration &&
          t.promodata_decoration === group.promodata_decoration
      )
  );

  // Find all additions with the same promodata_decoration as the selected print method
  // Deduplicate by lead_time, keeping the first occurrence for each unique lead_time
  const getLeadTimeOptions = () => {
    if (!selectedPrintMethod || selectedPrintMethod.type !== "addition") {
      return [];
    }
    const decoration = selectedPrintMethod.promodata_decoration;
    if (!decoration) return [];

    // Filter all matching additions
    const allOptions = availablePriceGroups.filter(
      (group) =>
        group.type === "addition" &&
        group.promodata_decoration === decoration &&
        group.lead_time
    );

    // Deduplicate by lead_time, keeping the first occurrence
    const uniqueOptionsMap = new Map();
    allOptions.forEach((option) => {
      const leadTime = option.lead_time;
      // Only add if we haven't seen this lead_time before
      if (!uniqueOptionsMap.has(leadTime)) {
        uniqueOptionsMap.set(leadTime, option);
      }
    });

    // Convert Map values to array and maintain original order (first occurrence)
    return Array.from(uniqueOptionsMap.values());
  };

  const leadTimeOptions = getLeadTimeOptions();

  // When print method changes, reset lead time selection
  useEffect(() => {
    if (
      selectedPrintMethod?.type === "addition" &&
      leadTimeOptions.length > 0
    ) {
      // Auto-select first lead time option if none selected or if decoration doesn't match
      if (
        !selectedLeadTimeAddition ||
        selectedLeadTimeAddition.promodata_decoration !==
          selectedPrintMethod.promodata_decoration ||
        !leadTimeOptions.some(
          (opt) =>
            opt.key === selectedLeadTimeAddition.key &&
            opt.lead_time === selectedLeadTimeAddition.lead_time
        )
      ) {
        const firstOption = leadTimeOptions[0];
        if (firstOption) {
          setSelectedLeadTimeAddition(firstOption);
          // Update selectedPrintMethod to use first option's price_breaks
          setSelectedPrintMethod({
            ...selectedPrintMethod,
            price_breaks: firstOption.price_breaks,
            setup: firstOption.setup,
            lead_time: firstOption.lead_time,
          });
        }
      }
    } else {
      // Clear lead time selection if not an addition or no options available
      setSelectedLeadTimeAddition(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedPrintMethod?.key,
    selectedPrintMethod?.promodata_decoration,
    leadTimeOptions.length,
  ]);

  // Get the effective print method (use selectedLeadTimeAddition if available)
  const effectivePrintMethod = selectedLeadTimeAddition || selectedPrintMethod;

  const getCleanPrintMethodName = (description) => {
    if (!description) return "";

    // Remove everything after " - Set up" or " - Setup" (case insensitive)
    const cleaned = description.replace(/\s*-\s*set\s*up.*$/i, "").trim();

    // Also remove parentheses content if exists
    return cleaned.split(" (")[0].trim();
  };

  const isClothing = isProductCategory(single_product, "Clothing");

  const priceGroups = isClothing ? availablePriceGroups : uniquePriceGroups;
  return (
    <div className="overflow-x-auto space-y-1 !text-black">
      {priceGroups?.length > 0 && (
        <div className="flex items-center gap-4">
          <label
            htmlFor="print-method"
            className=" my-2  font-medium text-black text-sm sm:text-base"
          >
            Print Method:
          </label>

          <select
            id="print-method"
            value={selectedPrintMethod?.key}
            onChange={(e) => {
              const selected = priceGroups.find(
                (method) => method.key === e.target.value
              );
              setSelectedPrintMethod(selected);
              // Reset lead time selection when print method changes
              setSelectedLeadTimeAddition(null);
              // Reset quantity to first price break of new selection
              if (selected?.price_breaks?.length > 0) {
                setCurrentQuantity(selected.price_breaks[0].qty);
              }
            }}
            className="px-2 py-2 border rounded-md outline-none pr-3"
          >
            {priceGroups?.map((method, index) => {
              const displayName = isClothing
                ? getCleanPrintMethodName(method.description)
                : getTrimmedDescription(method?.promodata_decoration);

              return (
                <option key={method.key + index} value={method.key}>
                  {displayName}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Lead Time Selection for Additions */}
      {leadTimeOptions.length > 0 && (
        <div className="flex justify-start items-start gap-2 mt-3">
          <label className="w-max min-w-[100px] font-medium text-black">
            Lead Time:
          </label>
          <div className="flex flex-wrap gap-2">
            {leadTimeOptions.map((option, index) => {
              const isSelected =
                selectedLeadTimeAddition?.key === option.key &&
                selectedLeadTimeAddition?.lead_time === option.lead_time;
              return (
                <button
                  key={`${option.lead_time}-${option.key}-${index}`}
                  onClick={() => {
                    setSelectedLeadTimeAddition(option);
                    // Update selectedPrintMethod to use this addition's price_breaks
                    setSelectedPrintMethod({
                      ...selectedPrintMethod,
                      price_breaks: option.price_breaks,
                      setup: option.setup,
                      lead_time: option.lead_time,
                    });
                    // Reset to first price break
                    if (option.price_breaks?.length > 0) {
                      setCurrentQuantity(option.price_breaks[0].qty);
                    }
                  }}
                  className={`px-2 py-1.5 rounded-md border text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-secondary text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.lead_time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isClothing && parseSizing()?.sizes?.length > 1 && (
        <div className="flex flex-col w-full mb-3">
          <div className="flex justify-between items-center gap-4 my-2">
            <label htmlFor="print-method" className="w-full my-2  font-medium">
              Size:
            </label>
            <select
              id="print-method"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-2 py-2 border rounded-md outline-none"
            >
              {parseSizing().sizes?.map((size, index) => (
                <option key={index} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <p
            className="w-full text-right hover:underline text-sm text-black cursor-pointer"
            onClick={() => setShowSizeGuide(true)}
          >
            * See Size Guide
          </p>
        </div>
      )}
      {!isClothing && (
        <span className="text-sm text-black mt-3">
          * The pricing includes 1 col - 1 position
        </span>
      )}

      {(() => {
        // Sort price breaks once for reuse - use effectivePrintMethod
        const sortedBreaks = effectivePrintMethod?.price_breaks
          ? [...effectivePrintMethod.price_breaks].sort((a, b) => a.qty - b.qty)
          : [];
        const firstQuantity = sortedBreaks[0]?.qty;
        const showContactRow = sortedBreaks.length > 0 && firstQuantity > 2;

        return (
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-black">
                <th className="py-2 pr-4 text-base   sm:text-xl">Select</th>
                <th className="py-2 pr-4 text-base sm:text-xl">Qty</th>
                <th className="py-2 pr-4 text-base sm:text-xl min-w-[70px]">
                  Unit <span className=" text-gray-500">(excl GST)</span>
                </th>
                <th className="py-2 text-base sm:text-xl">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Contact row for quantities below first price break */}
              {showContactRow && (
                <tr className="border-t hover:bg-gray-50 text-black">
                  <td className="py-2 pr-4 align-middle text-md text-black">
                    <input
                      type="radio"
                      name="priceTier"
                      aria-label="Contact for quote"
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    />
                  </td>
                  <td className="py-2 pr-4 align-middle text-lg text-black">
                    0-{firstQuantity - 1}
                  </td>
                  <td
                    className="py-2   text-lg text-black text-right"
                    colSpan={2}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowQuoteForm?.({ state: true, from: "lowMOQ" });
                        setCurrentQuantity(0);
                      }}
                      className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-medium rounded-md transition-colors"
                    >
                      For Low MOQ, Contact Us
                    </button>
                  </td>
                </tr>
              )}
              {sortedBreaks.map((item, i) => {
                const baseProductPrice = getPriceForQuantity(item.qty);
                let methodUnit =
                  effectivePrintMethod.type === "base"
                    ? item.price
                    : baseProductPrice + item.price;

                // Add clothing-specific additional cost per unit if applicable
                if (isClothing) {
                  const clothingAdditionalCost = getClothingAdditionalCost(
                    effectivePrintMethod.description
                  );
                  methodUnit += clothingAdditionalCost;
                }

                const unitWithMargin = methodUnit;
                const unitDiscounted = unitWithMargin * discountMultiplier;
                const total = unitDiscounted * item.qty;

                // Check if this price tier applies to the current quantity
                const isSelected =
                  currentQuantity >= item.qty &&
                  (i === sortedBreaks.length - 1 ||
                    currentQuantity < sortedBreaks[i + 1].qty);
                return (
                  <tr
                    key={item.qty}
                    className={`border-t cursor-pointer hover:bg-blue-50/80 text-black ${
                      isSelected ? "bg-blue-50/80" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setCurrentQuantity(item.qty);
                      setActiveIndex(i);
                    }}
                  >
                    <td className="py-2 pr-4 align-middle text-base sm:text-lg text-black">
                      <input
                        type="radio"
                        name="priceTier"
                        aria-label={`Select ${item.qty}+ tier`}
                        checked={isSelected}
                        onChange={() => {
                          setCurrentQuantity(item.qty);
                          setActiveIndex(i);
                        }}
                      />
                    </td>
                    <td className="py-2 pr-4 align-middle text-base sm:text-lg text-black">
                      {item.qty}+
                    </td>
                    <td className="py-2 pr-4 align-middle text-base sm:text-lg text-black">
                      ${unitDiscounted.toFixed(2)}
                    </td>
                    <td className="py-2 align-middle text-base sm:text-lg text-black">
                      ${total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      })()}
      <div className="mb-4 p-4 xs:p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center xs:gap-2 gap-4">
          <label className="md:text-lg text-md font-medium text-gray-700 whitespace-nowrap">
            Order Quantity:
          </label>
          <div className="flex items-center xs:gap-1 gap-2">
            <input
              type="number"
              min="1"
              value={currentQuantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setCurrentQuantity(value);
                // Find the appropriate price tier for this quantity
                const sortedBreaks = [
                  ...(effectivePrintMethod?.price_breaks || []),
                ].sort((a, b) => a.qty - b.qty);
                let newActiveIndex = 0;
                for (let i = 0; i < sortedBreaks.length; i++) {
                  if (value >= sortedBreaks[i].qty) {
                    newActiveIndex = i;
                  } else {
                    break;
                  }
                }
                setActiveIndex(newActiveIndex);
              }}
              className="w-24 xs:w-20 px-3 py-2 border border-gray-300 rounded-md text-md md:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter qty"
            />
            <span className="text-md md:text-lg text-black block xs:hidden">
              units
            </span>{" "}
            <span className="text-md md:text-lg text-black hidden xs:block">
              pcs
            </span>
          </div>
          {/* <div className="ml-auto text-sm text-black">
                          <Button>Large Order?</Button>
                        </div> */}
        </div>
      </div>
      {/* Enhanced Drag and Drop Section */}
      {/* <div
                      className={`mt-2 px-6 py-2 mb-4 text-center border-2 border-dashed cursor-pointer bg-dots transition-all duration-200 ${
                        isDragging
                          ? "border-blue-500 bg-blue-50"
                          : "border-smallHeader"
                      }`}
                      onClick={handleDivClick}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <img
                        src={selectedFile || "/drag.png"}
                        alt="Uploaded File"
                        className="flex m-auto max-w-[100px] max-h-[100px] object-contain"
                      />
                      <p className=" text-lg font-medium text-smallHeader">
                        {selectedFile
                          ? "Logo image Uploaded"
                          : isDragging
                          ? "Drop files here"
                          : "Click or Drag your Artwork/Logo to upload"}
                      </p>
                      <p className="text-smallHeader  m-auto text-sm">
                        Supported formats: AI, EPS, SVG, PDF, JPG, JPEG, PNG.
                        Max file size: 16 MB
                      </p>
                      <input
                        type="file"
                        id="fileUpload"
                        accept=".ai, .eps, .svg, .pdf, .jpg, .jpeg, .png"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div> */}
      <Link
        onClick={(e) => {
          handleAddToCart(e);
        }}
        className="flex items-center justify-center w-full gap-3 px-2 py-3 mt-6 text-white rounded-sm cursor-pointer bg-primary hover:bg-primary/80 transition-all duration-300"
      >
        <button className="text-lg uppercase">Add to cart</button>
        <IoCartOutline className="text-xl" />
      </Link>
    </div>
  );
};

export default PricingTab;
