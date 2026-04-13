import React from "react";

const QuoteFormModal = ({
  setShowQuoteForm,
  product,
  selectedColor,
  selectedSize,
  selectedPrintMethod,
  currentQuantity,
  discountedUnitPrice,
  currentPrice,
  formData,
  handleChange,
  handleDragEnter2,
  handleDragLeave2,
  handleDragOver2,
  handleDrop2,
  handleFileChange2,
  handleDivClick2,
  notRobot,
  onSubmitHandler,
  quoteLoading,
  selectedFile2,
  setSelectedFile2,
  previewImage2,
  isDragging2,
  setPreviewImage2,
  setNotRobot,
  showQuoteForm,
  setCurrentQuantity,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Get Express Quote
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              We'll email you a detailed quote within 24 hours
            </p>
          </div>
          <button
            onClick={() => setShowQuoteForm({ state: false, from: "" })}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-500"
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

        {/* Modal Content */}
        <div className="px-6 py-2">
          {/* Selected Product Summary */}
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">
                  Selected Product:{" "}
                  <span className="text-sm font-semibold text-gray-900">
                    {product?.name || "Product"}
                  </span>
                </p>
              </div>
            </div>
            <div className="px-4 py-3 text-sm text-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Color</span>
                <span className="font-medium">
                  {selectedColor || "Not selected"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Size</span>
                <span className="font-medium">
                  {selectedSize || "Not selected"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Print Method</span>
                <span className="font-medium truncate max-w-[180px] text-right">
                  {selectedPrintMethod?.description || "Not selected"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-600">Quantity</span>

                {showQuoteForm?.from === "lowMOQ" ? (
                  <input
                    type="number"
                    value={currentQuantity}
                    onChange={(e) =>
                      setCurrentQuantity(parseInt(e.target.value))
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                ) : (
                  <span className="font-semibold">{currentQuantity}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Unit Price</span>
                <span className="font-semibold">
                  ${discountedUnitPrice?.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-extrabold text-smallHeader">
                  ${currentPrice?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <form className="space-y-3">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={formData?.name}
                  type="text"
                  placeholder="Your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  name="email"
                  value={formData?.email}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  name="phone"
                  value={formData?.phone}
                  type="tel"
                  placeholder="+61 410 123 456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery State *
                </label>
                <input
                  name="delivery"
                  value={formData?.delivery}
                  type="text"
                  placeholder="e.g., Sydney, Melbourne"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo/Artwork Files
              </label>
              <div
                className={`border-2 border-dashed rounded-lg px-4 py-2 text-center transition-colors ${
                  isDragging2
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDragEnter2}
                onDragLeave={handleDragLeave2}
                onDragOver={handleDragOver2}
                onDrop={handleDrop2}
              >
                {selectedFile2 ? (
                  <div className="space-y-4">
                    <img
                      src={previewImage2}
                      alt="Uploaded File"
                      className="mx-auto max-w-[120px] max-h-[120px] object-contain rounded-lg"
                    />
                    <p className="text-sm text-green-600 font-medium">
                      File uploaded successfully!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile2(null);
                        setPreviewImage2(null);
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="w-full space-y-1">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <div className="w-full flex justify-center items-center gap-2">
                      <p className="text-sm text-gray-600">
                        {isDragging2
                          ? "Drop files here"
                          : "Drag and drop your files here, or"}
                      </p>
                      <button
                        type="button"
                        onClick={handleDivClick2}
                        className="text-sm text-primary hover:text-blue-700 font-medium"
                      >
                        browse files
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Supported: AI, EPS, SVG, PDF, JPG, JPEG, PNG (Max 16MB)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  id="fileUpload2"
                  accept=".ai, .eps, .svg, .pdf, .jpg, .jpeg, .png"
                  className="hidden"
                  onChange={handleFileChange2}
                />
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments
              </label>
              <textarea
                name="comment"
                value={formData?.comment}
                placeholder="Tell us about your project requirements, special instructions, or any questions you have..."
                className="w-full px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32 resize-none"
                onChange={handleChange}
                rows={2}
              />
            </div>

            {/* Terms and Submit */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="not-robot"
                  checked={notRobot}
                  onChange={() => setNotRobot(!notRobot)}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                />
                <label htmlFor="not-robot" className="text-sm text-gray-700">
                  I confirm that I'm not a robot and agree to the{" "}
                  <a
                    href="/privacy"
                    className="text-primary hover:text-blue-700 underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuoteForm({ state: false, from: "" })}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSubmitHandler}
                  disabled={!notRobot || quoteLoading}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {quoteLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Quote Request...
                    </div>
                  ) : (
                    "Send Quote Request"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuoteFormModal;
