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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="Mycontainer">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary mb-3">
            My Favourites
          </h1>
          <p className="text-gray-600 text-lg">
            {favouriteItems.length > 0
              ? `${favouriteItems.length} ${
                  favouriteItems.length === 1 ? "item" : "items"
                } saved for later`
              : "Start building your collection"}
          </p>
        </div>

        {/* Products Grid */}
        {favouriteItems.length > 0 ? (
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 max-sm:grid-cols-2">
            {favouriteItems?.map((product) => {
              return (
                <ProductCard
                  key={product.meta.id}
                  product={product}
                  productionIds={productionIds}
                  australiaIds={australiaIds}
                  favSet={favSet}
                  getProductPrice={getProductPrice}
                  backgroundColor={backgroundColor}
                  onViewProduct={handleViewProduct}
                  handleRemoveFavourite={handleRemoveFavourite}
                />
              );
            })}
          </div>
        ) : (
          // Empty State
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-100 rounded-full mb-6">
                <FaHeart className="w-16 h-16 text-gray-300" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                No Favourites Yet
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Start saving products you love by tapping the{" "}
                <FaHeart className="inline w-5 h-5 text-primary mx-1" /> icon on
                any product card.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/shop")}
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FaShoppingBag className="w-5 h-5 mr-2" />
                Browse Products
              </button>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-secondary font-semibold rounded-lg border-2 border-gray-200 hover:border-primary hover:text-primary transition-all duration-300"
              >
                Go to Homepage
              </button>
            </div>

            {/* Features */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <FaHeart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">
                  Save Your Favorites
                </h3>
                <p className="text-sm text-gray-600">
                  Keep track of products you love for easy access later
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-secondary mb-2">
                  Get Notified
                </h3>
                <p className="text-sm text-gray-600">
                  Receive alerts when your favorites go on sale
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-secondary mb-2">
                  Quick Access
                </h3>
                <p className="text-sm text-gray-600">
                  Find your saved items anytime, from any device
                </p>
              </div>
            </div>
          </div>
        )}
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
