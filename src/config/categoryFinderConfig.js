const ORDER_QUANTITY_QUESTION = {
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
};

const COLOUR_QUESTION = {
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
};

const BUDGET_QUESTION = {
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
};

const ATTRIBUTE_PRIORITY_BY_GROUP = {
  PA: ["Features", "Material", "Capacity", "Eco Factors"],
  PB: ["Material", "Features", "Eco Factors"],
  PC: ["Material", "Features", "Eco Factors"],
  PD: ["Features", "Eco Factors", "Material"],
  PE: ["Capacity", "Features", "Material", "Eco Factors"],
  PF: ["Features", "Material", "Eco Factors"],
  PG: ["Material", "Features", "Sport"],
  PH: ["Features", "Material", "Sport"],
  PI: ["Capacity", "Material", "Features"],
  PJ: ["Features", "Material", "Sport"],
  PK: ["Material", "Features", "Eco Factors"],
  PL: ["Features", "Material", "Eco Factors"],
  PM: ["Features", "Material", "Eco Factors"],
  PN: ["Material", "Features", "Eco Factors"],
  PO: ["Material", "Features", "Eco Factors"],
  PP: ["Features", "Material", "Eco Factors"],
  PQ: ["Features", "Material", "Sport", "Eco Factors"],
  PR: ["Features", "Material", "Eco Factors"],
  PS: ["Features", "Capacity", "Material", "Eco Factors"],
  PT: ["Material", "Features", "Eco Factors"],
  PU: ["Material", "Features", "Eco Factors"],
  PV: ["Sport", "Material", "Features"],
  PW: ["Material", "Features", "Eco Factors"],
  PX: ["Material", "Features", "Local Factors"],
  PY: ["Features", "Material", "Eco Factors"],
};

const FALLBACK_ATTRIBUTE_PRIORITY = [
  "Features",
  "Material",
  "Capacity",
  "Eco Factors",
  "Sport",
  "Local Factors",
];

const toAttributeQuestion = (attribute) => ({
  id: `attribute-${attribute.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  label: attribute.name,
  placeholder: `Any ${attribute.name.toLowerCase()}`,
  type: "attribute",
  attributeName: attribute.name,
  options: attribute.values.map((value) => ({ label: value, value })),
});

const getDynamicAttributeQuestions = (productTypeId, attributes = []) => {
  const available = new Map(
    attributes
      .filter(
        (attribute) =>
          attribute?.name &&
          Array.isArray(attribute.values) &&
          attribute.values.length > 0
      )
      .map((attribute) => [attribute.name, attribute])
  );
  const groupId = productTypeId?.split("-")[0];
  const priorities = [
    ...(ATTRIBUTE_PRIORITY_BY_GROUP[groupId] || []),
    ...FALLBACK_ATTRIBUTE_PRIORITY,
  ];

  return [...new Set(priorities)]
    .map((name) => available.get(name))
    .filter(Boolean)
    .slice(0, 2)
    .map(toAttributeQuestion);
};

export const CATEGORY_FINDER_CONFIG = {
  "PE-02": {
    eyebrow: "Bottle Finder",
    title: "Find the right bottle in under 30 seconds",
    description:
      "Choose what matters most and we’ll narrow the range. You can change or remove any filter afterwards.",
    submitLabel: "Show my matches",
    questions: [
      ORDER_QUANTITY_QUESTION,
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
      COLOUR_QUESTION,
      BUDGET_QUESTION,
    ],
  },
};

export const getCategoryFinderConfig = (
  productTypeId,
  { attributes = [], categoryLabel = "" } = {}
) => {
  if (!productTypeId) return null;
  if (CATEGORY_FINDER_CONFIG[productTypeId]) {
    return CATEGORY_FINDER_CONFIG[productTypeId];
  }

  const attributeQuestions = getDynamicAttributeQuestions(
    productTypeId,
    attributes
  );
  if (attributeQuestions.length === 0) return null;

  const label = categoryLabel.trim() || "products";
  const labelLower = label.toLowerCase();

  return {
    eyebrow: `${label} Finder`,
    title: `Find the right ${labelLower} in under 30 seconds`,
    description:
      "Choose what matters most and we’ll narrow the range. You can change or remove any filter afterwards.",
    submitLabel: "Show my matches",
    emptySubmitLabel: `View all ${labelLower}`,
    questions: [
      ORDER_QUANTITY_QUESTION,
      ...attributeQuestions,
      COLOUR_QUESTION,
      BUDGET_QUESTION,
    ],
  };
};
