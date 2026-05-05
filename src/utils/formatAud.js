/** Australian dollar display for storefront (en-AU, AUD). */
export function formatAud(amount) {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
}
