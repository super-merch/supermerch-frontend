import React from "react";
import { FaClock, FaInfoCircle } from "react-icons/fa";

const LeadTimeModal = ({ onClose, leadTimeData = [] }) => {
  // Fallback to default data if no leadTimeData provided
  const defaultLeadTimeData = [
    {
      process: "Assembly",
      leadTime: "The process with the longest lead time +1 day",
    },
    {
      process: "ColourFlex Transfer/Faux Embroidery - Headwear",
      leadTime: "3 Days",
    },
    {
      process: "ColourFlex Transfer/Faux Embroidery - Umbrellas",
      leadTime: "3 Days",
    },
    { process: "Debossing | Hot Stamping", leadTime: "3 Days" },
    { process: "Digital Label", leadTime: "3 Days" },
    { process: "Digital Packaging Print", leadTime: "3 Days" },
    { process: "Direct Digital - Notebooks", leadTime: "3 Days" },
    { process: "Direct Digital - Pens", leadTime: "3 Days" },
    { process: "Embroidery (up to 10k stitches)", leadTime: "3 Days" },
    { process: "Foil Printing", leadTime: "3 Days" },
    {
      process: "Kitting",
      leadTime: "The process with the longest lead time +2 days",
    },
    { process: "Laser Engraving - Drinkware", leadTime: "3 Days" },
    { process: "Laser Engraving - Pens", leadTime: "3 Days" },
    {
      process: "Multi-Process",
      leadTime: "The process with the longest lead time +1 day",
    },
    { process: "Pad Print - Multi Colour", leadTime: "3 Days" },
    { process: "Pad Print - Multi Colour - Pens", leadTime: "3 Days" },
    { process: "Pad Print - Pens", leadTime: "3 Days" },
    { process: "Resin Label", leadTime: "3 Days" },
    { process: "Rotary Digital", leadTime: "4 Days" },
    { process: "Screen Print - Bags/Textiles", leadTime: "3 Days" },
    { process: "Screen Print - Bottles", leadTime: "3 Days" },
    { process: "Screen Print - Flat Bed", leadTime: "3 Days" },
    { process: "Screen Print - Mugs/Cups", leadTime: "3 Days" },
    { process: "Screen Print - Notebooks", leadTime: "3 Days" },
    { process: "Screen Print - Pens", leadTime: "3 Days" },
    { process: "Screen Print - Umbrellas", leadTime: "3 Days" },
    { process: "Silicone Debossing", leadTime: "3 Days" },
    { process: "Silicone Digital Print", leadTime: "3 Days" },
    { process: "Sublimation - Flat", leadTime: "3 Days" },
    { process: "Sublimation - Mugs", leadTime: "3 Days" },
    { process: "Sublimation - Umbrellas", leadTime: "3 Days" },
    { process: "x Melbourne Production", leadTime: "6 Days" },
  ];

  // Use provided data or fall back to default
  const displayData =
    leadTimeData.length > 0
      ? leadTimeData.map((item) => ({
          process: item.method,
          leadTime: item.leadTime,
        }))
      : defaultLeadTimeData;

  const hasCustomData = leadTimeData.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FaClock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {hasCustomData ? "Production Lead Times" : "Process Lead Times"}
              </h2>
              {hasCustomData && (
                <p className="text-sm text-gray-600">
                  Estimated production times for this product
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Info Banner - Only show for custom data */}

        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3">
          <div className="flex items-start gap-2">
            <FaInfoCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-primary">
              Lead times are estimates based on selected decoration methods.
              Actual production time may vary depending on order complexity and
              current workload.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="px-6 py-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="bg-gray-50">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900 border-b-2 border-primary/20">
                      {hasCustomData ? "Decoration Method" : "Process"}
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900 border-b-2 border-primary/20">
                      Lead Time (working days)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayData.map((item, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition-colors`}
                    >
                      <td className="py-4 px-4 text-gray-700 border-b border-gray-100 font-medium">
                        {item.process}
                      </td>
                      <td className="py-4 px-4 border-b border-gray-100">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary font-semibold rounded-full text-sm">
                          <FaClock className="w-3 h-3" />
                          {item.leadTime}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadTimeModal;
