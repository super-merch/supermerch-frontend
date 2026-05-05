import { useState, useRef, useEffect, useCallback, useMemo, useContext } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import axios from "axios";
import TextCustomization, { FONTS, COLORS } from "./TextCustomization";
import { AuthContext } from "@/context/AuthContext";
import { formatAud } from "@/utils/formatAud";

/**
 * Default Remix icons by enum — matches workwear `CustomizationModal.jsx` (METHOD_FALLBACK_CONFIG /
 * TYPE_FALLBACK_CONFIG `.icon` only). Used when admin/API does not set `icon` / `typeIcon`.
 */
const WORKWEAR_METHOD_ICON_BY_ENUM = {
    EMBROIDERY: "ri-scissors-line",
    PRINTING: "ri-printer-line",
};
const WORKWEAR_TYPE_ICON_BY_ENUM = {
    IMAGE: "ri-image-add-line",
    TEXT: "ri-text",
};
const FALLBACK_METHOD_ICON = "ri-palette-line";
const FALLBACK_TYPE_ICON = "ri-file-list-line";

/**
 * PromoData PDP: `/api/product-customizations` returns one array item per **mapping**
 * (one CustomizationMethod + its allowed positions). The modal’s position step only shows
 * `positions` for the **currently selected** method+type row — counts differ per mapping (e.g. 7 vs 3).
 */
function transformSupermerchCustomizationRows(rows) {
    if (!Array.isArray(rows)) return { methods: [], positions: [] };
    const methods = [];
    const positions = [];
    for (const row of rows) {
        const m = row.method;
        if (!m?._id) continue;
        const apiTypeIcon = m.typeIcon && String(m.typeIcon).trim();
        methods.push({
            ...m,
            id: m._id,
            displayDescription: m.description ?? "",
            typeDisplayName:
                (m.displayName && String(m.displayName).trim()) ||
                m.applicationType,
            typeDescription:
                (m.description && String(m.description).trim()) || "",
            typeIcon:
                apiTypeIcon ||
                WORKWEAR_TYPE_ICON_BY_ENUM[m.applicationType] ||
                FALLBACK_TYPE_ICON,
            typeImageUrl: m.typeImageUrl || null,
        });
        for (const p of row.positions || []) {
            if (!p?._id) continue;
            positions.push({
                ...p,
                id: p._id,
                methodId: m._id,
            });
        }
    }
    const dedup = [];
    const seen = new Set();
    for (const m of methods) {
        const k = String(m._id);
        if (seen.has(k)) continue;
        seen.add(k);
        dedup.push(m);
    }
    return { methods: dedup, positions };
}

function resolveMediaUrl(apiOrigin, url) {
    if (!url) return "";
    const s = String(url);
    if (/^(https?:|blob:|data:)/i.test(s)) return s;
    const base = String(apiOrigin || "").replace(/\/$/, "");
    if (!base) return s;
    return `${base}/${s.replace(/^\//, "")}`;
}

