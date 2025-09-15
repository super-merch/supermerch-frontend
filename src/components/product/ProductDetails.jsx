import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLocation, useNavigate } from "react-router";
import { IoMdArrowForward } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { IoCartOutline } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import {
  addToCart,
  initializeCartFromStorage,
} from "../../redux/slices/cartSlice";
import {
  setCurrentUser,
  selectCurrentUserCartItems,
} from "../../redux/slices/cartSlice";
import { useSelector } from "react-redux";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { useDispatch } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { AppContext } from "../../context/AppContext";
import noimage from "/noimage.png";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { colornames } from "color-name-list";

const ProductDetails = () => {
  const [userEmail, setUserEmail] = useState(null);
  const currentUserCartItems = useSelector(selectCurrentUserCartItems);
  //get id from navigate's state

  // const { id } = useParams();
  const { state: id } = useLocation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    backednUrl,
    token,
    fetchProducts,
    skeletonLoading,
    error,
    marginApi,
    totalDiscount,
  } = useContext(AppContext);
  const [single_product, setSingle_Product] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState("pricing"); // features | decoration | pricing

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, using guest email");
          setUserEmail("guest@gmail.com");
          dispatch(initializeCartFromStorage({ email: "guest@gmail.com" }));
          return;
        }

        const { data } = await axios.get(`${backednUrl}/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data.success) {
          setUserEmail(data.email);
          // Set current user in Redux cart
          dispatch(initializeCartFromStorage({ email: data.email }));
        }
      } catch (error) {
        console.error(
          "Error fetching user email:",
          error.response?.data || error.message
        );
        // Fallback to guest email if there's an error
        setUserEmail("guest@gmail.com");
        dispatch(initializeCartFromStorage({ email: "guest@gmail.com" }));
      }
    };

    fetchUserEmail();
  }, [dispatch, backednUrl]);
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const fetchSingleProduct = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backednUrl}/api/single-product/${id}`
      );
      if (data) {
        setSingle_Product(data.data, "fetchSingleProduct");
        setLoading(false);
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
            extractedSizes = sizesString.split(",").map((size) => size.trim());
          }
        }
      }

      setSizes(extractedSizes);
      setSelectedSize(extractedSizes[0] || extractedSizes[1]);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
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

  const [freightFee, setFreightFee] = useState(0);

  const getShippingCharges = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/shipping/get`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add authorization headers if needed
          },
        }
      );

      const data = await response.json();
      console.log("Shipping Charges Data:", data);
      setFreightFee(data.shipping || 0);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch shipping charges");
      }

      return { data };
    } catch (error) {
      throw error;
    }
  };
  useEffect(() => {
    getShippingCharges();
  }, []);

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

  const marginEntry = marginApi[productId] || { marginFlat: 0 };
  const perUnitWithMargin = unitPrice + marginEntry.marginFlat;

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
      setSelectedPrintMethod(allGroups[0]);

      // Initialize quantity and price based on first price break
      if (allGroups[0]?.price_breaks?.length > 0) {
        const firstBreak = allGroups[0].price_breaks[0];
        setCurrentQuantity(firstBreak.qty);
        setUnitPrice(firstBreak.price);
        setCurrentPrice(
          firstBreak.price * firstBreak.qty +
            (allGroups[0].setup || 0) +
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
        console.log("Colors:", product.colours.list);
        setActiveImage(
          colorImages[firstColor] || product.images?.[0] || noimage
        );
      } else {
        // Product has no colors - use first product image
        setActiveImage(product.images?.[0] || noimage);
      }
    }
  }, [product]);

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

    // Calculate pricing with margin and discount
    const marginEntry = marginApi[productId] || { marginFlat: 0 };
    const rawPerUnit = finalUnitPrice + marginEntry.marginFlat;
    const discountedPerUnit = rawPerUnit * (1 - discountPct / 100);

    // Calculate total: (discounted per-unit × qty) + setup + freight
    const total = discountedPerUnit * currentQuantity;

    setCurrentPrice(total);
  }, [
    currentQuantity,
    selectedPrintMethod,
    freightFee,
    productId,
    marginApi,
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
      console.log("product:", single_product);

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
        Number((selectedPrintMethod?.setup || 0).toFixed(2))
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
        console.log(data);
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
        console.log(data.message);
      }
    } catch (error) {
      setQuoteLoading(false);
      console.log(error.message);
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

  // Calculate final per unit price with margin and discount
  const rawPerUnit = unitPrice + marginEntry.marginFlat;
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
          // Get the base product price for current quantity
          const baseProductPrice = getPriceForQuantity(currentQuantity);

          // Sort price breaks and find the correct one for current quantity
          const sortedBreaks = [...selectedPrintMethod.price_breaks].sort(
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

          // Add margin and apply discount
          const rawPerUnit = finalUnitPrice + marginEntry.marginFlat;
          return rawPerUnit * (1 - discountPct / 100);
        })(),
        marginFlat: marginEntry.marginFlat,
        totalPrice: currentPrice,
        discountPct,
        size: selectedSize,
        code: product.code,
        color: selectedColor,
        quantity: currentQuantity, // Use the actual quantity
        print: selectedPrintMethod.description,
        logoColor: logoColor,
        freightFee: freightFee,
        setupFee: selectedPrintMethod.setup || 0,
        dragdrop: selectedFile,
        deliveryDate,
        priceBreaks: selectedPrintMethod.price_breaks,
        printMethodKey: selectedPrintMethod.key,
        userEmail: userEmail || "guest@gmail.com",
      })
    );
    navigate("/cart");
  };
  const [notRobot, setNotRobot] = useState(false);

  function filterByNames(array) {
    const namesToInclude = [
      "Materials",
      "Material",
      "Packing",
      "Features",
      "Size",
      "Item Size",
      "Sizing",
      "Product Dimensions",
      "Dimensions",
      "Fabric",
      "Tags",
      "Gender",
      "Qty Per Carton",
    ];
    const lowerCaseNames = namesToInclude.map((name) => name?.toLowerCase());
    return array?.filter((item) =>
      lowerCaseNames.includes(item?.name?.toLowerCase())
    );
  }

  const filterByNamesForDecoration = (array) => {
    const namesToInclude = ["Branding Options", "Print Areas"];
    const lowerCaseNames = namesToInclude.map((name) => name?.toLowerCase());
    return array?.filter((item) =>
      lowerCaseNames.includes(item?.name?.toLowerCase())
    );
  };

  const filterByNamesForShipping = (array) => {
    const namesToInclude = ["Packaging", "Carton Size", "Carton Notes"];
    const lowerCaseNames = namesToInclude.map((name) => name?.toLowerCase());
    return array?.filter((item) =>
      lowerCaseNames.includes(item?.name?.toLowerCase())
    );
  };

  const parseSizing = () => {
    const detailString = single_product?.product?.details?.find(
      (d) => d.name === "Sizing"
    )?.detail;
    if (!detailString) return [];
    const lines = detailString.trim().split("\n");
    if (lines.length < 3) return [];

    // Parse header (sizes)
    const sizes = lines[0].split(",").slice(1); // Skip empty first value

    // Parse measurements
    const chestValues = lines[1].split(",").slice(1);
    const lengthValues = lines[2].split(",").slice(1);

    const result = sizes.map((size, index) => {
      const chest = chestValues[index];
      const length = lengthValues[index];
      return `${size} (Half Chest ${chest} cm, Length ${length} cm)`;
    });

    return result;
  };

  if (error)
    return (
      <div className="flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 rounded-full border-t-blue-500 animate-spin"></div>
      </div>
    );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center h-screen">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
          <div className="flex flex-col items-center space-y-6">
            {/* Loading Spinner */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400 opacity-20"></div>
            </div>

            {/* Loading Text */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Loading Product Details
              </h3>
              <p className="text-sm text-gray-600">
                Please wait while we fetch the latest information...
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="Mycontainer ">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[28%_45%_24%] gap-8 mt-2">
          {/* 1st culmn  */}
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
          ) : (
            <div>
              <div className="mb-4 border border-border2">
                <img src={activeImage} alt={product?.name} className="w-full" />
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
                  <button className="p-1 text-white rounded-full custom-prev bg-smallHeader lg:p-2 md:p-1 sm:p-1">
                    <IoArrowBackOutline className="text-base text-md" />
                  </button>
                </div>

                <div className="absolute right-0 top-[47%] transform -translate-y-1/2 z-10">
                  <button className="p-1 text-white rounded-full custom-next bg-smallHeader lg:p-2 md:p-1 sm:p-1">
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
          )}
          {/* 2nd column  */}
          <div>
            <div className="flex justify-between">
              <div>
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
                      SKU: SM-{single_product?.supplier.supplier_id}-
                      {single_product?.meta.id}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200">
                    In Stock
                  </span>
                </div>
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
                                    ? "border-1 border-blue-500"
                                    : "border-slate-900"
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
            </div>

            {/* Feature/Decoration/Pricing Tabs */}
            <div className="mt-1 mb-0">
              {/* Tab headers */}
              <div className="flex gap-2 border-b">
                {[
                  { key: "pricing", label: "Pricing" },
                  { key: "features", label: "Features" },
                  { key: "decoration", label: "Decoration" },
                  { key: "shipping", label: "Shipping" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveInfoTab(tab.key)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                      activeInfoTab === tab.key
                        ? "border-smallHeader text-smallHeader"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="mt-3 rounded-lg border border-border bg-perUnit p-4">
                {activeInfoTab === "pricing" && (
                  <div className="overflow-x-auto">
                    {/* Color Selection */}
                    {/* {single_product?.product?.colours?.list.length > 0 && (
                      <div className="flex justify-between items-center gap-4 mb-2">
                        <p className="mt-2 font-medium">Color:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(() => {
                            // Extract all colors and remove duplicates
                            const allColors =
                              single_product?.product?.colours?.list
                                .flatMap((colorObj) => colorObj.colours)
                                .filter(
                                  (color, index, array) =>
                                    array.indexOf(color) === index
                                );

                            return allColors.length > 0 ? (
                              allColors.map((color, index) => {
                                const matchedColor = colornames.find(
                                  (item) =>
                                    color === item.name ||
                                    color.includes(item.name)
                                );
                                console.log(
                                  colornames.find((item) => color === item.name)
                                );

                                return (
                                  <div
                                    key={index}
                                    className={`w-5 h-5 text-xs font-medium rounded-full cursor-pointer border ${
                                      selectedColor === color
                                        ? "border-[3px] border-blue-500"
                                        : "border-slate-900"
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
                    )} */}
                    {/* Dropdowns */}
                    {availablePriceGroups.length > 0 && (
                      <div className="flex justify-between items-center gap-4">
                        <label
                          htmlFor="print-method"
                          className="w-full my-2  font-medium"
                        >
                          Print Method:
                        </label>
                        <select
                          id="print-method"
                          value={selectedPrintMethod?.key}
                          onChange={(e) => {
                            const selected = availablePriceGroups.find(
                              (method) => method.key === e.target.value
                            );
                            setSelectedPrintMethod(selected);
                            // Reset quantity to first price break of new selection
                            if (selected?.price_breaks?.length > 0) {
                              setCurrentQuantity(selected.price_breaks[0].qty);
                            }
                          }}
                          className="w-full px-2 py-2 border rounded-md outline-none pr-3"
                        >
                          {availablePriceGroups.map((method, index) => (
                            <option key={method.key} value={method.key}>
                              {method.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}{" "}
                    {/* {availablePriceGroups.length > 0 && (
                      <div className="flex justify-between items-center gap-4">
                        <label
                          htmlFor="print-method"
                          className="w-full my-2  font-medium"
                        >
                          Add ons:
                        </label>
                        <select
                          id="print-method"
                          value={selectedPrintMethod?.key}
                          onChange={(e) => {
                            const selected = availablePriceGroups.find(
                              (method) => method.key === e.target.value
                            );
                            setSelectedPrintMethod(selected);
                            // Reset quantity to first price break of new selection
                            if (selected?.price_breaks?.length > 0) {
                              setCurrentQuantity(selected.price_breaks[0].qty);
                            }
                          }}
                          className="w-full px-2 py-2 border rounded-md outline-none pr-3"
                        >
                          {availablePriceGroups.map((method, index) => (
                            <option key={method.key} value={method.key}>
                              {method.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    )} */}
                    {parseSizing().length > 1 && (
                      <div className="flex flex-col w-full mb-3">
                        <div className="flex justify-between items-center gap-4 my-2">
                          <label
                            htmlFor="print-method"
                            className="w-full my-2  font-medium"
                          >
                            Size:
                          </label>
                          <select
                            id="print-method"
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="w-full px-2 py-2 border rounded-md outline-none"
                          >
                            {parseSizing()?.map((size, index) => (
                              <option key={index} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p
                          className="w-full text-right hover:underline text-sm text-gray-600 cursor-pointer"
                          onClick={() => setShowSizeGuide(true)}
                        >
                          * See Size Guide
                        </p>
                      </div>
                    )}
                    <span className="text-sm text-gray-600 mt-3">
                      * The pricing includes 1 col - 1 position
                    </span>
                    {/* <div className="flex justify-between items-center gap-4 mb-4 ">
                      <label
                        htmlFor="logo-color"
                        className="w-full pt-3 mb-2 font-medium"
                      >
                        Logo Colour:
                      </label>
                      <select
                        value={logoColor}
                        onChange={(e) => setLogoColor(e.target.value)}
                        id="logo-color"
                        className="w-full px-2 py-2 border rounded-md outline-none"
                      >
                        <option>1 Colour Print</option>
                        <option>2 Colour Print</option>
                      </select>
                    </div> */}
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-2 pr-4">Select</th>
                          <th className="py-2 pr-4">Qty</th>
                          <th className="py-2 pr-4">Unit</th>
                          <th className="py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPrintMethod?.price_breaks?.map((item, i) => {
                          const marginEntry = marginApi[productId];
                          const baseProductPrice = getPriceForQuantity(
                            item.qty
                          );
                          const methodUnit =
                            selectedPrintMethod.type === "base"
                              ? item.price
                              : baseProductPrice + item.price;
                          const unitWithMargin = marginEntry
                            ? methodUnit + marginEntry.marginFlat
                            : methodUnit;
                          const unitDiscounted =
                            unitWithMargin * discountMultiplier;
                          const total = unitDiscounted * item.qty;
                          const isSelected = currentQuantity === item.qty;
                          return (
                            <tr
                              key={item.qty}
                              className={`border-t cursor-pointer hover:bg-blue-50/80 ${
                                isSelected
                                  ? "bg-blue-50/80"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => {
                                setCurrentQuantity(item.qty);
                                setActiveIndex(i);
                              }}
                            >
                              <td className="py-2 pr-4 align-middle">
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
                              <td className="py-2 pr-4 align-middle">
                                {i === 0 && "0 - "} {item.qty}+
                              </td>
                              <td className="py-2 pr-4 align-middle">
                                ${unitDiscounted.toFixed(2)}
                              </td>
                              <td className="py-2 align-middle">
                                ${total.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>{" "}
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
                      className="flex items-center justify-center w-full gap-3 px-2 py-3 text-white rounded-sm cursor-pointer bg-smallHeader"
                    >
                      <button className="text-sm uppercase">Add to cart</button>
                      <IoCartOutline className="text-xl" />
                    </Link>
                  </div>
                )}
                {activeInfoTab === "features" && (
                  <div className="space-y-1">
                    {/* Brief Description */}
                    {single_product?.product?.description && (
                      <>
                        {single_product.product.description.includes(
                          "Features:"
                        ) && (
                          <div className="text-sm leading-6 text-gray-800 mb-2">
                            <span className="font-semibold">Features:</span>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                              {single_product.product.description
                                .split("Features:")[1]
                                ?.split("\n")
                                .filter((item) => item.trim().startsWith("*"))
                                .map((feature, index) => (
                                  <li key={index} className="text-gray-800">
                                    {feature.replace("*", "").trim()}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                        <span className="font-semibold">Description:</span>
                        <p className="text-sm leading-6 text-gray-800">
                          {
                            single_product.product.description.split(
                              "Features:"
                            )[0]
                          }
                        </p>
                      </>
                    )}

                    {/* Highlights chips */}
                    {Array.isArray(single_product?.product?.features) &&
                      single_product.product.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {single_product.product.features
                            .slice(0, 8)
                            .map((f, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 ring-1 ring-inset ring-gray-200"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-smallHeader" />
                                {f}
                              </span>
                            ))}
                        </div>
                      )}

                    {/* Specifications Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-2">
                      <div className="bg-gray-50 pl-6 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Specifications
                        </h3>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <tbody className="divide-y divide-gray-200">
                            {/* API Details */}
                            {Array.isArray(single_product?.product?.details) &&
                              filterByNames(
                                single_product?.product?.details
                              ).map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3 capitalize">
                                    {item?.name || "Detail"}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-pre-line">
                                    {item?.detail?.split(";").join("\n") || "-"}
                                  </td>
                                </tr>
                              ))}

                            {/* Fallback specs */}
                            {single_product?.product?.material && (
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3">
                                  Material
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {single_product.product.material}
                                </td>
                              </tr>
                            )}

                            {single_product?.product?.dimensions && (
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3">
                                  Dimensions
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {single_product.product.dimensions}
                                </td>
                              </tr>
                            )}

                            {single_product?.product?.packaging && (
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3">
                                  Packaging
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {single_product.product.packaging}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeInfoTab === "decoration" && (
                  <div className="space-y-3 text-sm leading-6">
                    {filterByNamesForDecoration(single_product.product.details)
                      ?.length > 0 ? (
                      filterByNamesForDecoration(
                        single_product.product.details
                      ).map((d, i) => (
                        <div key={i} className="border-b last:border-0 pb-3">
                          <p className="font-semibold">{d.method || d.name}</p>
                          {d?.positions && (
                            <p className="text-gray-600">
                              Positions: {d.positions.join(", ")}
                            </p>
                          )}
                          {d?.max_colors && (
                            <p className="text-gray-600">
                              Max colors: {d.max_colors}
                            </p>
                          )}
                          {d?.detail && (
                            <p className="text-gray-600">
                              {d?.detail?.split(";" || ":" || ".").join("\n") ||
                                "-"}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No decoration info available.</p>
                    )}
                  </div>
                )}
                {activeInfoTab === "shipping" && (
                  <div className="space-y-3 text-sm leading-6">
                    {filterByNamesForShipping(single_product.product.details)
                      ?.length > 0 ? (
                      filterByNamesForShipping(
                        single_product.product.details
                      )?.map((d, i) => (
                        <div key={i} className="border-b last:border-0 pb-3">
                          <p className="font-semibold">{d.method || d.name}</p>

                          {d?.detail && (
                            <p className="text-gray-600">
                              {d?.detail?.split(". ").join("\n") || "-"}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No decoration info available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 3rd column  */}

          <div className="">
            {/* Consolidated Order Summary */}
            <div className="bg-white rounded-none border border-gray-200 shadow-sm lg:sticky lg:top-4">
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
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 ring-1 ring-inset ring-gray-200">
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
              <div className="px-6 py-2">
                {/* Action Buttons */}
                <div className="space-y-3 mt-2">
                  <div
                    onClick={() => setShowQuoteForm(!showQuoteForm)}
                    className="flex items-center justify-center gap-2 py-2 text-white cursor-pointer bg-smallHeader"
                  >
                    <img src="/money.png" alt="" />
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
                          marginFlat: marginEntry.marginFlat,
                          discountPct,
                          totalPrice: perUnitWithMargin * 1, // optional: a helpful hint, reducer recalculates
                          code: product.code,
                          color: selectedColor,
                          quantity: 1, // Force quantity to 1 for sample
                          print: selectedPrintMethod?.description || "",
                          logoColor: logoColor,
                          size: selectedSize,
                          setupFee: selectedPrintMethod?.setup || 0,
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
                    className="flex items-center justify-center gap-2 py-2 mt-2 text-white cursor-pointer bg-buy"
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
                    <p className="text-white bg-gren p-1 rounded-[50%] text-xs ">
                      <FaCheck />
                    </p>
                    <p className="text-sm">
                      Color:{" "}
                      {selectedColor ? selectedColor : "No color selected"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 pt-3 ">
                    <p className="text-white bg-gren p-1 rounded-[50%] text-xs ">
                      <FaCheck />
                    </p>
                    <p className="text-sm">
                      Print Method:{" "}
                      {selectedPrintMethod?.description || "Not selected"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 pt-3 ">
                    <p className="text-white bg-gren p-1 rounded-[50%] text-xs ">
                      <FaCheck />
                    </p>
                    <p className="text-sm">
                      Selected SIze: &nbsp;
                      {selectedSize || "Not selected"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 pt-3 ">
                    <p className="text-white bg-gren p-1 rounded-[50%] text-xs ">
                      <FaCheck />
                    </p>
                    <p className="text-sm">
                      Logo Color: {logoColor || "No logo color selected"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 pt-3 ">
                    <p className="text-white bg-gren p-1 rounded-[50%] text-xs ">
                      <FaCheck />
                    </p>
                    {/* <p className='text-sm'>Quantity: {quantity2[activeIndex]?.sell || 50}</p> */}
                    <p className="text-sm">Quantity: {currentQuantity}</p>
                  </div>

                  <div className="flex items-start gap-2 pt-3 ">
                    <p className="text-white bg-gren p-1 rounded-[50%] text-xs ">
                      <FaCheck />
                    </p>
                    <p className="text-sm">
                      Setup Charge: $
                      {selectedPrintMethod?.setup?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 pt-3 ">
                    <p className="text-white bg-gren p-1 rounded-[50%] text-xs ">
                      <FaCheck />
                    </p>
                    <p className="text-sm">
                      Freight Charge: ${freightFee.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Show on click */}

          {/* Show on click */}
        </div>
      </div>

      {/* Tabs moved above within the middle column for better UX */}

      {/* Quote Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Get Express Quote
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  We'll email you a detailed quote within 24 hours
                </p>
              </div>
              <button
                onClick={() => setShowQuoteForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-2">
              {/* Selected Product Summary */}
              <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">
                      Selected Product:{" "}
                      <span className="text-sm font-semibold text-gray-900">
                        {product?.name || "Product"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3 text-sm text-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Color</span>
                    <span className="font-medium">
                      {selectedColor || "Not selected"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Size</span>
                    <span className="font-medium">
                      {selectedSize || "Not selected"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Print Method</span>
                    <span className="font-medium truncate max-w-[180px] text-right">
                      {selectedPrintMethod?.description || "Not selected"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-semibold">{currentQuantity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Unit Price</span>
                    <span className="font-semibold">
                      ${discountedUnitPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-extrabold text-smallHeader">
                      ${currentPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <form className="space-y-3">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      type="text"
                      placeholder="Your full name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      name="email"
                      value={formData.email}
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      type="tel"
                      placeholder="+61 410 123 456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery State *
                    </label>
                    <input
                      name="delivery"
                      value={formData.delivery}
                      type="text"
                      placeholder="e.g., Sydney, Melbourne"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo/Artwork Files
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg px-4 py-2 text-center transition-colors ${
                      isDragging2
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragEnter={handleDragEnter2}
                    onDragLeave={handleDragLeave2}
                    onDragOver={handleDragOver2}
                    onDrop={handleDrop2}
                  >
                    {selectedFile2 ? (
                      <div className="space-y-4">
                        <img
                          src={previewImage2}
                          alt="Uploaded File"
                          className="mx-auto max-w-[120px] max-h-[120px] object-contain rounded-lg"
                        />
                        <p className="text-sm text-green-600 font-medium">
                          File uploaded successfully!
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile2(null);
                            setPreviewImage2(null);
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="w-full space-y-1">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <div className="w-full flex justify-center items-center gap-2">
                          <p className="text-sm text-gray-600">
                            {isDragging2
                              ? "Drop files here"
                              : "Drag and drop your files here, or"}
                          </p>
                          <button
                            type="button"
                            onClick={handleDivClick2}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            browse files
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Supported: AI, EPS, SVG, PDF, JPG, JPEG, PNG (Max
                          16MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      id="fileUpload2"
                      accept=".ai, .eps, .svg, .pdf, .jpg, .jpeg, .png"
                      className="hidden"
                      onChange={handleFileChange2}
                    />
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Comments
                  </label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    placeholder="Tell us about your project requirements, special instructions, or any questions you have..."
                    className="w-full px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32 resize-none"
                    onChange={handleChange}
                    rows={2}
                  />
                </div>

                {/* Terms and Submit */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="not-robot"
                      checked={notRobot}
                      onChange={() => setNotRobot(!notRobot)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <label
                      htmlFor="not-robot"
                      className="text-sm text-gray-700"
                    >
                      I confirm that I'm not a robot and agree to the{" "}
                      <a
                        href="/privacy"
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowQuoteForm(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={onSubmitHandler}
                      disabled={!notRobot || quoteLoading}
                      className="flex-1 px-6 py-3 bg-smallHeader text-white rounded-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {quoteLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending Quote Request...
                        </div>
                      ) : (
                        "Send Quote Request"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Service Benefits Section - Simple & Minimalistic */}
      <div className="bg-gray-50 py-12 my-16">
        <div className="Mycontainer">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Free Mockup */}
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Free Mockup
              </h3>
              <p className="text-sm text-gray-600">Professional Design</p>
            </div>

            {/* Fast & Free Delivery */}
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19,7H16V6A4,4 0 0,0 8,6H11A4,4 0 0,0 19,6V7M11,4A2,2 0 0,1 13,6V7H5V6A2,2 0 0,1 7,4H11M4,10H20L19,9H5L4,10M6,12H18V14H6V12M4,15H20V17H4V15M6,18H18V20H6V18Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Fast Delivery
              </h3>
              <p className="text-sm text-gray-600">2 - 4 working days*</p>
            </div>

            {/* Zero Setup Fees */}
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Zero Setup Fees
              </h3>
              <p className="text-sm text-gray-600">No hidden charges</p>
            </div>

            {/* Low MOQs */}
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Low MOQs
              </h3>
              <p className="text-sm text-gray-600">Order what you need</p>
            </div>

            {/* AfterPay */}
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-teal-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                AfterPay
              </h3>
              <p className="text-sm text-gray-600">Promo now, AfterPay later</p>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowSizeGuide(false)}
            ></div>

            {/* Modal */}
            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Size Guide
                  </h3>
                  <button
                    onClick={() => setShowSizeGuide(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* General Size Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      How to Measure
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      To find your perfect size, measure your body as follows:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>
                        • <strong>Chest:</strong> Measure around the fullest
                        part of your chest
                      </li>
                      <li>
                        • <strong>Waist:</strong> Measure around your natural
                        waistline
                      </li>
                      <li>
                        • <strong>Hip:</strong> Measure around the fullest part
                        of your hips
                      </li>
                      <li>
                        • <strong>Length:</strong> Measure from shoulder to
                        desired length
                      </li>
                    </ul>
                  </div>

                  {/* Product Size Chart */}
                  {parseSizing().length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-4 text-center">
                        Product Size Chart
                      </h4>
                      <div className="space-y-1">
                        {parseSizing().map((sizeInfo, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded-lg border-b ${
                              index % 2 === 0
                                ? "bg-gray-50 border-gray-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900 text-center">
                              {sizeInfo}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-yellow-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <p className="text-sm text-yellow-800">
                          Size information not available for this product
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Additional Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Important Notes
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• All measurements are in centimeters</li>
                      <li>
                        • Sizes may vary slightly between different products
                      </li>
                      <li>
                        • If you're between sizes, we recommend choosing the
                        larger size
                      </li>
                      <li>
                        • For custom sizing, please contact our customer service
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(false)}
                  className="w-full inline-flex justify-center rounded-md bg-smallHeader px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 sm:ml-3 sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetails;
