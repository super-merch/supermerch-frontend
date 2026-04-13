import React from "react";
import useCmsData from "../../hooks/useCmsData";

export default function WhyUs({ className = "" }) {
  const { data: cmsData } = useCmsData("/api/general-cms/by-slug/why-us");
  const heading = cmsData?.header;
  const description = cmsData?.description;
  const points = Array.isArray(cmsData?.points) ? cmsData.points : [];
  const showShimmer = !heading || !description || points.length === 0;

  return (
    <section className={`bg-white text-gray-800 py-12 ${className}`} aria-labelledby="why-us-heading">
      <div className="Mycontainer mx-auto">
        <header className="mb-8 text-center">
          <h2 id="why-us-heading" className="text-3xl font-semibold text-blue-700">{heading}</h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">{description}</p>
        </header>

        {showShimmer ? (
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-slate-200 rounded mx-auto mb-3"></div>
            <div className="h-4 w-1/2 bg-slate-200 rounded mx-auto mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-24 bg-slate-200 rounded-lg"></div>
              <div className="h-24 bg-slate-200 rounded-lg"></div>
              <div className="h-24 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {points.map((point, idx) => (
              <article key={idx} className="flex items-start gap-4 p-5 border rounded-lg shadow-sm">
                <div>
                  <h3 className="text-lg font-medium text-blue-700">{point?.title || `Point ${idx + 1}`}</h3>
                  <p className="text-gray-600 text-sm">{point?.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
