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
import DescripTabs from "./DescriptionTabs/DescripTabs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ProductDetails = () => {
  const [userEmail, setUserEmail] = useState(null);
  const currentUserCartItems = useSelector(selectCurrentUserCartItems);
  //get id from navigate's state

  // const { id } = useParams();
    const { state: id } = useLocation();
    console.log(id)

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
        extractedSizes = details[0].detail.split(",").map(size => size.trim());
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
            const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
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
            extractedSizes = sizesString.split(",").map(size => size.trim());
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
        console.log("Colors:",product.colours.list);
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
      formData1.append(
        "price",
        Number(
          single_product?.product?.prices?.price_groups[0]?.base_price
            .price_breaks[0]?.price
        )
      );
      formData1.append(
        "quantity",
        Number(
          single_product?.product?.prices?.price_groups[0]?.base_price
            .price_breaks[0]?.qty
        )
      );
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

  if (error)
    return (
      <div className="flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 rounded-full border-t-blue-500 animate-spin"></div>
      </div>
    );

  return (
    <>
      <div className="Mycontainer ">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[28%_45%_24%] gap-8 mt-8">
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
                  <button className="p-1 text-white rounded-full custom-prev bg-smallHeader lg:p-2 md:p-2 sm:p-2">
                    <IoArrowBackOutline className="text-base lg:text-xl md:text-xl sm:text-xl" />
                  </button>
                </div>

                <div className="absolute right-0 top-[47%] transform -translate-y-1/2 z-10">
                  <button className="p-1 text-white rounded-full custom-next bg-smallHeader lg:p-2 md:p-2 sm:p-2">
                    <IoMdArrowForward className="text-base lg:text-xl md:text-xl sm:text-xl" />
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
            <h2
              className={`text-2xl ${
                product?.name ? "font-bold" : "font-medium"
              }`}
            >
              {product?.name ? product?.name : "Loading ..."}
            </h2>
            {/* <div className="flex flex-wrap items-center ">
              <span className="text-2xl text-smallHeader">★★★★★</span>
              <p className="ml-2 text-gray-600">
                4.7 Star Rating (1767 User Feedback)
              </p>
            </div> */}
            <div className="flex items-center justify-between py-2 border-b-2">
              {!loading &&<p className="text-black">SM-{single_product?.supplier.supplier_id}-{single_product?.meta.id}</p>}
              <p className="font-bold text-smallHeader">
                <span className="font-normal text-stock"> Availability:</span>{" "}
                In Stock
              </p>
            </div>

            {/* Color Selection */}
            {single_product?.product?.colours?.list.length > 0 && (
              <div className="mb-2">
                <p className="mt-2 font-medium">Color:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(() => {
                    // Extract all colors and remove duplicates
                    const allColors = single_product?.product?.colours?.list
                      .flatMap((colorObj) => colorObj.colours)
                      .filter(
                        (color, index, array) => array.indexOf(color) === index
                      );

                    return allColors.length > 0 ? (
                      allColors.map((color, index) => (
                        <div
                          key={index}
                          className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer border ${
                            selectedColor === color
                              ? "border-[3px] border-blue-500"
                              : "border-slate-900"
                          }`}
                          onClick={() => handleColorClick(color)}
                        >
                          {color}
                        </div>
                      ))
                    ) : (
                      <p>No colors available for this product</p>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Dropdowns */}

            {availablePriceGroups.length > 0 && (
              <div className="">
                <label
                  htmlFor="print-method"
                  className="block my-2  font-medium"
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
                      console.log(
                        "Selected price breaks:",
                        selected.price_breaks[0].qty
                      );
                      setCurrentQuantity(selected.price_breaks[0].qty);
                    }
                  }}
                  className="w-full px-2 py-4 border rounded-md outline-none"
                >
                  {availablePriceGroups.map((method, index) => (
                    <option key={method.key} value={method.key}>
                      {method.description}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {sizes.length > 1 && (
              <div className="">
                <label
                  htmlFor="print-method"
                  className="block my-2  font-medium"
                >
                  Print Method:
                </label>
                <select
                  id="print-method"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full px-2 py-4 border rounded-md outline-none"
                >
                  {sizes
                    .filter((item) => item !== "") // Remove empty strings first
                    .map((item) => {
                      // Extract only the part before \n if it exists
                      const sizePart = item.includes("\n")
                        ? item.split("\n")[0]
                        : item;
                      return sizePart;
                    })
                    .filter((size) => {
                      // Now filter for valid sizes (S, M, L, XL, 2XL, 3XL, etc.)
                      return /^[0-9]*[A-Za-z]+$/.test(size);
                    })
                    .map((size, index) => (
                      <option key={index} value={size}>
                        {size}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="mb-4 ">
              <label
                htmlFor="logo-color"
                className="block pt-3 mb-2 font-medium"
              >
                Logo Colour:
              </label>
              <select
                value={logoColor}
                onChange={(e) => setLogoColor(e.target.value)}
                id="logo-color"
                className="w-full px-2 py-4 border rounded-md outline-none"
              >
                <option>1 Colour Print</option>
                <option>2 Colour Print</option>
              </select>
            </div>

            <div>
              <p className="mt-2 mb-2 text-sm font-medium ">
                {" "}
                Quantity ({currentQuantity}):
              </p>

              <div className="grid gap-2 mt-4 lg:grid-cols-4 max-md:grid-cols-3 max-default:grid-cols-2">
                {selectedPrintMethod?.price_breaks?.map((item, i) => {
                  const marginEntry = marginApi[productId];

                  // Get base product price for this quantity
                  const baseProductPrice = getPriceForQuantity(item.qty);

                  // Calculate final unit price based on print method type
                  let finalUnitPrice;
                  if (selectedPrintMethod.type === "base") {
                    finalUnitPrice = item.price;
                  } else {
                    finalUnitPrice = baseProductPrice + item.price;
                  }

                  const rawTierPrice = marginEntry
                    ? finalUnitPrice + marginEntry.marginFlat
                    : finalUnitPrice;

                  const discountedTierPrice = rawTierPrice * discountMultiplier;

                  return (
                    <div
                      className={`flex cursor-pointer justify-center border border-smallHeader items-end gap-2 px-2 py-3 ${
                        activeIndex === i ? "border-blue-500 bg-blue-50" : ""
                      }`}
                      key={i}
                      // onClick={() => handleBoxClick(i)}
                      onClick={() => {
                        setCurrentQuantity(item.qty);
                        setActiveIndex(i);
                      }}
                    >
                      {activeIndex === i && (
                        <span className="bg-smallHeader p-1 rounded-[50%] ">
                          <FaCheck className="text-sm text-white" />
                        </span>
                      )}
                      <div>
                        <p className="text-sm text-center">
                          {i === 0 && "0 - "}
                          {item.qty}+
                        </p>
                        <p className="text-sm">
                          $
                          {discountedTierPrice.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div
                  className="flex justify-center px-4 py-4 text-center border cursor-pointer border-smallHeader lg:col-span-2 max-md:col-span-3 max-default:col-span-2"
                  onClick={() => setShowQuoteForm(true)}
                >
                  <p className="text-sm font-semibold">Larger Order?</p>
                </div>
              </div>
            </div>
            <div className="mt-3 mb-3">
              <div className="py-3 border rounded-md border-smallHeader">
                <div className="flex items-center justify-between gap-2 px-6">
                  <button onClick={handleDecrement} className="text-2xl">
                    -
                  </button>
                  <input
                    type="text"
                    value={currentQuantity}
                    onChange={handleInputChange}
                    className="text-xl text-center w-[80%] border-none outline-none"
                    min="1"
                  />
                  <button onClick={handleIncrement} className="text-2xl">
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Drag and Drop Section */}
            <div
              className={`px-6 py-2 mb-4 text-center border-2 border-dashed cursor-pointer bg-dots transition-all duration-200 ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-smallHeader"
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
              {/* <p className="mb-1 text-xl font-semibold text-smallHeader">
                Upload artwork or logo
              </p> */}
              <p className="text-smallHeader  m-auto text-sm">
                Supported formats: AI, EPS, SVG, PDF, JPG, JPEG, PNG. Max file
                size: 16 MB
              </p>
              <input
                type="file"
                id="fileUpload"
                accept=".ai, .eps, .svg, .pdf, .jpg, .jpeg, .png"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

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
          {/* 3rd column  */}

          <div className="">
            <div className="px-6 py-5 border bg-perUnit border-border">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xl font-bold text-smallHeader">
                  $
                  {discountedUnitPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs font-normal text-smallHeader">
                  (Per Unit)
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4 ">
                <p className="text-2xl font-bold text-smallHeader ">
                  $
                  {currentPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs font-normal text-smallHeader">(Total)</p>
              </div>

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
              {showQuoteForm && (
                <div className="bg-perUnit border border-border py-5 mt-0.5">
                  <button className="w-full py-3 text-sm text-white bg-smallHeader">
                    We'll Email You A Quote
                  </button>
                  <div className="px-6 mt-7">
                    <input
                      name="name"
                      value={formData.name}
                      type="text"
                      placeholder="Your name"
                      className="w-full p-3 rounded shadow outline-none shadow-shadow bg-line"
                      onChange={handleChange}
                    />
                    <input
                      name="email"
                      value={formData.email}
                      type="email"
                      placeholder="Email"
                      className="w-full p-3 mt-2 rounded shadow outline-none shadow-shadow"
                      onChange={handleChange}
                    />
                    <input
                      name="phone"
                      value={formData.phone}
                      type="phone"
                      placeholder="Phone"
                      className="w-full p-3 mt-2 rounded shadow outline-none shadow-shadow"
                      onChange={handleChange}
                    />
                    <input
                      name="delivery"
                      value={formData.delivery}
                      type="text"
                      placeholder="Delivery state"
                      className="w-full p-3 mt-2 rounded shadow outline-none shadow-shadow"
                      onChange={handleChange}
                    />

                    <div>
                      <p className="pt-6 text-xs">Logo Artworks</p>
                      {/* Enhanced Second Drag and Drop Section */}
                      <div
                        className={`px-5 mt-4 text-center border shadow cursor-pointer shadow-shadow py-7 transition-all duration-200 ${
                          isDragging2
                            ? "border-blue-500 bg-blue-50"
                            : "border-smallHeader bg-line"
                        }`}
                        onDragEnter={handleDragEnter2}
                        onDragLeave={handleDragLeave2}
                        onDragOver={handleDragOver2}
                        onDrop={handleDrop2}
                      >
                        {selectedFile2 ? (
                          <img
                            // value={formData.file}
                            src={previewImage2}
                            alt="Uploaded File"
                            className="flex m-auto max-w-[100px] max-h-[100px] object-contain"
                          />
                        ) : (
                          <>
                            <img
                              src="/drag.png"
                              alt="Drag"
                              className="flex m-auto text-smallHeader"
                            />
                            <p className="pt-4 text-xs">
                              {isDragging2
                                ? "Drop files here"
                                : "Drop files here or"}
                            </p>
                          </>
                        )}
                        <button
                          onClick={handleDivClick2}
                          className="w-full py-3 mt-4 text-sm font-bold text-white uppercase rounded bg-smallHeader"
                        >
                          select file
                        </button>
                        <input
                          type="file"
                          id="fileUpload2"
                          accept=".ai, .eps, .svg, .pdf, .jpg, .jpeg, .png"
                          className="hidden"
                          onChange={handleFileChange2}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="pt-3 text-xs">
                        Accepted file types: ai, eps, svg, pdf, jpg, jpeg, png,
                        Max. file size: 16 MB.
                      </p>
                      <textarea
                        onChange={handleChange}
                        value={formData.comment}
                        name="comment"
                        placeholder="comment"
                        id=""
                        className="w-full px-4 py-3 mt-4 border shadow outline-none h-36 shadow-shadow bg-line border-smallHeader"
                      ></textarea>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-4 mt-3 mb-5 border border-border">
                      <input
                        type="checkbox"
                        id="not-robot"
                        onClick={() => setNotRobot(!notRobot)}
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor="not-robot"
                        id="not-robot"
                        onClick={() => setNotRobot(!notRobot)}
                        className="text-sm"
                      >
                        I'm not a robot
                      </label>
                    </div>

                    {notRobot ? (
                      <button
                        onClick={onSubmitHandler}
                        className="w-full py-3 font-medium text-white rounded-md bg-smallHeader"
                      >
                        {quoteLoading ? "LOADING..." : " GET YOUR QUOTE"}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 font-medium text-white rounded-md bg-gray-400 cursor-not-allowed"
                      >
                        {quoteLoading ? "LOADING..." : " GET YOUR QUOTE"}
                      </button>
                    )}
                  </div>
                </div>
              )}
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
                    Color: {selectedColor ? selectedColor : "No color selected"}
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
                    Selected SIze:{" "}&nbsp;
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
              {/* <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs">See our 87 reviews on</p>
                <img src="/star.png" alt="" />
              </div> */}
            </div>

            {/* Show on click */}

            {/* Show on click */}
          </div>
        </div>
      </div>
      <div className="mt-12">
        <DescripTabs single_product={single_product} />
      </div>
    </>
  );
};

export default ProductDetails;
