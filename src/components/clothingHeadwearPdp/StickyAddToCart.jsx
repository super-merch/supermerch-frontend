import WwButton from "./WwButton";
import { formatAud } from "@/utils/formatAud";

export default function StickyAddToCart({
  product,
  selectedColor,
  colorVariants,
  sizeQuantities,
  pricingTiers,
  onAddToCart,
  addingToCart = false,
}) {
  const totalQty = Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0);
  const hasSelection = totalQty > 0;

  const totalPrice =
    hasSelection && colorVariants
      ? Object.entries(sizeQuantities).reduce((sum, [sizeId, qty]) => {
          if (qty > 0) {
            const variant = colorVariants.sizesWithStock?.find(
              (v) => v.size.id === parseInt(sizeId, 10),
            );
            if (variant) {
              let tierPrice = pricingTiers[0]?.unitPrice || 0;
              for (let i = pricingTiers.length - 1; i >= 0; i--) {
                const tier = pricingTiers[i];
                const maxQty = tier.maxQuantity || Infinity;
                if (qty >= tier.minQuantity && qty <= maxQty) {
                  tierPrice = tier.unitPrice;
                  break;
                }
              }
              return sum + (tierPrice + variant.priceAdjustment) * qty;
            }
          }
          return sum;
        }, 0)
      : 0;

  const primaryImage =
    colorVariants?.images?.[0]?.url || product.primaryImage?.imageUrl;

  if (!hasSelection) return null;

  /**
   * Price-on-application products have no price, so there is nothing for this
   * bar to show and nothing to add.
   *
   * The main Add to Cart button is inside the block replaced by the "Contact
   * us" panel, so it disappears on its own. This one does not: the size and
   * quantity selectors are still rendered, so a customer on mobile could pick a
   * colour and quantity, and this bar would slide up showing $0.00 with a
   * working button. Hiding the price without hiding every way to buy would be
   * worse than leaving it alone.
   */
  if (product.isPriceOnApplication) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#CBD5E1] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 lg:hidden safe-area-bottom">
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={primaryImage}
                alt={product.name}
                className="w-12 h-12 object-contain rounded-lg border border-[#CBD5E1] shadow-sm bg-[#FAFAFA]"
              />
              <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-gradient-to-br from-[#009688] to-[#00796B] rounded-full flex items-center justify-center px-1 shadow-md">
                <span className="text-white text-[10px] font-bold">{totalQty}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col">
                <span
                  className="text-[#10B981] font-bold leading-tight"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "16px",
                  }}
                >
                  {formatAud(totalPrice)}
                </span>
                <span className="text-[10px] text-[#6B7380] font-medium truncate">
                  {totalQty} item{totalQty > 1 ? "s" : ""} selected
                </span>
              </div>
            </div>
          </div>

          <WwButton
            size="sm"
            disabled={!product.inStock || !hasSelection || !selectedColor || addingToCart}
            className="h-11 px-5 text-sm font-bold shadow-lg rounded-xl whitespace-nowrap"
            onClick={onAddToCart}
          >
            {addingToCart ? (
              <span className="flex items-center gap-1.5">
                <i className="ri-loader-4-line animate-spin"></i>
                Adding...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <i className="ri-shopping-cart-2-line"></i>
                Add to Cart
              </span>
            )}
          </WwButton>
        </div>
      </div>
    </div>
  );
}
