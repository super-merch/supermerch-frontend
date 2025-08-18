import React from "react";

const ClearancePage = () => {

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Clearance & Final Sale</h1>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          <section className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            <p>
              Clearance items are deeply discounted to clear inventory. These deals are limited in quantity and are sold on a first-come, first-served basis. Prices shown are final sale unless otherwise specified.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Discounts & Pricing</h2>
            <p>
              Discounts on clearance items vary and are applied to the listed price. Some items may show percentage-off labels while others display the final reduced price.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Returns & Exchanges</h2>
            <p>
              Most clearance items are marked as "final sale" and are not eligible for returns or exchanges. If a clearance item is faulty or damaged on arrival, contact support within 14 days with photos and order details.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Shipping</h2>
            <p>
              Standard shipping policies apply to clearance orders. Shipping costs may not be refundable unless the return is due to our error. Estimated delivery times are shown at checkout.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Stock & Availability</h2>
            <p>
              Clearance stock is limited. When an item is out of stock it will be removed from the clearance listing. We do our best to keep listings updated but occasional oversells may occur.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Need Help?</h2>
            <p>
              For questions about clearance items, returns on damaged goods, or bulk clearance inquiries, contact our support team at{' '}
              <button onClick={() => window.open('mailto:Info@supermerch.com.au')} className="text-blue-600 hover:underline">Info@supermerch.com.au</button>.
            </p>
          </section>
        </div>

        <div className="mt-6 text-sm text-gray-500 text-center">
          Note: Clearance policies may vary by supplier—check product details for any supplier-specific terms.
        </div>
      </div>
    </div>
  );
};

export default ClearancePage;
