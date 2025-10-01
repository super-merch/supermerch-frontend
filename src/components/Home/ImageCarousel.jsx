import { useState, useEffect, useContext, useMemo } from "react";
import { FaFire } from "react-icons/fa";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import noimage from "/noimage.png";
import { slugify } from "@/utils/utils";

const ImageCarousel = () => {
  const navigate = useNavigate();
  const { fetchTrendingProducts, trendingProducts, trendingProductsLoading } =
    useContext(AppContext);

  // Fetch trending products on component mount
  useEffect(() => {
    if (trendingProducts.length === 0) {
      fetchTrendingProducts(1, "", 16);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // fetchTrendingProducts is intentionally excluded to prevent infinite re-renders

  // Group products into slides of 4 - memoized to prevent re-creation
  const productSlides = useMemo(() => {
    const slides = [];
    if (trendingProducts && trendingProducts.length > 0) {
      for (let i = 0; i < trendingProducts.length; i += 4) {
        slides.push(trendingProducts.slice(i, i + 4));
      }
    }
    return slides;
  }, [trendingProducts]);

  // React Slick carousel settings - memoized to prevent re-creation
  const settings = useMemo(
    () => ({
      dots: productSlides.length > 1,
      infinite: productSlides.length > 1,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: productSlides.length > 1,
      autoplaySpeed: 5000,
      pauseOnHover: true,
      arrows: false,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    }),
    [productSlides.length]
  );

  const handleViewProduct = (productId, name) => {
    const encodedId = btoa(productId); // base64 encode
    const slug = slugify(name);
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`);
  };

  if (trendingProductsLoading) {
    return (
      <div className="w-full py-2">
        <div className="Mycontainer">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading trending products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!trendingProducts || trendingProducts.length === 0) {
    return (
      <div className="w-full py-2">
        <div className="Mycontainer">
          <div className="text-center py-8">
            <p className="text-gray-600">No trending products available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <div className="Mycontainer">
        {/* Trending Heading - Outside the carousel */}
        <div className="flex items-cente justify-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <FaFire className="text-yellow-300 text-xl animate-pulse" />
              <div className="flex flex-col justify-center">
                <div className="border-t border-orange-300 border-dashed w-full h-0.5"></div>
                <span className="text-white font-bold text-sm tracking-wide">
                  TRENDING NOW!
                </span>
                <div className="border-b border-orange-300 border-dashed w-full h-0.5"></div>
              </div>
            </div>
          </div>
        </div>

        {/* React Slick Carousel Container */}
        <div className="relative w-full">
          {productSlides.length > 0 ? (
            <Slider {...settings}>
              {productSlides.map((slide, slideIndex) => (
                <div key={slideIndex} className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                    {slide.map((product) => {
                      const priceGroups =
                        product.product?.prices?.price_groups || [];
                      const basePrice =
                        priceGroups.find((group) => group?.base_price) || {};
                      const priceBreaks =
                        basePrice.base_price?.price_breaks || [];
                      const prices = priceBreaks
                        .map((breakItem) => breakItem.price)
                        .filter((price) => price !== undefined);
                      const minPrice = Math.min(...prices);
                      const maxPrice = Math.max(...prices);

                      return (
                        <div
                          key={product.meta.id}
                          className="bg-white border border-1 rounded-xl shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 cursor-pointer group overflow-hidden"
                          onClick={() =>
                            handleViewProduct(
                              product.meta.id,
                              product.overview.name
                            )
                          }
                        >
                          {/* Product Image */}
                          <div className="h-48 md:h-60 border-b overflow-hidden relative rounded-t-xl">
                            <img
                              src={
                                product.overview.hero_image
                                  ? product.overview.hero_image
                                  : noimage
                              }
                              alt={product.overview.name || "Product"}
                              className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="p-3 rounded-b-xl">
                            <h3 className="text-base font-semibold text-brand group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                              {product.overview.name || "No Name"}
                            </h3>
                            <p className="text-xs text-gray-500 pt-1">
                              Min Qty:{" "}
                              {product.product?.prices?.price_groups[0]
                                ?.base_price?.price_breaks[0]?.qty || 1}
                            </p>
                            <div className="pt-2">
                              <h4 className="text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                                From $
                                {minPrice === maxPrice
                                  ? minPrice.toFixed(2)
                                  : minPrice.toFixed(2)}
                              </h4>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No products available to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
