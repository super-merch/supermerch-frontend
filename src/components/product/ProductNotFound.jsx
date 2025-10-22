import React from "react";

const ProductNotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <svg
              className="w-16 h-16 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        {/* Error Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Product Not Found
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We couldn't find the product you're looking for. It might have been
            removed or the link might be incorrect.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              onClick={() => {
                setErrorFetching(false);
                fetchSingleProduct();
              }}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>

            <button
              onClick={() => navigate("/shop")}
              className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Browse Products
            </button>
          </div>

          {/* Additional Help */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <button
                onClick={() => navigate("/contact")}
                className="text-smallHeader hover:underline font-medium"
              >
                Contact our support team
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductNotFound;
