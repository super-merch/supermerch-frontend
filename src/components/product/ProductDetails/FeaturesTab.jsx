import React from "react";
import { FaInfoCircle } from "react-icons/fa";

const FeaturesTab = ({ single_product, activeInfoTab }) => {
  function filterByNames(array) {
    const namesToInclude = [
      "Materials",
      "Material",
      "Packing",
      "Features",
      // "Sizes",
      // "Size",
      // "Item Size",
      // "Sizing",
      "Product Dimensions",
      "Dimensions",
      "Fabric",
      "Gender",
      "Qty Per Carton",
      "Product Materials",
      "Product Material",
      "Product Size",
      "Product Item Size",
      "Product Packaging Inner",
      "Fabric Types",
      "Genders",
      "Blurb",
      "Sleeve",
      "Tech",
      "Technology",
      "Fit",
      "Tags",
    ];
    const lowerCaseNames = namesToInclude.map((name) => name?.toLowerCase());
    return array?.filter((item) =>
      lowerCaseNames.includes(item?.name?.toLowerCase())
    );
  }

  return (
    <div className="space-y-1 border- border-gray-200 pt-2">
      {/* Brief Description */}
      {single_product?.product?.description ? (
        <div className=" border-gray-200 pb-2">
          {(single_product.product.description.includes("Features:") ||
            single_product?.product?.categorisation?.promodata_attributes) && (
            <div className="text-sm leading-6 text-black mb-2 border-b border-gray-200 pb-2">
              <span className="font-semibold">Features:</span>

              <ul className="mt-2 space-y-1 list-disc list-inside">
                {single_product.product.description
                  .split("Features:")[1]
                  ?.split("\n")
                  .filter((item) =>
                    item?.trim()?.startsWith("*")
                      ? item?.trim()?.startsWith("*")
                      : item?.trim()
                  )
                  .map((feature, index) => (
                    <p key={index} className="mb-1">
                      - {feature?.replace("*", "").trim()}
                    </p>
                  ))}
                {single_product?.product?.categorisation?.promodata_attributes?.map(
                  (attribute, index) => (
                    <p key={index} className="mb-1">
                      - {attribute}
                    </p>
                  )
                )}
              </ul>
            </div>
          )}
          {single_product.product.description.split("Features:")[0] && (
            <>
              <span className="font-semibold">Description:</span>

              <p className="text-sm leading-6 text-black">
                {single_product.product.description
                  .split("Features:")[0]
                  .split("\n")
                  .map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <FaInfoCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Description Available
          </h3>
        </div>
      )}
      {/* Highlights chips */}
      {Array.isArray(single_product?.product?.features) &&
        single_product.product.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {single_product.product.features.slice(0, 8).map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-black ring-1 ring-inset ring-gray-200"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {f}
              </span>
            ))}
          </div>
        )}
      {activeInfoTab === "features" && (
        <div className="space-y-3 text-sm leading-6">
          {filterByNames(single_product?.product?.details)?.map((d, i) => (
            <div key={i} className="border-b last:border-0 pb-3">
              <p className="font-semibold capitalize">{d.method || d.name}</p>

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
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturesTab;
