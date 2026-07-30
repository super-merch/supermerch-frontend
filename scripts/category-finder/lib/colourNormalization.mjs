// Colour value normalization + family grouping for the Category Finder.
//
// ROOT CAUSE this file fixes: fetch-catalogue-snapshot.mjs used to aggregate
// colour (and attribute) values keyed by the EXACT raw string. Real supplier
// data has case/whitespace variants of the same colour ("Natural" vs
// "natural " vs "NATURAL") that are semantically identical -- the backend's
// colour match is already case-insensitive (getAllV2Products.js: `new
// RegExp(escapeRegex(c), "i")`), so submitting any one casing matches every
// product regardless of which casing THAT product's own data uses. Treating
// case variants as distinct dropdown entries therefore produced duplicate
// VISIBLE labels (both title-case down to "Natural") -- this is the reviewed
// "161 question sets with duplicate labels" finding.
//
// SEPARATE problem this file also fixes: even after case-dedup, some
// categories have 50-260+ distinct real colour shade names (raw supplier
// fashion/shade vocabulary: "clay", "ecru", "walnut", "dusty rose", ...).
// Exposing all of them is the reviewed "99 categories with dropdown >50
// values" finding. This groups raw values into a short, controlled list of
// broad colour families (Black, White, Blue, ...). A family option's `value`
// is a comma-joined list of the raw values it covers *within that leaf* --
// the frontend already supports this without any component change:
// CategoryFinder.jsx puts a question's selected value verbatim into one URL
// param (`colors=<value>`), Cards.jsx splits that param on "," into an array
// (`urlColors.split(",")`), and ProductsContext.jsx appends one `colors[]`
// entry per array member -- exactly the OR-match array the backend already
// expects. No backend or component change is required for family grouping.

import { dedupeValueStats } from "./valueDedup.mjs";

