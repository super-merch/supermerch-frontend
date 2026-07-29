import React, { useState, useEffect } from "react";

const RefundPolicy = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/policies/by-type/refund`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          setPolicy(data.data);
          setError(null);
        } else {
          throw new Error("Invalid response format from server");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Refund Policy Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-red-900 mb-4">Error Loading Refund Policy</h1>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900">Loading Refund Policy...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {policy?.title || "Refund Policy"}
          </h1>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          {policy?.sections && policy.sections.map((section, idx) => (
            <section key={idx} className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {section.heading}
              </h2>
              <p className="whitespace-pre-wrap">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-6 text-sm text-gray-500 text-center">
          For product-specific return instructions check the product page or
          contact support.
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
