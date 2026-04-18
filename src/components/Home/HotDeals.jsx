import { useEffect, useRef, useState } from "react";
import { FaFire } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import noimage from "/noimage.png";
import Tooltip from "../Common/Tooltip";

const HotDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasRequestedRef = useRef(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (hasRequestedRef.current) return;

    const fetchDeals = async () => {
      try {
        hasRequestedRef.current = true;
        setLoading(true);

        const response = await axios.get(`${backendUrl}/api/frontend/deals?limit=4&featured=true`);

        if (response.data?.success) {
          setDeals(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [backendUrl]);

  return (
    <div className="border border-primary rounded-lg p-4 h-full flex flex-col shadow-lg shadow-primary/20 min-h-96 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <FaFire className="text-orange-500 text-lg animate-pulse hover:animate-bounce transition-all duration-300" />
        <h3 className="text-lg font-bold text-gray-800">HOT DEALS</h3>
      </div>

      {/* Hot Deals List */}
      <div className="flex-1 flex flex-col justify-start overflow-y-auto">
        {loading
          ? // Loading skeleton
            [...Array(4)].map((_, index) => {
              const isLastItem = index === 3;
              return (
                <div
                  key={index}
                  className={`bg-blue-50 rounded-lg p-3 animate-pulse ${
                    isLastItem ? "mb-0" : "mb-2"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-300 rounded-md flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              );
            })
          : // Real deals
            (() => {
              if (deals.length === 0) {
                return (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-gray-500">No deals available</p>
                  </div>
                );
              }

              return deals.map((deal, index) => {
                const isLastItem = index === 3;
                const imageUrl = deal.bannerImage
                  ? deal.bannerImage.startsWith('http')
                    ? deal.bannerImage
                    : `${backendUrl}/${deal.bannerImage}`
                  : noimage;

                return (
                  <Link
                    to={`/deals/${deal.slug}`}
                    key={deal.id || `deal-${index}`}
                    className={`bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-colors cursor-pointer ${
                      isLastItem ? "mb-0" : "mb-2"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Deal Image */}
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 relative">
                        <img
                          src={imageUrl}
                          alt={deal.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                        {/* Discount Badge */}
                        {deal.savingsPercentage > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            -{deal.savingsPercentage}%
                          </div>
                        )}
                      </div>

                      {/* Deal Info */}
                      <div className="flex flex-col flex-1 min-w-0">
                        {/* Deal Title */}
                        <Tooltip content={deal.title} placement="top">
                          <h4
                            className="text-sm font-semibold text-gray-800 truncate mb-1"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            {deal.title}
                          </h4>
                        </Tooltip>

                        {/* Pricing - "From" pricing for quotation system */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">From</span>
                          <span className="text-base font-bold text-primary">
                            ${deal.dealPrice.toFixed(2)}
                          </span>
                        </div>

                        {/* Items count */}
                        <span className="text-xs text-gray-500">
                          {deal.totalItems} items
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              });
            })()}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <Link
          to="/deals"
          className="text-sm text-secondary hover:text-primary font-medium transition-colors"
        >
          View All Hot Deals →
        </Link>
      </div>
    </div>
  );
};

export default HotDeals;