const HTML_FRAGMENT_RE = /<br\s*\/?>?/gi;
const PARENTHETICAL_RE = /\([^)]*\)/g; // strips trailing Pantone/descriptor codes, e.g. "orange (021c)"
const PMS_CODE_RE = /\b(pms|cmyk)\b\s*[:#]?\s*[a-z0-9-]*/gi;

// Exact-match noise tokens: not colours at all (production/print metadata,
// garment construction terms, or a vague "ask us" placeholder), never
// classified into any family (including "Other") and never shown to a
// customer as a colour choice.
const NOISE_VALUES = new Set([
  "pms",
  "cmyk",
  "c",
  "s",
  "s/c",
  "custom",
  "customized",
  "customised",
  "customize",
  "round neck",
  "v-neck",
  "waistband",
  "can be produced in almost any colour",
  "range of colours",
  "pms matching not available",
  ">pms matching not available",
  "pms matching is available",
  "as shown",
  "as shown<br",
  "as shown<br/>pms matching not available",
]);

// Ordered, documented substring -> family dictionary. First match wins
// within one token, so more specific keywords are listed before generic
// ones (e.g. "off white"/"ecru" before the bare "white" fallback would ever
// apply). Built from the real, frequency-sorted distinct colour vocabulary
// observed across the live catalogue (scripts/category-finder/.snapshot),
// not guessed blind -- see PR description for the extraction method.
// Judgment calls made on genuinely ambiguous shade names are called out
// inline; these are documented decisions, not silent guesses.
const FAMILY_KEYWORDS = [
  // Natural / Beige -- checked before Brown/White so cream/ecru/stone-family
  // shades don't fall through to a generic brown or white bucket.
  ["Natural / Beige", ["off white", "off-white", "ecru", "natural", "cream", "ivory", "beige", "sand", "stone", "sandstone", "quarry", "wheat", "bone", "taupe", "khaki tan", "vanilla", "canvas"]],
  // Black
  ["Black", ["black", "onyx", "liquorice", "coal", "jet"]],
  // White
  ["White", ["white", "snow", "lychee", "opal"]],
  // Grey / Silver kept as one family (both read as "no strong colour
  // preference, metallic/neutral" to a customer) per the reviewed guidance
  // to keep the list short and controlled.
  ["Grey / Silver", ["grey", "gray", "silver", "charcoal", "gunmetal", "anthracite", "steel", "slate", "smoke", "ash", "granite", "pewter", "chrome", "platinum", "graphite", "carbon", "cement", "dolphin", "shadow", "mushroom"]],
  // Gold
  ["Gold", ["gold", "golden", "bronze", "champagne", "copper"]],
  // Blue (includes navy/royal/teal-family shades)
  ["Blue", ["blue", "navy", "royal", "sky", "teal", "turquoise", "aqua", "cyan", "cobalt", "indigo", "denim", "ceil", "petrol", "ocean", "marine", "atlantic", "reflex", "olympic", "carolina", "process blue"]],
  // Green (khaki/army/olive bucketed here -- more commonly an olive-green in
  // apparel/promo usage than a brown; a documented judgment call)
  ["Green", ["green", "olive", "khaki", "army", "military", "forest", "hunter", "emerald", "lime", "mint", "sage", "fern", "pine", "kelly", "bottle", "eucalyptus", "pistachio", "cypress", "camo", "multicam", "jade", "loden"]],
  // Red
  ["Red", ["red", "maroon", "burgundy", "wine", "crimson", "ruby", "cardinal", "garnet", "cherry", "strawberry", "tomato", "scarlet", "berry", "hibiscus"]],
  // Orange (rust bucketed here rather than Brown -- another documented call;
  // "rust" reads closer to a burnt-orange in most promo apparel ranges)
  ["Orange", ["orange", "rust", "tangerine", "apricot", "amber", "coyote", "saffron", "peach"]],
  // Yellow
  ["Yellow", ["yellow", "lemon", "mustard", "sunflower", "butter", "sunshine", "banana"]],
  // Pink
  ["Pink", ["pink", "fuchsia", "magenta", "blush", "rose", "raspberry", "salmon", "coral", "flamingo"]],
  // Purple
  ["Purple", ["purple", "violet", "lavender", "lilac", "mauve", "grape", "plum", "orchid", "eggplant", "aubergine", "hollyhock"]],
  // Brown (wood/material-derived colour names, common on wooden pens/coasters)
  ["Brown", ["brown", "tan", "camel", "chocolate", "walnut", "chestnut", "wood", "cork", "bamboo", "clay", "blackbutt", "mocha", "coffee"]],
  // Fluoro / Hi-Vis kept distinct from its base hue -- a fluoro/neon/safety
  // shade is chosen by customers specifically FOR its high-visibility
  // property, not as "a yellow" or "an orange".
  ["Fluoro / Hi-Vis", ["neon", "fluoro", "fluor", "safety", "hiviz", "hi-vis", "hi vis"]],
  // Clear / Transparent
  ["Clear / Transparent", ["clear", "transparent"]],
  // Multi-Colour / Print
  ["Multi-Colour / Print", ["multicolour", "multicolor", "multi-colour", "multi colour", "rainbow", "galaxy", "assorted", "full colour", "full color", "rasta"]],
];

function stripNoiseMarkers(token) {
  return token
    .replace(HTML_FRAGMENT_RE, " ")
    .replace(PARENTHETICAL_RE, " ")
    .replace(PMS_CODE_RE, " ")
    .replace(/-/g, " ") // hyphen is a word-internal joiner here ("off-white", "dark-green"), not a multi-tone separator
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes a raw colour string to a case/whitespace-insensitive key so
 * true duplicates (same colour, different casing) collapse to one entry.
 */
export function normalizeColourKey(rawValue) {
  return String(rawValue).trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * True if a raw colour value is production/print metadata or a
 * non-committal placeholder rather than an actual colour -- should never be
 * shown to a customer as a colour choice, under any family (including
 * "Other").
 */
export function isNoiseColourValue(rawValue) {
  const key = normalizeColourKey(rawValue);
  if (NOISE_VALUES.has(key)) return true;
  const cleaned = stripNoiseMarkers(key);
  if (!cleaned) return true; // nothing left after stripping HTML/PMS/parenthetical markers
  if (NOISE_VALUES.has(cleaned)) return true;
  return false;
}

/**
 * Maps one raw colour value to the set of broad families it belongs to.
 * Compound/two-tone values ("Black/White", "navy.gold") are split on "/"
 * and "." (the two separators actually observed in the live data) and each
 * part is classified independently -- a "Black/White" product genuinely IS
 * partly black, so it correctly appears under both families, matching a
 * customer's real expectation when they filter by either.
 *
 * Returns an empty array for noise values and for any part that matches no
 * known keyword (never invents an "Other" here -- callers decide how to
 * handle unmatched values, see buildColourFamilyOptions).
 */
// Word-boundary match, NOT plain substring -- a plain `.includes()` check
// let "charcoal" (a real Grey/Silver shade) wrongly match Black's "coal"
// keyword, since "charcoal" contains "coal" as a substring even though
// "coal" never appears there as its own word. `\b` around the keyword
// requires it to start/end on a real word boundary, so "charcoal" no longer
// matches "coal" but "coal grey" still correctly matches "coal".
function matchesKeyword(part, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(part);
}

export function classifyColourFamilies(rawValue) {
  if (isNoiseColourValue(rawValue)) return [];
  const key = normalizeColourKey(rawValue);
  const parts = key.split(/[/.]/).map((p) => stripNoiseMarkers(p)).filter(Boolean);
  const families = new Set();
  for (const part of parts) {
    for (const [family, keywords] of FAMILY_KEYWORDS) {
      if (keywords.some((kw) => matchesKeyword(part, kw))) {
        families.add(family);
        break; // first-matching family wins for this part; keyword lists are ordered by specificity
      }
    }
  }
  return [...families];
}

/**
 * Deduplicates a leaf's raw colourValues stats (as produced by
 * fetch-catalogue-snapshot.mjs) case/whitespace-insensitively, merging
 * product counts for values that normalize to the same key. Keeps the
 * most-frequently-seen exact casing as the canonical display/filter value
 * (arbitrary among case variants since backend matching is case-insensitive
 * -- any variant would match identically).
 */
export function dedupeColourValues(colourValues) {
  return dedupeValueStats(colourValues);
}

/**
 * Groups a leaf's (already case-deduped) colour values into a short,
 * controlled family list. Each returned option's `value` is a comma-joined
 * list of the leaf's own raw values that fall into that family -- passed
 * straight through the existing comma-split multi-value plumbing, no
 * component/backend change needed (see file header).
 *
 * Product counts per family are an approximate sum across the family's raw
 * values (a product tagged with two raw values in the same family is
 * counted twice) -- this count is display/sort-order only, never used for
 * actual filtering, so the approximation doesn't affect correctness of
 * results, only the cosmetic ordering of the family list.
 *
 * Raw values matching no known family are grouped under "Other" so real
 * products are never silently hidden; pure noise values (see
 * isNoiseColourValue) are dropped entirely, not folded into "Other".
 */
export function buildColourFamilyOptions(colourValues) {
  const deduped = dedupeColourValues(colourValues);
  const familyRawValues = new Map(); // family -> [{value, productCount}]
  for (const entry of deduped) {
    const families = classifyColourFamilies(entry.value);
    if (isNoiseColourValue(entry.value)) continue;
    const targets = families.length > 0 ? families : ["Other"];
    for (const family of targets) {
      if (!familyRawValues.has(family)) familyRawValues.set(family, []);
      familyRawValues.get(family).push(entry);
    }
  }
  const options = [...familyRawValues.entries()].map(([family, entries]) => ({
    label: family,
    value: entries.map((e) => e.value).join(","),
    productCount: entries.reduce((sum, e) => sum + e.productCount, 0),
    rawValueCount: entries.length,
  }));
  return options.sort((a, b) => b.productCount - a.productCount);
}
