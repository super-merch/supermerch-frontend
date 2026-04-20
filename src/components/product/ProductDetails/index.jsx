import LoadingOverlay from "@/components/Common/LoadingOverlay";
import RecommendationsStrip from "@/components/Common/RecommendationsStrip";
import SeoHelmet from "@/components/Common/SeoHelmet";
import {
  getProductPrice,
  isProductCategory,
  findNearestColor,
  getProductCategory,
} from "@/utils/utils";
import axios, { all } from "axios";
import { CheckCheck } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { IoMdArrowForward } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import banner from "@/assets/cuo.jpg";
import { AppContext } from "../../../context/AppContext";
import { ProductsContext } from "../../../context/ProductsContext";
import { AuthContext } from "../../../context/AuthContext";
import { addToCart } from "../../../redux/slices/cartSlice";
import {
  addToFavourite,
  removeFromFavourite,
} from "../../../redux/slices/favouriteSlice";
import { CiHeart } from "react-icons/ci";
import { IoIosHeart } from "react-icons/io";
import ProductNotFound from "../ProductNotFound";
import QuoteFormModal from "../QuoteFormModal";
import Services from "../Services";
import SizeGuideModal from "../SizeGuideModal";
import DecorationTab from "./DecorationTab";
import FeaturesTab from "./FeaturesTab";
import ImageGalleryModal from "./ImageGalleryModal";
import PricingTab from "./PricingTab";
import ShippingTab from "./ShippingTab";
import noimage from "/noimage.png";
import LeadTimeTab from "./LeadTime";
import { Tooltip } from "@mui/material";
import useRecommendations from "@/hooks/useRecommendations";

