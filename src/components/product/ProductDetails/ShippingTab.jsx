import React from "react";

const ShippingTab = ({ single_product }) => {
  const filterByNamesForShipping = (array) => {
    const namesToInclude = [
      "Packaging",
      "Packaging Type",
      "Carton Size",
      "Carton Notes",
    ];
    const lowerCaseNames = namesToInclude.map((name) => name?.toLowerCase());
    return array?.filter((item) =>
      lowerCaseNames.includes(item?.name?.toLowerCase())
    );
  };
  return (
    <div className="space-y-3 text-sm leading-6">
      {filterByNamesForShipping(single_product.product.details)?.length > 0 ? (
        filterByNamesForShipping(single_product.product.details)?.map(
          (d, i) => (
            <div key={i} className="border-b last:border-0 pb-3">
              <p className="font-semibold">{d.method || d.name}</p>

              {d?.detail && (
                <div className="text-gray-600">
                  {d?.detail?.split("\n").map((line, index) => (
                    <p key={index} className="mb-1">
                      - {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )
        )
      ) : (
        <p>No decoration info available.</p>
      )}
    </div>
  );
};

export default ShippingTab;
