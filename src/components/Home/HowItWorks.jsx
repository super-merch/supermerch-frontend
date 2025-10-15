import React from "react";

export default function HowItWorks({ className = "" }) {
  return (
    <section className={`bg-white text-gray-800 py-12 ${className}`} aria-labelledby="how-it-works-heading">
      <div className="Mycontainer mx-auto">
        <header className="mb-8 text-center">
          <h2 id="how-it-works-heading" className="text-3xl font-semibold text-blue-700">How It Works</h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">A simple, secure shopping flow — from adding items to tracking your orders.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article className="p-5 border rounded-lg shadow-sm">
            <div className="flex items-center gap-4 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="text-lg font-medium text-blue-700">1. Add Products to Cart</h3>
            </div>
            <p className="text-gray-600 text-sm">Browse the store and add the items you like to your cart. You can choose different quantities for each product before proceeding.</p>
          </article>

          <article className="p-5 border rounded-lg shadow-sm">
            <div className="flex items-center gap-4 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 12h18M6 6h12M6 18h12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="text-lg font-medium text-blue-700">2. Quantity & Pricing Breaks</h3>
            </div>
            <p className="text-gray-600 text-sm">Certain products include quantity-based price breaks — the more you order, the better the unit price. Breaks are applied automatically at checkout for eligible items.</p>
          </article>

          <article className="p-5 border rounded-lg shadow-sm">
            <div className="flex items-center gap-4 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 10V6a5 5 0 0 1 10 0v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="text-lg font-medium text-blue-700">3. Apply Coupon Codes</h3>
            </div>
            <p className="text-gray-600 text-sm">Have a coupon? Enter it during checkout. We sometimes send starter coupons by email when the site launches — keep an eye on your inbox.</p>
          </article>

          <article className="p-5 border rounded-lg shadow-sm">
            <div className="flex items-center gap-4 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 7h18M21 7l-8 8-4-4-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="text-lg font-medium text-blue-700">4. Checkout & Payment</h3>
            </div>
            <p className="text-gray-600 text-sm">At checkout you'll provide billing and shipping details. Payments are processed securely via Stripe — enter your credit card information to complete the order.</p>
          </article>

          <article className="p-5 border rounded-lg shadow-sm">
            <div className="flex items-center gap-4 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="text-lg font-medium text-blue-700">5. Manage Your Orders</h3>
            </div>
            <p className="text-gray-600 text-sm">After purchase, track and manage your orders from the "Manage Orders" page — view order status, history, and details in one place.</p>
          </article>

          <article className="p-5 border rounded-lg shadow-sm">
            <div className="flex items-center gap-4 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 20l9-5-9-5-9 5 9 5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 12v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="text-lg font-medium text-blue-700">Need Bulk or Custom Support?</h3>
            </div>
            <p className="text-gray-600 text-sm">If you need a large quantity or special pricing, contact our support — we can offer tailored quotes and faster handling for bulk orders.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
