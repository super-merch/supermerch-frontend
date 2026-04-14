import React, { useState, useEffect } from 'react';

export default function PrivacyPolicy() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/policies/by-type/privacy")
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
        console.error("Privacy Policy Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-red-900 mb-4">Error Loading Privacy Policy</h1>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900">Loading Privacy Policy...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {policy?.title || "Privacy Policy"}
          </h1>
          <p className="text-lg text-gray-600">
            Super Merch - Your Privacy Matters to Us
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(policy?.updatedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {policy?.sections && policy.sections.map((section, idx) => (
            <section key={idx} className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {section.heading}
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
