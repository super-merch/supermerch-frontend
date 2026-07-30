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
  // Presence/certification-style attributes only (e.g. Compliance: Hi-Vis) --
  // see isPresenceAttributeUsable below for why these need a different rule
  // than isAttributeUsable.
  MIN_PRESENCE_COVERAGE: 0.05, // below this, too few products carry the tag for it to be worth a filter
  MAX_PRESENCE_COVERAGE: 0.95, // above this, nearly everything has it -- selecting it wouldn't narrow anything
};

/**
 * Coverage is judged against how many SAMPLED products were actually
 * inspected (`sampleSize`), never the leaf's full category product count --
 * a 100-product sample from a 3,000-product category is not "3%
 * populated" just because 100/3000 is small; it's "92% populated within the
 * sample" if 92 of those 100 products had the attribute.
 * @param {{taggedProductCount:number, sampleSize:number, topShare:number, distinctValues:number}|null} attribute
 * @returns {boolean}
 */
export function isAttributeUsable(attribute) {
  if (!attribute || !attribute.sampleSize) return false;
  const coverage = attribute.taggedProductCount / attribute.sampleSize;
  return (
    coverage >= THRESHOLDS.MIN_ATTRIBUTE_COVERAGE &&
    attribute.topShare < THRESHOLDS.MAX_SINGLE_VALUE_SHARE &&
    attribute.distinctValues <= THRESHOLDS.MAX_DISTINCT_VALUES &&
    attribute.distinctValues >= THRESHOLDS.MIN_DISTINCT_VALUES
  );
}

/**
 * A different usability rule for presence/certification-style attributes
 * (e.g. Compliance: Hi-Vis, NSW Rail Compliant, ...) where a customer is
 * choosing "does this product carry the tag at all", not picking among
 * mutually-exclusive categories the way they would for Material or Gender
 * Fit. isAttributeUsable's MAX_SINGLE_VALUE_SHARE/MIN_DISTINCT_VALUES rules
 * don't fit here: real data shows Compliance is 88-100% "Hi-Vis" AMONG the
 * tagged subset (rail-compliance/UPF values are rare) -- and for some
 * Workwear leaves, Hi-Vis is genuinely the ONLY Compliance value that ever
 * appears at all (distinctValues=1). Neither is a usability problem for a
 * presence-based filter: the discriminating power comes from POPULATION
 * (only 20-60% of products tagged), not from value diversity within the
 * tagged group -- a customer selecting "Hi-Vis" still narrows from the
 * whole category down to a genuine subset regardless of how many OTHER
 * compliance standards exist. Only the two extremes are genuinely
 * unhelpful: near-zero coverage (nothing to find) and near-total coverage
 * (selecting it wouldn't narrow anything).
 * @param {{taggedProductCount:number, sampleSize:number}|null} attribute
 * @returns {boolean}
 */
export function isPresenceAttributeUsable(attribute) {
  if (!attribute || !attribute.sampleSize) return false;
  const coverage = attribute.taggedProductCount / attribute.sampleSize;
  return coverage >= THRESHOLDS.MIN_PRESENCE_COVERAGE && coverage <= THRESHOLDS.MAX_PRESENCE_COVERAGE;
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
