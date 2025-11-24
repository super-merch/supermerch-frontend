import LoadingOverlay from "@/components/Common/LoadingOverlay";
import {
  getProductPrice,
  getClothingAdditionalCost,
  getClothingPricing,
  isProductCategory,
  findNearestColor,
  getProductCategory,
  getProductSupplier,
} from "@/utils/utils";
import axios from "axios";
import { CheckCheck } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { IoMdArrowForward } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import banner from "../../../../public/BANNER/cuo.jpg";
import { AppContext } from "../../../context/AppContext";
import { addToCart } from "../../../redux/slices/cartSlice";
import ProductNotFound from "../ProductNotFound";
import QuoteFormModal from "../QuoteFormModal";
import Services from "../Services";
import SizeGuideModal from "../SizeGuideModal";
import DecorationTab from "./DecorationTab";
import FeaturesTab from "./FeaturesTab";
import ImageGalleryModal from "./ImageGalleryModal";
import OrderSummary from "./OrderSummary";
import PricingTab from "./PricingTab";
import ShippingTab from "./ShippingTab";
import noimage from "/noimage.png";
import LeadTimeTab from "./LeadTime";

const ProductDetails = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [searchParams] = useSearchParams();
  const encodedId = searchParams.get("ref");
  const id = encodedId ? atob(encodedId) : null;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    backednUrl,
    token,
    error,
    totalDiscount,
    shippingCharges: freightFee,
    userData,
  } = useContext(AppContext);
  const [single_product, setSingle_Product] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorFetching, setErrorFetching] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState("pricing");

  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");

  useEffect(() => {
    if (!id) return;
    const fetchSingleProduct = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${backednUrl}/api/single-product/${id}`
        );
        if (data) {
          setSingle_Product(data.data, "fetchSingleProduct");
          setTimeout(() => {
            setLoading(false);
          }, 200);
          setErrorFetching(false);
        }

        // First, try to find sizes in details array
        const details = data.data?.product?.details?.filter((item) => {
          return (
            item.name.toLowerCase() === "sizing" ||
            item.name.toLowerCase() === "sizes" ||
            item.name.toLowerCase() === "size"
          );
        });

        let extractedSizes = [];

        if (details && details?.length > 0) {
          // If sizes found in details array, use them
          extractedSizes = details[0]?.detail
            .split(",")
            .map((size) => size.trim());
        } else {
          // If no sizes in details, check description for sizes
          const description = data.data?.product?.description || "";
          const sizesMatch = description.match(/Sizes:\s*([^\n]+)/i);

          if (sizesMatch) {
            const sizesString = sizesMatch[1].trim();
            // Handle different formats like "XS - 2XL" or "72, 77, 82, ..."
            if (sizesString.includes(" - ")) {
              // Handle range format like "XS - 2XL"
              const [start, end] = sizesString.split(" - ");
              const sizeOrder = [
                "XS",
                "S",
                "M",
                "L",
                "XL",
                "2XL",
                "3XL",
                "4XL",
                "5XL",
              ];
              const startIndex = sizeOrder.indexOf(start.trim());
              const endIndex = sizeOrder.indexOf(end.trim());

              if (startIndex !== -1 && endIndex !== -1) {
                extractedSizes = sizeOrder.slice(startIndex, endIndex + 1);
              } else {
                // If not standard size format, just use as is
                extractedSizes = [sizesString];
              }
            } else {
              // Handle comma-separated format
              extractedSizes = sizesString
                .split(",")
                .map((size) => size.trim());
            }
          }
        }

        setSizes(extractedSizes);
        setSelectedSize(extractedSizes[0] || extractedSizes[1]);

        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        setLoading(false);
        setErrorFetching(true);
        console.log(error);
      }
    };
    const email = userData?.email || "guest@gmail.com";
    setUserEmail(email);
    fetchSingleProduct();
  }, [id]);

  const product = single_product?.product || {};
  const productId = single_product?.meta?.id || "";

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
    product?.images?.[0] || noimage
  );
  const [logoColor, setLogoColor] = useState("1 Colour Print");

  const [selectedPrintMethod, setSelectedPrintMethod] = useState(null);
  const [selectedLeadTimeAddition, setSelectedLeadTimeAddition] =
    useState(null);
  const [availablePriceGroups, setAvailablePriceGroups] = useState([]);
  const [imageModel, setImageModel] = useState(false);

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
    sortedPriceBreaks[0]?.qty || 50
  );
  const [unitPrice, setUnitPrice] = useState(sortedPriceBreaks[0]?.price || 0);
  const [currentPrice, setCurrentPrice] = useState(
    sortedPriceBreaks[0]
      ? sortedPriceBreaks[0].price * sortedPriceBreaks[0].qty
      : 0
  );

  const perUnitWithMargin = unitPrice;

  const discountPct = totalDiscount[productId] || 0;
  const discountMultiplier = 1 - discountPct / 100;

  useEffect(() => {
    if (priceGroups.length > 0) {
      const isClothing = isProductCategory(single_product, "Clothing");
      const supplier = getProductSupplier(single_product);
      let allGroups = [];

      if (isClothing) {
        // Create static print methods for clothing products
        // Use the base price breaks from the first price group for all clothing methods
        const basePriceBreaks = priceGroups[0]?.base_price?.price_breaks || [];

        const clothingMethods = [
          {
            key: "pocket-size-front-print",
            description: "Pocket size Front print",
            type: "base",
            setup: 29,
            price_breaks: basePriceBreaks,
          },
          {
            key: "pocket-size-front-embroidery",
            description: "Pocket size Front embroidery",
            type: "base",
            setup: 49,
            price_breaks: basePriceBreaks,
          },
          {
            key: "big-print-in-back",
            description: "Big Print in Back",
            type: "base",
            setup: 29,
            price_breaks: basePriceBreaks,
          },
          {
            key: "pocket-front-big-back",
            description: "Pocket size front + Big print back",
            type: "base",
            setup: 49,
            price_breaks: basePriceBreaks,
          },
          {
            key: "unbranded",
            description: "Unbranded",
            type: "base",
            setup: 0,
            price_breaks: basePriceBreaks,
          },
        ];

        const staticClothingMethods =
          supplier === "AS Colour"
            ? clothingMethods.filter((method) => method.key !== "unbranded")
            : clothingMethods;

        allGroups = staticClothingMethods;
      } else {
        // For non-clothing items, use backend data as before
        const baseGroup = {
          ...priceGroups[0].base_price,
          type: "base",
        };

        const additionGroups = priceGroups.flatMap((group) =>
          group.additions.map((add) => ({
            ...add,
            type: "addition",
            description: add.description,
          }))
        );

        allGroups = [baseGroup, ...additionGroups];
      }

      setAvailablePriceGroups(allGroups);
      setSelectedPrintMethod(allGroups[0]);
      // Initialize quantity and price based on first price break
      const initialMethod = allGroups[0];
      if (initialMethod?.price_breaks?.length > 0) {
        const firstBreak = initialMethod.price_breaks[0];
        setCurrentQuantity(firstBreak.qty);
        setUnitPrice(firstBreak.price);
        const setupFee = isClothing
          ? getClothingPricing(initialMethod.description).setupFee
          : allGroups[1]?.setup * 1.5 || 0;
        setCurrentPrice(
          firstBreak.price * firstBreak.qty + setupFee + freightFee
        );
      }
    }
  }, [priceGroups, single_product]);

  useEffect(() => {
    if (product) {
      const hasColors = product?.colours?.list?.length > 0;

      if (hasColors) {
        const firstColor = product.colours.list[0].colours[0];
        setSelectedColor(firstColor);
        setActiveImage(
          colorImages[firstColor] || product.images?.[0] || noimage
        );
      } else {
        // Product has no colors - use first product image
        setActiveImage(product.images?.[0] || noimage);
      }
    }
  }, [product]);

  // Set dynamic page title
  useEffect(() => {
    if (product?.name) {
      const productName = product.name;
      const productDescription = product.description
        ? product.description.substring(0, 150) + "..."
        : "Premium promotional products and custom merchandise";

      document.title = `${productName} - SuperMerch Australia`;

      // Update meta description
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute("content", productDescription);
      } else {
        // Create meta description if it doesn't exist
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = productDescription;
        document.head.appendChild(meta);
      }

      // Update Open Graph meta tags for social media sharing
      const updateMetaTag = (property, content) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (meta) {
          meta.setAttribute("content", content);
        } else {
          meta = document.createElement("meta");
          meta.setAttribute("property", property);
          meta.setAttribute("content", content);
          document.head.appendChild(meta);
        }
      };

      updateMetaTag("og:title", `${productName} - SuperMerch Australia`);
      updateMetaTag("og:description", productDescription);
      updateMetaTag("og:type", "product");
      if (product?.images?.[0]) {
        updateMetaTag("og:image", product.images[0]);
      }
    }

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title =
        "SuperMerch - Premium Australian Made Promotional Products & Custom Merchandise";
    };
  }, [product?.name, product?.description]);

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

  useEffect(() => {
    if (!selectedPrintMethod?.price_breaks?.length) return;

    const sortedBreaks = [...selectedPrintMethod.price_breaks].sort(
      (a, b) => a.qty - b.qty
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

    // Add clothing-specific additional cost per unit if applicable
    const isClothing = isProductCategory(single_product, "Clothing");
    if (isClothing) {
      const clothingAdditionalCost = getClothingAdditionalCost(
        selectedPrintMethod.description
      );
      finalUnitPrice += clothingAdditionalCost;
    }

    setUnitPrice(finalUnitPrice);

    const rawPerUnit = finalUnitPrice;
    const discountedPerUnit = rawPerUnit * (1 - discountPct / 100);

    // Calculate total: (discounted per-unit × qty) + setup + freight
    const total = discountedPerUnit * currentQuantity;

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

  // Function to find the nearest color match

  const handleColorClick = (color) => {
    setSelectedColor(color);
    setActiveImage(colorImages[color] || noimage);
  };

  useEffect(() => {
    if (product) {
      // Check if product has colors
      const hasColors = product?.colours?.list?.length > 0;

      if (hasColors) {
        const firstColor = product.colours.list[0].colours[0];
        setActiveImage(product.images?.[0] || noimage); // show 0 index image when component mounts
      } else {
        setActiveImage(product.images?.[0] || noimage);
      }
    }
  }, [product?.images?.length > 0]); // Run whenever product data changes

  const colorImages = useMemo(() => {
    if (!product?.colours?.list) return {};

    return product.colours.list.reduce((acc, colorObj) => {
      colorObj.colours.forEach((color) => {
        acc[color] = colorObj.image || product.images?.[0] || noimage;
      });
      return acc;
    }, {});
  }, [product]);

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
          "Please upload a valid file type: AI, EPS, SVG, PDF, JPG, JPEG, PNG"
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
      formData1.append("description", single_product?.product?.description);

      if (selectedFile2) {
        formData1.append("file", selectedFile2);
      }

      const { data } = await axios.post(
        `${backednUrl}/api/checkout/quote`,
        formData1,
        {
          headers: { token },
        }
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

  const rawPerUnit = unitPrice;
  const discountedUnitPrice = rawPerUnit * (1 - discountPct / 100);
  // Calculate setup fee - use clothing-specific setup fee if applicable
  const getSetupFee = () => {
    const isClothing = isProductCategory(single_product, "Clothing");
    if (isClothing && selectedPrintMethod?.description) {
      const clothingPricing = getClothingPricing(
        selectedPrintMethod.description
      );
      return clothingPricing?.setupFee;
    }
    return (
      priceGroups[0]?.additions[0]?.setup * 1.5 ||
      selectedPrintMethod?.setup * 1.5 ||
      0
    );
  };

  const setupFee = getSetupFee();
  const productPrice = getProductPrice(single_product, productId);
  const handleAddToCart = (e) => {
    if (productPrice == 0) {
      toast.error(
        "Product price not available contact us to get the price and place order."
      );
      setShowQuoteForm({ state: true, from: "quoteButton" });
      return;
    }
    e.preventDefault();

    dispatch(
      addToCart({
        id: productId,
        name: product.name,
        basePrices:
          priceGroups.find((g) => g.base_price)?.base_price?.price_breaks || [],
        image: product.images?.[0] || "",
        price: (() => {
          const baseProductPrice = getPriceForQuantity(currentQuantity);
          const sortedBreaks = [...selectedPrintMethod?.price_breaks].sort(
            (a, b) => a.qty - b.qty
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

          // Add clothing-specific additional cost per unit if applicable
          const isClothing = isProductCategory(single_product, "Clothing");
          if (isClothing) {
            const clothingAdditionalCost = getClothingAdditionalCost(
              selectedPrintMethod.description
            );
            finalUnitPrice += clothingAdditionalCost;
          }

          const rawPerUnit = finalUnitPrice;
          return rawPerUnit * (1 - discountPct / 100);
        })(),
        totalPrice: currentPrice,
        discountPct,
        size: selectedSize,
        code: product.code,
        color: selectedColor,
        quantity: currentQuantity, // Use the actual quantity
        print: selectedPrintMethod.description,
        logoColor: logoColor,
        freightFee: freightFee,
        setupFee: setupFee,
        dragdrop: selectedFile,
        deliveryDate,
        priceBreaks: selectedPrintMethod.price_breaks,
        printMethodKey: selectedPrintMethod.key,
        userEmail: userEmail || "guest@gmail.com",
        supplierName: single_product.overview.supplier,
        sample:false
      })
    );
    navigate("/cart");
  };
  const [notRobot, setNotRobot] = useState(false);

  const parseSizing = () => {
    const detailString = single_product?.product?.details?.find(
      (d) =>
        d.name === "Sizing" || d.name === "Sizes" || d.name === "product sizes"
    )?.detail;
    if (!detailString) return [];
    const lines = detailString.trim().split("\n");
    if (!lines.length) return [];
    // Parse header (sizes)
    let sizes = lines[0]?.split(",").filter((size) => size !== ""); // Skip empty first value
    // Parse measurements
    const chestValues = lines[1]?.split(",").slice(1);
    const lengthValues = lines[2]?.split(",").slice(1);

    sizes = sizes.length > 1 ? sizes : ["XS", "S", "M", "L", "XL", "2XL"];
    const result =
      chestValues &&
      sizes?.map((size, index) => {
        const chest = chestValues?.[index] || "";
        const length = lengthValues?.[index] || "";
        return `${size} (Half Chest ${chest} cm, Length ${length} cm)`;
      });

    return { sizes, result };
  };

  if (error)
    return (
      <div className="flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 rounded-full border-t-blue-500 animate-spin"></div>
      </div>
    );

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
      <div className="Mycontainer relative ">
        {/* Image Gallery Modal */}
        <ImageGalleryModal
          isOpen={imageModel}
          onClose={() => setImageModel(false)}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          images={product?.images || []}
          productName={product?.name}
        />
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[35%_35%_25%] gap-4 mt-2 justify-between">
          <div>
            <div
              className="mb-4  border-border2 overflow-hidden relative group cursor-zoom-in"
              onClick={() => setImageModel(true)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                e.currentTarget.querySelector(
                  "img"
                ).style.transformOrigin = `${x}% ${y}%`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.querySelector("img").style.transformOrigin =
                  "center center";
              }}
            >
              <img
                src={activeImage}
                alt={product?.name}
                className="w-full transition-transform duration-300 ease-out group-hover:scale-150"
              />
            </div>

            <Swiper
              navigation={{
                prevEl: ".custom-prev",
                nextEl: ".custom-next",
              }}
              modules={[Navigation]}
              className="mySwiper"
              breakpoints={{
                0: { slidesPerView: 2, spaceBetween: 5 },
                580: { slidesPerView: 3, spaceBetween: 10 },
                1024: { slidesPerView: 4, spaceBetween: 10 },
              }}
            >
              <div className="absolute left-0 top-[47%] transform -translate-y-1/2 z-10">
                <button className="p-1 text-white rounded-full custom-prev bg-primary lg:p-2 md:p-1 sm:p-1">
                  <IoArrowBackOutline className="text-base text-md" />
                </button>
              </div>

              <div className="absolute right-0 top-[47%] transform -translate-y-1/2 z-10">
                <button className="p-1 text-white rounded-full custom-next bg-primary lg:p-2 md:p-1 sm:p-1">
                  <IoMdArrowForward className="text-base text-md" />
                </button>
              </div>

              {product?.images?.map((item, index) => (
                <SwiperSlide key={index}>
                  <div
                    className="flex justify-center px-2 py-3 cursor-pointer bg-line lg:px-0 md:px-0 sm:px-0"
                    onClick={() => {
                      setActiveImage(item);
                      // setSelectedColor('')
                    }}
                  >
                    <img
                      src={item}
                      alt={`Thumbnail ${index}`}
                      className={`w-full border-2  ${
                        activeImage === item
                          ? "border-smallHeader"
                          : "border-transparent"
                      }`}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          {/* // )} */}
          {/* 2nd column  */}
          <div>
            <div className="flex justify-between items-center md:flex-row flex-col">
              <div className="w-full">
                <h2
                  className={`text-2xl ${
                    product?.name ? "font-bold" : "font-medium"
                  } cursor-pointer transition-colors`}
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
                </h2>{" "}
                <div className="flex flex-wrap items-center gap-2 py-1">
                  {!loading && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 ring-1 ring-inset ring-gray-200">
                      SKU: {single_product?.overview?.sku_number}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200">
                    In Stock
                  </span>
                </div>
                {/* Color Selection */}
                {single_product?.product?.colours?.list.length > 0 && (
                  <div className="flex justify-between items-center gap-4 mb-2">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(() => {
                        // Extract all colors and remove duplicates
                        const allColors = single_product?.product?.colours?.list
                          .flatMap((colorObj) => colorObj.colours)
                          .filter(
                            (color, index, array) =>
                              array.indexOf(color) === index
                          );

                        return allColors.length > 0 ? (
                          allColors.map((color, index) => {
                            const matchedColor = findNearestColor(color);
                            const isSelected = selectedColor === color;

                            return (
                              <div
                                key={index}
                                className="relative inline-flex items-center justify-center"
                              >
                                <div
                                  className={`relative rounded-full cursor-pointer transition-all duration-300 ${
                                    isSelected
                                      ? "w-7 h-7 shadow-xl"
                                      : "w-6 h-6 hover:shadow-lg hover:scale-110"
                                  }`}
                                  style={{
                                    backgroundColor:
                                      matchedColor?.hex || "#9ca3af",
                                  }}
                                  onClick={() => handleColorClick(color)}
                                  title={color}
                                  aria-label={`Color: ${color}${
                                    isSelected ? " (Selected)" : ""
                                  }`}
                                >
                                  {/* White border for contrast */}
                                  <div
                                    className={`absolute inset-0 rounded-full ${
                                      isSelected
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
                    className={`flex-shrink-0 sm:px-4 px-2 xs:px-1 py-2 sm:text-lg text-sm font-bold border-b-2 -mb-px transition-colors ${
                      activeInfoTab === tab.key
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="mt-3">
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
                      discountMultiplier,
                      setSelectedSize,
                      single_product,
                      setShowQuoteForm,
                      selectedLeadTimeAddition,
                      setSelectedLeadTimeAddition,
                    }}
                  />
                )}
                {activeInfoTab === "decoration" && (
                  <DecorationTab
                    single_product={single_product}
                    availablePriceGroups={availablePriceGroups}
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
          {/* 3rd column  */}
          <OrderSummary
            rawPerUnit={rawPerUnit}
            discountedUnitPrice={discountedUnitPrice}
            discountPct={discountPct}
            currentQuantity={currentQuantity}
            currentPrice={currentPrice}
            showQuoteForm={showQuoteForm}
            setShowQuoteForm={setShowQuoteForm}
            productId={productId}
            product={product}
            priceGroups={priceGroups}
            perUnitWithMargin={perUnitWithMargin}
            selectedColor={selectedColor}
            selectedPrintMethod={selectedPrintMethod}
            logoColor={logoColor}
            selectedSize={selectedSize}
            selectedFile={selectedFile}
            deliveryDate={deliveryDate}
            freightFee={freightFee}
            userEmail={userEmail}
            setupFee={setupFee}
            setCurrentQuantity={setCurrentQuantity}
          />
        </div>
      </div>

      {/* Tabs moved above within the middle column for better UX */}

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
