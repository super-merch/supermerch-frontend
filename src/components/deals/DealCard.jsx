const DealCard = ({ deal, backendUrl, onClick }) => {
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(Number(price || 0));

  const getImageUrl = (url) => {
    if (!url) return '/noimage.png';
    return url.startsWith('http') ? url : `${backendUrl}/${url}`;
  };

  const getTotalItems = () => {
    if (typeof deal?.totalItems === 'number' && deal.totalItems > 0) {
      return deal.totalItems;
    }

    if (Array.isArray(deal?.productSlots) && deal.productSlots.length > 0) {
      return deal.productSlots.reduce((sum, slot) => sum + Number(slot.requiredQuantity || 0), 0);
    }

    return 0;
  };

  const formatDealType = (value) =>
    value
      ? value
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (character) => character.toUpperCase())
      : '';

  const dealTypeLabel = formatDealType(deal?.dealType) || (deal?.includesCustomization ? 'Customizable' : 'Fixed Bundle');

  const totalItems = getTotalItems();
  const savingsAmount = Number(deal?.savingsAmount);
  const hasSavingsAmount = Number.isFinite(savingsAmount) && savingsAmount > 0;

  return (
    <div
      onClick={onClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[#D7DFEA] bg-white shadow-[0_18px_40px_-24px_rgba(15,157,138,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-24px_rgba(15,157,138,0.3)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F6F7FA]">
        <img
          src={getImageUrl(deal.bannerImage)}
          alt={deal.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {totalItems > 0 && (
            <div className="w-fit rounded-[10px] bg-[#0A7568] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white shadow-lg">
              {totalItems} Items
            </div>
          )}
        </div>

        {deal.includesCustomization && (
          <div className="absolute right-3 top-3 rounded-[10px] bg-[#F3B11A] px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#0A5D59] shadow-lg">
            Customizable
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col bg-white px-5 pb-5 pt-4 text-left">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-[6px] bg-[#F5F7FB] px-2.5 py-1 text-[11px] font-medium tracking-[0.06em] text-[#9AA3AF]">
            {dealTypeLabel}
          </span>
        </div>

        <h3 className="mb-4 text-[20px] font-bold leading-[1.1] text-[#0A5D59] transition-colors group-hover:text-[#0F9D8A]">
          {deal.title}
        </h3>

        {deal.productSlots && deal.productSlots.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {deal.productSlots.slice(0, 3).map((slot, idx) => (
              <span
                key={`${slot.slotName}-${idx}`}
                className="rounded-full border border-[#C8F1EB] bg-[#F0FFF9] px-3 py-1.5 text-[11px] font-medium text-[#0F9D8A]"
              >
                {slot.requiredQuantity}x {slot.slotName}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto border-t border-[#EEF2F6] pt-4">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.12em] text-[#9AA3AF]">Price</span>
              {Number(deal.basePrice) > Number(deal.dealPrice) && (
                <span className="mt-1 text-sm font-semibold text-[#98A2B3] line-through">{formatPrice(deal.basePrice)}</span>
              )}
              <span className="text-[28px] font-black leading-none text-[#0A5D59]">{formatPrice(deal.dealPrice)}</span>
            </div>

            {hasSavingsAmount && (
              <span className="rounded-[6px] bg-[#ECFDF3] px-3 py-1.5 text-[12px] font-semibold text-[#0F9D8A]">
                Save {formatPrice(savingsAmount)}
              </span>
            )}
          </div>

          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#0F9D8A] px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 group-hover:bg-[#0C8A79]"
          >
            View Deal
            <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealCard;