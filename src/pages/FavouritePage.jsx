import React, { useState, useEffect, useContext } from "react";
import { IoClose } from "react-icons/io5";
import { FaHeart, FaShoppingBag } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeFromFavourite } from "../redux/slices/favouriteSlice";
import { toast } from "react-toastify";
import { AppContext } from "@/context/AppContext";
import { ProductCard } from "@/components/Common";
import { getProductPrice, backgroundColor } from "@/utils/utils";

const FavouritePage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { productionIds, australiaIds } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);
  const [cardHover, setCardHover] = useState(null);

  const navigate = useNavigate();

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
  const favSet = new Set();

  favouriteItems.map((item) => {
    favSet.add(item.meta.id);
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

  const handleRemoveFavourite = (product) => {
    toast.success("Product removed from favourites");
    dispatch(removeFromFavourite(product));
  };

  return (
    <div className="my-10">
      <div className=" Mycontainer">
        <h2 className="mb-5 text-2xl font-semibold text-center">Favourites</h2>
        <div
          className={`grid gap-5 max-default:grid-cols-1 ${
            favouriteItems.length > 0
              ? "lg:grid-cols-4 max-default:grid-cols-1 max-md:grid-cols-3 max-sm:grid-cols-2"
              : "lg:grid-cols-1"
          }`}
        >
          {favouriteItems.length > 0 ? (
            favouriteItems?.map((product) => {
              return (
                <ProductCard
                  key={product.meta.id}
                  product={product}
                  productionIds={productionIds}
                  australiaIds={australiaIds}
                  favSet={favSet}
                  getProductPrice={getProductPrice}
                  onViewProduct={handleViewProduct}
                />
              );
            })
          ) : (
            <div className="">
              <h1 className="text-xl text-center   my-20 text-brand">
                Your favourites are empty! <br /> Tap the ❤️ on any product to
                save it here for later.
              </h1>
            </div>
          )}
        </div>
      </div>
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
    </div>
  );
};

export default FavouritePage;
