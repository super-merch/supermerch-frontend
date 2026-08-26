/**
 * Pricing rules for the customer re-order flow.
 *
 * These live outside the component because they decide what a customer is
 * charged, and three separate bugs in this area shipped while the logic was
 * buried inside a 1,500-line React file where nothing could reach it:
 *
 *   - a successful availability lookup never repriced the line, so a re-order
 *     charged the price frozen in the historical order;
 *   - "available" meant the server named the product, not that it could be
 *     priced, so a product with no current price breaks either kept its stale
 *     price or silently dropped to zero;
 *   - a quantity of 0 quoted $0 while the server billed for one unit.
 *
 * All three were found by review rather than by a test. They are testable now.
 */

/**
 * The unit price for a quantity, from a supplier's price-break ladder.
 *
 * Returns 0 for an empty ladder — see resolveUnitPrice, which is the function
 * callers should use, because 0 here is ambiguous and it separates the two
 * meanings.
 */
export const getPriceForQuantity = (quantity, priceBreaks) => {
  if (!priceBreaks?.length) return 0;
  const sorted = [...priceBreaks].sort((a, b) => a.qty - b.qty);
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (quantity >= sorted[i].qty) return sorted[i].price;
  }
  return sorted[0]?.price || 0;
};

/**
 * The live unit price for a quantity, or null when the product cannot be priced.
 *
 * null is the whole point. getPriceForQuantity returns 0 for an empty
 * price-break list, which is indistinguishable from a genuinely free product,
 * and that 0 used to be written straight onto the line. Separating "we cannot
 * price this" from "this costs nothing" is what lets the caller refuse instead
 * of charging nothing.
 */
export const resolveUnitPrice = (detail, quantity) => {
  const baseGroup = detail?.product?.prices?.price_groups?.find(
    (g) => g.base_price
  );
  const priceBreaks = baseGroup?.base_price?.price_breaks;
  if (!priceBreaks?.length) return null;
  const unitPrice = getPriceForQuantity(Number(quantity), priceBreaks);
  return Number.isFinite(unitPrice) ? unitPrice : null;
};

/**
 * A quantity has to be a whole number of at least one before it can be ordered.
 *
 * `min="1"` on the input does not enforce this: React's onChange accepts 0 and
 * "" happily, and Confirm was never gated on HTML validity.
 */
export const isOrderableQuantity = (value) => {
  const q = Number(value);
  return Number.isInteger(q) && q >= 1;
};

/**
 * Does a lookup response actually identify the product we asked about?
 *
 * Truthiness is not identification. A 200 carrying {}, [] or some other
 * product is truthy, and treating that as available would let the line be
 * charged at the price frozen in the old order on the strength of a response
 * that never confirmed this product exists.
 */
export const identifiesProduct = (returned, id) => {
  if (!returned || typeof returned !== "object" || Array.isArray(returned)) {
    return false;
  }
  const returnedId = returned?.meta?.id ?? returned?.id;
  if (returnedId === undefined || returnedId === null) return false;
  return String(returnedId) === String(id);
};

/**
 * What the customer will ACTUALLY be charged.
 *
 * Mirrors controllers/checkoutSessionController.js, deliberately and line for
 * line, INCLUDING quantising each line to cents the way the server does before
 * it builds the Stripe line items:
 *
 *   subtotal = Σ round(price × 100)/100 × quantity
 *   base     = max(subtotal + setupFee, 0)
 *   preTax   = base − couponDiscount + shipping   (no coupon on a re-order)
 *   gst      = preTax × gstPercent / 100
 *
 * Change one and change the other, or a quote silently drifts from a charge.
 * The modal used to add the ORIGINAL order's GST to a filtered subtotal and
 * never showed the setup fee at all, so it misquoted every re-order that had
 * one — by exactly the setup fee — and misquoted every partial re-order twice
 * over.
 */
export const computeReorderTotals = ({
  orderableLines = [],
  setupFee = 0,
  shipping = 0,
  gstPercent = 10,
} = {}) => {
  const subtotal = orderableLines.reduce(
    (sum, line) =>
      sum +
      (Math.round((Number(line.price) || 0) * 100) / 100) *
        (Number(line.quantity) || 0),
    0
  );
  const fee = Number(setupFee) || 0;
  const ship = Number(shipping) || 0;
  const pct = Number(gstPercent) || 10;
  const preTax = Math.max(subtotal + fee, 0) + ship;
  const gst = (preTax * pct) / 100;
  return { subtotal, setupFee: fee, shipping: ship, gstPercent: pct, gst, total: preTax + gst };
};

/**
 * Reprice the lines whose live detail we successfully resolved.
 *
 * Extracted and made pure because the previous version of this lived inline
 * and iterated `Object.entries(pricedById)` — whose keys are ALWAYS STRINGS.
 * It then compared them with `p.id === id`, so a numeric product id never
 * matched its own line: every line fell through to "cannot price", was
 * demoted to UNVERIFIED, and nothing could be re-ordered at all. Fail-closed,
 * so nobody was overcharged, but the whole feature was dead.
 *
 * The helper tests did not catch it because they tested the pricing functions
 * and not the loop that calls them. Hence this function, and hence the tests
 * that pass it numeric ids.
 *
 * Takes a Map keyed by the ORIGINAL id value — no string coercion anywhere —
 * and returns:
 *   repriced     Map of id -> live unit price, for lines we can sell
 *   unpriceable  array of ids that identified but cannot be priced now,
 *                which the caller must demote rather than sell at the old price
 */
export const repriceLines = (pricedById, orderLines = []) => {
  const repriced = new Map();
  const unpriceable = [];

  for (const [id, detail] of pricedById) {
    const line = orderLines.find((l) => l.id === id);
    const quantity = line?.quantity;
    const unitPrice = isOrderableQuantity(quantity)
      ? resolveUnitPrice(detail, quantity)
      : null;
    if (unitPrice === null) {
      unpriceable.push(id);
    } else {
      repriced.set(id, unitPrice);
    }
  }

  return { repriced, unpriceable };
};
