// Hand-authored family templates + leaf assignment. Deliberately not inferred
// from navGroup/allowedTypeGroupIds -- exceptions like "PK Headwear looks
// clothing-like but Gender Fit is a near-single-value there" need to be a
// visible, reviewable line of code, not a heuristic that silently misfires.
//
// PR1 note: only the templates and the assignment map's *shape* are needed for
// this PR (the manifest still ships with just PE-02). The full leaf-by-leaf
// LEAF_FAMILY_MAP population (~280 entries) is PR2's job, validated per-leaf
// against real category data from the discovery audit, not assumed from group
// membership alone.

// Single source of truth: src/config/quantityOptions.js. That file is plain,
// dependency-free ESM (no JSX, no React import) specifically so it can be
// imported unmodified from both the browser bundle (CategoryFinder.jsx,
// MOQFilter.jsx) and these Node generator scripts -- duplicating the array
// here would let the Finder and sidebar wording silently drift apart.
import { QUANTITY_OPTIONS, ANY_QUANTITY_LABEL } from "../../src/config/quantityOptions.js";
export { QUANTITY_OPTIONS, ANY_QUANTITY_LABEL };

export const sharedQuantityQuestion = () => ({
  id: "moq",
  label: "Order quantity",
  placeholder: ANY_QUANTITY_LABEL,
  type: "query",
  queryParam: "moq",
  options: QUANTITY_OPTIONS,
});

export const sharedBudgetQuestion = (buckets) => ({
  id: "budget",
  label: "Unit budget (ex GST)",
  placeholder: "Any budget",
  type: "price",
  options:
    buckets || [
      { label: "Under $5", value: "0:5" },
      { label: "$5–$10", value: "5:10" },
      { label: "$10–$20", value: "10:20" },
      { label: "$20–$35", value: "20:35" },
      { label: "$35+", value: "35:" },
    ],
});

export const sharedColourQuestion = (options) => ({
  id: "colour",
  label: "Colour",
  placeholder: "Any colour",
  type: "query",
  queryParam: "colors",
  options,
});

// Family templates: { requiredAttribute, optionalAttribute }. A leaf only
// inherits a family if the required attribute independently passes
// isAttributeUsable() for THAT leaf's own real data -- family membership alone
// is never sufficient (see generate-manifest.mjs's classify()).
export const FAMILIES = {
  clothing_gender_fit: {
    requiredAttribute: "Gender Fit",
    optionalAttribute: "Sleeves",
    // Explicitly excluded groups: PK (Headwear -- Gender Fit is ~91% Unisex
    // there, near-zero discriminating power) and PJ (Golf -- not a clothing
    // group at all; included here only as a reminder this is an opt-in list,
    // not every group under a generic "clothing" umbrella).
    applicableGroups: ["PU", "PV", "PW", "PN", "PO", "PC", "PG", "PB"],
  },
  // Workwear gets its own family (split out of clothing_gender_fit) so
  // Visibility -- derived from the real, structured "Compliance" tag
  // discovered in the live API's `product.categorisation.
  // promodata_attributes` (see fetch-catalogue-snapshot.mjs's
  // splitWorkwearCompliance, which separates Hi-Vis from the OTHER
  // compliance values -- rail compliance, UPF rating -- so a customer
  // asking "is this Hi-Vis" and a customer asking "is this rail-compliant"
  // get two honestly distinct questions, not one mixed dropdown) -- can be
  // prioritized as the optional attribute slot ahead of Sleeves. A
  // safety-conscious Workwear buyer choosing "Hi-Vis" is more valuable than
  // sleeve length; Sleeves stays the optional pick for every OTHER clothing
  // group, where this data barely exists anyway.
  //
  // IMPORTANT, sets the customer-facing design decision explicitly: this
  // ships "Visibility: Hi-Vis" as a POSITIVE-ONLY filter (selecting it
  // narrows to Hi-Vis products; leaving it unselected shows everything,
  // Hi-Vis and non-Hi-Vis alike -- the existing "Any" default already
  // covers "don't care"). It does NOT and CANNOT offer an explicit
  // "Non-Hi-Vis" option: confirmed live that the backend's attribute filter
  // is positive-match-only (getAllV2Products.js builds an OR of regexes
  // against promodata_attributes; there is no negation/exclude mechanism
  // anywhere in that code path), so a genuine "show me only the non-Hi-Vis
  // ones" filter is impossible without a backend change. A separate backend
  // PR proposing that change exists (not merged/deployed) -- see
  // scripts/category-finder/BACKEND_BLOCKED_ATTRIBUTES.md. Never pretend a
  // positive attribute filter supports full negation; the copy/UI must not
  // imply a Non-Hi-Vis toggle exists.
  workwear_visibility: {
    requiredAttribute: "Gender Fit",
    optionalAttribute: "Visibility",
    // Visibility (like the "Compliance" it's derived from) is a
    // presence/certification tag, not a categorical choice -- real data
    // shows Hi-Vis is the near-universal value among products that carry
    // ANY Compliance tag at all for most Workwear leaves (some leaves only
    // ever have Hi-Vis, never a second value), which the generic
    // isAttributeUsable rule would reject as "no discriminating power" even
    // though selecting "Hi-Vis" genuinely narrows the whole category. See
    // isPresenceAttributeUsable.
    optionalAttributeMode: "presence",
    applicableGroups: ["PX"],
  },
  drinkware: {
    requiredAttribute: "Capacity",
    optionalAttribute: "Material",
    applicableGroups: ["PE"],
  },
  bags_eco: {
    requiredAttribute: "Eco Factors",
    optionalAttribute: "Material",
    applicableGroups: ["PA"],
  },
  writing_eco: {
    requiredAttribute: "Eco Factors",
    optionalAttribute: "Material",
    applicableGroups: ["PY"],
  },
};

