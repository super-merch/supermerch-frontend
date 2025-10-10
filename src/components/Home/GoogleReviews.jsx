import React, { useState, useEffect } from "react";
import { Heading } from "../Common";
import { ReactGoogleReviews } from "react-google-reviews";
import "react-google-reviews/dist/index.css";

const GoogleReviewsComponent = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const featurableWidgetId = "d2b1b65c-56fe-4764-a228-58d2820cf5ff";

  // Fallback review data
  const fallbackReviews = [
    {
      id: "review-1",
      author: "Sarah Johnson",
      rating: 5,
      text: "Excellent quality products and fast delivery! Super Merch exceeded our expectations with their custom merchandise.",
      date: "2024-01-15",
      avatar: "/team1.png",
    },
    {
      id: "review-2",
      author: "Mike Chen",
      rating: 5,
      text: "Outstanding customer service and amazing promotional products. Highly recommend for any business needs!",
      date: "2024-01-10",
      avatar: "/team2.png",
    },
    {
      id: "review-3",
      author: "Emily Davis",
      rating: 5,
      text: "Professional team, great prices, and top-notch quality. Will definitely use Super Merch again!",
      date: "2024-01-08",
      avatar: "/team3.png",
    },
    {
      id: "review-4",
      author: "David Wilson",
      rating: 5,
      text: "Fantastic experience from start to finish. The custom designs were exactly what we wanted!",
      date: "2024-01-05",
      avatar: "/team4.png",
    },
  ];

  useEffect(() => {
    fetchGoogleReviews();
  }, []);

  const fetchGoogleReviews = async () => {
    try {
      setLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use fallback data for now
      setReviews(fallbackReviews);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching Google reviews:", err);
      setError("Failed to load reviews");
      setReviews(fallbackReviews);
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${index < rating ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="w-full py-12 bg-white">
      <div className="Mycontainer">
        <Heading
          title="What Our Customers Say"
          description="Read genuine reviews from our satisfied customers"
          align="center"
          size="large"
          titleClassName="uppercase"
          descriptionClassName="text-gray-600"
          containerClassName="mb-12 py-0 !py-0"
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 sm:p-6 animate-pulse">
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
          <div className="w-full">
            <div className="relative">
              <ReactGoogleReviews layout="carousel" featurableId={featurableWidgetId} showDots={false} />
            </div>
          </div>
        )}

        {/* View All Reviews Button */}
        <div className="text-center mt-6 sm:mt-8">
          <a
            href="https://maps.app.goo.gl/cXd6s7xCWRjYiD1Z7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-3 sm:px-6 sm:py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base min-h-[44px]"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            View All Google Reviews
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleReviewsComponent;
