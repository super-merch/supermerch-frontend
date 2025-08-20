import React from "react";

const Download = ({ single_product, activeTab }) => {
  if (activeTab !== "Download") return null;

  // Extract relevant order processing information from the product
  const orderDetails = [
    {
      name: "Minimum Order Quantity",
      detail: single_product?.overview?.min_qty 
        ? `${single_product.overview.min_qty} units` 
        : "1 unit"
    },
    {
      name: "Lead Time",
      detail: single_product?.product?.prices?.price_groups?.[0]?.base_price?.lead_time || 
             "Standard production time applies"
    },

    
  ];

  return (
    <div className="Mycontainer gap-6 pb-8">
      {orderDetails.length === 0 ? (
        <p className="text-sm text-gray-500">No order process information available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orderDetails.map((detail, index) => {
            const key = `${detail.name}-${index}`;

            // Normalize content (arrays/objects -> string)
            let content = detail.detail ?? "";
            if (Array.isArray(content)) content = content.join(", ");
            else if (content && typeof content === "object")
              content = JSON.stringify(content);

            return (
              <div
                key={key}
                className="py-2 rounded-lg"
                aria-label={`order-${index}`}
              >
                <h3 className="text-base font-semibold text-gray-800 capitalize md:mb-1">
                  {detail.name}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {content || "—"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Download;