export default function ShippingStep({
  open,
  setOpen,
  addressData,
  register,
  onContinue,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div
        className="px-4 py-3 cursor-pointer flex items-center justify-between border-b border-gray-200 bg-white"
        onClick={() => setOpen(!open)}
      >
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Shipping Information
            </h3>
            <p className="text-sm text-gray-500">
              Enter your shipping details
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Toggle shipping"
          className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        >
          <svg
            className="w-8 h-8 text-gray-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {open && (
        <div className="p-6">
          <div className="bg-white rounded-xl  border-gray-200 shadow-sm overflow-hidden">
            <div className="grid gap-6 lg:grid-cols-2 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <svg
                    className="w-8 h-8 mr-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  {...register("shipping.companyName")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                />
              </div>
              <div className="space-y-2"></div>
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <svg
                    className="w-8 h-8 mr-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  First Name{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  defaultValue={addressData?.firstName || ""}
                  placeholder="Enter first name"
                  {...register("shipping.firstName", {
                    required: true,
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <svg
                    className="w-8 h-8 mr-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Last Name{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  {...register("shipping.lastName")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg
                  className="w-8 h-8 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Address <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter street address and unit number (e.g. 123 Main St, Unit 4)"
                {...register("shipping.address")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
              />
            </div>

            <div className="grid gap-6 mt-6 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <svg
                    className="w-8 h-8 mr-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Country <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  {...register("shipping.country", {
                    required: true,
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                >
                  {addressData?.country && (
                    <option value={addressData?.country}>
                      {addressData?.country}
                    </option>
                  )}
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <svg
                    className="w-8 h-8 mr-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                State <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                {...register("shipping.region", { required: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
              >
                {addressData?.state && (
                  <option value={addressData?.state}>
                    {addressData?.state}
                  </option>
                )}
                <option value="New South Wales">New South Wales</option>
                <option value="Victoria">Victoria</option>
                <option value="Queensland">Queensland</option>
                <option value="Western Australia">Western Australia</option>
                <option value="South Australia">South Australia</option>
                <option value="Tasmania">Tasmania</option>
                <option value="Northern Territory">Northern Territory</option>
                <option value="Australian Capital Territory">
                  Australian Capital Territory
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <svg
                  className="w-8 h-8 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                City <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                {...register("shipping.city", { required: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
              >
                {addressData?.city && (
                  <option value={addressData.city}>
                    {addressData?.city}
                  </option>
                )}
                <option value="Sydney">Sydney</option>
                <option value="Melbourne">Melbourne</option>
                <option value="Brisbane">Brisbane</option>
                <option value="Perth">Perth</option>
                <option value="Adelaide">Adelaide</option>
                <option value="Gold Coast">Gold Coast</option>
                <option value="Canberra">Canberra</option>
                <option value="Newcastle">Newcastle</option>
                <option value="Wollongong">Wollongong</option>
                <option value="Hobart">Hobart</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <svg
                  className="w-8 h-8 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M7 4a2 2 0 012-2h6a2 2 0 012 2"
                  />
                </svg>
                Postal Code{" "}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter postal code"
                {...register("shipping.zip", { required: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
              />
            </div>
          </div>
            </div>
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onContinue}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              Continue to Billing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

