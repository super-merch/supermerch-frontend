import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

import SeoHelmet from "@/components/Common/SeoHelmet";
import RecommendationsStrip from "@/components/Common/RecommendationsStrip";
import ProductGallery from "@/components/clothingHeadwearPdp/ProductGallery";
import ProductInfo from "@/components/clothingHeadwearPdp/ProductInfo";
import ClothingHeadwearSupermerchTabs from "@/components/clothingHeadwearPdp/ClothingHeadwearSupermerchTabs";
import StickyAddToCart from "@/components/clothingHeadwearPdp/StickyAddToCart";
import WorkwearCustomizationModal from "@/components/clothingHeadwearPdp/WorkwearCustomizationModal";
import VolumePricingModal from "@/components/clothingHeadwearPdp/VolumePricingModal";
import QuoteFormModal from "@/components/product/QuoteFormModal";
import { AppContext } from "@/context/AppContext";
import { AuthContext } from "@/context/AuthContext";
import { ProductsContext } from "@/context/ProductsContext";
import { useProductPrefetch } from "@/context/ProductPrefetchContext";
import useRecommendations from "@/hooks/useRecommendations";
import { addToCart } from "@/redux/slices/cartSlice";
import { addToFavourite, removeFromFavourite } from "@/redux/slices/favouriteSlice";
import { resolveAddLogoLaterFromCustomizationData } from "@/utils/addLogoLater";
import { getArtworkSource } from "@/utils/categoryMeta";
import {
  buildColorVariants,
  extractSizesForSelectedColor,
  extractSizesFromProduct,
  getDefaultPrintMethod,
  getPriceForQuantity,
  mapSingleProductToWorkwearModel,
  normalizedImageList,
} from "@/utils/promodataWorkwearPdpMap";

