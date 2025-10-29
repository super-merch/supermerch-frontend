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
          <div className="w-full relative">
            <ReactGoogleReviews
              layout="carousel"
              featurableId={featurableWidgetId}
              maxCharacters={100}
              maxItems={3}
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