export default function WorkwearCustomizationModal({
    isOpen,
    onClose,
    onComplete,
    productId,
    dealId,
    productName,
    productImage,
    quantity = 1,
    existingCustomization = null,
    backendUrl = "",
}) {
    const [step, setStep] = useState(1);
    const [selectedMethodType, setSelectedMethodType] = useState(null); // EMBROIDERY or PRINTING
    const [selectedApplicationType, setSelectedApplicationType] =
        useState(null); // TEXT or IMAGE
    const [selectedPositions, setSelectedPositions] = useState([]);
    const [textData, setTextData] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [addLogoLater, setAddLogoLater] = useState(false);
    const [error, setError] = useState(null);
    const [pricing, setPricing] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // Auth state
    const { token, userData } = useContext(AuthContext);
    const isAuthenticated = Boolean(token && userData);
    const apiOrigin = useMemo(() => String(backendUrl || "").replace(/\/$/, ""), [backendUrl]);

    // Past logos state
    const [pastLogos, setPastLogos] = useState([]);
    const [selectedPastLogo, setSelectedPastLogo] = useState(null);
    const [isLoadingPastLogos, setIsLoadingPastLogos] = useState(false);
    const [isReusedLogo, setIsReusedLogo] = useState(false);

    // Raw data from backend - all customization method records for this product
    const [rawMethods, setRawMethods] = useState([]);
    const [availablePositions, setAvailablePositions] = useState([]);
    const [freeCustomizations, setFreeCustomizations] = useState([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);

    const fileInputRef = useRef(null);

    // Handle past logo selection
    const handlePastLogoSelect = (logo) => {
        setUploadedImageUrl(logo.imageUrl);
        setUploadedFile(null);
        setSelectedPastLogo(logo);
        setIsReusedLogo(true);
        setError(null);
    };

    // Fetch past logos when modal opens (optional — Supermerch may not expose this route)
    useEffect(() => {
        if (!isOpen || !isAuthenticated || !apiOrigin) {
            if (!isAuthenticated) setPastLogos([]);
            return;
        }
        const fetchPastLogos = async () => {
            setIsLoadingPastLogos(true);
            try {
                const { data } = await axios.get(`${apiOrigin}/api/user/past-logos`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (data?.success) {
                    setPastLogos(data.data || []);
                } else {
                    setPastLogos([]);
                }
            } catch {
                setPastLogos([]);
            } finally {
                setIsLoadingPastLogos(false);
            }
        };
        fetchPastLogos();
    }, [isOpen, isAuthenticated, apiOrigin, token]);

    // Determine if this is a product or deal customization
    const isDeal = !!dealId;
    const itemId = dealId || productId;

    // Group customization methods by applicationMethod — labels/icons only from admin/API rows
    const uniqueMethodTypes = useMemo(() => {
        const methodMap = new Map();
        rawMethods.forEach((method) => {
            if (!methodMap.has(method.applicationMethod)) {
                methodMap.set(method.applicationMethod, {
                    type: method.applicationMethod,
                    applicationTypes: [],
                    methods: [],
                });
            }
            const entry = methodMap.get(method.applicationMethod);
            if (!entry.applicationTypes.includes(method.applicationType)) {
                entry.applicationTypes.push(method.applicationType);
            }
            entry.methods.push(method);
        });
        return Array.from(methodMap.values()).map((entry) => {
            const pickTrimmed = (getter) => {
                for (const m of entry.methods) {
                    const v = getter(m);
                    if (v != null && String(v).trim() !== "") {
                        return String(v).trim();
                    }
                }
                return "";
            };
            const name =
                pickTrimmed((m) => m.displayName) || entry.type;
            const description =
                pickTrimmed((m) => m.description) ||
                pickTrimmed((m) => m.displayDescription);
            const imageUrl =
                entry.methods.find((m) => m.imageUrl && String(m.imageUrl).trim())
                    ?.imageUrl || null;
            const icon =
                entry.methods.find((m) => m.icon && String(m.icon).trim())?.icon ||
                WORKWEAR_METHOD_ICON_BY_ENUM[entry.type] ||
                FALLBACK_METHOD_ICON;
            return {
                ...entry,
                name,
                description,
                imageUrl,
                icon,
            };
        });
    }, [rawMethods]);

    // Get available application types for the selected method
    const availableApplicationTypes = useMemo(() => {
        if (!selectedMethodType) return [];
        const methodEntry = uniqueMethodTypes.find(
            (m) => m.type === selectedMethodType
        );
        if (!methodEntry) return [];

        return methodEntry.applicationTypes.map((type) => {
            const methodRecord = rawMethods.find(
                (m) =>
                    m.applicationMethod === selectedMethodType &&
                    m.applicationType === type
            );
            const nameTrim = (v) =>
                v != null && String(v).trim() !== "" ? String(v).trim() : "";
            const name =
                nameTrim(methodRecord?.typeDisplayName) ||
                nameTrim(methodRecord?.displayName) ||
                type;
            const description =
                nameTrim(methodRecord?.typeDescription) ||
                nameTrim(methodRecord?.description) ||
                nameTrim(methodRecord?.displayDescription) ||
                "";
            const icon =
                nameTrim(methodRecord?.typeIcon) ||
                nameTrim(methodRecord?.icon) ||
                WORKWEAR_TYPE_ICON_BY_ENUM[type] ||
                FALLBACK_TYPE_ICON;
            return {
                id: type,
                name,
                description,
                icon,
                imageUrl: methodRecord?.typeImageUrl || methodRecord?.imageUrl || null,
            };
        });
    }, [selectedMethodType, uniqueMethodTypes, rawMethods]);

    // Get the actual customization method record based on selections
    const selectedMethod = useMemo(() => {
        if (!selectedMethodType || !selectedApplicationType) return null;
        return rawMethods.find(
            (m) =>
                m.applicationMethod === selectedMethodType &&
                m.applicationType === selectedApplicationType
        );
    }, [selectedMethodType, selectedApplicationType, rawMethods]);

    // Filter positions based on the selected method
    // Positions now have a methodId that links them to specific methods
    const methodFilteredPositions = useMemo(() => {
        if (!selectedMethod) return availablePositions;
        const methodKey = selectedMethod.id || selectedMethod._id;
        if (!methodKey) return availablePositions;

        // Filter positions to only show those that belong to the selected method
        // If methodId is null, the position is shared across all methods (backward compatibility)
        const filtered = availablePositions.filter(
            (p) =>
                p.methodId === methodKey ||
                String(p.methodId) === String(methodKey) ||
                p.methodId === null ||
                p.methodId === undefined
        );

        return filtered.length > 0 ? filtered : availablePositions;
    }, [selectedMethod, availablePositions]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedMethodType(null);
            setSelectedApplicationType(null);
            setSelectedPositions([]);
            setTextData(null);
            setUploadedFile(null);
            setUploadedImageUrl(null);
            setError(null);
            setPricing(null);
            setFreeCustomizations([]);
            setRawMethods([]);
            setAvailablePositions([]);

            // If we have existing customization, load it after options are fetched
            // The actual loading will be done after options are available
        }
    }, [isOpen]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Fetch customization options when modal opens (Supermerch + optional deal shape)
    useEffect(() => {
        const fetchCustomizationOptions = async () => {
            if (!isOpen || !itemId || !apiOrigin) return;

            setIsLoadingOptions(true);
            try {
                let responseData = { methods: [], positions: [], freeCustomizations: [] };

                if (isDeal) {
                    try {
                        const { data } = await axios.get(
                            `${apiOrigin}/api/deals/${encodeURIComponent(itemId)}/customization-options`,
                        );
                        if (data?.success && data.data) {
                            responseData = {
                                methods: data.data.methods || [],
                                positions: data.data.positions || [],
                                freeCustomizations: data.data.freeCustomizations || [],
                            };
                        }
                    } catch {
                        responseData = { methods: [], positions: [], freeCustomizations: [] };
                    }
                } else {
                    const { data } = await axios.get(
                        `${apiOrigin}/api/product-customizations/${encodeURIComponent(itemId)}`,
                    );
                    if (data?.success && Array.isArray(data.data)) {
                        responseData = transformSupermerchCustomizationRows(data.data);
                    }
                }

                if (responseData.methods?.length > 0) {
                    setRawMethods(responseData.methods);
                } else {
                    setRawMethods([]);
                }

                if (responseData.positions?.length > 0) {
                    setAvailablePositions(
                        responseData.positions.map((p) => ({
                            ...p,
                            icon: "ri-map-pin-line",
                        })),
                    );
                } else {
                    setAvailablePositions([]);
                }

                if (responseData.freeCustomizations?.length) {
                    setFreeCustomizations(responseData.freeCustomizations);
                } else {
                    setFreeCustomizations([]);
                }
            } catch (err) {
                console.error("Error fetching customization options:", err);
                setRawMethods([]);
                setAvailablePositions([]);
            } finally {
                setIsLoadingOptions(false);
            }
        };

        fetchCustomizationOptions();
    }, [isOpen, itemId, isDeal, apiOrigin]);

    // Load existing customization after options are fetched
    useEffect(() => {
        if (
            !isOpen ||
            !existingCustomization ||
            isLoadingOptions ||
            rawMethods.length === 0
        )
            return;

        // Restore the customization state from existing data
        if (existingCustomization.applicationMethodType) {
            setSelectedMethodType(existingCustomization.applicationMethodType);
        } else if (
            ["EMBROIDERY", "PRINTING"].includes(
                existingCustomization.applicationMethod,
            )
        ) {
            setSelectedMethodType(existingCustomization.applicationMethod);
        }
        if (existingCustomization.applicationType) {
            setSelectedApplicationType(existingCustomization.applicationType);
        }
        if (
            existingCustomization.positions &&
            existingCustomization.positions.length > 0
        ) {
            // Match positions from available positions
            const matchedPositions = existingCustomization.positions
                .map((p) =>
                    availablePositions.find(
                        (ap) =>
                            ap.id === p.id ||
                            ap._id === p.id ||
                            ap.id === p._id ||
                            ap._id === p._id ||
                            ap.positionCode === p.positionCode,
                    ),
                )
                .filter(Boolean);
            if (matchedPositions.length > 0) {
                setSelectedPositions(matchedPositions);
            }
        }
        if (existingCustomization.content) {
            if (
                existingCustomization.applicationType === "TEXT" &&
                existingCustomization.content.lines
            ) {
                setTextData(existingCustomization.content);
            } else if (
                existingCustomization.applicationType === "IMAGE" &&
                existingCustomization.content.imageUrl
            ) {
                setUploadedImageUrl(existingCustomization.content.imageUrl);
                if (existingCustomization.isReusedLogo) {
                    setIsReusedLogo(true);
                }
            }
        }
        // Move to review step if everything is loaded
        if (
            (existingCustomization.applicationMethodType ||
                existingCustomization.applicationMethod) &&
            existingCustomization.applicationType &&
            existingCustomization.positions?.length > 0
        ) {
            setStep(4); // Go to content/review step
        }
    }, [
        isOpen,
        existingCustomization,
        isLoadingOptions,
        rawMethods,
        availablePositions,
    ]);

    // Check if a method+position combo is free for deals
    const isFreeCustomization = useCallback(
        (methodId, positionId) => {
            if (!isDeal || freeCustomizations.length === 0) return false;
            return freeCustomizations.some(
                (fc) => fc.methodId === methodId && fc.positionId === positionId
            );
        },
        [isDeal, freeCustomizations]
    );

    // Calculate pricing when relevant data changes
    const calculatePricing = useCallback(async () => {
        if (
            !selectedMethod ||
            !(selectedMethod.id || selectedMethod._id) ||
            selectedPositions.length === 0 ||
            !quantity ||
            quantity <= 0
        ) {
            setPricing(null);
            return;
        }

        // Validate all positions have valid IDs
        const validPositions = selectedPositions.filter((p) => p && (p.id || p._id));
        if (validPositions.length === 0) {
            setPricing(null);
            return;
        }

        // Supermerch: use position pricing tiers (same as workwear local path)
        setIsCalculating(true);
        try {
            calculateLocalPricing();
        } finally {
            setIsCalculating(false);
        }
    }, [
        selectedMethod,
        selectedPositions,
        quantity,
        productId,
        isDeal,
        isReusedLogo,
    ]);

    // Local pricing calculation (fallback and for deals)
    const calculateLocalPricing = useCallback(() => {
        if (!selectedMethod || selectedPositions.length === 0) {
            setPricing(null);
            return;
        }

        // Use pricing tiers from positions if available, otherwise use default
        const positionCount = selectedPositions.length;
        let totalPositionCost = 0;
        let freePositionCount = 0;

        for (const position of selectedPositions) {
            // Check if this position is free for deals
            if (
                isDeal &&
                isFreeCustomization(
                    selectedMethod.id || selectedMethod._id,
                    position.id || position._id,
                )
            ) {
                freePositionCount++;
                continue; // Skip adding cost for free customizations
            }

            // Try to find the correct tier based on quantity
            let pricePerItem = 5.5; // default
            if (position.pricingTiers && position.pricingTiers.length > 0) {
                const tier = position.pricingTiers.find(
                    (t) =>
                        quantity >= t.minQuantity &&
                        (!t.maxQuantity || quantity <= t.maxQuantity)
                );
                if (tier) {
                    pricePerItem = parseFloat(tier.pricePerApplication);
                }
            }
            totalPositionCost += pricePerItem * quantity;
        }

        // For deals with all positions free, setup fee may also be waived
        const hasAnyPaidPositions = positionCount > freePositionCount;
        const setupFee =
            hasAnyPaidPositions && !isReusedLogo
                ? parseFloat(selectedMethod.setupCharge || 15)
                : 0;
        const subtotal = totalPositionCost + setupFee;
        const vat = subtotal * 0.2;
        const total = subtotal + vat;

        setPricing({
            pricePerPosition:
                totalPositionCost /
                    ((positionCount - freePositionCount) * quantity) || 0,
            positionCount,
            freePositionCount,
            quantity,
            positionTotal: totalPositionCost,
            setupFee,
            subtotal,
            vat,
            total,
            isFree: subtotal === 0,
        });
    }, [
        selectedMethod,
        selectedPositions,
        quantity,
        isDeal,
        isDeal,
        isFreeCustomization,
        isReusedLogo,
    ]);

    useEffect(() => {
        calculatePricing();
    }, [calculatePricing]);

    const handleMethodTypeSelect = (methodType) => {
        setSelectedMethodType(methodType);
        // Reset application type when method changes
        setSelectedApplicationType(null);
        // Reset positions when method changes
        setSelectedPositions([]);
    };

    const handleApplicationTypeSelect = (typeId) => {
        setSelectedApplicationType(typeId);
        setSelectedPositions([]);
        // Reset content when type changes
        setTextData(null);
        setUploadedFile(null);
        setUploadedImageUrl(null);
    };

    const posKey = (p) => String(p?.id ?? p?._id ?? "");

    const handlePositionToggle = (position) => {
        const key = posKey(position);
        setSelectedPositions((prev) => {
            const exists = prev.find((p) => posKey(p) === key);
            if (exists) {
                return prev.filter((p) => posKey(p) !== key);
            }
            return [...prev, position];
        });
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            return;
        }

        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/svg+xml",
        ];
        if (!allowedTypes.includes(file.type)) {
            setError("Please upload PNG, JPG, or SVG files only");
            return;
        }

        setError(null);
        setUploadedFile(file);
        setSelectedPastLogo(null);
        setIsReusedLogo(false); // Reset reused flag on new upload

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setUploadedImageUrl(previewUrl);

        // Optional server upload (Supermerch may not expose this route — preview still works)
        if (apiOrigin) {
            try {
                setIsUploading(true);
                const formData = new FormData();
                formData.append("image", file);
                const { data } = await axios.post(
                    `${apiOrigin}/api/customization/upload`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } },
                );
                if (data?.success && data?.data?.url) {
                    setUploadedImageUrl(data.data.url);
                }
            } catch {
                // Keep local preview URL
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleTextChange = (data) => {
        setTextData(data);
    };

    const canProceed = () => {
        switch (step) {
            case 1: // Method selection
                return selectedMethodType !== null;
            case 2: // Type selection
                return selectedApplicationType !== null;
            case 3: // Position selection
                return selectedPositions.length > 0;
            case 4: // Content (text or image)
                if (selectedApplicationType === "TEXT") {
                    return textData?.hasContent;
                }
                // Allow proceeding if logo uploaded OR add logo later is checked
                return uploadedFile !== null || uploadedImageUrl !== null || addLogoLater;
            case 5: // Confirmation
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (canProceed() && step < 5) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleComplete = () => {
        if (!selectedMethod) return;

        // Get dynamic display data from uniqueMethodTypes
        const methodEntry = uniqueMethodTypes.find(
            (m) => m.type === selectedMethodType
        );
        const typeEntry = availableApplicationTypes.find(
            (t) => t.id === selectedApplicationType
        );

        const customizationData = {
            applicationMethod: selectedMethod.id || selectedMethod._id,
            applicationMethodName: methodEntry?.name || selectedMethodType,
            applicationMethodType: selectedMethodType,
            applicationType: selectedApplicationType,
            applicationTypeName: typeEntry?.name || selectedApplicationType,
            /** Full records for Supermerch cart payload */
            _methodRecord: selectedMethod,
            _positionsDetail: selectedPositions,
            positions: selectedPositions.map((p) => ({
                id: p.id,
                name: p.positionName || p.name,
                code: p.positionCode || p.id,
                isFree:
                    isDeal &&
                    isFreeCustomization(
                        selectedMethod.id || selectedMethod._id,
                        p.id || p._id,
                    ),
            })),
            content:
                selectedApplicationType === "TEXT"
                    ? {
                          type: "TEXT",
                          lines: textData.lines,
                          filledLines: textData.filledLines,
                          font: textData.font,
                          color: textData.color,
                      }
                    : addLogoLater
                    ? {
                          type: "IMAGE",
                          imageUrl: null, // No image yet - will be uploaded later
                          fileName: "Logo to be uploaded later",
                          addLogoLater: true,
                      }
                    : {
                          type: "IMAGE",
                          imageUrl: uploadedImageUrl,
                          fileName:
                              uploadedFile?.name ||
                              (isReusedLogo
                                  ? selectedPastLogo?.fileName ||
                                    "Previously Used Logo"
                                  : "Uploaded Image"),
                      },
            pricing: pricing,
            isDeal: isDeal,
            dealId: dealId,
            productId: productId,
            isReusedLogo: isReusedLogo,
            addLogoLater: addLogoLater,
        };

        onComplete(customizationData);
    };

    if (!isOpen) return null;

    const portalTarget =
        typeof document !== "undefined" ? document.body : null;
    if (!portalTarget) return null;

    const steps = [
        { number: 1, label: "Method", icon: "ri-palette-line" },
        { number: 2, label: "Type", icon: "ri-file-list-line" },
        { number: 3, label: "Position", icon: "ri-map-pin-line" },
        {
            number: 4,
            label: "Content",
            icon:
                selectedApplicationType === "TEXT"
                    ? "ri-text"
                    : "ri-upload-line",
        },
        { number: 5, label: "Confirm", icon: "ri-check-line" },
    ];

    return createPortal(
        <div
            className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-[2px]"
            role="presentation"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-[#FEFEFE] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col relative z-[1] shadow-2xl ring-1 ring-black/10"
                role="dialog"
                aria-modal="true"
                aria-labelledby="workwear-customization-title"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-[#E8ECF2] shrink-0">
                    <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                        {productImage && (
                            <img
                                src={productImage}
                                alt={productName}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover hidden sm:block flex-shrink-0"
                            />
                        )}
                        <div className="min-w-0">
                            <h2
                                id="workwear-customization-title"
                                className="text-base sm:text-xl md:text-2xl font-bold text-[#1E2328] truncate"
                                style={{ fontFamily: "Poppins, sans-serif" }}
                            >
                                Customize Product
                            </h2>
                            <p
                                className="text-[#6B7380] text-xs sm:text-sm mt-0.5 truncate"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                {productName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-[#6B7380] hover:text-[#009688] transition-colors rounded-lg hover:bg-[#F8F9FA] flex-shrink-0 ml-2"
                    >
                        <i className="ri-close-line text-xl sm:text-2xl"></i>
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-[#F8F9FA] border-b border-[#E8ECF2] shrink-0 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center justify-between min-w-0 sm:min-w-[400px]">
                        {steps.map((s, index) => (
                            <div key={s.number} className="flex items-center">
                                <div
                                    className={`flex items-center space-x-1 sm:space-x-2 ${
                                        step >= s.number
                                            ? "text-[#009688]"
                                            : "text-[#6B7380]"
                                    }`}
                                >
                                    <div
                                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                                            step >= s.number
                                                ? "bg-[#009688] text-white"
                                                : "bg-[#E8ECF2] text-[#6B7380]"
                                        }`}
                                    >
                                        {step > s.number ? (
                                            <i className="ri-check-line text-xs sm:text-sm"></i>
                                        ) : (
                                            <i
                                                className={`${s.icon} text-xs sm:text-sm`}
                                            ></i>
                                        )}
                                    </div>
                                    <span
                                        className="text-[10px] sm:text-xs md:text-sm font-medium hidden sm:inline"
                                        style={{
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-4 sm:w-8 md:w-12 h-0.5 mx-1 sm:mx-2 ${
                                            step > s.number
                                                ? "bg-[#009688]"
                                                : "bg-[#E8ECF2]"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col lg:flex-row h-full">
                        {/* Main Content */}
                        <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
                            {/* Step 1: Application Method */}
                            {step === 1 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div>
                                        <h3
                                            className="text-base sm:text-lg md:text-xl font-semibold text-[#1E2328] mb-1 sm:mb-2"
                                            style={{
                                                fontFamily:
                                                    "Poppins, sans-serif",
                                            }}
                                        >
                                            Choose Method
                                        </h3>
                                        <p
                                            className="text-[#6B7380] text-xs sm:text-sm"
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            Select how you want your design
                                            applied
                                        </p>
                                    </div>

                                    {isLoadingOptions ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="w-8 h-8 border-4 border-[#009688] border-t-transparent rounded-full animate-spin mr-3"></div>
                                            <span className="text-[#6B7380]">
                                                Loading options...
                                            </span>
                                        </div>
                                    ) : uniqueMethodTypes.length === 0 ? (
                                        <div className="text-center py-12 text-[#6B7380]">
                                            <i className="ri-error-warning-line text-4xl mb-3 block text-[#009688]"></i>
                                            <p>
                                                No customization methods
                                                available for this product.
                                            </p>
                                            <p className="text-sm mt-2">
                                                Please contact support or try a
                                                different product.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            {uniqueMethodTypes.map(
                                                (methodType) => {
                                                    const minSetupCharge =
                                                        Math.min(
                                                            ...methodType.methods.map(
                                                                (m) =>
                                                                    parseFloat(
                                                                        m.setupCharge ||
                                                                            0
                                                                    )
                                                            )
                                                        );

                                                    return (
                                                        <button
                                                            key={
                                                                methodType.type
                                                            }
                                                            onClick={() =>
                                                                handleMethodTypeSelect(
                                                                    methodType.type
                                                                )
                                                            }
                                                            className={`p-4 sm:p-6 border-2 rounded-xl transition-all text-left ${
                                                                selectedMethodType ===
                                                                methodType.type
                                                                    ? "border-[#009688] bg-[#009688]/5"
                                                                    : "border-[#E8ECF2] hover:border-[#009688]"
                                                            }`}
                                                        >
                                                            {methodType.imageUrl ? (
                                                                <div
                                                                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden mb-3 sm:mb-4 border-2 ${
                                                                        selectedMethodType ===
                                                                        methodType.type
                                                                            ? "border-[#009688]"
                                                                            : "border-[#E8ECF2]"
                                                                    }`}
                                                                >
                                                                    <img
                                                                        src={resolveMediaUrl(
                                                                            apiOrigin,
                                                                            methodType.imageUrl,
                                                                        )}
                                                                        alt={
                                                                            methodType.name
                                                                        }
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 ${
                                                                        selectedMethodType ===
                                                                        methodType.type
                                                                            ? "bg-[#009688] text-white"
                                                                            : "bg-[#F8F9FA] text-[#6B7380]"
                                                                    }`}
                                                                >
                                                                    <i
                                                                        className={`${methodType.icon} text-lg sm:text-xl`}
                                                                    ></i>
                                                                </div>
                                                            )}
                                                            <h4
                                                                className="text-sm sm:text-base md:text-lg font-semibold text-[#1E2328] mb-1 sm:mb-2"
                                                                style={{
                                                                    fontFamily:
                                                                        "Inter, sans-serif",
                                                                }}
                                                            >
                                                                {
                                                                    methodType.name
                                                                }
                                                            </h4>
                                                            {methodType.description ? (
                                                                <p
                                                                    className="text-[#6B7380] text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2"
                                                                    style={{
                                                                        fontFamily:
                                                                            "Inter, sans-serif",
                                                                    }}
                                                                >
                                                                    {
                                                                        methodType.description
                                                                    }
                                                                </p>
                                                            ) : null}
                                                            <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm">
                                                                <span className="text-[#6B7380]">
                                                                    From{" "}
                                                                    {formatAud(
                                                                        minSetupCharge,
                                                                    )}{" "}
                                                                    setup
                                                                </span>
                                                                <span className="text-[#009688] bg-[#009688]/20 px-2 py-0.5 rounded text-xs">
                                                                    {
                                                                        methodType
                                                                            .applicationTypes
                                                                            .length
                                                                    }{" "}
                                                                    option
                                                                    {methodType
                                                                        .applicationTypes
                                                                        .length >
                                                                    1
                                                                        ? "s"
                                                                        : ""}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Application Type */}
                            {step === 2 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div>
                                        <h3
                                            className="text-base sm:text-lg md:text-xl font-semibold text-[#1E2328] mb-1 sm:mb-2"
                                            style={{
                                                fontFamily:
                                                    "Poppins, sans-serif",
                                            }}
                                        >
                                            Choose Type
                                        </h3>
                                        <p
                                            className="text-[#6B7380] text-xs sm:text-sm"
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            What would you like to add?
                                        </p>
                                    </div>

                                    {availableApplicationTypes.length === 0 ? (
                                        <div className="text-center py-12 text-[#6B7380]">
                                            <i className="ri-error-warning-line text-4xl mb-3 block text-[#009688]"></i>
                                            <p>
                                                No content types available for
                                                this method.
                                            </p>
                                            <p className="text-sm mt-2">
                                                Please go back and select a
                                                different method.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            {availableApplicationTypes.map(
                                                (type) => {
                                                    // Get the setup charge for this specific method+type combination
                                                    const methodRecord =
                                                        rawMethods.find(
                                                            (m) =>
                                                                m.applicationMethod ===
                                                                    selectedMethodType &&
                                                                m.applicationType ===
                                                                    type.id
                                                        );
                                                    const setupCharge =
                                                        parseFloat(
                                                            methodRecord?.setupCharge ||
                                                                0
                                                        );

                                                    return (
                                                        <button
                                                            key={type.id}
                                                            onClick={() =>
                                                                handleApplicationTypeSelect(
                                                                    type.id
                                                                )
                                                            }
                                                            className={`p-6 border-2 rounded-xl transition-all text-left ${
                                                                selectedApplicationType ===
                                                                type.id
                                                                    ? "border-[#009688] bg-[#009688]/5"
                                                                    : "border-[#E8ECF2] hover:border-[#009688]"
                                                            }`}
                                                        >
                                                            {/* Show image if available, otherwise show icon */}
                                                            {type.imageUrl ? (
                                                                <div
                                                                    className={`w-16 h-16 rounded-lg overflow-hidden mb-4 border-2 ${
                                                                        selectedApplicationType ===
                                                                        type.id
                                                                            ? "border-[#009688]"
                                                                            : "border-[#E8ECF2]"
                                                                    }`}
                                                                >
                                                                    <img
                                                                        src={resolveMediaUrl(
                                                                            apiOrigin,
                                                                            type.imageUrl,
                                                                        )}
                                                                        alt={
                                                                            type.name
                                                                        }
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                                                                        selectedApplicationType ===
                                                                        type.id
                                                                            ? "bg-[#009688] text-white"
                                                                            : "bg-[#F8F9FA] text-[#6B7380]"
                                                                    }`}
                                                                >
                                                                    <i
                                                                        className={`${type.icon} text-xl`}
                                                                    ></i>
                                                                </div>
                                                            )}
                                                            <h4
                                                                className="text-lg font-semibold text-[#1E2328] mb-2"
                                                                style={{
                                                                    fontFamily:
                                                                        "Inter, sans-serif",
                                                                }}
                                                            >
                                                                {type.name}
                                                            </h4>
                                                            {type.description ? (
                                                                <p
                                                                    className="text-[#6B7380] text-sm mb-3"
                                                                    style={{
                                                                        fontFamily:
                                                                            "Inter, sans-serif",
                                                                    }}
                                                                >
                                                                    {
                                                                        type.description
                                                                    }
                                                                </p>
                                                            ) : null}
                                                            <div className="flex items-center space-x-4 text-sm">
                                                                <span className="text-[#6B7380]">
                                                                    {formatAud(
                                                                        setupCharge,
                                                                    )}{" "}
                                                                    setup
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Position Selection */}
                            {step === 3 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div>
                                        <h3
                                            className="text-base sm:text-lg md:text-xl font-semibold text-[#1E2328] mb-1 sm:mb-2"
                                            style={{
                                                fontFamily:
                                                    "Poppins, sans-serif",
                                            }}
                                        >
                                            Select Position
                                        </h3>
                                        <p
                                            className="text-[#6B7380] text-xs sm:text-sm"
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            Where to place your design (
                                            {selectedPositions.length} selected)
                                        </p>
                                    </div>

                                    {methodFilteredPositions.length === 0 ? (
                                        <div className="text-center py-12 text-[#6B7380]">
                                            <i className="ri-error-warning-line text-4xl mb-3 block text-[#009688]"></i>
                                            <p>
                                                No customization positions
                                                available for this method.
                                            </p>
                                            <p className="text-sm mt-2">
                                                Please try a different method or
                                                contact support.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                                            {methodFilteredPositions.map(
                                                (position) => {
                                                    const isFree =
                                                        isDeal &&
                                                        selectedMethod &&
                                                        isFreeCustomization(
                                                            selectedMethod.id ||
                                                                selectedMethod._id,
                                                            position.id || position._id,
                                                        );
                                                    const pk = posKey(position);
                                                    return (
                                                        <button
                                                            key={pk}
                                                            onClick={() =>
                                                                handlePositionToggle(
                                                                    position
                                                                )
                                                            }
                                                            className={`p-3 sm:p-4 border-2 rounded-xl transition-all text-center relative ${
                                                                selectedPositions.find(
                                                                    (p) =>
                                                                        posKey(p) === pk,
                                                                )
                                                                    ? "border-[#009688] bg-[#009688]/5"
                                                                    : "border-[#E8ECF2] hover:border-[#009688]"
                                                            }`}
                                                        >
                                                            {isFree && (
                                                                <span className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-[#10B981] text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                                                                    FREE
                                                                </span>
                                                            )}
                                                            {/* Show image if available from API, otherwise show icon */}
                                                            {position.imageUrl ? (
                                                                <div
                                                                    className={`w-16 h-16 rounded-lg overflow-hidden mx-auto mb-3 border-2 ${
                                                                        selectedPositions.find(
                                                                            (p) =>
                                                                                posKey(p) === pk,
                                                                        )
                                                                            ? "border-[#009688]"
                                                                            : "border-[#E8ECF2]"
                                                                    }`}
                                                                >
                                                                    <img
                                                                        src={resolveMediaUrl(
                                                                            apiOrigin,
                                                                            position.imageUrl,
                                                                        )}
                                                                        alt={
                                                                            position.positionName ||
                                                                            position.name
                                                                        }
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                                                                        selectedPositions.find(
                                                                            (p) =>
                                                                                posKey(p) === pk,
                                                                        )
                                                                            ? "bg-[#009688] text-white"
                                                                            : "bg-[#F8F9FA] text-[#6B7380]"
                                                                    }`}
                                                                >
                                                                    <i
                                                                        className={`${
                                                                            position.icon ||
                                                                            "ri-map-pin-line"
                                                                        } text-xl`}
                                                                    ></i>
                                                                </div>
                                                            )}
                                                            <h4
                                                                className="text-sm font-medium text-[#1E2328]"
                                                                style={{
                                                                    fontFamily:
                                                                        "Inter, sans-serif",
                                                                }}
                                                            >
                                                                {position.positionName ||
                                                                    position.name}
                                                            </h4>
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}

                                    <div className="bg-[#F8F9FA] rounded-lg p-4">
                                        <p
                                            className="text-[#6B7380] text-xs sm:text-sm"
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            <i className="ri-information-line text-[#009688] mr-2"></i>
                                            {isDeal &&
                                            freeCustomizations.length > 0
                                                ? "FREE positions are included with this deal."
                                                : "Select multiple positions. Each charged separately."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Content Entry */}
                            {step === 4 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div>
                                        <h3
                                            className="text-base sm:text-lg md:text-xl font-semibold text-[#1E2328] mb-1 sm:mb-2"
                                            style={{
                                                fontFamily:
                                                    "Poppins, sans-serif",
                                            }}
                                        >
                                            {selectedApplicationType === "TEXT"
                                                ? "Enter Text"
                                                : "Upload Design"}
                                        </h3>
                                        <p
                                            className="text-[#6B7380] text-xs sm:text-sm"
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            {selectedApplicationType === "TEXT"
                                                ? "Up to 4 lines of text"
                                                : "PNG, JPG, SVG (max 5MB)"}
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                            <i className="ri-error-warning-line mr-2"></i>
                                            {error}
                                        </div>
                                    )}

                                    {selectedApplicationType === "TEXT" ? (
                                        <TextCustomization
                                            onTextChange={handleTextChange}
                                            initialData={textData}
                                            position={
                                                selectedPositions[0]
                                                    ?.positionName ||
                                                selectedPositions[0]?.name ||
                                                "Selected positions"
                                            }
                                        />
                                    ) : (
                                        <div className="space-y-4">
                                            <div
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                                                    uploadedImageUrl
                                                        ? isReusedLogo
                                                            ? "border-[#009688] bg-[#009688]/5"
                                                            : "border-[#10B981] bg-[#10B981]/5"
                                                        : "border-[#E8ECF2] hover:border-[#009688]"
                                                }`}
                                            >
                                                {uploadedImageUrl ? (
                                                    <div className="space-y-4">
                                                        <img
                                                            src={resolveMediaUrl(
                                                                apiOrigin,
                                                                uploadedImageUrl,
                                                            )}
                                                            alt="Logo preview"
                                                            className="max-w-48 max-h-48 mx-auto rounded-lg shadow-md object-contain"
                                                        />
                                                        <p
                                                            className={`${
                                                                isReusedLogo
                                                                    ? "text-[#009688]"
                                                                    : "text-[#10B981]"
                                                            } font-medium flex items-center justify-center`}
                                                            style={{
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                            }}
                                                        >
                                                            <i className="ri-check-line mr-2"></i>
                                                            {isReusedLogo
                                                                ? "Selected from Past Orders"
                                                                : uploadedFile?.name ||
                                                                  "Image Selected"}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            className="text-[#009688] hover:text-[#00796B] text-sm font-medium"
                                                        >
                                                            Click to change file
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="w-16 h-16 bg-[#F8F9FA] rounded-xl flex items-center justify-center mx-auto">
                                                            {isUploading ? (
                                                                <i className="ri-loader-4-line text-2xl text-[#009688] animate-spin"></i>
                                                            ) : (
                                                                <i className="ri-upload-cloud-line text-3xl text-[#6B7380]"></i>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p
                                                                className="text-[#1E2328] font-medium mb-1"
                                                                style={{
                                                                    fontFamily:
                                                                        "Inter, sans-serif",
                                                                }}
                                                            >
                                                                {isUploading
                                                                    ? "Uploading..."
                                                                    : "Click to upload your logo"}
                                                            </p>
                                                            <p
                                                                className="text-[#6B7380] text-sm"
                                                                style={{
                                                                    fontFamily:
                                                                        "Inter, sans-serif",
                                                                }}
                                                            >
                                                                PNG, JPG, or SVG
                                                                (max 5MB)
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".png,.jpg,.jpeg,.svg"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />

                                            {/* Add Logo Later Option */}
                                            {!uploadedImageUrl && !uploadedFile && (
                                                <div className="mt-4 p-4 bg-gradient-to-r from-[#009688]/5 to-[#00796B]/5 rounded-xl border border-[#E8ECF2]">
                                                    <label className="flex items-start cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            checked={addLogoLater}
                                                            onChange={(e) => {
                                                                setAddLogoLater(e.target.checked);
                                                                if (e.target.checked) {
                                                                    setError(null);
                                                                }
                                                            }}
                                                            className="mt-1 w-4 h-4 text-[#009688] border-gray-300 rounded focus:ring-[#009688] focus:ring-2"
                                                        />
                                                        <div className="ml-3 flex-1">
                                                            <div className="flex items-center">
                                                                <span className="text-sm font-semibold text-[#1E2328] group-hover:text-[#009688]">
                                                                    Add Logo Later
                                                                </span>
                                                                <span className="ml-2 px-2 py-0.5 bg-[#009688] text-white text-xs font-medium rounded-full">
                                                                    Popular
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-[#6B7380] mt-1 leading-relaxed">
                                                                Don't have your logo ready? No problem! Select your positions and methods now, pay for customization, and upload your logo from your orders page after checkout.
                                                            </p>
                                                            <div className="mt-2 flex items-start text-xs text-[#10B981]">
                                                                <i className="ri-information-line mr-1 mt-0.5"></i>
                                                                <span>You'll still pay for customization now, but can upload the logo anytime before production.</span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            )}

                                            {/* Past Logos Section */}
                                            {isAuthenticated ? (
                                                pastLogos.length > 0 ? (
                                                    <div className="mt-6 border-t border-[#E8ECF2] pt-6">
                                                        <h4 className="text-sm font-semibold text-[#1E2328] mb-3 flex items-center">
                                                            <i className="ri-history-line mr-2 text-[#009688]"></i>
                                                            Use Previously
                                                            Uploaded Logo
                                                            <span className="ml-2 text-xs font-normal text-[#10B981]">
                                                                (Free Setup)
                                                            </span>
                                                        </h4>
                                                        {isLoadingPastLogos ? (
                                                            <div className="text-sm text-[#6B7380] flex items-center">
                                                                <div className="w-4 h-4 border-2 border-[#009688] border-t-transparent rounded-full animate-spin mr-2"></div>
                                                                Loading past
                                                                logos...
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
                                                                {pastLogos.map(
                                                                    (
                                                                        logo,
                                                                        idx
                                                                    ) => (
                                                                        <button
                                                                            key={
                                                                                idx
                                                                            }
                                                                            onClick={() =>
                                                                                handlePastLogoSelect(
                                                                                    logo
                                                                                )
                                                                            }
                                                                            className={`relative aspect-square rounded-lg border-2 overflow-hidden hover:border-[#009688] transition-all bg-white p-2 group ${
                                                                                uploadedImageUrl ===
                                                                                logo.imageUrl
                                                                                    ? "border-[#009688] ring-2 ring-[#009688]/20"
                                                                                    : "border-[#E8ECF2]"
                                                                            }`}
                                                                        >
                                                                            <img
                                                                                src={resolveMediaUrl(
                                                                                    apiOrigin,
                                                                                    logo.imageUrl,
                                                                                )}
                                                                                alt={
                                                                                    logo.fileName
                                                                                }
                                                                                className="w-full h-full object-contain"
                                                                            />
                                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                                <span className="text-white text-xs font-medium px-2 py-1 bg-[#009688] rounded">
                                                                                    Use
                                                                                    This
                                                                                </span>
                                                                            </div>
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="mt-6 border-t border-[#E8ECF2] pt-6">
                                                        <div className="bg-[#F8F9FA] rounded-lg p-4 text-center">
                                                            <i className="ri-history-line text-2xl text-[#6B7380] mb-2 block"></i>
                                                            <p className="text-sm text-[#6B7380]">
                                                                No previously
                                                                uploaded logos
                                                                found.
                                                            </p>
                                                            <p className="text-xs text-[#9CA3AF] mt-1">
                                                                Logos from your
                                                                past orders will
                                                                appear here for
                                                                easy reuse.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="mt-6 border-t border-[#E8ECF2] pt-6">
                                                    <div className="bg-gradient-to-r from-[#009688]/10 to-[#00796B]/10 rounded-lg p-4">
                                                        <h4 className="text-sm font-semibold text-[#1E2328] mb-2 flex items-center">
                                                            <i className="ri-user-line mr-2 text-[#009688]"></i>
                                                            Save on Setup Fees!
                                                        </h4>
                                                        <p className="text-sm text-[#6B7380]">
                                                            <a
                                                                href="/account"
                                                                className="text-[#009688] font-medium hover:underline"
                                                            >
                                                                Log in
                                                            </a>{" "}
                                                            to reuse logos from
                                                            your previous orders
                                                            and skip the setup
                                                            fee.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="bg-[#F8F9FA] rounded-lg p-4">
                                                <p
                                                    className="text-[#6B7380] text-sm"
                                                    style={{
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                    }}
                                                >
                                                    <i className="ri-information-line text-[#009688] mr-2"></i>
                                                    {isReusedLogo ? (
                                                        <span className="text-[#10B981] font-medium">
                                                            Setup fee waived for
                                                            reused logo!
                                                        </span>
                                                    ) : (
                                                        "For best results, use a high-resolution image with transparent background."
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 5: Confirmation */}
                            {step === 5 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div>
                                        <h3
                                            className="text-base sm:text-lg md:text-xl font-semibold text-[#1E2328] mb-1 sm:mb-2"
                                            style={{
                                                fontFamily:
                                                    "Poppins, sans-serif",
                                            }}
                                        >
                                            Review
                                        </h3>
                                        <p
                                            className="text-[#6B7380] text-xs sm:text-sm"
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            Review your selections before adding
                                            to cart
                                        </p>
                                    </div>

                                    <div className="bg-[#F8F9FA] rounded-xl p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                                        {/* Summary Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            {/* Left Column - Details */}
                                            <div className="space-y-3 sm:space-y-4">
                                                <h4
                                                    className="text-sm sm:text-base md:text-lg font-semibold text-[#1E2328]"
                                                    style={{
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                    }}
                                                >
                                                    Details
                                                </h4>

                                                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                                    <div className="flex justify-between py-2 border-b border-[#E8ECF2]">
                                                        <span className="text-[#6B7380]">
                                                            Method:
                                                        </span>
                                                        <span className="text-[#1E2328] font-medium">
                                                            {uniqueMethodTypes.find(
                                                                (m) =>
                                                                    m.type ===
                                                                    selectedMethodType
                                                            )?.name ||
                                                                selectedMethodType}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-[#E8ECF2]">
                                                        <span className="text-[#6B7380]">
                                                            Type:
                                                        </span>
                                                        <span className="text-[#1E2328] font-medium">
                                                            {availableApplicationTypes.find(
                                                                (t) =>
                                                                    t.id ===
                                                                    selectedApplicationType
                                                            )?.name ||
                                                                selectedApplicationType}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-[#E8ECF2]">
                                                        <span className="text-[#6B7380]">
                                                            Positions:
                                                        </span>
                                                        <span className="text-[#1E2328] font-medium text-right">
                                                            {selectedPositions
                                                                .map(
                                                                    (p) =>
                                                                        p.positionName ||
                                                                        p.name
                                                                )
                                                                .join(", ")}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-[#E8ECF2]">
                                                        <span className="text-[#6B7380]">
                                                            Quantity:
                                                        </span>
                                                        <span className="text-[#1E2328] font-medium">
                                                            {quantity} items
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column - Preview */}
                                            <div className="space-y-4">
                                                <h4
                                                    className="text-lg font-semibold text-[#1E2328]"
                                                    style={{
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                    }}
                                                >
                                                    Content Preview
                                                </h4>

                                                <div className="bg-gradient-to-br from-[#009688] to-[#00695c] rounded-xl p-6 min-h-[150px] flex items-center justify-center">
                                                    {selectedApplicationType ===
                                                        "TEXT" &&
                                                    textData?.filledLines
                                                        ?.length > 0 ? (
                                                        <div className="text-center space-y-1">
                                                            {textData.filledLines.map(
                                                                (
                                                                    line,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        style={{
                                                                            fontFamily:
                                                                                textData
                                                                                    .font
                                                                                    ?.family,
                                                                            fontWeight:
                                                                                textData
                                                                                    .font
                                                                                    ?.weight,
                                                                            color: textData
                                                                                .color
                                                                                ?.hex,
                                                                            fontSize:
                                                                                "1.25rem",
                                                                        }}
                                                                    >
                                                                        {line}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    ) : uploadedImageUrl ? (
                                                        <img
                                                            src={resolveMediaUrl(
                                                                apiOrigin,
                                                                uploadedImageUrl,
                                                            )}
                                                            alt="Design preview"
                                                            className="max-w-32 max-h-32 object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-[#6B7380]">
                                                            No preview available
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Important Notice */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                                        <p
                                            className="text-blue-800 text-xs sm:text-sm"
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            <i className="ri-information-line mr-2"></i>
                                            We'll send a digital proof for
                                            approval before production.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pricing Sidebar — opaque column so PDP never shows through */}
                        <div className="w-full lg:w-72 xl:w-80 bg-[#F8F9FA] border-t lg:border-t-0 lg:border-l border-[#E8ECF2] p-3 sm:p-4 md:p-5 shrink-0 lg:self-stretch lg:min-h-0 relative z-[2]">
                            <h4
                                className="text-sm sm:text-base md:text-lg font-semibold text-[#1E2328] mb-3 sm:mb-4"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                Price Summary
                            </h4>

                            {isCalculating ? (
                                <div className="flex items-center justify-center py-8">
                                    <i className="ri-loader-4-line text-2xl text-[#009688] animate-spin mr-2"></i>
                                    <span className="text-[#6B7380]">
                                        Calculating...
                                    </span>
                                </div>
                            ) : pricing ? (
                                <div className="space-y-3">
                                    {pricing.isFree ? (
                                        // Show FREE message for completely free customizations
                                        <div className="text-center py-4">
                                            <div className="bg-[#10B981]/10 rounded-lg p-4">
                                                <i className="ri-gift-line text-3xl text-[#10B981] mb-2 block"></i>
                                                <p className="text-[#10B981] font-bold text-lg">
                                                    FREE with this deal!
                                                </p>
                                                <p className="text-[#6B7380] text-sm mt-2">
                                                    All selected customizations
                                                    are included at no extra
                                                    cost.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {pricing.freePositionCount > 0 && (
                                                <div className="bg-[#10B981]/10 rounded-lg p-3 mb-3">
                                                    <p className="text-[#10B981] text-sm font-medium">
                                                        <i className="ri-gift-line mr-1"></i>
                                                        {
                                                            pricing.freePositionCount
                                                        }{" "}
                                                        position
                                                        {pricing.freePositionCount >
                                                        1
                                                            ? "s"
                                                            : ""}{" "}
                                                        FREE with this deal!
                                                    </p>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#6B7380]">
                                                    Per position (
                                                    {pricing.quantity} items):
                                                </span>
                                                <span className="text-[#1E2328]">
                                                    {formatAud(
                                                        pricing.pricePerPosition *
                                                            pricing.quantity,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#6B7380]">
                                                    Positions (
                                                    {pricing.positionCount -
                                                        (pricing.freePositionCount ||
                                                            0)}
                                                    /{pricing.positionCount}):
                                                </span>
                                                <span className="text-[#1E2328]">
                                                    {formatAud(
                                                        pricing.positionTotal,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#6B7380]">
                                                    Setup fee (one-time):
                                                </span>
                                                <span className="text-[#1E2328]">
                                                    {pricing.setupFee === 0
                                                        ? "FREE"
                                                        : formatAud(
                                                              pricing.setupFee,
                                                          )}
                                                </span>
                                            </div>
                                            <div className="border-t border-[#E8ECF2] pt-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[#6B7380]">
                                                        Subtotal:
                                                    </span>
                                                    <span className="text-[#1E2328]">
                                                        {formatAud(
                                                            pricing.subtotal,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[#6B7380]">
                                                        VAT (20%):
                                                    </span>
                                                    <span className="text-[#1E2328]">
                                                        {formatAud(
                                                            pricing.vat,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="border-t border-[#E8ECF2] pt-3">
                                                <div className="flex justify-between">
                                                    <span className="text-[#1E2328] font-semibold">
                                                        Total:
                                                    </span>
                                                    <span className="text-[#009688] font-bold text-xl">
                                                        {formatAud(
                                                            pricing.total,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-[#6B7380]">
                                    <i className="ri-price-tag-3-line text-3xl mb-2 block opacity-50"></i>
                                    <p className="text-sm">
                                        Select options to see pricing
                                    </p>
                                </div>
                            )}

                            <div className="mt-4 sm:mt-6 bg-white rounded-lg p-3 sm:p-4">
                                <p
                                    className="text-[#6B7380] text-[10px] sm:text-xs"
                                    style={{ fontFamily: "Inter, sans-serif" }}
                                >
                                    <i className="ri-shield-check-line text-[#10B981] mr-1"></i>
                                    All costs included. No hidden fees.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-t border-[#E8ECF2] bg-white shrink-0 gap-2 sm:gap-3">
                    <button
                        onClick={step === 1 ? onClose : handleBack}
                        className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 border border-[#E8ECF2] text-[#6B7380] rounded-lg hover:border-[#009688] hover:text-[#009688] transition-colors text-sm sm:text-base"
                        style={{ fontFamily: "Inter, sans-serif" }}
                    >
                        <i className="ri-arrow-left-line sm:mr-1"></i>
                        <span className="hidden sm:inline">
                            {step === 1 ? "Cancel" : "Back"}
                        </span>
                    </button>

                    <div className="flex space-x-2 sm:space-x-3">
                        {step < 5 ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-[#009688] text-white rounded-lg font-medium hover:bg-[#00796B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                <span className="hidden sm:inline">
                                    Continue
                                </span>
                                <span className="sm:hidden">Next</span>
                                <i className="ri-arrow-right-line ml-1 sm:ml-2"></i>
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={!canProceed()}
                                className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#1d9b54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                <i className="ri-check-line mr-1 sm:mr-2"></i>
                                <span className="hidden sm:inline">
                                    Add Customization
                                </span>
                                <span className="sm:hidden">Add</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        portalTarget,
    );
}

WorkwearCustomizationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired,
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dealId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productName: PropTypes.string,
    productImage: PropTypes.string,
    quantity: PropTypes.number,
    existingCustomization: PropTypes.object,
    backendUrl: PropTypes.string,
};
