export const getPriceForQuantity = (quantity, priceBreaks) => {
  const sorted = [...priceBreaks].sort((a, b) => a.qty - b.qty);
  if (sorted.length === 0) return 0; // Handle empty case
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (quantity >= sorted[i].qty) return sorted[i].price;
  }
  return sorted[0]?.price || 0;
};