// Candidate family assignment per leaf, mechanically derived from the
// authoritative inventory's parentId against each FAMILIES entry's
// applicableGroups (scripts/category-finder/authoritative-category-ids.json).
// This is deliberately just a CANDIDATE list, not an assertion that
// inheritance actually happens: classify.mjs still requires the leaf's own
// real sampled data to pass isAttributeUsable() and produce >=2 real options
// for the family's requiredAttribute before it inherits anything -- a mapped
// leaf whose real data doesn't support the family attribute falls back to
// generic classification automatically, the same as an unmapped leaf.
export const LEAF_FAMILY_MAP = {
  // clothing_gender_fit (54 leaves)
  "PB-02": "clothing_gender_fit", // Chefs Pants
  "PB-03": "clothing_gender_fit", // Dress Shorts
  "PB-04": "clothing_gender_fit", // Dresses
  "PB-05": "clothing_gender_fit", // Leggings
  "PB-06": "clothing_gender_fit", // Misc Bottoms
  "PB-07": "clothing_gender_fit", // Skirts
  "PC-01": "clothing_gender_fit", // Belts
  "PC-02": "clothing_gender_fit", // Cufflinks
  "PC-03": "clothing_gender_fit", // Gloves
  "PC-04": "clothing_gender_fit", // Misc Clothing Accessories
  "PC-05": "clothing_gender_fit", // Scarves
  "PC-06": "clothing_gender_fit", // Ties
  "PG-01": "clothing_gender_fit", // Boots
  "PG-02": "clothing_gender_fit", // Misc Footwear
  "PG-03": "clothing_gender_fit", // Socks
  "PG-04": "clothing_gender_fit", // Thongs
  "PN-01": "clothing_gender_fit", // Blazers & Suit Jackets
  "PN-02": "clothing_gender_fit", // Cardigans
  "PN-03": "clothing_gender_fit", // Chefs Jackets
  "PN-04": "clothing_gender_fit", // Misc Jackets
  "PN-05": "clothing_gender_fit", // Polar Fleece Jacket
  "PN-06": "clothing_gender_fit", // Ponchos
  "PN-07": "clothing_gender_fit", // Puffer Jackets
  "PN-08": "clothing_gender_fit", // Rain Jackets
  "PN-09": "clothing_gender_fit", // Soft Shell Jackets
  "PN-10": "clothing_gender_fit", // Track Jackets
  "PN-11": "clothing_gender_fit", // Trench Coats
  "PN-12": "clothing_gender_fit", // Varsity Jackets
  "PO-01": "clothing_gender_fit", // Hoodies
  "PO-02": "clothing_gender_fit", // Knitted Jumpers
  "PO-03": "clothing_gender_fit", // Misc Jumpers
  "PO-04": "clothing_gender_fit", // Polar Fleece Jumpers
  "PO-05": "clothing_gender_fit", // Sweaters
  "PO-06": "clothing_gender_fit", // Vests
  "PU": "clothing_gender_fit", // Shirts
  "PV-07": "clothing_gender_fit", // Sports Shorts
  "PW": "clothing_gender_fit", // Uniforms
  "PW-01": "clothing_gender_fit", // Chefwear
  "PW-04": "clothing_gender_fit", // Roughalls & Overalls
  "PW-10": "clothing_gender_fit", // Tunics
  "PX-01": "workwear_visibility", // Aprons
  "PX-02": "workwear_visibility", // Misc Workwear
  "PX-03": "workwear_visibility", // Work Hoodies
  "PX-04": "workwear_visibility", // Work Jackets
  "PX-05": "workwear_visibility", // Work Jumpers
  "PX-06": "workwear_visibility", // Work Pants
  "PX-07": "workwear_visibility", // Work Polar Fleece
  "PX-08": "workwear_visibility", // Work Polo Shirts
  "PX-09": "workwear_visibility", // Work Shirts
  "PX-10": "workwear_visibility", // Work Shorts
  "PX-11": "workwear_visibility", // Work Singlets
  "PX-12": "workwear_visibility", // Work Socks
  "PX-13": "workwear_visibility", // Work T-Shirts
  "PX-14": "workwear_visibility", // Work Vests
  // drinkware (11 leaves)
  "PE-01": "drinkware", // Coffee Mugs
  "PE-02": "drinkware", // Drink Bottles (has its own LEAF_OVERRIDES entry below, takes priority)
  "PE-03": "drinkware", // Drinking Straws
  "PE-04": "drinkware", // Flasks
  "PE-05": "drinkware", // Misc Drinkware
  "PE-06": "drinkware", // Plastic Cups & Tumblers
  "PE-07": "drinkware", // Protein Shakers
  "PE-08": "drinkware", // Reusable Coffee Cups
  "PE-09": "drinkware", // Stubby Holders
  "PE-10": "drinkware", // Thermoses
  "PE-11": "drinkware", // Travel Mugs
  // bags_eco (17 leaves)
  "PA-01": "bags_eco", // Backpacks
  "PA-02": "bags_eco", // Bum Bags
  "PA-03": "bags_eco", // Cooler Bags
  "PA-04": "bags_eco", // Drawstring Bags
  "PA-05": "bags_eco", // Dry Bags
  "PA-06": "bags_eco", // Duffle Bags
  "PA-07": "bags_eco", // Laptop Bags
  "PA-08": "bags_eco", // Luggage Tags
  "PA-09": "bags_eco", // Lunch Bags/Lunch Boxes
  "PA-10": "bags_eco", // Misc Bags
  "PA-11": "bags_eco", // Paper Bags
  "PA-12": "bags_eco", // Reusable Grocery Bags
  "PA-13": "bags_eco", // Satchels
  "PA-14": "bags_eco", // Toiletry Bags & Accessories
  "PA-15": "bags_eco", // Tote Bags
  "PA-16": "bags_eco", // Wallets & Purses
  "PA-17": "bags_eco", // Wheeled Bags
  // writing_eco (13 leaves)
  "PY-01": "writing_eco", // Coloured Pencils
  "PY-02": "writing_eco", // Erasers
  "PY-03": "writing_eco", // Grey-Lead Pencils
  "PY-04": "writing_eco", // Highlighters
  "PY-05": "writing_eco", // Markers
  "PY-06": "writing_eco", // Metal Pens
  "PY-07": "writing_eco", // Misc Writing
  "PY-08": "writing_eco", // Other Pens
  "PY-09": "writing_eco", // Pen Packaging
  "PY-10": "writing_eco", // Pencil Sharpeners
  "PY-11": "writing_eco", // Plastic Pens
  "PY-12": "writing_eco", // Stylus Pens
  "PY-13": "writing_eco", // Wooden Pens
};

