import React from "react";

const Shipping = ({ single_product, activeTab }) => {
  if (activeTab !== "Shipping & Delivery") return null;

  // Extract relevant delivery information from the product
  const deliveryDetails = [
    {
      name: "Product Dimensions",
      detail: single_product?.product?.details?.find(d => 
        d.name.toLowerCase().includes('dimensions')
      )?.detail || "Not specified"
    },
    {
      name: "Packaging",
      detail: single_product?.product?.details?.find(d => 
        d.name.toLowerCase().includes('packaging')
      )?.detail || "Standard packaging"
    },
    
  ];

  return (
    <div className="Mycontainer gap-6 pb-8">
      {deliveryDetails.length === 0 ? (
        <p className="text-sm text-gray-500">No delivery information available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveryDetails.map((detail, index) => {
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
                aria-label={`delivery-${index}`}
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

export default Shipping;