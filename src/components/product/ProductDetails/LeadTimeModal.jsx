import React from "react";

const LeadTimeModal = ({ onClose }) => {
  const leadTimeData = [
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Process Lead Times
          </h2>
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

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="px-6 py-2">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr className="bg-gray-50">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900 border-b border-gray-200">
                      Process
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900 border-b border-gray-200">
                      Standard Lead Time (working days)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leadTimeData.map((item, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition-colors`}
                    >
                      <td className="py-4 px-4 text-gray-700 border-b border-gray-100">
                        {item.process}
                      </td>
                      <td className="py-4 px-4 text-gray-700 border-b border-gray-100 font-medium">
                        {item.leadTime}
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
