import { addToFavourite } from "@/redux/slices/favouriteSlice";
import { useContext, useEffect, useState } from "react";
import { CiHeart } from "react-icons/ci";
import { IoIosHeart } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ProductsContext } from "../../../context/ProductsContext";
import noimage from "/noimage.png";
import ProductCard from "./ProductCard";

const AllProducts = ({ activeTab }) => {
  const navigate = useNavigate();
  const {
    fetchProducts,
    error,
    marginAdd,
    marginApi,
    getGlobalDiscount,
    totalDiscount,
  } = useContext(ProductsContext);

  useEffect(() => {
    if (!Object.keys(marginApi).length) {
      marginAdd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginApi]);

  useEffect(() => {
    if (!Object.keys(marginApi).length) {
      marginAdd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginApi]);

  // Local state for products to avoid conflicts with other tabs
  const [products, setProducts] = useState([]);
  const [skeletonLoading, setSkeletonLoading] = useState(false);

  // State for modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Local fetch function for AllProducts
  const fetchAllProducts = async () => {
    setSkeletonLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/client-products?page=1&limit=8&sort=relevance&filter=true`
      );

      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();

      if (!data || !data.data) {
        throw new Error("Unexpected API response structure");
      }

      setProducts(data.data);
      setSkeletonLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setSkeletonLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if activeTab is "All Product" to avoid unnecessary calls
    if (activeTab === "All Product" && products.length === 0) {
      // fetchProducts(1, "", 8);
      fetchAllProducts();
    }
  }, [activeTab]); // Changed dependency to activeTab instead of empty array

  const dispatch = useDispatch();

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

  const { favouriteItems } = useSelector((state) => state.favouriteProducts);

  const [cardHover, setCardHover] = useState(null);
  const favSet = new Set();

  favouriteItems.map((item) => {
    favSet.add(item.meta.id);
  });

  // Function to open modal
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  };

  // Function to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    // Restore body scroll
    document.body.style.overflow = "unset";
  };
  const visibleProductList = products.filter((product) => {
    const disc = product?.meta?.discontinued;
    return !(disc === true || disc === "true");
  });

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  if (error)
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          Issue getting products reload your page. Or come back later.
        </div>
      </div>
    );
  return (
    <>
      {activeTab === "All Product" && (
        <div className="pb-10 Mycontainer">
          <div className="grid gap-6 max-default:grid-cols-1 lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
            {skeletonLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative p-4 border rounded-xl shadow-lg border-border2 bg-white hover:shadow-xl transition-all duration-300"
                  >
                    <Skeleton
                      height={150}
                      className="sm:h-[200px] rounded-t-xl"
                    />
                    <div className="p-4 rounded-b-xl">
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
                    // Check if there's at least one valid price
                    return (
                      priceBreaks.length > 0 &&
                      priceBreaks[0]?.price !== undefined
                    );
                  })
                  .slice(0, 4)
                  .map((product, index) => {
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
                    minPrice += (minPrice * marginFlat) / 100;
                    maxPrice += (maxPrice * marginFlat) / 100;

                    // Get discount percentage from product's discount info
                    const discountPct = product.discountInfo?.discount || 0;
                    const isGlobalDiscount =
                      product.discountInfo?.isGlobal || false;

                    return (
                      <ProductCard 
                        priority={index < 4}
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

      {/* Modal for enlarged product image */}
      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full mx-4 bg-white rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <IoClose className="text-2xl text-gray-600" />
            </button>

            {/* Image container */}
            <div className="p-6">
              <img
                src={selectedProduct.overview.hero_image || noimage}
                alt={selectedProduct.overview.name || "Product Image"}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />

              {/* Product info */}
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

export default AllProducts;
