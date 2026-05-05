import { useState } from "react";
import FeaturesTab, {
  filterDetailsForFeaturesTab,
} from "@/components/product/ProductDetails/FeaturesTab";
import LeadTimeTab from "@/components/product/ProductDetails/LeadTime";
import ShippingTab from "@/components/product/ProductDetails/ShippingTab";

const TABS = [
  { id: "description", label: "Description" },
  { id: "specifications", label: "Specifications" },
  { id: "leadTime", label: "Lead Time" },
  { id: "shipping", label: "Shipping" },
];

/**
 * Workwear-styled tab shell with the same Promodata / single-product content
 * as the legacy ProductDetails tabs (FeaturesTab, LeadTime, Shipping).
 */
export default function ClothingHeadwearSupermerchTabs({
  single_product,
  availablePriceGroups = [],
}) {
  const [activeTab, setActiveTab] = useState("description");

  const renderTabContent = () => {
    if (!single_product?.product) {
      return (
        <p className="text-sm text-gray-500 py-4">
          Product details are not available.
        </p>
      );
    }

    switch (activeTab) {
      case "description":
        return (
          <FeaturesTab
            single_product={single_product}
            activeInfoTab="pricing"
          />
        );
      case "specifications": {
        const rows = filterDetailsForFeaturesTab(
          single_product.product.details,
        );
        if (!rows?.length) {
          return (
            <p className="text-sm text-gray-500 py-4">
              No specification fields from the supplier for this product.
            </p>
          );
        }
        return (
          <div className="space-y-3 text-sm leading-6">
            {rows.map((d, i) => (
              <div
                key={i}
                className="border-b border-gray-100 last:border-0 pb-3"
              >
                <p
                  className="text-lg font-semibold capitalize text-[#009688]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {d.method || d.name}
                </p>
                {d?.detail && (
                  <div className="text-[#1E2328]">
                    {d.detail.split("\n").map((line, idx) => (
                      <p key={idx} className="mb-1">
                        - {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }
      case "leadTime":
        return (
          <LeadTimeTab
            availablePriceGroups={availablePriceGroups}
            useGenericFallback={false}
          />
        );
      case "shipping":
        return <ShippingTab single_product={single_product} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-[#F8FAFC] to-[#FEFEFE] border-b border-[#CBD5E1] rounded-t-xl overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-shrink-0 px-3 sm:px-4 py-3 font-semibold transition-all duration-300 snap-start whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-[#009688] bg-white shadow-sm"
                  : "text-[#6B7380] hover:text-[#009688] hover:bg-white/50"
              }`}
              style={{ fontFamily: "Poppins, sans-serif", fontSize: "12px" }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#009688] to-[#00796B] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[200px] sm:min-h-[300px] bg-white rounded-b-xl border-x border-b border-[#CBD5E1] p-3 sm:p-5 shadow-sm">
        {renderTabContent()}
      </div>
    </div>
  );
}
