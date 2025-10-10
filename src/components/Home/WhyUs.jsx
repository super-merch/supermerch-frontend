import React from "react";

export default function WhyUs({ className = "" }) {
  return (
    <section className={`bg-white text-gray-800 py-12 ${className}`} aria-labelledby="why-us-heading">
      <div className="Mycontainer mx-auto">
        <header className="mb-8 text-center">
          <h2 id="why-us-heading" className="text-3xl font-semibold text-blue-700">Why Choose Us</h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">Reliable products, trusted payments, and service that scales with your needs.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <article className="flex items-start gap-4 p-5 border rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M6 7v12a2 2 0 002 2h8a2 2 0 002-2V7" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-blue-700">Top Australian Brands</h3>
              <p className="text-gray-600 text-sm">We partner with trusted Australian brands to deliver authentic, high-quality products.</p>
            </div>
          </article>

          <article className="flex items-start gap-4 p-5 border rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
              <path d="M2 10h20" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-blue-700">Trusted Payments (Stripe)</h3>
              <p className="text-gray-600 text-sm">Secure checkout powered by Stripe — global reliability and robust fraud protection.</p>
            </div>
          </article>

          <article className="flex items-start gap-4 p-5 border rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-blue-700">Quality Guaranteed</h3>
              <p className="text-gray-600 text-sm">Every product goes through quality checks so you receive durable and reliable items.</p>
            </div>
          </article>

          <article className="flex items-start gap-4 p-5 border rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-blue-700">Fast & Responsive Service</h3>
              <p className="text-gray-600 text-sm">From ordering to delivery and support — expect fast responses and smooth handling.</p>
            </div>
          </article>

          <article className="flex items-start gap-4 p-5 border rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 7h18M21 7l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-blue-700">Bulk Orders & Competitive Pricing</h3>
              <p className="text-gray-600 text-sm">We offer great prices for bulk purchases — ideal for businesses and resellers.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
