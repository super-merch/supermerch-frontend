import { getProductPrice } from "@/utils/utils";
import axios from "axios";
import { colornames } from "color-name-list";
import { CheckCheck } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { IoMdArrowForward } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { AppContext } from "../../../context/AppContext";
import {
  addToCart,
  initializeCartFromStorage,
  selectCurrentUserCartItems,
} from "../../../redux/slices/cartSlice";
import ProductNotFound from "../ProductNotFound";
import QuoteFormModal from "../QuoteFormModal";
import Services from "../Services";
import SizeGuideModal from "../SizeGuideModal";
import DecorationTab from "./DecorationTab";
import FeaturesTab from "./FeaturesTab";
import PricingTab from "./PricingTab";
import ShippingTab from "./ShippingTab";
import ImageGalleryModal from "./ImageGalleryModal";
import noimage from "/noimage.png";
import { LoadingBar } from "@/components/Common";
import LoadingOverlay from "@/components/Common/LoadingOverlay";
import { FaMoneyBillWave } from "react-icons/fa";
import banner from "../../../../public/BANNER/cuo.jpg";

const ProductDetails = () => {
  const [userEmail, setUserEmail] = useState(null);

  const currentUserCartItems = useSelector(selectCurrentUserCartItems);
  //get id from navigate's state

  // const { id } = useParams();
  // const { state: id } = useLocation();
  const { name } = useParams();
  const [searchParams] = useSearchParams();

  const encodedId = searchParams.get("ref");
  const id = encodedId ? atob(encodedId) : null;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    backednUrl,
    token,
    fetchProducts,
    skeletonLoading,
    error,
    totalDiscount,
    shippingCharges: freightFee,
    userData,
  } = useContext(AppContext);
  const [single_product, setSingle_Product] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorFetching, setErrorFetching] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState("pricing");

  // useEffect(() => {
  //   const fetchUserEmail = async () => {
  //     try {
  //       const token = localStorage.getItem("token");
  //       if (!token) {
  //         setUserEmail("guest@gmail.com");
  //         dispatch(initializeCartFromStorage({ email: "guest@gmail.com" }));
  //         return;
  //       }

  //       const { data } = await axios.get(`${backednUrl}/api/auth/user`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (data.success) {
  //         setUserEmail(data.email);
  //         // Set current user in Redux cart
  //         dispatch(initializeCartFromStorage({ email: data.email }));
  //       }
  //     } catch (error) {
  //       console.error(
  //         "Error fetching user email:",
  //         error.response?.data || error.message
  //       );
  //       // Fallback to guest email if there's an error
  //       setUserEmail("guest@gmail.com");
  //       dispatch(initializeCartFromStorage({ email: "guest@gmail.com" }));
  //     }
  //   };

  //   fetchUserEmail();
  // }, [dispatch, backednUrl]);
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
        const details = data.data?.product.details.filter((item) => {
          return (
            item.name.toLowerCase() === "sizing" ||
            item.name.toLowerCase() === "sizes" ||
            item.name.toLowerCase() === "size"
          );
        });

        let extractedSizes = [];

        if (details && details.length > 0) {
          // If sizes found in details array, use them
          extractedSizes = details[0].detail
            .split(",")
            .map((size) => size.trim());
        } else {
          // If no sizes in details, check description for sizes
          const description = data.data?.product.description || "";
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

  // useEffect(() => {
  //   const loadProducts = async () => {
  //     await fetchProducts();
  //   };
  //   loadProducts();
  // }, []);

  const product = single_product?.product || {};
  const productId = single_product?.meta?.id || "";

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFile2, setSelectedFile2] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [previewImage2, setPreviewImage2] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
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
      const baseGroup = {
        ...priceGroups[0].base_price,
        type: "base",
        // description: "Default Print Method (Select)",
      };

      const additionGroups = priceGroups.flatMap((group) =>
        group.additions.map((add) => ({
          ...add,
          type: "addition",
          description: add.description,
        }))
      );

      const allGroups = [baseGroup, ...additionGroups];
      setAvailablePriceGroups(allGroups);
      setSelectedPrintMethod(
        allGroups.length === 1 ? allGroups[0] : allGroups[1]
      );

      // Initialize quantity and price based on first price break
      if (
        (allGroups.length === 1 ? allGroups[0] : allGroups[1])?.price_breaks
          ?.length > 0
      ) {
        const firstBreak = (
          allGroups.length === 1 ? allGroups[0] : allGroups[1]
        )?.price_breaks[0];
        setCurrentQuantity(firstBreak.qty);
        setUnitPrice(firstBreak.price);
        setCurrentPrice(
          firstBreak.price * firstBreak.qty +
            (allGroups[0].setup * 1.5 || 0) +
            freightFee
        );
      }
    }
  }, [priceGroups]);

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
  ]);

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

  // Enhanced drag and drop handlers for first upload area
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone completely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

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
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedFile(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(
          "Please upload a valid file type: AI, EPS, SVG, PDF, JPG, JPEG, PNG"
        );
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDivClick = () => {
    document.getElementById("fileUpload").click();
  };

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

  const handleBoxClick = (index) => {
    if (index < sortedPriceBreaks.length) {
      const selectedBreak = sortedPriceBreaks[index];
      setCurrentQuantity(selectedBreak.qty);
    }
  };

  const handleIncrement = () => {
    setCurrentQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setCurrentQuantity((prev) => Math.max(prev - 1, 1)); // Minimum quantity is 1
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow empty string or valid numbers
    if (value === "" || /^[0-9]*$/.test(value)) {
      const numericValue = value === "" ? 0 : parseInt(value, 10);
      setCurrentQuantity(numericValue || 0);
    }
  };

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
      formData1.append(
        "setupFee",
        Number((selectedPrintMethod?.setup * 1.5 || 0).toFixed(2))
      );
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
        setShowQuoteForm(false);
      } else {
        toast.error(data.message || "Something went wrong");
        setQuoteLoading(false);
      }
    } catch (error) {
      setQuoteLoading(false);
    }
  };
  const getPrintMethods = (details) => {
    const printAreas = details.find((item) => item.name === "printAreas");
    if (!printAreas) return [];
    return printAreas.detail.split(";").map((method) => {
      const trimmed = method.trim();
      const [printType, ...areas] = trimmed.split(":");
      return {
        type: printType.trim(),
        areas: areas.join(":").trim(),
      };
    });
  };

  // In your component:
  const printMethods = getPrintMethods(single_product?.product?.details || []);

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

  const handleAddToCart = (e) => {
    e.preventDefault();
    //   if (!userEmail) {
    //   toast.error("Please login to add items to cart");
    //   navigate("/signup");
    //   return;
    // }

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
        setupFee: selectedPrintMethod.setup * 1.5 || 0,
        dragdrop: selectedFile,
        deliveryDate,
        priceBreaks: selectedPrintMethod.price_breaks,
        printMethodKey: selectedPrintMethod.key,
        userEmail: userEmail || "guest@gmail.com",
        supplierName: single_product.overview.supplier,
      })
    );
    navigate("/cart");
  };
  const [notRobot, setNotRobot] = useState(false);

  const parseSizing = () => {
    const detailString = single_product?.product?.details?.find(
      (d) => d.name === "Sizing" || d.name === "Sizes"
    )?.detail;
    if (!detailString) return [];
    const lines = detailString.trim().split("\n");
    if (!lines.length) return [];
    // Parse header (sizes)
    const sizes = lines[0]?.split(","); // Skip empty first value
    // Parse measurements
    const chestValues = lines[1]?.split(",").slice(1);
    const lengthValues = lines[2]?.split(",").slice(1);

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
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[28%_45%_24%] gap-8 mt-2">
          {/* 1st culmn  */}
          {/* {loading && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center h-screen">
              <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400 opacity-20"></div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Loading Product Details
                    </h3>
                    <p className="text-sm text-gray-600">
                      Please wait while we fetch the latest information...
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )} */}
          {/* 
          {loading ? (
            Array.from({ length: 1 }).map((_, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg shadow-md h-fit border-border2"
              >
                <Skeleton height={200} className="rounded-md" />
                <div className="flex items-center justify-between gap-2">
                  <Skeleton height={60} width={58} className="rounded-md" />
                  <Skeleton height={60} width={58} className="rounded-md" />
                  <Skeleton height={60} width={58} className="rounded-md" />
                  <Skeleton height={60} width={58} className="rounded-md" />
                </div>
              </div>
            ))
          ) : ( */}
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
              <div className="w-2/3">
                <h2
                  className={`text-2xl ${
                    product?.name ? "font-bold" : "font-medium"
                  }`}
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
                            const matchedColor = colornames.find(
                              (item) => color === item.name
                            );

                            return (
                              <div
                                key={index}
                                className={`w-5 h-5 text-xs font-medium rounded-full cursor-pointer border ${
                                  selectedColor === color
                                    ? "border-2 border-primary"
                                    : "bo"
                                }`}
                                style={{
                                  backgroundColor: matchedColor?.hex,
                                }}
                                onClick={() => handleColorClick(color)}
                              ></div>
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
              {/* <div className="flex flex-wrap items-center ">
              <span className="text-2xl text-smallHeader">★★★★★</span>
              <p className="ml-2 text-gray-600">
                4.7 Star Rating (1767 User Feedback)
              </p>
            </div> */}
              {/* Starting Price */}
              <div className="md:w-1/3 flex justify-center items-center flex-wrap gap-2 p-1 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full -translate-y-8 translate-x-8 opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-teal-200 to-green-200 rounded-full translate-y-6 -translate-x-6 opacity-30"></div>

                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg text-white">
                    $
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Starting From
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-extrabold text-green-600">
                        ${getProductPrice(single_product, productId) ?? 0}{" "}
                        <span className="text-xs text-gray-500">per unit</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-full">
                    <CheckCheck className="w-4 h-4 text-green-700" />
                    <span className="text-sm font-semibold text-green-700">
                      Great Deal!
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature/Decoration/Pricing Tabs */}
            <div className="mt-1 mb-0">
              {/* Tab headers */}
              <div className="flex gap-2 border-b">
                {[
                  { key: "features", label: "Features" },
                  { key: "pricing", label: "Pricing" },
                  { key: "decoration", label: "Decoration" },
                  { key: "shipping", label: "Shipping" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveInfoTab(tab.key)}
                    className={`px-4 py-2 text-md font-medium border-b-2 -mb-px transition-colors ${
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
                    }}
                  />
                )}
                {activeInfoTab === "decoration" && (
                  <DecorationTab
                    single_product={single_product}
                    availablePriceGroups={availablePriceGroups}
                  />
                )}
                {activeInfoTab === "shipping" && (
                  <ShippingTab single_product={single_product} />
                )}
              </div>
            </div>
          </div>
          {/* 3rd column  */}
          <div className="">
            {/* Consolidated Order Summary */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm lg:sticky lg:top-4">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 bg-white rounded-t-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 tracking-wide">
                      Per unit
                    </p>
                    <div className="flex items-baseline gap-2">
                      {discountPct > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                          ${rawPerUnit.toFixed(2)}
                        </span>
                      )}
                      <p className="text-2xl font-bold text-smallHeader">
                        $
                        {discountedUnitPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    {discountPct > 0 && (
                      <span className="mt-2 inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700 ring-1 ring-inset ring-green-200">
                        Save {discountPct}%
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-600 tracking-wide">
                      Total
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[13px] text-gray-700 ring-1 ring-inset ring-gray-200">
                        {currentQuantity} pcs
                      </span>
                      <p className="text-3xl font-extrabold text-smallHeader">
                        $
                        {currentPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="px-6 py-2 rounded-lg">
                {/* Action Buttons */}
                <div className="space-y-3 mt-2">
                  <div
                    onClick={() => setShowQuoteForm(!showQuoteForm)}
                    className="flex items-center justify-center gap-2 py-2 text-primary cursor-pointer border border-primary transition-all duration-300 rounded-sm hover:shadow-md"
                  >
                    <FaMoneyBillWave className="text-primary" />
                    <button className="text-sm">Get Express Quote</button>
                  </div>
                  <div
                    onClick={() => {
                      //                 if (!userEmail) {
                      //   toast.error("Please login to add items to cart");
                      //   navigate("/signup");
                      //   return;
                      // }
                      // inside ProductDetails - BUY 1 SAMPLE handler
                      dispatch(
                        addToCart({
                          id: productId,
                          name: product.name,
                          image: product.images?.[0] || "",
                          // add basePrices so reducer can compute correct unit price
                          basePrices:
                            priceGroups.find((g) => g.base_price)?.base_price
                              ?.price_breaks || [],
                          // price optional — reducer currently ignores passed-in price for computation
                          price: perUnitWithMargin,
                          discountPct,
                          totalPrice: perUnitWithMargin * 1, // optional: a helpful hint, reducer recalculates
                          code: product.code,
                          color: selectedColor,
                          quantity: 1, // Force quantity to 1 for sample
                          print: selectedPrintMethod?.description || "",
                          logoColor: logoColor,
                          size: selectedSize,
                          setupFee: selectedPrintMethod?.setup * 1.5 || 0,
                          dragdrop: selectedFile,
                          deliveryDate,
                          priceBreaks: selectedPrintMethod?.price_breaks || [],
                          printMethodKey: selectedPrintMethod?.key || "",
                          freightFee: freightFee,
                          userEmail: userEmail || "guest@gmail.com",
                        })
                      );

                      navigate("/cart");
                    }}
                    className="flex items-center justify-center gap-2 py-2 mt-2 text-white cursor-pointer bg-primary hover:bg-primary/80 transition-all duration-300 rounded-sm"
                  >
                    <img src="/buy2.png" alt="" />
                    <button className="text-sm">BUY 1 SAMPLE</button>
                  </div>
                </div>
                {/* Product Details */}
                <div className="mt-6">
                  <p className="text-sm text-black">
                    Est Delivery Date: {deliveryDate}
                  </p>
                  <p className="pt-2 text-xs text-black ">
                    ${discountedUnitPrice.toFixed(2)} (Non-Branded sample) + $
                    {freightFee} delivery
                  </p>
                </div>

                <div className="pb-4 mt-2 mb-4 border-b">
                  <div className="flex items-start gap-2 pt-3 ">
                    <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                      <FaCheck />
                    </p>
                    <p className="text-sm">
                      Selected Color:{" "}
                      {selectedColor ? selectedColor : "No color selected"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 pt-3 ">
                    <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                      <FaCheck />
                    </p>
                    <p className="text-sm">
                      Print Method:{" "}
                      {selectedPrintMethod?.description || "Not selected"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 pt-3 ">
                    <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                      <FaCheck />
                    </p>
                    <p className="text-sm">
                      Selected Size: &nbsp;
                      {selectedSize || "Not selected"}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 pt-3 ">
                    <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                      <FaCheck />
                    </p>
                    {/* <p className='text-sm'>Quantity: {quantity2[activeIndex]?.sell || 50}</p> */}
                    <p className="text-sm">Quantity: {currentQuantity}</p>
                  </div>

                  <div className="flex items-start gap-2 pt-3 ">
                    <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                      <FaCheck />
                    </p>
                    <p className="text-sm">
                      Setup Charge: $
                      {selectedPrintMethod?.setup?.toFixed(2) * 1.5 || "0.00"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 pt-3 ">
                    <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                      <FaCheck />
                    </p>
                    <p className="text-sm">
                      Freight Charge:
                      {freightFee > 0 ? `$${freightFee.toFixed(2)}` : " TBD"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs moved above within the middle column for better UX */}

      {/* Quote Modal */}
      {showQuoteForm && (
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
    </>
  );
};

export default ProductDetails;
