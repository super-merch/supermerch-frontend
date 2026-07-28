// Pure, dependency-free classification rules shared by generate-manifest.mjs.
// Kept as plain functions (no I/O) so they're cheap to unit test and so tuning a
// threshold is a one-line, reviewable diff rather than buried inside the
// generator's control flow.

export const THRESHOLDS = {
  // No category is excluded for being small (quantity+budget always work via the
  // existing moq/min_price/max_price backend filters regardless of category
  // size) -- there is deliberately no MIN_PRODUCT_COUNT threshold here. See the
  // discovery report: a naive "product count < 60" rule would have wrongly
  // excluded a third of all leaf categories, including real, legitimate ones
  // (Bandannas at 48 products, Golf Ball Markers at 45, etc).
  MIN_ATTRIBUTE_COVERAGE: 0.3, // attribute must be tagged on >=30% of the category's products
  MAX_SINGLE_VALUE_SHARE: 90, // a value dominating >=90% of tagged products has no discriminating power
  MAX_DISTINCT_VALUES: 12, // more raw values than this needs a curated alias map, not a plain dropdown
  MIN_DISTINCT_VALUES: 2, // a single-value attribute isn't a real question
  MIN_COLOUR_POPULATED_PCT: 40, // below this, colour is more misleading than helpful
};

/**
 * @param {{totalTagged:number, topShare:number, distinctValues:number}|null} attribute
 * @param {number} productCount
 * @returns {boolean}
 */
export function isAttributeUsable(attribute, productCount) {
  if (!attribute || productCount <= 0) return false;
  const coverage = attribute.totalTagged / productCount;
  return (
    coverage >= THRESHOLDS.MIN_ATTRIBUTE_COVERAGE &&
    attribute.topShare < THRESHOLDS.MAX_SINGLE_VALUE_SHARE &&
    attribute.distinctValues <= THRESHOLDS.MAX_DISTINCT_VALUES &&
    attribute.distinctValues >= THRESHOLDS.MIN_DISTINCT_VALUES
  );
}

/**
 * @param {number} colourPopulatedPct
 * @returns {boolean}
 */
export function isColourUsable(colourPopulatedPct) {
  return colourPopulatedPct >= THRESHOLDS.MIN_COLOUR_POPULATED_PCT;
}

/**
 * A leaf with zero products has nothing to filter -- the only exclusion rule
 * that isn't about attribute/colour quality.
 * @param {number} productCount
 * @returns {boolean}
 */
export function hasNoProducts(productCount) {
  return productCount === 0;
}
