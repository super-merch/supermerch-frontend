import React, { useState } from "react";

const Specification = ({ single_product, activeTab }) => {
  if (activeTab !== "Specification") return null;

  const details = single_product?.product?.details ?? [];
  const [showAdditional, setShowAdditional] = useState(false);

  // helper to detect "additional info" (case-insensitive)
  const isAdditional = (d) =>
    String(d?.name ?? "").toLowerCase().trim() === "additional info";

  // Filtered list to render: hide "additional info" when showAdditional is false
  const visibleDetails = details.filter((d) => showAdditional || !isAdditional(d));

  return (
    <div className="Mycontainer gap-6 pb-8">
      {details.length === 0 ? (
        <p className="text-sm text-gray-500">No specifications available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleDetails.map((detail, index) => {
            const key = detail?.id ?? detail?.name ?? index;
            if(detail.name == "included packaging" || detail.name == "product dimensions") {
              return
            }
            // Normalize content (arrays/objects -> string)
            let content = detail?.detail ?? detail?.value ?? "";
            if (Array.isArray(content)) content = content.join(", ");
            else if (content && typeof content === "object")
              content = JSON.stringify(content);

            return (
              <div
                key={key}
                className="py-2 rounded-lg"
                aria-label={`spec-${index}`}
              >
                <h3 className="text-base font-semibold text-gray-800 capitalize md:mb-1">
                  {detail?.name ?? `Detail ${index + 1}`}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {content || "—"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Show/hide button for "additional info" */}
      {details.some((d) => isAdditional(d)) && (
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setShowAdditional((s) => !s)}
            className="text-sm text-blue-700 underline"
          >
            {showAdditional ? "Hide Additional Info" : "Show Additional Info"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Specification;
