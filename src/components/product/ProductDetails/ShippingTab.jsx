import React from "react";
import { FaBox, FaInfoCircle } from "react-icons/fa";

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
                <div className="text-black">
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
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <FaBox className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Shipping Information
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Shipping details are not currently available for this product.
            Please contact us for more information.
          </p>
        </div>
      )}
    </div>
  );
};

export default ShippingTab;
