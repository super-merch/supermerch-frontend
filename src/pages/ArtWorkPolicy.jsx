import React from "react";

const ArtWorkPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Artwork Policy
          </h1>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">1. Overview</h2>
            <p>
              This artwork policy explains the basic requirements and best
              practices for files submitted for printing, labeling, or product
              customization on Super Merch. It helps ensure fast approval and
              high-quality results.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              2. Accepted File Types
            </h2>
            <ul className="list-disc pl-6">
              <li>Preferred: PDF (print-ready), AI (outlined text), EPS.</li>
              <li>
                Also acceptable: high-resolution PNG or TIFF for raster images.
              </li>
              <li>
                We do not accept low-resolution JPEGs for print products unless
                pre-approved.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              3. Resolution & Color
            </h2>
            <ul className="list-disc pl-6">
              <li>
                Raster images should be at least 300 DPI at final print size.
              </li>
              <li>
                Use CMYK color mode for print files when possible. RGB is
                acceptable for digital-only items.
              </li>
              <li>
                Proof colors may vary slightly from screen to print; we provide
                digital proofs when requested.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              4. Bleed & Safe Area
            </h2>
            <p>
              Add a minimum bleed of 3mm (or 0.125 in) beyond the final trim
              size. Important text and logos should be kept within a 5mm safe
              area from the trim edge to avoid accidental cropping.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              5. Fonts & Text
            </h2>
            <ul className="list-disc pl-6">
              <li>Embed or outline all fonts in your submitted files.</li>
              <li>
                Avoid very small text for legibility (recommend at least 6pt for
                print).
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              6. Proofing & Approval
            </h2>
            <p>
              We offer digital proofs on request. Please review proofs carefully
              — once approved, minor variations in color or cropping may occur
              during production. Approval by the customer allows production to
              proceed.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              7. Turnaround & Rejections
            </h2>
            <p>
              Turnaround times depend on the product and processing queue. Files
              that do not meet these guidelines may be rejected or require
              adjustments. We will contact you with options if changes are
              needed.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              8. Copyright & Licensing
            </h2>
            <p>
              You must have the legal right to use all artwork, images, and
              fonts submitted. By submitting artwork you confirm you have
              permission to reproduce the content. Super Merch is not
              responsible for third-party copyright claims arising from
              submitted artwork.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              9. Need Help?
            </h2>
            <p>
              If you need assistance preparing files or have special
              requirements, contact our support or use the "Request Artwork
              Help" option on the product page. We can provide templates and
              basic file checks for most products.
            </p>
            <div className="mt-3">
              <button
                onClick={() =>
                  window.open(
                    "https://mail.google.com/mail/?view=cm&to=Info@supermerch.com.au",
                    "_blank"
                  )
                }
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary"
              >
                Contact Artwork Support
              </button>
            </div>
          </section>
        </div>

        <div className="mt-8 text-sm text-gray-500 text-center">
          This artwork policy is a short guide — for product-specific
          requirements, check the product page or contact support.
        </div>
      </div>
    </div>
  );
};

export default ArtWorkPolicy;