function formatDeliveryDate(d) {
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPositionPriceForOne(position) {
  const tierPrice = Number(position?.pricePerApplication);
  if (Number.isFinite(tierPrice)) return tierPrice;

  const tiers = Array.isArray(position?.pricingTiers) ? position.pricingTiers : [];
  const tierForOne = tiers.find((tier) => {
    const min = Number(tier?.minQuantity ?? 0);
    const max =
      tier?.maxQuantity === null || tier?.maxQuantity === undefined || tier?.maxQuantity === ""
        ? Infinity
        : Number(tier.maxQuantity);
    return min <= 1 && 1 <= max;
  });
  if (tierForOne) return Number(tierForOne.pricePerApplication || 0);

  const minOneTier = tiers.find((tier) => Number(tier?.minQuantity) === 1);
  if (minOneTier) return Number(minOneTier.pricePerApplication || 0);

  return Number(position?.priceAdjustment || 0);
}

export default function ClothingHeadwearWorkwearPdp() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const prefetch = useProductPrefetch();
  const singleProduct = prefetch?.data ?? null;

  const { backendUrl, shippingCharges: freightFee } = useContext(AppContext);
  const { totalDiscount, totalMargin, v1categories } = useContext(ProductsContext);
  const { userData } = useContext(AuthContext);
  const dispatch = useDispatch();
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);

  const tabsSectionRef = useRef(null);

  const productId = singleProduct?.meta?.id != null ? String(singleProduct.meta.id) : "";
  const categoryGroupId =
    singleProduct?.product?.categorisation?.promodata_product_type?.type_group_id || "";
  const artworkSource = useMemo(
    () => getArtworkSource(categoryGroupId, v1categories),
    [categoryGroupId, v1categories],
  );

  const workwearProduct = useMemo(
    () => (singleProduct ? mapSingleProductToWorkwearModel(singleProduct, v1categories) : null),
    [singleProduct, v1categories],
  );

  const [selectedColor, setSelectedColor] = useState("");
  const [sizeQuantities, setSizeQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState({ state: false, from: "" });
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    name: "",
    email: "",
    phone: "",
    delivery: "",
    comment: "",
  });
  const [quoteFile, setQuoteFile] = useState(null);
  const [quoteFilePreview, setQuoteFilePreview] = useState(null);
  const [isDraggingQuoteFile, setIsDraggingQuoteFile] = useState(false);
  const [notRobot, setNotRobot] = useState(false);
  const [quoteQuantity, setQuoteQuantity] = useState(1);
  const [customization, setCustomization] = useState(null);
  const [adminCustomizationState, setAdminCustomizationState] = useState(null);
  const [localPricing, setLocalPricing] = useState(null);
  const [availablePriceGroups, setAvailablePriceGroups] = useState([]);

  // Supplier modal (Shift + A + click on product heading)
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isAPressed, setIsAPressed] = useState(false);
  const aKeyTimeoutRef = useRef(null);

  const promodataProduct = singleProduct?.product || {};
  const priceGroups = useMemo(
    () => promodataProduct?.prices?.price_groups || [],
    [promodataProduct?.prices?.price_groups],
  );

  useEffect(() => {
    if (!singleProduct) {
      setAvailablePriceGroups([]);
      return;
    }
    if (priceGroups.length > 0 || (promodataProduct?.prices?.addons || []).length > 0) {
      const basePriceData = priceGroups.find((group) => group?.base_price)?.base_price;
      const baseGroup = basePriceData
        ? {
            ...basePriceData,
            type: "base",
          }
        : null;

      const groupedAdditions = priceGroups.flatMap((group) =>
        (group?.additions || []).map((add) => ({
          ...add,
          type: "addition",
          description: add.description,
        })),
      );

      const standaloneAddons = (promodataProduct?.prices?.addons || []).map((add) => ({
        ...add,
        type: "addition",
        description: add.description,
      }));

      const additionGroups = [...groupedAdditions, ...standaloneAddons].filter(Boolean);
      const dedupedAdditions = additionGroups.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (other) => (other.key || other.description) === (item.key || item.description),
          ),
      );

      const allGroups = [baseGroup, ...dedupedAdditions].filter(Boolean);
      setAvailablePriceGroups(allGroups);
    } else {
      setAvailablePriceGroups([]);
    }
  }, [singleProduct, priceGroups, promodataProduct?.prices?.addons]);

  const sizes = useMemo(() => {
    if (!singleProduct) return [];
    if (selectedColor) return extractSizesForSelectedColor(singleProduct, selectedColor);
    return extractSizesFromProduct(singleProduct);
  }, [singleProduct, selectedColor]);

  const selectedPrintMethod = useMemo(
    () => (singleProduct ? getDefaultPrintMethod(singleProduct) : null),
    [singleProduct],
  );

  const pricingSummary = singleProduct?.pricingSummary || null;
  const discountPct =
    pricingSummary?.discountPercent ?? totalDiscount?.[productId] ?? localPricing?.discount ?? 0;

  const colorVariants = useMemo(() => {
    if (!singleProduct || !selectedColor) return null;
    return buildColorVariants(singleProduct, selectedColor, sizes);
  }, [singleProduct, selectedColor, sizes]);

  const normalizedImages = useMemo(() => {
    if (!singleProduct) return [];
    const p = mapSingleProductToWorkwearModel(singleProduct, v1categories);
    return p.primaryImage?.imageUrl ? [p.primaryImage.imageUrl] : [];
  }, [singleProduct, v1categories]);

  const allProductImages = useMemo(() => {
    if (!singleProduct) return [];
    return normalizedImageList(singleProduct);
  }, [singleProduct]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!workwearProduct?.availableColors?.length) return;
    setSelectedColor((prev) => {
      if (prev && workwearProduct.availableColors.some((c) => c.id === prev)) return prev;
      return "";
    });
  }, [workwearProduct]);

  // Keyboard event listeners for Shift + A (supplier modal trigger)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Shift") {
        setIsShiftPressed(true);
      }
      if (e.key.toLowerCase() === "a" && e.shiftKey) {
        setIsAPressed(true);
        if (aKeyTimeoutRef.current) clearTimeout(aKeyTimeoutRef.current);
        aKeyTimeoutRef.current = setTimeout(() => {
          setIsAPressed(false);
        }, 2000);
      }
      if (e.key === "Escape" && showSupplierModal) {
        setShowSupplierModal(false);
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === "Shift") setIsShiftPressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (aKeyTimeoutRef.current) clearTimeout(aKeyTimeoutRef.current);
    };
  }, [showSupplierModal]);

  // Called when the product name heading is clicked
  const handleHeadingClick = (e) => {
    const shiftHeld = e.shiftKey || isShiftPressed;
    if (shiftHeld && isAPressed) {
      e.preventDefault();
      e.stopPropagation();
      setShowSupplierModal(true);
      setIsAPressed(false);
      if (aKeyTimeoutRef.current) {
        clearTimeout(aKeyTimeoutRef.current);
        aKeyTimeoutRef.current = null;
      }
    }
  };

  useEffect(() => {
    setSizeQuantities({});
  }, [selectedColor]);

  useEffect(() => {
    if (!productId) return;
    if (totalDiscount?.[productId] !== undefined || totalMargin?.[productId] !== undefined) return;
    axios
      .get(`${backendUrl}/api/add-discount/effective/${encodeURIComponent(productId)}`)
      .then((res) => {
        if (res.data?.success && res.data?.data) setLocalPricing(res.data.data);
      })
      .catch(() => {});
  }, [productId, backendUrl, totalDiscount, totalMargin]);

  const { recommendations, recommendationsLoading } = useRecommendations({
    backendUrl,
    type: "product",
    productId,
    userId: userData?._id,
    limit: 8,
    enabled: Boolean(productId),
  });

  const userEmail = userData?.email || "guest@gmail.com";

  const isFavourited = favouriteItems?.some((item) => item.meta?.id === singleProduct?.meta?.id);

  const handleToggleWishlist = () => {
    if (!singleProduct) return;
    if (isFavourited) {
      dispatch(removeFromFavourite(singleProduct, userEmail));
      toast.success("Removed from favourites");
    } else {
      dispatch(addToFavourite(singleProduct, userEmail));
      toast.success("Added to favourites");
    }
  };

  const handleCustomizationComplete = useCallback((data) => {
    setAdminCustomizationState({
      flow: "workwear",
      customizationData: data,
      methodRecord: data._methodRecord,
      positionsDetail: data._positionsDetail || [],
    });
    const positions = data._positionsDetail || [];
    const posTotal = positions.reduce((sum, p) => sum + getPositionPriceForOne(p), 0);
    setCustomization({
      applicationMethodName: data.applicationMethodName,
      applicationTypeName: data.applicationTypeName,
      positions: (data.positions || []).map((p) => ({ name: p.name })),
      pricing: {
        setupFee: Number(data.pricing?.setupFee ?? data._methodRecord?.setupCharge ?? 0),
        positionTotal: Number(data.pricing?.positionTotal ?? posTotal),
      },
    });
    toast.success("Customization added successfully!");
  }, []);

  const quoteSelection = useMemo(() => {
    const variants = colorVariants?.sizesWithStock || [];
    const selectedEntry = Object.entries(sizeQuantities || {}).find(([, q]) => Number(q) > 0);
    if (selectedEntry) {
      const selectedVariant = variants.find((v) => String(v.size.id) === String(selectedEntry[0]));
      return {
        variant: selectedVariant || variants[0] || null,
        selectedQty: Number(selectedEntry[1]) || 1,
      };
    }
    return {
      variant: variants[0] || null,
      selectedQty: 1,
    };
  }, [colorVariants?.sizesWithStock, sizeQuantities]);

  const selectedColorName =
    workwearProduct?.availableColors?.find((c) => c.id === selectedColor)?.name || "";

  const adminPositionTotalForOne = useMemo(() => {
    if (adminCustomizationState?.flow !== "workwear") return 0;
    const positions = adminCustomizationState?.positionsDetail || [];
    return positions.reduce((sum, p) => sum + getPositionPriceForOne(p), 0);
  }, [adminCustomizationState]);

  const getEstimatedUnitPrice = useCallback(
    (quantity = 1) => {
      const baseBreaks =
        singleProduct?.product?.prices?.price_groups?.find((g) => g.base_price)?.base_price
          ?.price_breaks || [];
      if (!baseBreaks.length) return 0;
      const baseProductPrice = getPriceForQuantity(quantity, baseBreaks);
      const sortedPrintBreaks = [...(selectedPrintMethod?.price_breaks || baseBreaks)].sort(
        (a, b) => a.qty - b.qty,
      );
      let selectedBreak = sortedPrintBreaks[0];
      for (let i = 0; i < sortedPrintBreaks.length; i++) {
        if (quantity >= sortedPrintBreaks[i].qty) selectedBreak = sortedPrintBreaks[i];
        else break;
      }
      const variantAdjustment = Number(quoteSelection.variant?.priceAdjustment || 0);
      const methodUnit =
        selectedPrintMethod?.type === "base"
          ? Number(selectedBreak?.price || 0)
          : Number(baseProductPrice) + Number(selectedBreak?.price || 0);
      return methodUnit + variantAdjustment + Number(adminPositionTotalForOne || 0);
    },
    [singleProduct, selectedPrintMethod, quoteSelection.variant?.priceAdjustment, adminPositionTotalForOne],
  );

  const selectedAdminCustomizationForQuote = useMemo(() => {
    if (adminCustomizationState?.flow !== "workwear") return null;
    const method = adminCustomizationState?.methodRecord;
    if (!method?._id) return null;
    return { method };
  }, [adminCustomizationState]);

  const selectedPositionForQuote = useMemo(() => {
    if (adminCustomizationState?.flow !== "workwear") return null;
    return (adminCustomizationState?.positionsDetail || [])[0] || null;
  }, [adminCustomizationState]);

  const openExpressQuote = useCallback(() => {
    setQuoteQuantity(Math.max(1, quoteSelection.selectedQty || 1));
    setShowQuoteForm({ state: true, from: "quoteButton" });
  }, [quoteSelection.selectedQty]);

  const handleQuoteChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setQuoteFormData((prev) => ({ ...prev, phone: value.replace(/\D/g, "").slice(0, 10) }));
      return;
    }
    setQuoteFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuoteDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingQuoteFile(true);
  };
  const handleQuoteDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDraggingQuoteFile(false);
  };
  const handleQuoteDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleQuoteDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingQuoteFile(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    setQuoteFile(file);
    setQuoteFilePreview(URL.createObjectURL(file));
  };
  const handleQuoteFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQuoteFile(file);
    setQuoteFilePreview(URL.createObjectURL(file));
  };
  const handleQuoteDivClick = () => {
    document.getElementById("fileUpload2")?.click();
  };

  const handleExpressQuoteSubmit = async () => {
    try {
      setQuoteLoading(true);
      if (!quoteFormData.name || !quoteFormData.email || !quoteFormData.phone || !quoteFormData.delivery) {
        toast.error("Please fill in all required fields");
        return;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(quoteFormData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }
      const unit = getEstimatedUnitPrice(quoteQuantity);
      const total = unit * quoteQuantity;
      const fd = new FormData();
      fd.append("name", quoteFormData.name);
      fd.append("email", quoteFormData.email);
      fd.append("phone", quoteFormData.phone);
      fd.append("delivery", quoteFormData.delivery);
      fd.append("comment", quoteFormData.comment || "");
      fd.append("product", singleProduct?.product?.name || workwearProduct?.name || "");
      fd.append("productId", String(singleProduct?.meta?.id || ""));
      fd.append("price", Number(unit.toFixed(2)));
      fd.append("quantity", Number(quoteQuantity));
      fd.append("totalPrice", Number(total.toFixed(2)));
      fd.append("printMethod", selectedPrintMethod?.description || selectedPrintMethod?.promodata_decoration || "");
      fd.append("printMethodKey", selectedPrintMethod?.key || "");
      fd.append("setupFee", Number(((selectedPrintMethod?.setup ?? 0) * 1.5).toFixed(2)));
      fd.append("freightFee", Number((freightFee || 0).toFixed(2)));
      fd.append("color", selectedColorName || "");
      fd.append("size", quoteSelection.variant?.size?.name || "");
      fd.append("logoColor", "1 Colour Print");
      fd.append("description", singleProduct?.product?.description || "");
      if (quoteFile) fd.append("file", quoteFile);

      await axios.post(`${backendUrl}/api/checkout/quote`, fd);
      toast.success("Quote sent successfully");
      setShowQuoteForm({ state: false, from: "" });
      setQuoteFile(null);
      setQuoteFilePreview(null);
      setQuoteFormData({ name: "", email: "", phone: "", delivery: "", comment: "" });
      setNotRobot(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send quote request");
    } finally {
      setQuoteLoading(false);
    }
  };

  const buildAdminCustomizationPayload = async () => {
    const state = adminCustomizationState;
    if (!state) return null;

    if (state.flow === "workwear") {
      const d = state.customizationData;
      const method = state.methodRecord;
      const positions = state.positionsDetail || [];
      const primary = positions[0];
      const totalPosPrice = positions.reduce((sum, p) => sum + getPositionPriceForOne(p), 0);

      let customizationFileData = null;
      if (d?.content?.type === "IMAGE" && d.content.imageUrl && !d.content.addLogoLater) {
        const url = d.content.imageUrl;
        customizationFileData = {
          preview: url,
          name: d.content.fileName || "logo",
          type: "image/*",
        };
        if (method?._id) {
          const artworkKey = `sm_artwork_${productId}_${method._id}`;
          try {
            localStorage.setItem(artworkKey, JSON.stringify(customizationFileData));
          } catch (storageErr) {
            console.warn("Could not store artwork in localStorage:", storageErr);
          }
        }
      }

      if (!method?._id) return null;

      return {
        methodId: method._id,
        applicationMethod: method.applicationMethod,
        applicationType: method.applicationType,
        setupCharge: method.setupCharge,
        position: primary
          ? {
              positionId: primary._id,
              positionName: positions.map((p) => p.positionName).filter(Boolean).join(", "),
              priceAdjustment: totalPosPrice,
              pricePerApplication: totalPosPrice,
            }
          : null,
        customizationFile: customizationFileData,
      };
    }

    const selectedAdminCustomization = state.selectedAdminCustomization;
    const selectedPosition = state.selectedPosition;
    const customizationFile = state.customizationFile;

    if (!selectedAdminCustomization) return null;

    let customizationFileData = null;
    if (customizationFile) {
      try {
        const base64Result = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(customizationFile);
        });
        customizationFileData = {
          preview: base64Result,
          name: customizationFile.name,
          type: customizationFile.type,
        };
        const artworkKey = `sm_artwork_${productId}_${selectedAdminCustomization.method._id}`;
        try {
          localStorage.setItem(artworkKey, JSON.stringify(customizationFileData));
        } catch (storageErr) {
          console.warn("Could not store artwork in localStorage:", storageErr);
        }
      } catch (err) {
        console.error("Error converting customization file:", err);
      }
    }

    return {
      methodId: selectedAdminCustomization.method._id,
      applicationMethod: selectedAdminCustomization.method.applicationMethod,
      applicationType: selectedAdminCustomization.method.applicationType,
      setupCharge: selectedAdminCustomization.method.setupCharge,
      position: selectedPosition
        ? {
            positionId: selectedPosition._id,
            positionName: selectedPosition.positionName,
            priceAdjustment: Number(
              selectedPosition.pricePerApplication ?? selectedPosition.priceAdjustment ?? 0,
            ),
            pricePerApplication: Number(
              selectedPosition.pricePerApplication ?? selectedPosition.priceAdjustment ?? 0,
            ),
          }
        : null,
      customizationFile: customizationFileData,
    };
  };

  const handleAddToCart = async () => {
    if (!singleProduct || !workwearProduct || !colorVariants) return;

    const baseBreaks =
      singleProduct?.product?.prices?.price_groups?.find((g) => g.base_price)?.base_price
        ?.price_breaks || [];

    if (!baseBreaks.length) {
      toast.error("Pricing not available for this product.");
      return;
    }

    const items = Object.entries(sizeQuantities).filter(([, q]) => q > 0);
    if (!items.length) {
      toast.error("Select at least one size quantity.");
      return;
    }

    setAddingToCart(true);
    try {
      const adminPayload = await buildAdminCustomizationPayload();
      const deliveryDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        return formatDeliveryDate(d);
      })();

      const setupFee = (selectedPrintMethod?.setup ?? 0) * 1.5;
      const product = singleProduct.product || {};
      const colorName =
        workwearProduct.availableColors.find((c) => c.id === selectedColor)?.name || "";

      const sortedPrintBreaks = [...(selectedPrintMethod?.price_breaks || baseBreaks)].sort(
        (a, b) => a.qty - b.qty,
      );

      for (const [sizeId, qty] of items) {
        if (qty <= 0) continue;
        const variant = colorVariants.sizesWithStock.find(
          (v) => v.size.id === parseInt(sizeId, 10),
        );
        if (!variant) continue;

        let selectedBreak = sortedPrintBreaks[0];
        for (let i = 0; i < sortedPrintBreaks.length; i++) {
          if (qty >= sortedPrintBreaks[i].qty) selectedBreak = sortedPrintBreaks[i];
          else break;
        }

        const baseProductPrice = getPriceForQuantity(qty, baseBreaks);
        let lineUnitPrice;
        if (selectedPrintMethod?.type === "base") {
          lineUnitPrice = selectedBreak.price;
        } else {
          lineUnitPrice = baseProductPrice + selectedBreak.price;
        }
        lineUnitPrice += Number(variant.priceAdjustment || 0);
        if (adminPayload?.position) {
          lineUnitPrice += Number(
            adminPayload.position.pricePerApplication || adminPayload.position.priceAdjustment || 0,
          );
        }

        const imageUrl =
          colorVariants.images[0]?.url || workwearProduct.primaryImage?.imageUrl || normalizedImages[0] || "";

        const printLabel =
          artworkSource === "supermerch"
            ? [adminPayload?.applicationMethod, adminPayload?.position?.positionName]
                .filter(Boolean)
                .join(" - ") ||
              selectedPrintMethod?.promodata_decoration ||
              selectedPrintMethod?.description ||
              ""
            : selectedPrintMethod?.promodata_decoration || selectedPrintMethod?.description || "";

        dispatch(
          addToCart({
            id: productId,
            name: product.name,
            basePrices: baseBreaks,
            image: imageUrl,
            price: lineUnitPrice,
            totalPrice: lineUnitPrice * qty,
            discountPct,
            clearanceInfo: singleProduct?.clearanceInfo || null,
            size: variant.size.name,
            code: product.code,
            color: colorName,
            quantity: qty,
            print: printLabel,
            logoColor: "1 Colour Print",
            freightFee,
            setupFee,
            dragdrop: null,
            deliveryDate,
            priceBreaks: selectedPrintMethod?.price_breaks || [],
            printMethodKey: selectedPrintMethod?.key || "",
            userEmail,
            supplierName: singleProduct?.overview?.supplier,
            sample: false,
            sku_number: singleProduct?.overview?.sku_number,
            adminCustomization: adminPayload,
            addLogoLater: resolveAddLogoLaterFromCustomizationData(
              adminCustomizationState?.customizationData,
            ),
          }),
        );
      }

      toast.success("Added to cart");
      setSizeQuantities({});
      setCustomization(null);
      setAdminCustomizationState(null);
    } catch (e) {
      console.error(e);
      toast.error("Could not add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuySample = async () => {
    if (!singleProduct || !workwearProduct) return;
    const sampleVariant = quoteSelection.variant;
    if (!sampleVariant) {
      toast.error("Please select a colour/size first");
      return;
    }
    const adminPayload = await buildAdminCustomizationPayload();
    const unit = getEstimatedUnitPrice(1);
    if (unit <= 0) {
      toast.error("Pricing not available for this product.");
      return;
    }
    const deliveryDate = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return formatDeliveryDate(d);
    })();
    const imageUrl =
      colorVariants?.images?.[0]?.url || workwearProduct.primaryImage?.imageUrl || "";
    const printLabel =
      artworkSource === "supermerch"
        ? [adminPayload?.applicationMethod, adminPayload?.position?.positionName]
            .filter(Boolean)
            .join(" - ") ||
          selectedPrintMethod?.promodata_decoration ||
          selectedPrintMethod?.description ||
          ""
        : selectedPrintMethod?.promodata_decoration || selectedPrintMethod?.description || "";

    dispatch(
      addToCart({
        id: productId,
        name: singleProduct?.product?.name || workwearProduct.name,
        image: imageUrl,
        basePrices:
          singleProduct?.product?.prices?.price_groups?.find((g) => g.base_price)?.base_price
            ?.price_breaks || [],
        price: unit,
        totalPrice: unit,
        discountPct,
        clearanceInfo: singleProduct?.clearanceInfo || null,
        size: sampleVariant?.size?.name || "",
        code: singleProduct?.product?.code,
        color: selectedColorName,
        quantity: 1,
        print: printLabel,
        logoColor: "1 Colour Print",
        setupFee: 0,
        freightFee,
        deliveryDate,
        priceBreaks: selectedPrintMethod?.price_breaks || [],
        printMethodKey: selectedPrintMethod?.key || "",
        userEmail,
        supplierName: singleProduct?.overview?.supplier,
        sample: true,
        sku_number: singleProduct?.overview?.sku_number,
        adminCustomization: adminPayload,
        addLogoLater: resolveAddLogoLaterFromCustomizationData(
          adminCustomizationState?.customizationData,
        ),
      }),
    );
    navigate("/cart");
  };

  if (!singleProduct || !workwearProduct) {
    return (
      <div className="py-8 min-h-[50vh] flex items-center justify-center px-4">
        <p className="text-gray-600">Product data is not available.</p>
      </div>
    );
  }

  const productForInfo = {
    ...workwearProduct,
    priceTiers: workwearProduct.priceTiers,
    colors: workwearProduct.availableColors,
    badge: workwearProduct.isNew ? "New" : workwearProduct.isClearance ? "Sale" : workwearProduct.isFeatured ? "Featured" : null,
    rating: workwearProduct.rating || 0,
    reviews: workwearProduct.reviews || 0,
    brand: workwearProduct.brand?.name,
    brandSlug: workwearProduct.brand?.slug,
    brandLogo: workwearProduct.brand?.logo,
    sizeGuide: workwearProduct.brand?.sizeGuide,
    sku: workwearProduct.productCode,
    material: (workwearProduct.materials || []).map((m) => m.name).join(", "),
    stockLevel: workwearProduct.totalStock,
    inStock: workwearProduct.inStock,
    isCustomizable: true,
  };

  return (
    <>
      <SeoHelmet
        entityType="product"
        entityId={productId}
        fallback={{
          title: `${workwearProduct.name} | Super Merch`,
          description: singleProduct?.product?.description_plain || workwearProduct.name,
          ogImage: workwearProduct.primaryImage?.imageUrl,
        }}
      />
      <div className="py-2 sm:py-4 md:py-6 bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] min-h-screen">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-4 sm:gap-6 lg:gap-12 mb-6 sm:mb-8">
            <div className="flex flex-col min-h-0 lg:min-h-full">
              <div className="lg:sticky lg:top-20 lg:z-10 w-full">
                <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg border-2 border-[#009688]/20 hover:border-[#009688]/40 transition-colors">
                  <ProductGallery
                    images={colorVariants?.images.map((img) => img.url) || allProductImages}
                    productName={workwearProduct.name}
                    selectedColorName={workwearProduct.availableColors.find((c) => c.id === selectedColor)?.name}
                    isLoading={false}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-[#009688]/10 min-w-0">
              <ProductInfo
                uploadsBaseUrl={backendUrl || ""}
                product={productForInfo}
                selectedColor={selectedColor}
                colorVariants={colorVariants}
                loadingVariants={false}
                sizeQuantities={sizeQuantities}
                onColorChange={setSelectedColor}
                onSizeQuantitiesChange={setSizeQuantities}
                onAddToCart={handleAddToCart}
                onCustomize={() => setShowCustomizationModal(true)}
                onViewPricing={() => setShowPricingModal(true)}
                onGetExpressQuote={openExpressQuote}
                onBuySample={handleBuySample}
                customization={customization}
                addingToCart={addingToCart}
                deliveryOptions={[]}
                loadingDeliveryOptions={false}
                deliveryEstimate={null}
                loadingDeliveryEstimate={false}
                isInWishlist={isFavourited}
                wishlistLoading={false}
                onToggleWishlist={handleToggleWishlist}
                onHeadingClick={handleHeadingClick}
              />
            </div>
          </div>

          <div ref={tabsSectionRef} className="mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#009688]/10 overflow-hidden">
              <ClothingHeadwearSupermerchTabs
                single_product={singleProduct}
                availablePriceGroups={availablePriceGroups}
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-[#f0fdfa] to-[#e0f2f1] rounded-xl sm:rounded-2xl shadow-lg border-2 border-[#009688]/15 p-3 sm:p-5">
              <RecommendationsStrip
                title="Recommended for you"
                products={recommendations}
                loading={recommendationsLoading}
                maxItems={8}
                className="mt-0"
              />
            </div>
          </div>
        </div>

        <StickyAddToCart
          product={workwearProduct}
          selectedColor={selectedColor}
          colorVariants={colorVariants}
          sizeQuantities={sizeQuantities}
          pricingTiers={workwearProduct.priceTiers || []}
          onAddToCart={handleAddToCart}
          addingToCart={addingToCart}
        />

        <WorkwearCustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          backendUrl={backendUrl || ""}
          productId={productId}
          productName={workwearProduct.name}
          productImage={
            colorVariants?.images?.[0]?.url || workwearProduct.primaryImage?.imageUrl || ""
          }
          quantity={Math.max(
            1,
            Object.values(sizeQuantities).reduce((sum, q) => sum + (Number(q) || 0), 0),
          )}
          onComplete={(data) => {
            handleCustomizationComplete(data);
            setShowCustomizationModal(false);
          }}
        />

        <VolumePricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          productName={workwearProduct.name}
          priceTiers={workwearProduct.priceTiers || []}
        />
        {showQuoteForm?.state && (
          <QuoteFormModal
            setShowQuoteForm={setShowQuoteForm}
            product={singleProduct?.product}
            selectedColor={selectedColorName}
            selectedSize={quoteSelection.variant?.size?.name || ""}
            selectedPrintMethod={selectedPrintMethod}
            selectedAdminCustomization={selectedAdminCustomizationForQuote}
            selectedPosition={selectedPositionForQuote}
            currentQuantity={quoteQuantity}
            discountedUnitPrice={getEstimatedUnitPrice(quoteQuantity)}
            currentPrice={getEstimatedUnitPrice(quoteQuantity) * quoteQuantity}
            formData={quoteFormData}
            handleChange={handleQuoteChange}
            handleDragEnter2={handleQuoteDragEnter}
            handleDragLeave2={handleQuoteDragLeave}
            handleDragOver2={handleQuoteDragOver}
            handleDrop2={handleQuoteDrop}
            handleFileChange2={handleQuoteFileChange}
            handleDivClick2={handleQuoteDivClick}
            notRobot={notRobot}
            onSubmitHandler={handleExpressQuoteSubmit}
            quoteLoading={quoteLoading}
            selectedFile2={quoteFile}
            setSelectedFile2={setQuoteFile}
            previewImage2={quoteFilePreview}
            isDragging2={isDraggingQuoteFile}
            setPreviewImage2={setQuoteFilePreview}
            setNotRobot={setNotRobot}
            showQuoteForm={showQuoteForm}
            setCurrentQuantity={setQuoteQuantity}
          />
        )}
      </div>

      {/* Supplier Information Modal (Shift + A + click product name) */}
      <AnimatePresence>
        {showSupplierModal && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSupplierModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#009688] to-blue-600 px-6 py-5 rounded-t-2xl relative">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setShowSupplierModal(false)}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Close modal"
                  >
                    <IoClose className="w-6 h-6" />
                  </button>
                </div>
                <h3 className="text-2xl font-bold text-white pr-10">Supplier Information</h3>
                <p className="text-white/90 text-sm mt-1">Product supplier details</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Supplier Name */}
                {singleProduct?.overview?.supplier && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Supplier Name</h4>
                    <p className="text-lg font-medium text-gray-900">{singleProduct.overview.supplier}</p>
                  </div>
                )}

                {/* SKU Number */}
                {singleProduct?.overview?.sku_number && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">SKU Number</h4>
                    <p className="text-lg font-medium text-gray-900">{singleProduct.overview.sku_number}</p>
                  </div>
                )}

                {/* Product Name */}
                {workwearProduct?.name && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Product Name</h4>
                    <p className="text-lg font-medium text-gray-900">{workwearProduct.name}</p>
                  </div>
                )}

                {/* Product Code */}
                {singleProduct?.product?.code && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Product Code</h4>
                    <p className="text-lg font-medium text-gray-900">{singleProduct.product.code}</p>
                  </div>
                )}

                {/* Supplier Category */}
                {singleProduct?.product?.categorisation?.supplier_category && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Supplier Category</h4>
                    <p className="text-lg font-medium text-gray-900">{singleProduct.product.categorisation.supplier_category}</p>
                  </div>
                )}

                {!singleProduct?.overview?.supplier && !singleProduct?.overview?.sku_number && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No supplier information available for this product.</p>
                  </div>
                )}

                {/* Tip */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Tip:</span> Hold{" "}
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">Shift + A</kbd>{" "}
                    and click on the product name to view supplier information.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex justify-end">
                <button
                  onClick={() => setShowSupplierModal(false)}
                  className="px-6 py-2 bg-[#009688] hover:bg-[#00796B] text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
