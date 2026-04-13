import React from "react";
import { useNavigate } from "react-router-dom";

const SizeGuideModal = ({ setShowSizeGuide, parseSizing }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={() => setShowSizeGuide(false)}
        ></div>

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Size Guide</h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-start justify-between h-full">
                {/* General Size Information */}
                <div className="bg-gray-50 p-4 rounded-lg h-full">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    How to Measure
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    To find your perfect size, measure your body as follows:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • <strong>Chest:</strong> Measure around the fullest part
                      of your chest
                    </li>
                    <li>
                      • <strong>Waist:</strong> Measure around your natural
                      waistline
                    </li>
                    <li>
                      • <strong>Hip:</strong> Measure around the fullest part of
                      your hips
                    </li>
                    <li>
                      • <strong>Length:</strong> Measure from shoulder to
                      desired length
                    </li>
                  </ul>
                </div>
                {/* Additional Information */}
                <div className="bg-blue-50 p-4 rounded-lg h-full">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Important Notes
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• All measurements are in centimeters</li>
                    <li>
                      • Sizes may vary slightly between different products
                    </li>
                    <li>
                      • If you're between sizes, we recommend choosing the
                      larger size
                    </li>
                    <li>
                      • For custom sizing, please contact our customer service
                    </li>
                  </ul>
                </div>
              </div>
              {/* Product Size Chart */}
              {parseSizing()?.sizes?.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 text-center">
                    Product Size Chart
                  </h4>
                  <div className="space-y-1">
                    {parseSizing()?.result?.length > 0 ? (
                      parseSizing()?.result?.map((sizeInfo, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded-lg border-b ${
                            index % 2 === 0
                              ? "bg-gray-50 border-gray-200"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900 text-center">
                            {sizeInfo}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600 text-center">
                        No size information available for this product. Please
                        contact our customer service for more information.{" "}
                        <br />
                        <button
                          onClick={() => navigate("/contact")}
                          className="text-primary hover:text-blue-700 font-medium text-sm underline"
                        >
                          Contact our customer service
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <p className="text-sm text-yellow-800">
                      Size information not available for this product
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={() => setShowSizeGuide(false)}
              className="w-full inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 sm:ml-3 sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
