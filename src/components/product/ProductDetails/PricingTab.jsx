import { isProductCategory } from "@/utils/utils";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const NONE_ARTWORK_KEY = "__none_artwork__";

const PricingTab = ({
  productId,
  selectedPrintMethod,
  artworkSource,
  adminCustomizations = [],
  selectedAdminCustomization,
  setSelectedAdminCustomization,
  selectedPosition,
  setSelectedPosition,
  selectedSize,
  currentQuantity,
  availablePriceGroups,
  parseSizing,
  setSelectedPrintMethod,
  setCurrentQuantity,
  setActiveIndex,
  setShowSizeGuide,
  getPriceForQuantity,
  pricingSummary,
  setSelectedSize,
  single_product,
  setShowQuoteForm,
  selectedLeadTimeAddition,
  setSelectedLeadTimeAddition,
  stockAvailability,
  setActiveInfoTab,
}) => {
  const getTrimmedDescription = (description) => {
    return description?.trim()?.split(" (")[0];
  };

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
        group.lead_time,
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
            opt.lead_time === selectedLeadTimeAddition.lead_time,
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
  const quoteIsLowStock = Boolean(stockAvailability?.isQuoteLowStock);
  const sampleIsLowStock = Boolean(stockAvailability?.isSampleLowStock);
  const lowMoqIsLowStock = Boolean(stockAvailability?.isLowMoqLowStock);
  const isSupermerchArtwork = artworkSource === "supermerch" && adminCustomizations.length > 0;

  const isNonArtworkAddition = (group) => {
    const decoration = String(group?.promodata_decoration || "").toLowerCase();
    const description = String(group?.description || "").toLowerCase();

    if (decoration.startsWith("addition:")) return true;

    const nonArtworkPatterns = [
      "polybag",
      "packaging",
      "surcharge",
      "metallic thread",
      "additional charge",
      "additional 5,000",
      "additional 5000",
    ];

    return nonArtworkPatterns.some(
      (token) => description.includes(token) || decoration.includes(token),
    );
  };

  const artworkOptions = useMemo(() => {
    if (isSupermerchArtwork) {
      return adminCustomizations.map((cust) => ({
        key: cust._id,
        description: [cust.method?.applicationMethod, cust.method?.applicationType]
          .filter(Boolean)
          .join(" - "),
        customization: cust,
      }));
    }

    const baseOption = availablePriceGroups.find((group) => group.type === "base");
    const options = [];

    if (baseOption) {
      options.push(baseOption);
    }

    const seenKeys = new Set();
    availablePriceGroups.forEach((group) => {
      if (group.type !== "addition") return;
      if (isNonArtworkAddition(group)) return;

      const optionKey = group.key || group.description || group.promodata_decoration;

      if (!optionKey || seenKeys.has(optionKey)) return;
      seenKeys.add(optionKey);
      options.push(group);
    });

    return options;
  }, [availablePriceGroups, adminCustomizations, isSupermerchArtwork]);

  const selectedArtworkValue = useMemo(() => {
    if (isSupermerchArtwork) {
      return selectedAdminCustomization?._id || NONE_ARTWORK_KEY;
    }

    if (!selectedPrintMethod) return artworkOptions[0]?.key || "";

    const exactMatch = artworkOptions.find(
      (option) => option.key === selectedPrintMethod.key,
    );
    if (exactMatch) return exactMatch.key;

    return artworkOptions[0]?.key || "";
  }, [artworkOptions, isSupermerchArtwork, selectedAdminCustomization, selectedPrintMethod]);



  const handleArtworkChange = (event) => {
    const selectedKey = event.target.value;

    if (isSupermerchArtwork && selectedKey === NONE_ARTWORK_KEY) {
      setSelectedAdminCustomization?.(null);
      setSelectedPosition?.(null);
      return;
    }

    const selectedOption = artworkOptions.find((option) => option.key === selectedKey);
    if (!selectedOption) return;

    if (isSupermerchArtwork) {
      const customization = selectedOption.customization;
      setSelectedAdminCustomization?.(customization || null);
      // Don't auto-select position, let user choose in Decoration tab
      setSelectedPosition?.(null);
      return;
    }

    setSelectedLeadTimeAddition(null);
    setSelectedPrintMethod(selectedOption);

    const sortedBreaks = [...(selectedOption.price_breaks || [])].sort(
      (a, b) => a.qty - b.qty,
    );
    if (sortedBreaks.length > 0) {
      setCurrentQuantity(sortedBreaks[0].qty);
      setActiveIndex(0);
    }
  };

  return (
    <div className="overflow-x-auto space-y-1 !text-black">
      <div className="flex md:flex-row flex-col justify-between items-start gap-2 w-full">
        <div className="flex flex-col">
          <div className="flex justify-start items-center gap-4">
            <label htmlFor="artwork-method" className="font-medium my-2">
              Artwork:
            </label>
            <select
              id="artwork-method"
              value={selectedArtworkValue}
              onChange={handleArtworkChange}
              className="px-2 py-2 border rounded-md outline-none min-w-[230px]"
            >
              {isSupermerchArtwork && (
                <option value={NONE_ARTWORK_KEY}>None</option>
              )}
              {artworkOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {isSupermerchArtwork
                    ? getTrimmedDescription(option.description) ||
                      option.customization?.method?.applicationMethod ||
                      "Artwork"
                    : option.type === "base"
                      ? "None"
                      : getTrimmedDescription(option.description) ||
                        option.promodata_decoration ||
                        "Artwork"}
                </option>
              ))}
            </select>
          </div>
          {isSupermerchArtwork && selectedAdminCustomization && !selectedPosition && (
            <p className="text-sm text-primary font-medium mt-1">
              Please go to the{" "}
              <span
                className="font-bold underline cursor-pointer hover:text-amber-700"
                onClick={() => setActiveInfoTab("decoration")}
              >
                Decoration tab
              </span>{" "}
              to choose a position.
            </p>
          )}
        </div>

        {isClothing && parseSizing()?.sizes?.length > 1 && (
          <div className="flex flex-col">
            <div className="flex justify-start items-center gap-4">
              <label htmlFor="print-method" className="w- my-2  font-medium">
                Size:
              </label>
              <select
                id="print-method"
                value={selectedSize}
                onChange={(e) => {
                  setSelectedSize(e.target.value);
                }}
                className="w-fll px-2 py-2 border rounded-md outline-none"
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
      </div>
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
                      ? "bg-primary/10 text-primary border-primary"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {option.lead_time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isClothing && (
        <span className="text-sm text-black mt-3">
          * The pricing includes 1 col - 1 position
        </span>
      )}

          {Number(pricingSummary?.discountPercent || 0) > 0 && (
            <div className="mt-2 p-2 rounded-md border border-emerald-200 bg-emerald-50 text-sm text-emerald-900">
              Product discount applied: <span className="font-semibold">{Number(pricingSummary.discountPercent).toFixed(2)}% OFF</span>
            </div>
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
                <th className="py-2 pr-4 text-base sm:text-xl w-1/4">Select</th>
                <th className="py-2 pr-4 text-base sm:text-xl w-1/4">Qty</th>
                <th className="py-2 pr-4 text-base sm:text-xl w-1/4">
                  Unit <span className="text-gray-500 text-xs">(ex GST)</span>
                </th>
                <th className="py-2 pr-4 text-base sm:text-xl w-1/4">Total</th>
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
                      disabled={lowMoqIsLowStock}
                      className={`px-3 py-1.5 text-white text-xs sm:text-sm font-medium rounded-md transition-colors ${
                        lowMoqIsLowStock
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-primary hover:bg-primary/90"
                      }`}
                    >
                      {lowMoqIsLowStock ? "Low Stock" : "For Low MOQ, Contact Us"}
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
                let methodOriginal =
                  effectivePrintMethod.type === "base"
                    ? Number(item.originalPrice)
                    : null;

                if (effectivePrintMethod.type !== "base") {
                  const baseGroup = availablePriceGroups.find((group) => group.type === "base");
                  const baseBreaks = [...(baseGroup?.price_breaks || [])].sort((a, b) => a.qty - b.qty);
                  let selectedBaseBreak = baseBreaks[0] || null;

                  for (let k = 0; k < baseBreaks.length; k += 1) {
                    if (item.qty >= baseBreaks[k].qty) {
                      selectedBaseBreak = baseBreaks[k];
                    } else {
                      break;
                    }
                  }

                  const baseOriginal = Number(selectedBaseBreak?.originalPrice);
                  const additionOriginal = Number(item.originalPrice);
                  if (Number.isFinite(baseOriginal) && Number.isFinite(additionOriginal)) {
                    methodOriginal = baseOriginal + additionOriginal;
                  }
                }

                const unitFinal = methodUnit;
                const total = unitFinal * item.qty;
                const originalTotal = Number.isFinite(methodOriginal)
                  ? methodOriginal * item.qty
                  : null;

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
                      <div className="flex flex-col">
                        {Number(pricingSummary?.discountPercent || 0) > 0 && Number.isFinite(methodOriginal) && methodOriginal > unitFinal && (
                          <span className="text-xs text-red-500 line-through">
                            ${methodOriginal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                        <span>
                          ${unitFinal.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 align-middle text-base sm:text-lg text-black">
                      <div className="flex flex-col">
                        {Number(pricingSummary?.discountPercent || 0) > 0 && Number.isFinite(originalTotal) && originalTotal > total && (
                          <span className="text-xs text-red-500 line-through">
                            ${originalTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                        <span>
                          ${total.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      })()}
    </div>
  );
};

export default PricingTab;
