import React from "react";

const Services = () => {
  return (
    <div className="bg-primary/10 py-32 my-16">
      <div className="Mycontainer">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Super Merch?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Free Mockup */}
          <div className="group text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Free Mockup
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Professional design previews at no extra cost
            </p>
          </div>

          {/* Fast & Free Delivery */}
          <div className="group text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19,7H16V6A4,4 0 0,0 8,6H11A4,4 0 0,0 19,6V7M11,4A2,2 0 0,1 13,6V7H5V6A2,2 0 0,1 7,4H11M4,10H20L19,9H5L4,10M6,12H18V14H6V12M4,15H20V17H4V15M6,18H18V20H6V18Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Fast Delivery
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Quick turnaround in 2-4 working days
            </p>
          </div>

          {/* Zero Setup Fees */}
          <div className="group text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Minimum Setup Fees
            </h3>
            <p className="text-gray-600 leading-relaxed">
              No hidden charges or surprise costs
            </p>
          </div>

          {/* Low MOQs */}
          <div className="group text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Low MOQs</h3>
            <p className="text-gray-600 leading-relaxed">
              Order exactly what you need
            </p>
          </div>

          {/* AfterPay */}
          <div className="group text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AfterPay</h3>
            <p className="text-gray-600 leading-relaxed">
              Buy now, pay later with AfterPay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
