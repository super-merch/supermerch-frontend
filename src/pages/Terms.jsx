import React, { useState, useEffect } from "react";

export default function Terms() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/policies/by-type/terms`)
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
        console.error("Terms Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-red-900 mb-4">Error Loading Terms</h1>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-800">
        <header className="bg-primary/90 text-white py-8">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-3xl font-semibold">Loading Terms...</h1>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="bg-primary/90 text-white py-8">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-semibold">
            SuperMerch — {policy?.title || "Terms & Conditions"}
          </h1>
          <p className="mt-2 text-sm opacity-90">
            Last updated: {new Date(policy?.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {policy?.sections && policy.sections.map((section, idx) => (
          <section key={idx} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-2">{section.heading}</h2>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {section.content}
            </p>
          </section>
        ))}
      </main>
    </div>
  );
}
