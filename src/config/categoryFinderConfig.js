import { QUANTITY_OPTIONS, ANY_QUANTITY_LABEL } from "./quantityOptions";

export const CATEGORY_FINDER_CONFIG = {
  "PE-02": {
    eyebrow: "Bottle Finder",
    title: "Find the right bottle in under 30 seconds",
    description:
      "Choose what matters most and we’ll narrow the range. You can change or remove any filter afterwards.",
    submitLabel: "Show my matches",
    questions: [
      {
        id: "moq",
        label: "Order quantity",
        placeholder: ANY_QUANTITY_LABEL,
        type: "query",
        queryParam: "moq",
        options: QUANTITY_OPTIONS,
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

export const getCategoryFinderConfig = (productTypeId) =>
  CATEGORY_FINDER_CONFIG[productTypeId] || null;
