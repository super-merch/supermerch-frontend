import React from "react";

const FeaturesTab = ({ single_product, activeInfoTab }) => {
  function filterByNames(array) {
    const namesToInclude = [
      "Materials",
      "Material",
      "Packing",
      "Features",
      "Sizes",
      "Size",
      "Item Size",
      "Sizing",
      "Product Dimensions",
      "Dimensions",
      "Fabric",
      "Gender",
      "Qty Per Carton",
      "Product Materials",
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
      {single_product?.product?.description && (
        <div className=" border-gray-200 pb-2">
          {single_product.product.description.includes("Features:") && (
            <div className="text-sm leading-6 text-gray-800 mb-2 border-b border-gray-200 pb-2">
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
                    <li key={index} className="text-gray-800">
                      {feature?.replace("*", "").trim()}
                    </li>
                  ))}
              </ul>
            </div>
          )}
          {single_product.product.description.split("Features:")[0] && (
            <>
              <span className="font-semibold">Description:</span>
              <p className="text-sm leading-6 text-gray-800">
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
      )}

      {/* Highlights chips */}
      {Array.isArray(single_product?.product?.features) &&
        single_product.product.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {single_product.product.features.slice(0, 8).map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 ring-1 ring-inset ring-gray-200"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-smallHeader" />
                {f}
              </span>
            ))}
          </div>
        )}
      {activeInfoTab === "features" && (
        <div className="space-y-3 text-sm leading-6">
          {filterByNames(single_product?.product?.details)?.length > 0 ? (
            filterByNames(single_product?.product?.details)?.map((d, i) => (
              <div key={i} className="border-b last:border-0 pb-3">
                <p className="font-semibold capitalize">{d.method || d.name}</p>

                {d?.detail && (
                  <div className="text-gray-600">
                    {d?.detail
                      ?.split(/[;]/)
                      .filter((entry) => entry.trim() !== "")
                      .map((entry, index) => (
                        <p key={index} className="mb-1">
                          • {entry.trim()}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No features info available.</p>
          )}
        </div>
      )}
      {/* Specifications Table */}
      {/* <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-2">
                      <div className="bg-gray-50 pl-6 py-3 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Specifications
                        </h3>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <tbody className="divide-y divide-gray-200">
                            {Array.isArray(single_product?.product?.details) &&
                              filterByNames(
                                single_product?.product?.details
                              ).map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3 capitalize">
                                    {item?.name || "Detail"}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-pre-line">
                                    {item?.detail?.split(";").join("\n") || "-"}
                                  </td>
                                </tr>
                              ))}

                            {single_product?.product?.material && (
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3">
                                  Material
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {single_product.product.material}
                                </td>
                              </tr>
                            )}

                            {single_product?.product?.dimensions && (
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3">
                                  Dimensions
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {single_product.product.dimensions}
                                </td>
                              </tr>
                            )}

                            {single_product?.product?.packaging && (
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3">
                                  Packaging
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {single_product.product.packaging}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div> */}
    </div>
  );
};

export default FeaturesTab;
