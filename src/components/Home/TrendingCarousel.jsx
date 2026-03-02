import { slugify } from "@/utils/utils";
import { useContext, useEffect } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { FaFire } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoIosHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { addToFavourite, removeFromFavourite } from "@/redux/slices/favouriteSlice";
import { toast } from "react-toastify";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "swiper/css";
import "swiper/css/navigation";
import {
  A11y,
  Autoplay,
  Navigation,
  Pagination,
  Scrollbar,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ProductsContext } from "../../context/ProductsContext";
import Tooltip from "../Common/Tooltip";
import noimage from "/noimage.png";

const TrendingCarousel = () => {
  const { favouriteItems } = useSelector((state) => state.favouriteProducts);
  const { fetchTrendingProducts, trendingProducts, trendingProductsLoading } =
    useContext(ProductsContext);

  // Fetch trending products on component mount
  useEffect(() => {
    if (trendingProducts.length === 0) {
      fetchTrendingProducts(1, "", 16);
    }
  }, []);
 const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCardNavigate = (slug, encodedId) => {
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`);
  };

  const handleToggleFavourite = (e, product, isFavourited) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavourited) {
      dispatch(removeFromFavourite(product));
      toast.success("Product removed from favourites");
    } else {
      dispatch(addToFavourite(product));
      toast.success("Product added to favourites");
    }
  };
  
  // eslint-disable-line react-hooks/exhaustive-deps
  // fetchTrendingProducts is intentionally excluded to prevent infinite re-renders

  // React Slick carousel settings - memoized to prevent re-creation
  var settings = {
    dots: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    speed: 1000,
    autoplaySpeed: 3000,
    arrows: true,
    infinite: true,
    nextArrow: <BiChevronRight />,
    prevArrow: <BiChevronLeft />,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          dots: false,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          dots: true,
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
          arrows: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
          arrows: false,
        },
      },
    ],
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
    <div className="w-full py-10 bg-primary/10">
      <div className="Mycontainer">
        {/* Trending Heading - Outside the carousel */}
        <div className="flex items-center justify-center gap-3 mb-6 ">
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 px-4 py-2 rounded-lg">
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
          {trendingProducts.length > 0 ? (
            <>
              <div className="relative w-full">
                <Swiper
                  breakpoints={{
                    0: {
                      slidesPerView: 1,
                      spaceBetween: 12,
                    },
                    640: {
                      slidesPerView: 2,
                      spaceBetween: 24,
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 24,
                    },
                    1280: {
                      slidesPerView: 4,
                      spaceBetween: 24,
                    },
                  }}
                  pagination={{ clickable: true }}
                  scrollbar={{ draggable: true }}
                  navigation={{
                    prevEl: ".blog-prev",
                    nextEl: ".blog-next",
                  }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  speed={1000}
                  loop={true}
                  modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
                  className="blog-swiper"
                >
                  {trendingProducts.map((product, slideIndex) => {
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
                    const encodedId = btoa(product.meta?.id); // base64 encode
                    const slug = slugify(product.overview?.name);

                    const isFavourited = favouriteItems?.some(
                      (item) => item.meta?.id === product?.meta?.id,
                    );

                    return (
                      <SwiperSlide key={product.meta?.id || slideIndex} className="w-full">
                        <div
                          className="bg-white border rounded-xl shadow-sm hover:shadow-md hover:border-primary transition-all duration-300 cursor-pointer group overflow-hidden sm:mr-2"
                          onClick={() => handleCardNavigate(slug, encodedId)}
                        >
                          {" "}
                          {/* Product Image */}
                          <div className="h-48 md:h-60 border-b overflow-hidden relative rounded-t-xl">
                            <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              Hot
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleToggleFavourite(e, product, isFavourited)}
                              className="absolute top-2 right-2 z-20 p-2 bg-white/90 rounded-full shadow"
                            >
                              {isFavourited ? (
                                <IoIosHeart className="text-primary text-lg" />
                              ) : (
                                <CiHeart className="text-gray-700 text-lg" />
                              )}
                            </button>

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
                          <div className="p-3 rounded-b-xl text-center">
                            <Tooltip
                              content={product.overview.name || "No Name"}
                              placement="top"
                            >
                            <h3 className="text-base font-semibold text-secondary group-hover:text-primary transition-colors duration-300 line-clamp-2 truncate">
                              {product.overview.name || "No Name"}
                            </h3>
                            </Tooltip>
                            <p className="text-xs text-secondary/60">
                              Min Qty:{" "}
                              {product.product?.prices?.price_groups[0]
                                ?.base_price?.price_breaks[0]?.qty || 1}
                            </p>
                            <div className="mt-1">
                              <h4 className="text-sm font-bold text-primary group-hover:text-primary/90 transition-colors duration-300">
                                From $
                                {minPrice === maxPrice
                                  ? minPrice.toFixed(2)
                                  : minPrice.toFixed(2)}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
                <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <button className="blog-prev bg-white shadow-lg hover:shadow-xl text-secondary hover:text-primary w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-200 hover:border-primary">
                    <BiChevronLeft className="w-6 h-6" />
                  </button>
                </div>
                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                  <button className="blog-next bg-white shadow-lg hover:shadow-xl text-secondary hover:text-primary w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-200 hover:border-primary">
                    <BiChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </>
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

export default TrendingCarousel;
