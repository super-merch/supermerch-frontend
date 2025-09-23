import React from "react";

const DecorationTab = ({ single_product }) => {
  const filterByNamesForDecoration = (array) => {
    const namesToInclude = ["Branding Options", "Print Areas"];
    const lowerCaseNames = namesToInclude.map((name) => name?.toLowerCase());
    const arr = array?.filter((item) =>
      lowerCaseNames.includes(item?.name?.toLowerCase())
    );
    return arr;
  };

  return (
    <div className="space-y-3 text-sm leading-6">
      {filterByNamesForDecoration(single_product.product.details)?.length >
      0 ? (
        filterByNamesForDecoration(single_product.product.details).map(
          (d, i) => (
            <div key={i} className="border-b last:border-0 pb-3">
              <p className="font-semibold">{d.method || d.name}</p>

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
          )
        )
      ) : (
        <p>No decoration info available.</p>
      )}
    </div>
  );
};

export default DecorationTab;
