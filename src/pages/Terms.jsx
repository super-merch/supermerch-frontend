import React from "react";

export default function Terms({
  companyName = "SuperMerch",
  contactEmail = "info@supermerch.com",
  effectiveDate = "October 20, 2025",
}) {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="bg-primary/90 text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-semibold">
            {companyName} — Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm opacity-90">
            Effective date: {effectiveDate}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <section className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-700">
            Welcome to <strong>{companyName}</strong>. By using our website, app
            or placing an order you agree to these Terms. If you don’t agree,
            please don’t use our services.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-2">Orders &amp; Pricing</h2>
          <p className="text-gray-700 text-sm">
            Orders are subject to acceptance. Prices shown exclude taxes and
            shipping unless stated. Bulk orders may have minimum quantities,
            lead times, or deposit requirements shown on product pages or the
            invoice.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-2">Payments (Stripe)</h2>
          <p className="text-gray-700 text-sm">
            We use <strong>Stripe</strong> to process payments. By paying you
            authorize charges to your payment method. Stripe and your card
            issuer rules apply. We do not store full card data — Stripe handles
            that securely (PCI-compliant).
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-2">Shipping &amp; Risk</h2>
          <p className="text-gray-700 text-sm">
            Delivery times are estimates. Risk of loss passes to you when the
            carrier collects the shipment. International orders may incur
            customs, duties or taxes payable by the recipient.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-2">
            Returns &amp; Cancellations
          </h2>
          <p className="text-gray-700 text-sm">
            Our Returns Policy (linked on the site) describes eligibility and
            timelines. Bulk or custom orders may have different policies listed
            at checkout or in your invoice.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-2">Accounts &amp; Security</h2>
          <p className="text-gray-700 text-sm">
            You’re responsible for account security and activity under your
            credentials. Notify us immediately if you suspect unauthorized use.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-2">Intellectual Property</h2>
          <p className="text-gray-700 text-sm">
            All content on the site is owned or licensed by {companyName} and
            may not be reused without permission.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-2">Limitation of Liability</h2>
          <p className="text-gray-700 text-sm">
            To the fullest extent permitted by law, our liability is limited to
            the purchase price paid for the relevant order. We are not liable
            for indirect or consequential losses.
          </p>
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-2">Contact</h2>
          <p className="text-gray-700 text-sm">
            Questions or disputes? Email us at{" "}
            <a
              href={`mailto:${contactEmail}`}
              target="_blank"
              className="text-blue-700 font-medium underline"
            >
              {contactEmail}
            </a>
            .
          </p>
        </section>

        <footer className="text-center text-xs text-gray-500">
          <p>
            These Terms are a concise summary and do not constitute legal
            advice.
          </p>
          <p className="mt-2">
            Replace placeholders with your company details before publishing.
          </p>
        </footer>
      </main>
    </div>
  );
}
