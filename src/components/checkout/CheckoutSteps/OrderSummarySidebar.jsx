export default function OrderSummarySidebar({
  items,
  appliedCoupon,
  couponDiscount,
  couponDiscountAmount,
  couponDiscountExceedsLimit,
  totalAmount,
  shippingCharges,
  setupFee,
  gstCharges,
  gstAmount,
  total,
  artworkFile,
  artworkInstructions,
  loading,
}) {
  return (
    <div className="w-full h-fit lg:w-[35%]">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
        <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Order Summary
              </h3>
              <p className="text-sm text-gray-500">
                {items?.length} item{items?.length !== 1 ? "s" : ""} in order
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || items?.length === 0}
            className={`w-max py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
              loading || items?.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:opacity-90 shadow-lg hover:shadow-xl"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span>
                  Pay $
                  {total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </>
            )}
          </button>
        </div>

        <div className="p-6">
          {appliedCoupon && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    ✅ Coupon Applied: {appliedCoupon.coupen}
                  </p>
                  <p className="text-xs text-green-600">
                    You saved {couponDiscount}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <ul>
            {items.map((item) => {
              const itemTotal = item.price * item.quantity;
              return (
                <li key={item.id} className="flex justify-between py-1">
                  <div className="flex gap-3">
                    <div>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-10 h-10 rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-lg">
                        {item.quantity} * {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-base font-medium text-smallHeader">
                          ${item.price?.toFixed(2)} each
                        </p>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <p className="text-base text-gray-600">
                          Color: {item.color || "No Color"}
                        </p>
                        <p className="text-base text-gray-600">
                          Print:{" "}
                          {item.print || "No print method selected"}
                        </p>
                        {item?.size && (
                          <p className="text-base text-gray-600">
                            Size: {item.size || "No size"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ${itemTotal.toFixed(2)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          {(artworkFile || artworkInstructions) && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h4 className="text-base font-semibold text-blue-800">
                  Order Artwork
                </h4>
              </div>

              {artworkFile && (
                <div className="mb-3">
                  <p className="text-base text-blue-700 font-medium mb-2">
                    Uploaded File:
                  </p>
                  <div className="flex items-center space-x-3">
                    {artworkFile.file?.type?.startsWith("image/") ? (
                      <img
                        src={artworkFile.preview}
                        alt="Artwork preview"
                        className="w-16 h-16 object-cover rounded-lg border border-blue-300"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg border border-blue-300 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-base font-medium text-blue-900">
                        {artworkFile.name}
                      </p>
                      <p className="text-xs text-primary">
                        {artworkFile.file?.type?.startsWith("image/")
                          ? "Image File"
                          : "PDF Document"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {artworkInstructions && (
                <div>
                  <p className="text-base text-blue-700 font-medium mb-1">
                    Instructions:
                  </p>
                  <p className="text-sm text-blue-800 italic bg-white p-2 rounded border border-blue-200">
                    &quot;{artworkInstructions}&quot;
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-0 space-y-2 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-base">
              <span>Sub-total:</span>
              <span>
                $
                {totalAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-base">
              <span>Shipping:</span>
              <span>
                {shippingCharges > 0
                  ? `$${shippingCharges.toFixed(2)}`
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between text-base">
              <span>Setup Fee:</span>
              <span>
                {setupFee > 0 ? `$${setupFee.toFixed(2)}` : "-"}
              </span>
            </div>

            {appliedCoupon && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-base">
                  <span>Coupon ({appliedCoupon.coupen}):</span>
                  <span className="text-green-600">
                    -{couponDiscount}%
                    {couponDiscountExceedsLimit &&
                      " (Capped at Max Limit)"}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span>Discounted Price:</span>
                  <span className="text-green-600">
                    ${couponDiscountAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between text-base">
              <span>GST({gstCharges}%):</span>
              <span>${gstAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <img
                  src="/stripe.png"
                  className="w-8 h-8 rounded-full"
                  alt="Stripe"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    Secure Payment
                  </p>
                  <p className="text-sm text-gray-600">
                    Powered by Stripe
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">
                Total
              </span>
              <span className="text-2xl font-bold text-smallHeader">
                $
                {total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {items?.length === 0 && (
              <div className="text-center py-3 text-red-600 bg-red-50 rounded-lg border border-red-200 my-3">
                Your cart is empty
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
