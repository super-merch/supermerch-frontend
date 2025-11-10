import React, { useState } from "react";
import LeadTimeModal from "./LeadTimeModal";
import { FaPaintBrush, FaPrint, FaClock, FaCheckCircle } from "react-icons/fa";
import { MdColorLens } from "react-icons/md";

const DecorationTab = ({ single_product, availablePriceGroups }) => {
  const filterByNamesForDecoration = (array) => {
    const namesToInclude = ["Branding Options", "Print Areas"];
    const lowerCaseNames = namesToInclude.map((name) => name?.toLowerCase());
    const arr = array?.filter((item) =>
      lowerCaseNames.includes(item?.name?.toLowerCase())
    );
    return arr;
  };

  const [leadTimeModal, setLeadTimeModal] = useState(false);

  const getIconForMethod = (name) => {
    const lowerName = name?.toLowerCase() || "";
    if (lowerName.includes("branding"))
      return <FaPaintBrush className="w-5 h-5 text-primary" />;
    if (lowerName.includes("print"))
      return <FaPrint className="w-5 h-5 text-primary" />;
    return <MdColorLens className="w-5 h-5 text-primary" />;
  };

  const decorationData = filterByNamesForDecoration(
    single_product.product.details
  );

  // Extract lead times and filter out null/undefined values
  const leadTimeData = availablePriceGroups
    .map((group) => ({
      method: group.description || group.promodata_decoration || "Standard",
      leadTime: group.lead_time,
    }))
    .filter(
      (item) =>
        item.leadTime !== null &&
        item.leadTime !== undefined &&
        item.leadTime !== ""
    );
  // Check if there are any valid lead times
  const hasValidLeadTimes = leadTimeData.length > 0;

  return (
    <div className="space-y-6">
      {decorationData?.length > 0 ? (
        <>
          {/* Decoration Methods Grid */}
          <div className="grid gap-6">
            {decorationData.map((d, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getIconForMethod(d.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-secondary mb-1">
                      {d.method || d.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Available decoration option
                    </p>
                  </div>
                </div>

                {/* Details */}
                {d?.detail && (
                  <div className="space-y-2 ml-16">
                    {d?.detail?.split("\n").map((line, index) => {
                      const trimmedLine = line.trim();
                      if (!trimmedLine) return null;

                      return (
                        <div
                          key={index}
                          className="flex items-start gap-3 text-sm text-gray-700"
                        >
                          <FaCheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{trimmedLine}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        // Empty State
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <FaPaintBrush className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Decoration Information
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Decoration details are not currently available for this product.
            Please contact us for custom branding options.
          </p>
        </div>
      )}
      {/* Lead Time CTA - Only show if there are valid lead times */}

      {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaClock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-secondary mb-1">
                Production Timeline
              </h4>
              
            </div>
          </div>
          <button
            onClick={() => setLeadTimeModal(true)}
            className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            View Lead Times
          </button>
        </div>
      </div> */}

      {leadTimeModal && (
        <LeadTimeModal
          onClose={() => setLeadTimeModal(false)}
          leadTimeData={leadTimeData}
        />
      )}
    </div>
  );
};

export default DecorationTab;
