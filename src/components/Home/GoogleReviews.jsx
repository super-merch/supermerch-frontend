import React, { useState, useEffect } from "react";
import { Heading } from "../Common";
import { ReactGoogleReviews } from "react-google-reviews";
import "react-google-reviews/dist/index.css";
import { FaGoogle, FaQuoteLeft } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { StarOffIcon, StarsIcon } from "lucide-react";
import { MdStarRate } from "react-icons/md";
import { FaStar } from "react-icons/fa";

const GoogleReviewsComponent = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState({});
  const featurableWidgetId = "d2b1b65c-56fe-4764-a228-58d2820cf5ff";

  const toggleExpanded = (reviewId) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="w-full py-10 bg-white">
      <div className="Mycontainer">
        <Heading
          title="What Our Customers Say"
          description="Read genuine reviews from our satisfied customers"
          align="center"
          size="large"
          titleClassName="uppercase"
          descriptionClassName="text-gray-600"
          containerClassName="mb-12 py-0 !py-0"
          showUnderline={true}
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 sm:p-6 animate-pulse"
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full mr-3 sm:mr-4"></div>
                  <div>
                    <div className="h-3 sm:h-4 bg-gray-300 rounded w-20 sm:w-24 mb-2"></div>
                    <div className="h-2 sm:h-3 bg-gray-300 rounded w-12 sm:w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-300 rounded"></div>
                  <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full relative md:px-8 px-0">
            <ReactGoogleReviews
              layout="custom"
              featurableId={featurableWidgetId}
              renderer={(reviews) => (
                <>
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={16}
                    slidesPerView={2}
                    navigation={{
                      prevEl: ".review-prev",
                      nextEl: ".review-next",
                    }}
                    pagination={{
                      clickable: true,
                      dynamicBullets: true,
                    }}
                    autoplay={{
                      delay: 5000,
                      disableOnInteraction: false,
                    }}
                    loop={reviews.length > 4}
                    breakpoints={{
                      1024: {
                        slidesPerView: 4,
                        spaceBetween: 16,
                      },
                    }}
                    className="reviews-swiper !pb-12"
                  >
                    {reviews.map(
                      ({
                        reviewId,
                        reviewer,
                        comment,
                        starRating,
                        createTime,
                      }) => {
                        const displayText = comment;

                        return (
                          <SwiperSlide key={reviewId}>
                            <div className="border border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col h-[280px]">
                              {/* Author Info at Top (Google Style) */}
                              <div className="flex items-start mb-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2 bg-gray-200">
                                  {reviewer?.profilePhotoUrl ? (
                                    <img
                                      src={reviewer.profilePhotoUrl}
                                      alt={reviewer?.displayName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        const fallback = document.createElement("div");
                                        fallback.className = "w-full h-full flex items-center justify-center text-gray-600 font-medium text-sm";
                                        fallback.textContent = reviewer?.displayName?.charAt(0) || "U";
                                        e.target.parentElement.appendChild(fallback);
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600 font-medium text-sm">
                                      {reviewer?.displayName?.charAt(0) || "U"}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 text-xs truncate">
                                    {reviewer?.displayName || "Anonymous"}
                                  </h4>
                                  <p className="text-[10px] text-gray-500 mt-0.5">
                                    {createTime
                                      ? new Date(createTime).toLocaleDateString(
                                          "en-US",
                                          {
                                            month: "short",
                                            year: "numeric",
                                          }
                                        )
                                      : "Recent"}
                                  </p>
                                </div>
                              </div>

                              {/* Stars (Google Style - Yellow) */}
                              <div className="flex mb-2">
                                {Array.from({ length: 5 }, (_, index) => (
                                  <FaStar
                                    key={index}
                                    size={16}
                                    style={{
                                      color:
                                        index < starRating
                                          ? "#FFD700"
                                          : "#808080",
                                    }}
                                  />
                                ))}
                              </div>

                              {/* Review Text (Google Style) - Flexible height */}
                              <div className="flex-1 overflow-hidden">
                                <p className="text-gray-700 text-xs leading-relaxed line-clamp-6">
                                  {displayText}
                                </p>
                              </div>

                              {/* Google Logo Badge */}
                              <div className="flex items-center mt-3 pt-2 border-t border-gray-100">
                                <FaGoogle className="text-blue-500 text-md mr-1" />
                                <span className="text-sm text-gray-500">
                                  Posted on Google
                                </span>
                              </div>
                            </div>
                          </SwiperSlide>
                        );
                      }
                    )}
                  </Swiper>

                  {/* Custom Navigation Arrows */}
                  <button className="review-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl text-secondary hover:text-primary w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-200 hover:border-primary">
                    <BiChevronLeft className="w-6 h-6" />
                  </button>
                  <button className="review-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl text-secondary hover:text-primary w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-200 hover:border-primary">
                    <BiChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            />
          </div>
        )}

        {/* View All Reviews Button */}
        <div className="text-center mt-6 sm:mt-8">
          <a
            href="https://maps.app.goo.gl/cXd6s7xCWRjYiD1Z7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-3 sm:px-6 sm:py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base min-h-[44px]"
          >
            <FaGoogle className="w-4 h-4 mr-2" />
            View All Google Reviews
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleReviewsComponent;