// Per-leaf hand overrides that take priority over family/generic resolution
// (e.g. the existing PE-02 curated Bottle Finder). Populated in PR2 for any
// leaf whose generated question set needs a human-authored exception.
//
// PE-02 is copied verbatim from the pre-PR2 committed
// src/config/generated/categoryFinderManifest.js (questions AND copy) so the
// live Bottle Finder stays byte-identical -- the generic/inherited
// classification path would otherwise produce different Capacity bucketing,
// Material groupings, and copy (itemNamePlural "drink bottles" instead of
// "bottles", a generic "Find it faster" eyebrow, etc.), a real behavior
// change for the one category this whole rollout must never touch.
export const LEAF_OVERRIDES = {
  "PE-02": {
    filterMappingsValidated: true,
    runtimeEnabled: true,
    itemNamePlural: "bottles",
    finderEyebrow: "Bottle Finder",
    finderTitle: "Find the right bottle in under 30 seconds",
    finderDescription:
      "Choose what matters most and we’ll narrow the range. You can change or remove any filter afterwards.",
    questions: [
      {
        id: "moq",
        label: "Order quantity",
        placeholder: "Any quantity",
        type: "query",
        queryParam: "moq",
        options: [
          { label: "1–24", value: "24" },
          { label: "25–49", value: "49" },
          { label: "50–99", value: "99" },
          { label: "100–249", value: "249" },
          { label: "250–499", value: "499" },
          { label: "500+", value: "500" },
        ],
      },
      {
        id: "capacity",
        label: "Capacity",
        placeholder: "Any size",
        type: "attribute",
        attributeName: "Capacity",
        options: [
          { label: "Under 300ml", value: "100ml - 199ml,200ml - 299ml" },
          { label: "300–499ml", value: "300ml - 499ml" },
          { label: "500–749ml", value: "500ml - 749ml" },
          { label: "750–999ml", value: "750ml - 999ml" },
          { label: "1 litre+", value: "1000lm - 1999ml,2 - 4.9 Litres,5 - 9.9 Litres" },
        ],
      },
      {
        id: "material",
        label: "Bottle type",
        placeholder: "Any material",
        type: "attribute",
        attributeName: "Material",
        options: [
          { label: "Stainless steel", value: "Stainless Steel" },
          { label: "Aluminium", value: "Aluminium" },
          { label: "Tritan plastic", value: "Triton Plastic" },
          { label: "Other plastic", value: "Polyethylene,Polypropylene,rPET" },
          { label: "Glass", value: "Glass" },
          { label: "Eco materials", value: "Bamboo,Wheat Straw,Cork,rPET" },
        ],
      },
      {
        id: "colour",
        label: "Colour",
        placeholder: "Any colour",
        type: "query",
        queryParam: "colors",
        options: [
          { label: "Black", value: "Black" },
          { label: "White", value: "White" },
          { label: "Blue", value: "Blue" },
          { label: "Red", value: "Red" },
          { label: "Green", value: "Green" },
          { label: "Silver", value: "Silver" },
          { label: "Natural", value: "Natural" },
        ],
      },
      {
        id: "budget",
        label: "Unit budget (ex GST)",
        placeholder: "Any budget",
        type: "price",
        options: [
          { label: "Under $5", value: "0:5" },
          { label: "$5–$10", value: "5:10" },
          { label: "$10–$20", value: "10:20" },
          { label: "$20–$35", value: "20:35" },
          { label: "$35+", value: "35:" },
        ],
      },
    ],
  },
};
