import React, { useState } from "react";
import LeadTimeModal from "./LeadTimeModal";

const DecorationTab = ({ single_product }) => {
  const filterByNamesForDecoration = (array) => {
    const namesToInclude = ["Branding Options", "Print Areas"];
    const lowerCaseNames = namesToInclude.map((name) => name?.toLowerCase());
    const arr = array?.filter((item) =>
      lowerCaseNames.includes(item?.name?.toLowerCase())
    );
    return arr;
  };

  const [leadTimeModal, setLeadTimeModal] = useState(false);

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
      <button
        onClick={() => setLeadTimeModal(true)}
        className="text-sm text-blue-500 cursor-pointer hover:text-blue-700 hover:underline"
      >
        View Lead Time
      </button>
      {leadTimeModal && (
        <LeadTimeModal onClose={() => setLeadTimeModal(false)} />
      )}
    </div>
  );
};

export default DecorationTab;
