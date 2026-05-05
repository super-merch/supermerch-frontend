import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { formatAud } from "@/utils/formatAud";

export default function VolumePricingModal({ isOpen, onClose, productName, priceTiers = [] }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#009688]/10">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#009688]">Volume pricing — {productName}</h2>
          <button type="button" className="p-2 rounded-lg hover:bg-gray-100" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {priceTiers.length === 0 ? (
            <p className="text-sm text-gray-600">Pricing tiers will appear when available.</p>
          ) : (
            priceTiers.map((tier, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 px-3 rounded-lg bg-[#F8FAFC] border border-gray-100"
              >
                <span className="text-sm text-gray-700">
                  {tier.minQuantity}
                  {tier.maxQuantity ? ` – ${tier.maxQuantity}` : "+"} units
                </span>
                <span className="font-semibold text-[#009688]">{formatAud(tier.unitPrice)} ea.</span>
              </div>
            ))
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-[#009688] text-white text-sm font-semibold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