const ProductDetails = () => {
  const [userEmail, setUserEmail] = useState(null);
  const { id: routeIdentifier } = useParams();
  const [searchParams] = useSearchParams();
  const encodedId = searchParams.get("ref");
  const location = useLocation();
  const stateProductId = location?.state?.productId;
  const id = routeIdentifier
    ? String(routeIdentifier)
    : encodedId
      ? atob(encodedId)
      : stateProductId
        ? String(stateProductId)
        : null;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);

  const { token, userData } = useContext(AuthContext);
  const { error, totalDiscount, totalMargin } = useContext(ProductsContext);
  const { backendUrl, shippingCharges: freightFee } = useContext(AppContext);
  const [single_product, setSingle_Product] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorFetching, setErrorFetching] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState("pricing");

  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");

  const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  const pickDefaultSize = (list = []) => {
    const cleaned = list.map((s) => String(s).trim()).filter(Boolean);
    const nonFree = cleaned.filter(
      (s) => !["FRE", "FREE", "ONE SIZE"].includes(s.toUpperCase()),
    );
    return nonFree[0] || cleaned[0] || "";
  };

  const extractSizesFromProduct = (productData) => {
    const details = productData?.product?.details || [];
    const detailString =
      details.find((d) =>
        ["sizing", "sizes", "size", "product sizes"].includes(
          String(d?.name || "").toLowerCase(),
        ),
      )?.detail || "";

    const headerSizes = String(detailString)
      .split("\n")[0]
      .split(/[|,;:]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (headerSizes.length > 0) {
      return headerSizes;
    }

    const description = productData?.product?.description || "";
    const sizesMatch = description.match(/Sizes:\s*([^\n]+)/i);
    if (!sizesMatch) return [];

    const sizesString = sizesMatch[1].trim();
    if (sizesString.includes(" - ")) {
      const [start, end] = sizesString.split(" - ").map((s) => s.trim());
      const startIndex = SIZE_ORDER.indexOf(start);
      const endIndex = SIZE_ORDER.indexOf(end);
      if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
        return SIZE_ORDER.slice(startIndex, endIndex + 1);
      }
      return [sizesString];
    }

    return sizesString
      .split(/[|,;:]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };
  useEffect(() => {
    if (!id) {
      setLoading(false);
      setErrorFetching(true);
      return;
    }
    const fetchSingleProduct = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/single-product/${id}`,
        );
        if (data) {
          setSingle_Product(data.data, "fetchSingleProduct");
          setTimeout(() => {
            setLoading(false);
          }, 200);
          setErrorFetching(false);
        }

        const parsedSizes = extractSizesFromProduct(data.data);
        setSizes(parsedSizes);
        setSelectedSize((prev) =>
          parsedSizes.includes(prev) ? prev : pickDefaultSize(parsedSizes),
        );

        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        setLoading(false);
        setErrorFetching(true);
      }
    };
    const email = userData?.email || "guest@gmail.com";
    setUserEmail(email);
    fetchSingleProduct();
  }, [id]);

  const product = single_product?.product || {};
  const productId = single_product?.meta?.id || "";
  const productTags = Array.isArray(single_product?.productTags)
    ? single_product.productTags
    : [];

  const resolveImageUrl = (image) => {
    if (!image) return "";
    if (typeof image === "string") return image;
    return image.url || image.original || image.large_square || image.medium_square || image.small_square || "";
  };

  const normalizedImages = useMemo(() => {
    const primary = Array.isArray(product?.images)
      ? product.images.map(resolveImageUrl).filter(Boolean)
      : [];

    const fallback = Array.isArray(product?.image_data)
      ? product.image_data
        .map((img) => resolveImageUrl(img?.original || img))
        .filter(Boolean)
      : [];

    const colorImages = Array.isArray(product?.colours?.list)
      ? product.colours.list
        .map((colorObj) => resolveImageUrl(colorObj?.image))
        .filter(Boolean)
      : [];

    const heroImage = resolveImageUrl(single_product?.overview?.hero_image);

    return Array.from(new Set([
      ...primary,
      ...fallback,
      ...colorImages,
      ...(heroImage ? [heroImage] : []),
    ]));
  }, [product?.images, product?.image_data, product?.colours?.list, single_product?.overview?.hero_image]);

  const { recommendations: relatedProducts, recommendationsLoading } =
    useRecommendations({
      backendUrl,
      type: "product",
      productId,
      userId: userData?._id,
      limit: 8,
      enabled: Boolean(productId),
    });

  const toProductUrl = (pid, name) => {
    const slug = String(name || "product")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `/product/${slug}`;
  };

  // Fetch effective pricing for direct URL navigation (when product not in listing cache)
  const [localPricing, setLocalPricing] = useState(null);
  useEffect(() => {
    if (!productId) return;
    if (totalDiscount?.[productId] !== undefined || totalMargin?.[productId] !== undefined) return;
    axios
      .get(`${backendUrl}/api/add-discount/effective/${productId}`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setLocalPricing(res.data.data);
        }
      })
      .catch(() => {});
  }, [productId]);

  // Track recently viewed product (server-side)
  useEffect(() => {
    if (!productId || !single_product) return;
    const trackView = async () => {
      try {
        let sessionId = localStorage.getItem("rv_session");
        if (!sessionId) {
          sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
          localStorage.setItem("rv_session", sessionId);
        }
        await axios.post(`${backendUrl}/api/recently-viewed/track`, {
          userId: userData?._id || null,
          sessionId,
          productId: String(productId),
          productName: product?.name || "",
          productImage: normalizedImages[0] || "",
          productPrice: 0,
          supplierName: single_product?.meta?.supplier_name || "",
        });
      } catch {
        // Silent — tracking failure shouldn't affect UX
      }
    };
    trackView();
  }, [productId, normalizedImages]);

  // Fetch admin customization options for this product
  useEffect(() => {
    if (!productId) return;
    const fetchCustomizations = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/product-customizations/${productId}`,
        );
        if (data.success && data.data?.length > 0) {
          setAdminCustomizations(data.data);
        }
      } catch {
        // Silently fail — admin customizations are optional
      }
    };
    fetchCustomizations();
  }, [productId, backendUrl]);

  useEffect(() => {
    if (!productId) return;

    let isCancelled = false;

    const fetchStockLevels = async () => {
      setIsStockChecking(true);
      setStockCheckData(null);

      try {
        const { data } = await axios.post(
          `${backendUrl}/api/products/${productId}/check-stock`,
        );

        if (!isCancelled && data?.success) {
          setStockCheckData(data.data ?? null);
        }
      } catch {
        // Best-effort only: inconsistent or missing stock data must not block ordering.
      } finally {
        if (!isCancelled) {
          setIsStockChecking(false);
        }
      }
    };

    fetchStockLevels();

    return () => {
      isCancelled = true;
    };
  }, [backendUrl, productId]);

  // Live stock levels from PromoData
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFile2, setSelectedFile2] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [previewImage2, setPreviewImage2] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [showQuoteForm, setShowQuoteForm] = useState({
    state: false,
    from: "",
  });
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isAPressed, setIsAPressed] = useState(false);
  const aKeyTimeoutRef = useRef(null);
  const mobileSwiperRef = useRef(null);

  // Drag and drop states
  const [isDragging2, setIsDragging2] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    delivery: "",
    comment: "",
    // file: selectedFile2,
  });
  const [activeImage, setActiveImage] = useState(
    noimage,
  );
  const [logoColor, setLogoColor] = useState("1 Colour Print");

  const [selectedPrintMethod, setSelectedPrintMethod] = useState(null);
  const [selectedLeadTimeAddition, setSelectedLeadTimeAddition] =
    useState(null);
  const [availablePriceGroups, setAvailablePriceGroups] = useState([]);
  // Admin-defined customization options
  const [adminCustomizations, setAdminCustomizations] = useState([]);
  const [selectedAdminCustomization, setSelectedAdminCustomization] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [customizationFile, setCustomizationFile] = useState(null);
  const [imageModel, setImageModel] = useState(false);
  const [stockCheckData, setStockCheckData] = useState(null);
  const [isStockChecking, setIsStockChecking] = useState(false);

  // const [currentPrice, setCurrentPrice] = useState(0);
  const priceGroups = product?.prices?.price_groups || [];
  const basePrice = priceGroups.find((group) => group?.base_price) || {};
  const priceBreaks = basePrice.base_price?.price_breaks || [];
  const originalPrice =
    priceBreaks.length > 0 && priceBreaks[0]?.price !== undefined
      ? parseFloat(priceBreaks[0].price)
      : 0;

  // Sort price breaks by quantity (just in case they're not in order)
  const sortedPriceBreaks = [...priceBreaks].sort((a, b) => a.qty - b.qty);

  // Find the price for a given quantity
  const getPriceForQuantity = (quantity) => {
    // Start with the highest quantity price and work backwards
    for (let i = sortedPriceBreaks.length - 1; i >= 0; i--) {
      if (quantity >= sortedPriceBreaks[i].qty) {
        return sortedPriceBreaks[i].price;
      }
    }
    // If quantity is less than the smallest break, use the smallest break price
    return sortedPriceBreaks[0]?.price || 0;
  };

  const [currentQuantity, setCurrentQuantity] = useState(
    sortedPriceBreaks[0]?.qty || 50,
  );
  const [unitPrice, setUnitPrice] = useState(sortedPriceBreaks[0]?.price || 0);
  const [currentPrice, setCurrentPrice] = useState(
    sortedPriceBreaks[0]
      ? sortedPriceBreaks[0].price * sortedPriceBreaks[0].qty
      : 0,
  );

  const pricingSummary = single_product?.pricingSummary || null;

  const discountPct =
    pricingSummary?.discountPercent ?? totalDiscount?.[productId] ?? localPricing?.discount ?? 0;

  const parsePromodataStockQuantity = (payload) => {
    const parseNumber = (value) => {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }

      if (typeof value === "string") {
        const trimmed = value.trim();
        if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
          return Number(trimmed);
        }
      }

      return null;
    };

    const parseItem = (item) => {
      if (Array.isArray(item)) {
        return parseNumber(item[1]);
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const candidateKeys = [
        "stockQty",
        "quantity",
        "qty",
        "liveStock",
        "availableStock",
        "available",
        "count",
      ];

      for (const key of candidateKeys) {
        const parsed = parseNumber(item[key]);
        if (parsed !== null) {
          return parsed;
        }
      }

      return null;
    };

    const parseCollection = (collection) => {
      if (!Array.isArray(collection)) {
        return null;
      }

      let total = 0;
      let hasParsedValue = false;

      for (const item of collection) {
        const parsed = parseItem(item);
        if (parsed === null) {
          continue;
        }
        hasParsedValue = true;
        total += parsed;
      }

      return hasParsedValue ? total : null;
    };

    if (!payload) {
      return null;
    }

    if (Array.isArray(payload)) {
      return parseCollection(payload);
    }

    if (typeof payload !== "object") {
      return parseNumber(payload);
    }

    const arrayCandidates = [
      payload.stock,
      payload.data?.stock,
      payload.liveStockLevel,
      payload.data?.liveStockLevel,
      payload.stockLevels,
      payload.data?.stockLevels,
      payload.items,
      payload.data?.items,
    ];

    for (const candidate of arrayCandidates) {
      const parsedCollection = parseCollection(candidate);
      if (parsedCollection !== null) {
        return parsedCollection;
      }
    }

    const directCandidates = [
      payload.stockQty,
      payload.quantity,
      payload.qty,
      payload.liveStock,
      payload.availableStock,
      payload.available,
      payload.count,
      payload.data?.stockQty,
      payload.data?.quantity,
      payload.data?.qty,
      payload.data?.liveStock,
      payload.data?.availableStock,
      payload.data?.available,
      payload.data?.count,
    ];

    for (const candidate of directCandidates) {
      const parsed = parseNumber(candidate);
      if (parsed !== null) {
        return parsed;
      }
    }

    return null;
  };

  const resolvedStockQuantity = useMemo(
    () => parsePromodataStockQuantity(stockCheckData),
    [stockCheckData],
  );
  const hasReliableStockQuantity = resolvedStockQuantity !== null;
  const firstPriceBreakQuantity = sortedPriceBreaks[0]?.qty || 0;
  const isQuoteLowStock =
    hasReliableStockQuantity && currentQuantity > resolvedStockQuantity;
  const isSampleLowStock =
    hasReliableStockQuantity && resolvedStockQuantity < 1;
  const isLowMoqLowStock =
    hasReliableStockQuantity && firstPriceBreakQuantity > resolvedStockQuantity;

  useEffect(() => {
    if (priceGroups.length > 0 || (product?.prices?.addons || []).length > 0) {
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

      const standaloneAddons = (product?.prices?.addons || []).map((add) => ({
        ...add,
        type: "addition",
        description: add.description,
      }));

      const additionGroups = [...groupedAdditions, ...standaloneAddons].filter(Boolean);
      const dedupedAdditions = additionGroups.filter(
        (item, index, self) =>
          index === self.findIndex((other) => (other.key || other.description) === (item.key || item.description)),
      );

      const allGroups = [baseGroup, ...dedupedAdditions].filter(Boolean);
      setAvailablePriceGroups(allGroups);
      const initialMethod = baseGroup || allGroups[0] || null;
      setSelectedPrintMethod(initialMethod);
      // Initialize quantity and price based on first price break
      if (initialMethod?.price_breaks?.length > 0) {
        const firstBreak = initialMethod.price_breaks[0];
        setCurrentQuantity(firstBreak.qty);
        setUnitPrice(firstBreak.price);
        setCurrentPrice(firstBreak.price * firstBreak.qty);
      }
    }
  }, [priceGroups, product?.prices?.addons, single_product]);

  useEffect(() => {
    if (product) {
      const hasColors = product?.colours?.list?.length > 0;

      if (hasColors) {
        const firstColorObj = product.colours.list[0];
        const firstColorName = firstColorObj.name || firstColorObj.colours.join("/");
        setSelectedColor(firstColorName);
        setActiveImage(
          firstColorObj.image || normalizedImages[0] || noimage,
        );
      } else {
        // Product has no colors - use first product image
        setActiveImage(normalizedImages[0] || noimage);
      }
    }
  }, [product, normalizedImages]);

  // SEO meta is now handled by <SeoHelmet> in JSX — falls back to product name/description

  // Keyboard event listeners for Shift + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Shift") {
        setIsShiftPressed(true);
      }
      if (e.key.toLowerCase() === "a" && e.shiftKey) {
        setIsAPressed(true);
        // Clear any existing timeout
        if (aKeyTimeoutRef.current) {
          clearTimeout(aKeyTimeoutRef.current);
        }
        // Set A key to false after 2 seconds if not clicked
        aKeyTimeoutRef.current = setTimeout(() => {
          setIsAPressed(false);
        }, 2000);
      }
      // Close supplier modal on Escape key
      if (e.key === "Escape" && showSupplierModal) {
        setShowSupplierModal(false);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "Shift") {
        setIsShiftPressed(false);
      }
      // Don't immediately clear A key state - let timeout handle it
      // This allows user to release A while still holding Shift, then click
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (aKeyTimeoutRef.current) {
        clearTimeout(aKeyTimeoutRef.current);
      }
    };
  }, [showSupplierModal]);

  // Handle heading click with Shift + A
  const handleHeadingClick = (e) => {
    // Check if Shift key is being held during the click
    // and if A key was recently pressed (within last 2 seconds)
    const shiftHeld = e.shiftKey || isShiftPressed;

    if (shiftHeld && isAPressed) {
      e.preventDefault();
      e.stopPropagation();
      setShowSupplierModal(true);
      // Reset A key state and clear timeout after triggering
      setIsAPressed(false);
      if (aKeyTimeoutRef.current) {
        clearTimeout(aKeyTimeoutRef.current);
        aKeyTimeoutRef.current = null;
      }
    }
  };

  const isFavourited = favouriteItems?.some(
    (item) => item.meta?.id === single_product?.meta?.id,
  );

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (!single_product) return;
    if (isFavourited) {
      dispatch(removeFromFavourite(single_product, userData?.email));
      toast.success("Removed from favourites");
    } else {
      dispatch(addToFavourite(single_product, userData?.email));
      toast.success("Added to favourites");
    }
  };

  useEffect(() => {
    if (!selectedPrintMethod?.price_breaks?.length) return;

    const sortedBreaks = [...selectedPrintMethod.price_breaks].sort(
      (a, b) => a.qty - b.qty,
    );
    const minQuantity = sortedBreaks[0].qty;

    let selectedBreak = sortedBreaks[0];
    let newActiveIndex = 0;

    if (currentQuantity >= minQuantity) {
      for (let i = 0; i < sortedBreaks.length; i++) {
        if (currentQuantity >= sortedBreaks[i].qty) {
          selectedBreak = sortedBreaks[i];
          newActiveIndex = i;
        } else {
          break;
        }
      }
    }

    setActiveIndex(newActiveIndex);

    // Get the base product price for the current quantity
    const baseProductPrice = getPriceForQuantity(currentQuantity);

    // Calculate the final unit price
    let finalUnitPrice;
    if (selectedPrintMethod.type === "base") {
      // If it's the base price group, use the decoration price directly
      finalUnitPrice = selectedBreak.price;
    } else {
      // If it's an addition (decoration), add decoration price to base product price
      finalUnitPrice = baseProductPrice + selectedBreak.price;
    }

    setUnitPrice(finalUnitPrice);

    // API pricing already includes margin and discount adjustments.
    const total = finalUnitPrice * currentQuantity;

    setCurrentPrice(total);
  }, [
    currentQuantity,
    selectedPrintMethod,
    freightFee,
    productId,
    discountPct,
    sortedPriceBreaks,
    single_product,
  ]);

  const handleColorClick = (color) => {
    setSelectedColor(color);
    const colorImg = colorImages[color] || noimage;
    setActiveImage(colorImg);
    if (mobileSwiperRef.current) {
      const idx = normalizedImages.indexOf(colorImg);
      if (idx >= 0) mobileSwiperRef.current.slideTo(idx);
    }
  };

  useEffect(() => {
    if (product) {
      const hasColors = product?.colours?.list?.length > 0;
      if (hasColors) {
        setActiveImage(normalizedImages[0] || noimage); // show first image when component mounts
      } else {
        setActiveImage(normalizedImages[0] || noimage);
      }
    }
  }, [normalizedImages.length]); // Run whenever product image data changes

  const colorImages = useMemo(() => {
    if (!product?.colours?.list) return {};

    return product.colours.list.reduce((acc, colorObj) => {
      const colorName = colorObj.name || colorObj.colours.join("/");
      acc[colorName] = colorObj.image || normalizedImages[0] || noimage;
      // Also map individual color names for backwards compatibility
      colorObj.colours.forEach((color) => {
        if (!acc[color]) acc[color] = colorObj.image || normalizedImages[0] || noimage;
      });
      return acc;
    }, {});
  }, [product, normalizedImages]);

  // Enhanced drag and drop handlers for second upload area (quote form)
  const handleDragEnter2 = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging2(true);
  };

  const handleDragLeave2 = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone completely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging2(false);
    }
  };

  const handleDragOver2 = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop2 = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging2(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      // Check file type
      const allowedTypes = [
        ".ai",
        ".eps",
        ".svg",
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
      ];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();

      if (allowedTypes.includes(fileExtension)) {
        setSelectedFile2(file);
        setPreviewImage2(URL.createObjectURL(file));
      } else {
        toast.error(
          "Please upload a valid file type: AI, EPS, SVG, PDF, JPG, JPEG, PNG",
        );
      }
    }
  };

  const handleFileChange2 = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile2(e.target.files[0]);
      const file = e.target.files[0];
      setPreviewImage2(URL.createObjectURL(file));
    }
  };

  const handleDivClick2 = () => {
    document.getElementById("fileUpload2").click();
  };

  useEffect(() => {
    if (!isNaN(originalPrice) && originalPrice > 0) {
      setCurrentPrice(originalPrice * 50);
    } else {
      setCurrentPrice(0);
    }
  }, [originalPrice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
  };
  const [quoteLoading, setQuoteLoading] = useState(false);
  const onSubmitHandler = async () => {
    try {
      setQuoteLoading(true);
      const formData1 = new FormData();
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error("Please fill in all required fields");
        setQuoteLoading(false);
        return;
      }
      if (!formData.phone || formData.phone.length < 10) {
        toast.error("Please enter a valid phone number");
        setQuoteLoading(false);
        return;
      }
      //phone validation
      const phonePattern = /^\+?[0-9\s-]{10,15}$/; // Adjust pattern as needed
      if (!phonePattern.test(formData.phone)) {
        toast.error("Please enter a valid phone number");
        setQuoteLoading(false);
        return;
      }

      //email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        toast.error("Please enter a valid email address");
        setQuoteLoading(false);
        return;
      }
      if (!formData.delivery) {
        toast.error("Please select a delivery option");
        setQuoteLoading(false);
        return;
      }
      if (formData.comment.length < 10) {
        toast.error("Comment must be at least 10 characters long");
        setQuoteLoading(false);
        return;
      }

      formData1.append("name", formData.name);
      formData1.append("email", formData.email);
      formData1.append("phone", formData.phone);
      formData1.append("delivery", formData.delivery);
      formData1.append("comment", formData.comment);
      formData1.append("product", single_product?.product?.name);
      formData1.append("productId", single_product?.meta?.id);
      // Use the currently selected values
      formData1.append("price", Number(discountedUnitPrice.toFixed(2))); // per unit
      formData1.append("quantity", Number(currentQuantity));
      formData1.append("totalPrice", Number(currentPrice.toFixed(2)));
      formData1.append("printMethod", selectedPrintMethod?.description || "");
      formData1.append("printMethodKey", selectedPrintMethod?.key || "");
      formData1.append("setupFee", Number(setupFee.toFixed(2)));
      formData1.append("freightFee", Number(freightFee.toFixed(2)));
      formData1.append("color", selectedColor || "");
      formData1.append("size", selectedSize || "");
      formData1.append("logoColor", logoColor || "");
      if (selectedAdminCustomization) {
        formData1.append("customizationMethod", selectedAdminCustomization.method.applicationMethod);
        formData1.append("customizationType", selectedAdminCustomization.method.applicationType);
        if (selectedPosition) {
          formData1.append("customizationPosition", selectedPosition.positionName);
        }
      }
      formData1.append("description", single_product?.product?.description);

      if (selectedFile2) {
        formData1.append("file", selectedFile2);
      }

      const { data } = await axios.post(
        `${backendUrl}/api/checkout/quote`,
        formData1,
        {
          headers: { token },
        },
      );
      if (data.success) {
        toast.success("Quote sent successfully");
        setFormData({
          name: "",
          email: "",
          phone: "",
          delivery: "",
          comment: "",
          file: "",
        });
        setSelectedFile2(null);
        setQuoteLoading(false);
        setShowQuoteForm({ state: false, from: "" });
      } else {
        toast.error(data.message || "Something went wrong");
        setQuoteLoading(false);
      }
    } catch (error) {
      setQuoteLoading(false);
      toast.error(error?.response?.data?.message || "Failed to send quote request");
    }
  };

  const formatDeliveryDate = (date) => {
    const options = {
      weekday: "short",
      day: "numeric",
      month: "short",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const deliveryDate = (() => {
    const today = new Date();
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    return formatDeliveryDate(twoWeeksLater);
  })();

  const discountedUnitPrice = unitPrice;
  // Setup fee comes directly from the selected supplier-provided artwork method.
  const getSetupFee = () => {
    return (selectedLeadTimeAddition?.setup ?? selectedPrintMethod?.setup ?? 0) * 1.5;
  };

  const setupFee = getSetupFee();
  const productPrice = getProductPrice(single_product, productId);

  const uniquePriceGroups = availablePriceGroups.filter(
    (group, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.promodata_decoration &&
          t.promodata_decoration === group.promodata_decoration,
      ),
  );

  const [showAddToCartNotification, setShowAddToCartNotification] =
    useState(false);

  const handleAddToCart = async (e) => {
    if (productPrice == 0) {
      toast.error(
        "Product price not available contact us to get the price and place order.",
      );
      setShowQuoteForm({ state: true, from: "quoteButton" });
      return;
    }
    e.preventDefault();

    // Convert customizationFile (File object) to base64 so it survives Redux persist
    let customizationFileData = null;
    if (selectedAdminCustomization && customizationFile) {
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
        // Also store in dedicated localStorage key so large files survive even if
        // redux-persist hits the quota limit. Key format: sm_artwork_{productId}_{methodId}
        const artworkKey = `sm_artwork_${productId}_${selectedAdminCustomization.method._id}`;
        try {
          localStorage.setItem(artworkKey, JSON.stringify(customizationFileData));
        } catch (storageErr) {
          console.warn("Could not store artwork in localStorage (quota?):", storageErr);
        }
      } catch (err) {
        console.error("Error converting customization file:", err);
      }
    }

    dispatch(
      addToCart({
        id: productId,
        name: product.name,
        basePrices:
          priceGroups.find((g) => g.base_price)?.base_price?.price_breaks || [],
        image: normalizedImages[0] || "",
        price: (() => {
          const baseProductPrice = getPriceForQuantity(currentQuantity);
          const sortedBreaks = [...selectedPrintMethod?.price_breaks].sort(
            (a, b) => a.qty - b.qty,
          );
          let selectedBreak = sortedBreaks[0];

          // Find the correct price break for current quantity
          for (let i = 0; i < sortedBreaks.length; i++) {
            if (currentQuantity >= sortedBreaks[i].qty) {
              selectedBreak = sortedBreaks[i];
            } else {
              break;
            }
          }
          // Calculate final unit price based on print method type
          let finalUnitPrice;
          if (selectedPrintMethod.type === "base") {
            finalUnitPrice = selectedBreak.price;
          } else {
            // For decoration, add decoration price to base product price
            finalUnitPrice = baseProductPrice + selectedBreak.price;
          }

          return finalUnitPrice;
        })(),
        totalPrice: currentPrice,
        discountPct,
        size: selectedSize,
        code: product.code,
        color: selectedColor,
        quantity: currentQuantity, // Use the actual quantity
        print:
          selectedPrintMethod.promodata_decoration ||
          selectedPrintMethod.description,
        logoColor: logoColor,
        freightFee: freightFee,
        setupFee: setupFee,
        dragdrop: selectedFile,
        deliveryDate,
        priceBreaks: selectedPrintMethod.price_breaks,
        printMethodKey: selectedPrintMethod.key,
        userEmail: userEmail || "guest@gmail.com",
        supplierName: single_product.overview.supplier,
        sample: false,
        sku_number: single_product?.overview?.sku_number,
        // Admin-defined customization (if selected)
        adminCustomization: selectedAdminCustomization
          ? {
              methodId: selectedAdminCustomization.method._id,
              applicationMethod: selectedAdminCustomization.method.applicationMethod,
              applicationType: selectedAdminCustomization.method.applicationType,
              setupCharge: selectedAdminCustomization.method.setupCharge,
              position: selectedPosition
                ? {
                    positionId: selectedPosition._id,
                    positionName: selectedPosition.positionName,
                    priceAdjustment: selectedPosition.priceAdjustment,
                  }
                : null,
              customizationFile: customizationFileData,
            }
          : null,
      }),
    );
    setShowAddToCartNotification(true);
  };

  const handleBuySample = async () => {
    let customizationFileData = null;
    if (selectedAdminCustomization && customizationFile) {
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
          console.warn("Could not store artwork in localStorage (quota?):", storageErr);
        }
      } catch (err) {
        console.error("Error converting customization file:", err);
      }
    }

    dispatch(
      addToCart({
        id: productId,
        name: product.name,
        image: normalizedImages[0] || "",
        basePrices:
          priceGroups.find((g) => g.base_price)?.base_price?.price_breaks || [],
        price: unitPrice,
        discountPct,
        totalPrice: unitPrice,
        code: product.code,
        color: selectedColor,
        quantity: 1,
        print:
          selectedPrintMethod?.promodata_decoration ||
          selectedPrintMethod?.description ||
          "",
        logoColor: logoColor,
        size: selectedSize,
        setupFee: 0,
        dragdrop: selectedFile,
        deliveryDate,
        priceBreaks: selectedPrintMethod?.price_breaks || [],
        printMethodKey: selectedPrintMethod?.key || "",
        freightFee: freightFee,
        userEmail: userEmail || "guest@gmail.com",
        sample: true,
        adminCustomization: selectedAdminCustomization
          ? {
              methodId: selectedAdminCustomization.method._id,
              applicationMethod: selectedAdminCustomization.method.applicationMethod,
              applicationType: selectedAdminCustomization.method.applicationType,
              setupCharge: selectedAdminCustomization.method.setupCharge,
              position: selectedPosition
                ? {
                    positionId: selectedPosition._id,
                    positionName: selectedPosition.positionName,
                    priceAdjustment: selectedPosition.priceAdjustment,
                  }
                : null,
              customizationFile: customizationFileData,
            }
          : null,
      }),
    );

    navigate("/cart");
  };

  // useEffect(() => {
  //   if (!showAddToCartNotification) return;
  //   const timer = setTimeout(() => setShowAddToCartNotification(false), 5000);
  //   return () => clearTimeout(timer);
  // }, [showAddToCartNotification]);

  const [notRobot, setNotRobot] = useState(false);

  const parseSizing = () => {
    const detailString = single_product?.product?.details?.find(
      (d) =>
        d.name === "Sizing" ||
        d.name === "Sizes" ||
        d.name === "product sizes" ||
        d.name === "Size",
    )?.detail;

    const activeSizes = sizes.map((s) => String(s).trim()).filter(Boolean);
    if (!detailString) {
      return { sizes: activeSizes, result: [] };
    }

    const lines = detailString.trim().split("\n");
    const chestValues = lines[1]?.split(",").slice(1) || [];
    const lengthValues = lines[2]?.split(",").slice(1) || [];

    const result = activeSizes.map((size, index) => {
      const chest = chestValues[index] || "";
      const length = lengthValues[index] || "";
      if (!chest && !length) return size;
      return `${size} (Half Chest ${chest} cm, Length ${length} cm)`;
    });

    return { sizes: activeSizes, result };
  };

  if (errorFetching) return <ProductNotFound />;
  if (loading)
    return (
      <LoadingOverlay
        title="Loading Product Details"
        subtitle="Please wait while we fetch the latest product information and pricing..."
        variant="product"
        showBrand={true}
      />
    );

  return (
    <>
      <SeoHelmet
        entityType="product"
        entityId={productId}
        fallback={{
          title: product?.name ? `${product.name} - SuperMerch Australia` : "SuperMerch Australia",
          description: product?.description?.substring(0, 160) || "Premium promotional products and custom merchandise",
        }}
      />
      {/* Add to cart notification bar */}
      <AnimatePresence>
        {showAddToCartNotification && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAddToCartNotification(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto"
              onClick={(e) =>
                e.target === e.currentTarget &&
                setShowAddToCartNotification(false)
              }
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-lg my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        Added to cart
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddToCartNotification(false)}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      aria-label="Close"
                    >
                      <IoClose className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Product summary */}
                  <div className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={activeImage || normalizedImages[0] || noimage}
                          alt={product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 line-clamp-2 capitalize">
                          {product?.name}
                        </p>
                        {single_product?.overview?.sku_number && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            SKU: {single_product?.overview?.sku_number}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-gray-900 mt-2">
                          ${currentPrice?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Selected options */}
                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between py-1.5 border-b border-gray-50">
                        <dt className="text-gray-500">Quantity</dt>
                        <dd className="font-medium text-gray-900">
                          {currentQuantity}
                        </dd>
                      </div>
                      {selectedSize && (
                        <div className="flex justify-between py-1.5 border-b border-gray-50">
                          <dt className="text-gray-500">Size</dt>
                          <dd className="font-medium text-gray-900">
                            {selectedSize}
                          </dd>
                        </div>
                      )}
                      {selectedColor && (
                        <div className="flex justify-between py-1.5 border-b border-gray-50">
                          <dt className="text-gray-500">Colour</dt>
                          <dd className="font-medium text-gray-900">
                            {selectedColor}
                          </dd>
                        </div>
                      )}
                      {(selectedPrintMethod?.description ||
                        selectedPrintMethod?.promodata_decoration) && (
                          <div className="flex justify-between py-1.5 border-b border-gray-50">
                            <dt className="text-gray-500">Print / Decoration</dt>
                            <dd
                              className="font-medium text-gray-900 text-right max-w-[180px] truncate"
                              title={
                                selectedPrintMethod?.promodata_decoration ||
                                selectedPrintMethod?.description
                              }
                            >
                              {selectedPrintMethod?.promodata_decoration ||
                                selectedPrintMethod?.description}
                            </dd>
                          </div>
                        )}
                      {selectedAdminCustomization && (
                        <div className="flex justify-between py-1.5 border-b border-gray-50">
                          <dt className="text-gray-500">Customization</dt>
                          <dd className="font-medium text-gray-900 text-right max-w-[180px] truncate">
                            {selectedAdminCustomization.method.applicationMethod}
                            {selectedPosition && ` — ${selectedPosition.positionName}`}
                          </dd>
                        </div>
                      )}
                      {deliveryDate && (
                        <div className="flex justify-between py-1.5 border-b border-gray-50">
                          <dt className="text-gray-500">Est. delivery</dt>
                          <dd className="font-medium text-gray-900">
                            {deliveryDate}
                          </dd>
                        </div>
                      )}
                      {discountPct > 0 && (
                        <div className="flex justify-between py-1.5 border-b border-gray-50">
                          <dt className="text-gray-500">Discount</dt>
                          <dd className="font-medium text-emerald-600">
                            {discountPct}% off
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="flex gap-3 px-6 pb-6">
                    <button
                      onClick={() => setShowAddToCartNotification(false)}
                      className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Continue shopping
                    </button>
                    <button
                      onClick={() => {
                        setShowAddToCartNotification(false);
                        navigate("/cart");
                      }}
                      className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      View cart
                    </button>
                  </div>

                  {relatedProducts.length > 0 && (
                    <div className="px-6 pb-6">
                      <p className="text-sm font-semibold text-gray-900 mb-3">
                        You may also like
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {relatedProducts.slice(0, 4).map((item) => (
                          <button
                            key={item?.meta?.id}
                            type="button"
                            className="text-left border border-gray-200 rounded-lg p-2 hover:border-primary transition-colors"
                            onClick={() => {
                              setShowAddToCartNotification(false);
                              navigate(
                                toProductUrl(
                                  item?.slug || item?.overview?.originalName || item?.overview?.name
                                )
                              );
                            }}
                          >
                            <img
                              src={item?.overview?.hero_image || noimage}
                              alt={item?.overview?.name || "Product"}
                              className="w-full h-20 object-contain bg-gray-50 rounded"
                            />
                            <p className="mt-2 text-xs font-medium text-gray-900 line-clamp-2">
                              {item?.overview?.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="Mycontainer relative ">
        {/* Image Gallery Modal */}
        <ImageGalleryModal
          isOpen={imageModel}
          onClose={() => setImageModel(false)}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          images={normalizedImages}
          productName={product?.name}
        />
        {/* Mobile/Tablet: swipeable main images */}
        <div className="lg:hidden">
          <Swiper
            onSwiper={(swiper) => { mobileSwiperRef.current = swiper; }}
            onSlideChange={(swiper) => {
              const imgs = normalizedImages;
              if (imgs[swiper.activeIndex]) {
                setActiveImage(imgs[swiper.activeIndex]);
              }
            }}
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={0}
            slidesPerView={1}
            className="w-full"
          >
            {normalizedImages.map((item, index) => (
              <SwiperSlide key={index}>
                <div
                  className="flex justify-center cursor-pointer"
                  onClick={() => setImageModel(true)}
                >
                  <img
                    src={item}
                    alt={`${product?.name} ${index + 1}`}
                    className="w-full object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[44%_54%] gap-4 mt-2 justify-between lg:items-start">
          <div className="hidden lg:flex gap-5 items-start self-start">
            <div
              className={`flex flex-col gap-4 overflow-x-hidden pr-1 w-[128px] shrink-0 scrollbar-hide self-start ${normalizedImages.length > 6
                ? "h-[848px] overflow-y-auto"
                : "h-auto overflow-y-visible"
                }`}
            >
              {normalizedImages.map((item, index) => {
                const fullImage = item;
                return (
                <button
                  key={index}
                  type="button"
                  className={`w-[128px] h-[128px] min-h-[128px] shrink-0 rounded-2xl overflow-hidden border-2 bg-white transition-all duration-200 ${activeImage === fullImage
                    ? "border-smallHeader shadow-md"
                    : "border-transparent hover:border-gray-300"
                    }`}
                  onClick={() => {
                    setActiveImage(fullImage);
                  }}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={item}
                    alt={`Thumbnail ${index}`}
                    className="w-full h-full object-cover bg-gray-50"
                  />
                </button>
                );
              })}
            </div>

            <div
              className="flex-1 min-h-[760px] border-border2 overflow-hidden relative group cursor-zoom-in flex items-center justify-center"

              onClick={() => setImageModel(true)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                e.currentTarget.querySelector("img").style.transformOrigin =
                  `${x}% ${y}%`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.querySelector("img").style.transformOrigin =
                  "center center";
              }}
            >
              <img
                src={activeImage}
                alt={product?.name}
                className="w-full max-h-[760px] max-w-full object-contain transition-transform duration-300 ease-out group-hover:scale-150"
              />
            </div>
          </div>
          {/* // )} */}
          {/* 2nd column  */}
          <div className="lg:self-start">
            <div className="flex justify-between items-center md:flex-row flex-col">
              <div className="w-full">
                <div className="flex items-start justify-between gap-3">
                  <h2
                    className={`text-2xl flex-1 min-w-0 ${product?.name ? "font-bold" : "font-medium"
                      } cursor-pointer transition-colors capitalize`}
                    onClick={handleHeadingClick}
                    onKeyDown={(e) => {
                      if (e.shiftKey && e.key.toLowerCase() === "a") {
                        handleHeadingClick(e);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Product name - Press Shift+A to view supplier information"
                  >
                    {product?.name}
                  </h2>
                  <Tooltip
                    title={
                      isFavourited
                        ? "Remove from favourites"
                        : "Add to favourites"
                    }
                    placement="top"
                  >
                    <button
                      type="button"
                      onClick={handleFavoriteClick}
                      className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label={
                        isFavourited
                          ? "Remove from favourites"
                          : "Add to favourites"
                      }
                    >
                      {isFavourited ? (
                        <IoIosHeart className="w-6 h-6 text-primary" />
                      ) : (
                        <CiHeart className="w-6 h-6 text-gray-500 hover:text-primary transition-colors" />
                      )}
                    </button>
                  </Tooltip>
                </div>
                <div className="flex flex-wrap items-center gap-2 py-1">
                  {!loading && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 ring-1 ring-inset ring-gray-200">
                      SKU: {single_product?.overview?.sku_number}
                    </span>
                  )}
                  {productTags.map((tag) => (
                    <span
                      key={tag?._id || tag?.slug || tag?.name}
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset"
                      style={{
                        backgroundColor: tag?.color || "#3b82f6",
                        color: tag?.textColor || "#ffffff",
                        borderColor: tag?.color || "#3b82f6",
                      }}
                    >
                      {tag?.name}
                    </span>
                  ))}
                </div>
                {/* Color Selection */}
                {single_product?.product?.colours?.list.length > 0 && (
                  <div className="flex justify-between items-center gap-4 mb-2">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(() => {
                        // Deduplicate by colorObj.name (the combo name e.g. "Black/Heather Grey")
                        const seen = new Set();
                        const uniqueColorObjs = single_product?.product?.colours?.list.filter((colorObj) => {
                          const key = colorObj.name || colorObj.colours.join("/");
                          if (seen.has(key)) return false;
                          seen.add(key);
                          return true;
                        });

                        return uniqueColorObjs.length > 0 ? (
                          uniqueColorObjs.map((colorObj, index) => {
                            const colorName = colorObj.name || colorObj.colours.join("/");
                            const colours = colorObj.colours || [];
                            const isSelected = selectedColor === colorName;
                            const isSingleColor = colours.length <= 1;
                            const color1 = findNearestColor(colours[0]);
                            const color2 = colours[1] ? findNearestColor(colours[1]) : null;

                            return (
                              <div
                                key={index}
                                className="relative inline-flex items-center justify-center"
                              >
                                <div
                                  className={`relative rounded-full cursor-pointer transition-all duration-300 overflow-hidden ${isSelected
                                    ? "w-7 h-7 shadow-xl"
                                    : "w-6 h-6 hover:shadow-lg hover:scale-110"
                                    }`}
                                  style={isSingleColor ? {
                                    backgroundColor: color1?.hex || "#9ca3af",
                                  } : {
                                    background: `linear-gradient(135deg, ${color1?.hex || "#9ca3af"} 50%, ${color2?.hex || "#9ca3af"} 50%)`,
                                  }}
                                  onClick={() => handleColorClick(colorName)}
                                  title={colorName}
                                  aria-label={`Color: ${colorName}${isSelected ? " (Selected)" : ""}`}
                                >
                                  {/* White border for contrast */}
                                  <div
                                    className={`absolute inset-0 rounded-full ${isSelected
                                      ? "border-[2.5px] border-white shadow-[0_0_0_2px_#0d9488]"
                                      : "border-[2px] border-gray-400/60"
                                      }`}
                                  ></div>

                                  {/* Checkmark badge for selected */}
                                  {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-md border-2 border-white z-10">
                                      <CheckCheck
                                        className="w-2.5 h-2.5 text-white"
                                        strokeWidth={3}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p>No colors available for this product</p>
                        );
                      })()}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Feature/Decoration/Pricing Tabs */}
            <div className="mt-1 mb-0">
              {/* Tab headers */}
              <div className="flex max-sm:justify-start max-sm:gap-1 sm:gap-2 border-b">
                {[
                  { key: "features", label: "Details" },
                  { key: "pricing", label: "Pricing" },
                  { key: "decoration", label: "Decoration" },
                  { key: "leadTime", label: "Lead Time" },
                  { key: "shipping", label: "Shipping" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveInfoTab(tab.key)}
                    className={`flex-shrink-0 sm:px-4 px-2 xs:px-1 py-2 sm:text-lg text-sm font-bold border-b-2 -mb-px transition-colors ${activeInfoTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="mt-3 min-h-[420px] lg:min-h-[520px]">
                {activeInfoTab === "features" && (
                  <FeaturesTab
                    single_product={single_product}
                    activeInfoTab={activeInfoTab}
                  />
                )}
                {activeInfoTab === "pricing" && (
                  <PricingTab
                    {...{
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
                      pricingSummary,
                      setSelectedSize,
                      single_product,
                      setShowQuoteForm,
                      handleBuySample,
                      setupFee,
                      freightFee,
                      selectedLeadTimeAddition,
                      setSelectedLeadTimeAddition,
                    }}
                  />
                )}
                {activeInfoTab === "decoration" && (
                  <DecorationTab
                    single_product={single_product}
                    availablePriceGroups={availablePriceGroups}
                    adminCustomizations={adminCustomizations}
                    selectedAdminCustomization={selectedAdminCustomization}
                    setSelectedAdminCustomization={setSelectedAdminCustomization}
                    selectedPosition={selectedPosition}
                    setSelectedPosition={setSelectedPosition}
                    customizationFile={customizationFile}
                    setCustomizationFile={setCustomizationFile}
                    selectedPrintMethod={selectedPrintMethod}
                    setSelectedPrintMethod={setSelectedPrintMethod}
                    setSelectedLeadTimeAddition={setSelectedLeadTimeAddition}
                    setCurrentQuantity={setCurrentQuantity}
                    uniquePriceGroups={uniquePriceGroups}
                  />
                )}
                {activeInfoTab === "leadTime" && (
                  <LeadTimeTab availablePriceGroups={availablePriceGroups} />
                )}
                {activeInfoTab === "shipping" && (
                  <ShippingTab single_product={single_product} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs moved above within the middle column for better UX */}

      <div className="Mycontainer">
        <RecommendationsStrip
          title="Related Products"
          products={relatedProducts}
          loading={recommendationsLoading}
          maxItems={4}
        />
      </div>

      {/* Quote Modal */}
      {showQuoteForm?.state && (
        <QuoteFormModal
          {...{
            product,
            selectedColor,
            selectedSize,
            selectedPrintMethod,
            currentQuantity,
            discountedUnitPrice,
            currentPrice,
            formData,
            handleChange,
            handleDragEnter2,
            handleDragLeave2,
            handleDragOver2,
            handleDrop2,
            handleFileChange2,
            handleDivClick2,
            notRobot,
            onSubmitHandler,
            quoteLoading,
            selectedFile2,
            setSelectedFile2,
            previewImage2,
            isDragging2,
            setPreviewImage2,
            setNotRobot,
            setShowQuoteForm,
            showQuoteForm,
            setCurrentQuantity,
          }}
        />
      )}
      {/* Services */}
      <Services />
      <img src={banner} alt="Home" className="w-full h-auto my-10" />
      {/* Size Guide Modal */}
      {showSizeGuide && (
        <SizeGuideModal
          setShowSizeGuide={setShowSizeGuide}
          parseSizing={parseSizing}
        />
      )}

      {/* Supplier Information Modal */}
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
              <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-5 rounded-t-2xl relative">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setShowSupplierModal(false)}
                    className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Close modal"
                  >
                    <IoClose className="w-6 h-6" />
                  </button>
                </div>
                <h3 className="text-2xl font-bold text-white pr-10">
                  Supplier Information
                </h3>
                <p className="text-white/90 text-sm mt-1">
                  Product supplier details
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Supplier Name */}
                {single_product?.overview?.supplier && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Supplier Name
                    </h4>
                    <p className="text-lg font-medium text-gray-900">
                      {single_product.overview.supplier}
                    </p>
                  </div>
                )}

                {/* SKU Number */}
                {single_product?.overview?.sku_number && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      SKU Number
                    </h4>
                    <p className="text-lg font-medium text-gray-900">
                      {single_product.overview.sku_number}
                    </p>
                  </div>
                )}

                {/* Product Name */}
                {product?.name && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Product Name
                    </h4>
                    <p className="text-lg font-medium text-gray-900">
                      {product.name}
                    </p>
                  </div>
                )}

                {/* Product Code */}
                {product?.code && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Product Code
                    </h4>
                    <p className="text-lg font-medium text-gray-900">
                      {product.code}
                    </p>
                  </div>
                )}

                {/* Supplier Category */}
                {single_product?.product?.categorisation?.supplier_category && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Supplier Category
                    </h4>
                    <p className="text-lg font-medium text-gray-900">
                      {single_product.product.categorisation.supplier_category}
                    </p>
                  </div>
                )}

                {/* Additional Supplier Info */}
                {!single_product?.overview?.supplier &&
                  !single_product?.overview?.sku_number && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No supplier information available for this product.</p>
                    </div>
                  )}

                {/* Help Text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Tip:</span> Hold{" "}
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                      Shift + A
                    </kbd>{" "}
                    and click on the product name to view supplier information.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex justify-end">
                <button
                  onClick={() => setShowSupplierModal(false)}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
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
};

export default ProductDetails;
