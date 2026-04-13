import React, { useState, useRef } from "react";
import LeadTimeModal from "./LeadTimeModal";
import { FaPaintBrush, FaPrint, FaClock, FaCheckCircle, FaCloudUploadAlt, FaTimesCircle } from "react-icons/fa";
import { MdColorLens } from "react-icons/md";
import { GiSewingNeedle } from "react-icons/gi";
import { isProductCategory } from "@/utils/utils";

const DecorationTab = ({
  single_product,
  availablePriceGroups,
  adminCustomizations = [],
  selectedAdminCustomization,
  setSelectedAdminCustomization,
  selectedPosition,
  setSelectedPosition,
  customizationFile,
  setCustomizationFile,
  selectedPrintMethod,
  setSelectedPrintMethod,
  setSelectedLeadTimeAddition,
  setCurrentQuantity,
  uniquePriceGroups,
}) => {
  const filterByNamesForDecoration = (array) => {
    const namesToInclude = ["Branding Options", "Print Areas"];
    const lowerCaseNames = namesToInclude.map((name) => name?.toLowerCase());
    return array?.filter((item) =>
      lowerCaseNames.includes(item?.name?.toLowerCase())
    );
  };

  const [leadTimeModal, setLeadTimeModal] = useState(false);

  const getIconForMethod = (name) => {
    const lowerName = name?.toLowerCase() || "";
    if (lowerName.includes("branding"))
      return <FaPaintBrush className="w-5 h-5 text-primary" />;
    if (lowerName.includes("print"))
      return <FaPrint className="w-5 h-5 text-primary" />;
    if (lowerName.includes("embroid"))
      return <GiSewingNeedle className="w-5 h-5 text-primary" />;
    return <MdColorLens className="w-5 h-5 text-primary" />;
  };

  const getMethodIcon = (name) => {
    const lower = name?.toLowerCase() || "";
    if (lower.includes("embroid"))
      return <GiSewingNeedle className="w-5 h-5 text-primary" />;
    if (lower.includes("print") || lower.includes("transfer") || lower.includes("digital"))
      return <FaPrint className="w-5 h-5 text-primary" />;
    if (lower.includes("laser") || lower.includes("engrav"))
      return <MdColorLens className="w-5 h-5 text-primary" />;
    return <FaPaintBrush className="w-5 h-5 text-primary" />;
  };

  const decorationData = filterByNamesForDecoration(
    single_product.product.details
  );

  const leadTimeData = availablePriceGroups
    .map((group) => ({
      method: group.description || group.promodata_decoration || "Standard",
      leadTime: group.lead_time,
    }))
    .filter(
      (item) =>
        item.leadTime !== null &&
        item.leadTime !== undefined &&
        item.leadTime !== ""
    );

  // PromoData artwork/print methods
  const isClothing = isProductCategory(single_product, "Clothing");
  const priceGroups = isClothing ? availablePriceGroups : uniquePriceGroups;

  const getCleanName = (method) => {
    if (isClothing) {
      return (method.description || "")
        .replace(/\s*-\s*set\s*up.*$/i, "")
        .split(" (")[0]
        .trim();
    }
    return (method.promodata_decoration || "")
      .trim()
      .split(" (")[0]
      .trim();
  };

  // ── Selection handlers ──

  const handleSelectPrintMethod = (method) => {
    // Deselect admin customization when selecting a hardcoded option
    if (selectedAdminCustomization) {
      setSelectedAdminCustomization(null);
      setSelectedPosition(null);
      setCustomizationFile?.(null);
      setFilePreview(null);
    }
    setSelectedPrintMethod(method);
    setSelectedLeadTimeAddition?.(null);
    if (method?.price_breaks?.length > 0) {
      setCurrentQuantity(method.price_breaks[0].qty);
    }
  };

  const handleSelectCustomization = (cust) => {
    if (selectedAdminCustomization?._id === cust._id) {
      // Deselect
      setSelectedAdminCustomization(null);
      setSelectedPosition(null);
    } else {
      setSelectedAdminCustomization(cust);
      setSelectedPosition(cust.positions?.length > 0 ? cust.positions[0] : null);
    }
  };

  const handleSelectPosition = (pos) => {
    if (selectedPosition?._id === pos._id) {
      setSelectedPosition(null);
    } else {
      setSelectedPosition(pos);
    }
  };

  // ── File upload for IMAGE type ──
  const fileInputRef = useRef(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload an image file (PNG, JPG, SVG, WebP) or PDF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be under 10MB");
      return;
    }
    setCustomizationFile?.(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setCustomizationFile?.(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasAdminCustomizations = adminCustomizations.length > 0;
  const hasPromoMethods = priceGroups?.length > 0;

  return (
    <div className="space-y-6">
      {/* ─── Unified Decoration Options (admin + hardcoded together) ─── */}
      {(hasAdminCustomizations || hasPromoMethods) && (
        <div>
          <h3 className="text-lg font-bold text-secondary mb-1">
            Decoration Options
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Select a decoration method. The pricing will update accordingly.
          </p>
          <div className="grid gap-3">
            {/* ── Admin-defined customization cards ── */}
            {adminCustomizations.map((cust) => {
              const isSelected = selectedAdminCustomization?._id === cust._id;
              return (
                <div
                  key={`admin-${cust._id}`}
                  onClick={() => handleSelectCustomization(cust)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-primary/20" : "bg-primary/10"
                      }`}
                    >
                      {getMethodIcon(cust.method.applicationMethod)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-secondary">
                          {cust.method.applicationMethod}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {cust.method.applicationType}
                        </span>
                        {isSelected && (
                          <FaCheckCircle className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {cust.method.setupCharge > 0 && (
                          <p className="text-sm text-gray-500">
                            Setup: <span className="font-semibold text-gray-700">${cust.method.setupCharge.toFixed(2)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details when selected */}
                  {isSelected && (
                    <div className="mt-3 ml-16 space-y-3">
                      {/* Positions */}
                      {cust.positions?.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-1.5">
                            Select Position:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {cust.positions.map((pos) => {
                              const isPosSelected = selectedPosition?._id === pos._id;
                              return (
                                <div
                                  key={pos._id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectPosition(pos);
                                  }}
                                  className={`flex flex-col items-center p-2 rounded-lg border cursor-pointer transition-all ${
                                    isPosSelected
                                      ? "border-primary bg-primary/10 shadow-sm"
                                      : "border-gray-200 bg-white hover:border-gray-300"
                                  }`}
                                >
                                  {pos.imageUrl && (
                                    <img
                                      src={pos.imageUrl}
                                      alt={pos.positionName}
                                      className="w-12 h-12 object-contain mb-1 rounded"
                                    />
                                  )}
                                  <span className="text-xs font-medium text-center text-gray-700">
                                    {pos.positionName}
                                  </span>
                                  {pos.priceAdjustment > 0 && (
                                    <span className="text-xs text-gray-500">
                                      +${pos.priceAdjustment.toFixed(2)}
                                    </span>
                                  )}
                                  {isPosSelected && (
                                    <FaCheckCircle className="w-3 h-3 text-primary mt-0.5" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {selectedPosition?.maxWidth && selectedPosition?.maxHeight && (
                            <p className="text-xs text-gray-400 mt-1">
                              Max area: {selectedPosition.maxWidth}mm × {selectedPosition.maxHeight}mm
                            </p>
                          )}
                        </div>
                      )}

                      {/* Image Upload for IMAGE type */}
                      {cust.method.applicationType === "IMAGE" && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <p className="text-sm font-semibold text-gray-600 mb-1.5">
                            Upload Your Logo / Artwork:
                          </p>
                          {customizationFile ? (
                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                              {filePreview ? (
                                <img src={filePreview} alt="Preview" className="w-10 h-10 object-contain rounded border" />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">PDF</div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{customizationFile.name}</p>
                                <p className="text-xs text-gray-500">{(customizationFile.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <FaTimesCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onDragEnter={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                              onDragLeave={(e) => { e.preventDefault(); setIsDraggingFile(false); }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDraggingFile(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file) handleFileSelect(file);
                              }}
                              onClick={() => fileInputRef.current?.click()}
                              className={`flex flex-col items-center justify-center py-3 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                                isDraggingFile
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5"
                              }`}
                            >
                              <FaCloudUploadAlt className={`w-6 h-6 mb-1 ${isDraggingFile ? "text-primary" : "text-gray-400"}`} />
                              <p className="text-sm font-medium text-gray-600">
                                {isDraggingFile ? "Drop your file here" : "Click or drag to upload"}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, SVG, WebP or PDF (max 10MB)</p>
                              <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,application/pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileSelect(file);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Hardcoded PromoData artwork cards (same list, same format) ── */}
            {priceGroups?.map((method, index) => {
              const isSelected = !selectedAdminCustomization && selectedPrintMethod?.key === method.key;
              const displayName = getCleanName(method);
              const setupCost = method.setup || 0;

              return (
                <div
                  key={`promo-${method.key}-${index}`}
                  onClick={() => handleSelectPrintMethod(method)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-primary/20" : "bg-primary/10"
                      }`}
                    >
                      {getMethodIcon(method.promodata_decoration || method.description)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-secondary">
                          {displayName}
                        </h4>
                        {method.type === "base" && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Base
                          </span>
                        )}
                        {isSelected && (
                          <FaCheckCircle className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {setupCost > 0 && (
                          <p className="text-sm text-gray-500">
                            Setup: <span className="font-semibold text-gray-700">${parseFloat(setupCost).toFixed(2)}</span>
                          </p>
                        )}
                        {method.lead_time && (
                          <p className="text-sm text-gray-500">
                            Lead time: <span className="font-semibold text-gray-700">{method.lead_time}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Supplier Decoration Details (info only) ─── */}
      {decorationData?.length > 0 && (
        <>
          {(hasAdminCustomizations || hasPromoMethods) && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-bold text-secondary mb-3">
                Supplier Decoration Details
              </h3>
            </div>
          )}
          <div className="grid gap-6">
            {decorationData.map((d, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getIconForMethod(d.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-secondary mb-1">
                      {d.method || d.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Available decoration option
                    </p>
                  </div>
                </div>
                {d?.detail && (
                  <div className="space-y-2 ml-16">
                    {d?.detail?.split("\n").map((line, index) => {
                      const trimmedLine = line.trim();
                      if (!trimmedLine) return null;
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-3 text-sm text-gray-700"
                        >
                          <FaCheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{trimmedLine}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!hasAdminCustomizations && !hasPromoMethods && decorationData?.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <FaPaintBrush className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Decoration Information
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Decoration details are not currently available for this product.
            Please contact us for custom branding options.
          </p>
        </div>
      )}

      {leadTimeModal && (
        <LeadTimeModal
          onClose={() => setLeadTimeModal(false)}
          leadTimeData={leadTimeData}
        />
      )}
    </div>
  );
};

export default DecorationTab;
