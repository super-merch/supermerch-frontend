import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TbTruckDelivery } from "react-icons/tb";
import { AiOutlineEye } from "react-icons/ai";
import { BsCursor } from "react-icons/bs";
import { IoIosHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { IoCartOutline, IoClose } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import noimage from "/noimage.png";
import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ProductCard from "./ProductCard";

const Stationery = ({ activeTab }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { marginApi} = useContext(AppContext);
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);
  const productsCacheRef = useRef({});
  const pendingClothingRequestsRef = useRef({});

  const [cardHover, setCardHover] = useState(null);
  const favSet = new Set();

  favouriteItems.map((item) => {
    favSet.add(item.meta.id);
  });
  const dispatch = useDispatch();

  // Fetch products when tab opens
  useEffect(() => {
    if (activeTab === "Stationery" && products.length === 0) {
      fetchClothingProducts();
    }
  }, [activeTab]);

  const fetchClothingProducts = async () => {
    setLoading(true);
    setError(null);

    const category = "Stationery"; // same as your original URL
    const page = 1;
    const limit = 8;
    const key = `${category}_${page}_${limit}`;

    try {
      // 1) return cached page if present
      const cachedPage = productsCacheRef.current?.[category]?.pages?.[page];
      if (cachedPage) {
        // cachedPage is the full API response (same shape as `data`)
        setProducts((cachedPage.data || []).slice(0, limit));
        setLoading(false);
        return cachedPage;
      }

      // 2) if an identical request is already in-flight, await and reuse it
      if (pendingClothingRequestsRef.current[key]) {
        const inFlight = await pendingClothingRequestsRef.current[key];
        setProducts((inFlight.data || []).slice(0, limit));
        setLoading(false);
        return inFlight;
      }

      // 3) create & store promise so concurrent calls reuse it
      const promise = (async () => {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/client-products/category?category=${category}&page=${page}&limit=${limit}&filter=true`
        );

        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

        if (!data || !data.data) {
          throw new Error("Unexpected API response structure");
        }

        // store full response in cache under category -> pages -> page
        productsCacheRef.current[category] = {
          ...(productsCacheRef.current[category] || { pages: {} }),
          pages: {
            ...(productsCacheRef.current[category]?.pages || {}),
            [page]: data,
          },
        };

        return data;
      })();

      pendingClothingRequestsRef.current[key] = promise;

      // await the promise, update UI
      const result = await promise;
      setProducts((result.data || []).slice(0, limit));
      return result;
    } catch (err) {
      console.error("Error fetching clothing products:", err);
      setError(err.message || "Error fetching products");
    } finally {
      // clean up pending marker and loading state
      delete pendingClothingRequestsRef.current[key];
      setLoading(false);
    }
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    document.body.style.overflow = "unset";
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  const slugify = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      // replace any sequence of non-alphanumeric chars with a single hyphen
      .replace(/[^a-z0-9]+/g, "-")
      // remove leading/trailing hyphens
      .replace(/(^-|-$)/g, "");

  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId); // base64 encode
    const slug = slugify(name);
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 rounded-full border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {activeTab === "Stationery" && (
        <div className="pb-10 Mycontainer">
          <div className="grid gap-5 max-default:grid-cols-1 lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative p-2 sm:p-4 border rounded-lg shadow-md border-border2"
                  >
                    <Skeleton
                      height={150}
                      className="sm:h-[200px] rounded-md"
                    />
                    <div className="p-2 sm:p-4">
                      <Skeleton
                        height={16}
                        width={100}
                        className="sm:h-5 sm:w-[120px] rounded"
                      />
                      <Skeleton
                        height={12}
                        width={60}
                        className="mt-2 sm:h-[15px] sm:w-20 rounded"
                      />
                      <Skeleton
                        height={20}
                        width={80}
                        className="mt-3 sm:h-[25px] sm:w-[100px] rounded"
                      />
                      <Skeleton
                        height={12}
                        width={50}
                        className="mt-2 sm:h-[15px] sm:w-[60px] rounded"
                      />
                      <div className="flex items-center justify-between pt-2">
                        <Skeleton
                          height={16}
                          width={60}
                          className="sm:h-5 sm:w-20 rounded"
                        />
                        <Skeleton
                          height={16}
                          width={60}
                          className="sm:h-5 sm:w-20 rounded"
                        />
                      </div>
                      <div className="flex justify-between gap-1 mt-4 sm:mt-6 mb-2">
                        <Skeleton
                          circle
                          height={32}
                          width={32}
                          className="sm:h-10 sm:w-10"
                        />
                        <Skeleton
                          height={32}
                          width={80}
                          className="sm:h-10 sm:w-[120px] rounded"
                        />
                        <Skeleton
                          circle
                          height={32}
                          width={32}
                          className="sm:h-10 sm:w-10"
                        />
                      </div>
                    </div>
                  </div>
                ))
              : products
                  ?.filter((product) => {
                    const priceGroups =
                      product.product?.prices?.price_groups || [];
                    const basePrice =
                      priceGroups.find((group) => group?.base_price) || {};
                    const priceBreaks =
                      basePrice.base_price?.price_breaks || [];
                    return (
                      priceBreaks.length > 0 &&
                      priceBreaks[0]?.price !== undefined
                    );
                  })
                  .map((product) => {
                    const priceGroups =
                      product.product?.prices?.price_groups || [];
                    const basePrice =
                      priceGroups.find((group) => group?.base_price) || {};
                    const priceBreaks =
                      basePrice.base_price?.price_breaks || [];

                    // Get an array of prices from priceBreaks (these are already discounted)
                    const prices = priceBreaks
                      .map((breakItem) => breakItem.price)
                      .filter((price) => price !== undefined);

                    // 1) compute raw min/max
                    let minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                    let maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                    // 2) pull margin info (guarding against undefined)
                    const productId = product.meta.id;
                    const marginEntry = marginApi[productId] || {};
                    const marginFlat =
                      typeof marginEntry.marginFlat === "number"
                        ? marginEntry.marginFlat
                        : 0;
                    const baseMarginPrice =
                      typeof marginEntry.baseMarginPrice === "number"
                        ? marginEntry.baseMarginPrice
                        : 0;

                    // 3) apply the flat margin to both ends of the range
                    minPrice += marginFlat;
                    maxPrice += marginFlat;

                    // Get discount percentage from product's discount info
                    const discountPct = product.discountInfo?.discount || 0;
                    const isGlobalDiscount =
                      product.discountInfo?.isGlobal || false;

                    return (
                      <ProductCard
                        key={productId}
                        product={product}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        discountPct={discountPct}
                        isGlobalDiscount={isGlobalDiscount}
                        favSet={favSet}
                        isHovered={cardHover === product.meta.id}
                        onClickView={() =>
                          handleViewProduct(
                            product.meta.id,
                            product.overview.name
                          )
                        }
                        onAddFavourite={() => {
                          dispatch(addToFavourite(product));
                          toast.success("Product added to favourites");
                        }}
                        onMouseEnter={() => setCardHover(product.meta.id)}
                        onMouseLeave={() => setCardHover(null)}
                      />
                    );
                  })}
          </div>
        </div>
      )}
      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full mx-4 bg-white rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <IoClose className="text-2xl text-gray-600" />
            </button>

            <div className="p-6">
              <img
                src={selectedProduct.overview.hero_image || noimage}
                alt={selectedProduct.overview.name || "Product Image"}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />

              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-brand mb-2">
                  {selectedProduct.overview.name || "No Name"}
                </h2>
                <p className="text-gray-600 mb-2">
                  Code: {selectedProduct.overview.code}
                </p>
                {selectedProduct.overview.description && (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedProduct.overview.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Stationery;
