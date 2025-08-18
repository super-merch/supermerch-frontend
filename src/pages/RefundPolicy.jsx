import React from "react";

const RefundPolicy = () => {

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Refund Policy</h1>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          <section className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            <p>
              At Super Merch we want you to be satisfied with your purchase. If an item is faulty, damaged on arrival, or not as described, you may be eligible for a refund or replacement.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Eligibility</h2>
            <ul className="list-disc pl-6">
              <li>Report the issue within 14 days of delivery.</li>
              <li>Item should be returned in original condition where applicable.</li>
              <li>Proof of purchase (order number) is required.</li>
            </ul>
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">How to Request a Refund</h2>
            <p>
              Contact our support via the Contact page or email <button onClick={() => window.open('mailto:Info@supermerch.com.au')} className="text-blue-600 hover:underline">Info@supermerch.com.au</button> with your order number and photos (if applicable). We will review and reply with next steps.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Processing Time</h2>
            <p>
              Approved refunds are processed within 7–14 business days depending on the payment method and your bank. You will receive confirmation when the refund is initiated.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Exceptions</h2>
            <p>
              Perishable goods, personalized items, or products marked as "non-returnable" are generally not eligible unless faulty. Shipping fees may not be refundable unless the return is due to our error.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
            <p>
              If you have questions about a refund or need help with returns, contact our support team and we'll assist you promptly.
            </p>
          </section>
        </div>

        <div className="mt-6 text-sm text-gray-500 text-center">
          For product-specific return instructions check the product page or contact support.
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
