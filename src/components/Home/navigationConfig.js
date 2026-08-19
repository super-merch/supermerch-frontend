export const CLOTHING_MENU_ORDER = [
  "Shirts & Tee",
  "Pants & Bottoms",
  "Workwear",
  "Jackets",
  "Jumpers",
  "Headwear",
  "Hospitality Wears",
  "Sportswear",
  "Footwear",
  "Clothing Accessories",
];

export const buildHeadwearEntry = (headwearCategories = []) =>
  headwearCategories.length > 0
    ? {
        // PK is the real aggregate Headwear product group. Using the first
        // curated child's id made the parent label navigate to that child.
        id: "PK",
        name: "Headwear",
        menuColumnCount: 4,
        subTypes: headwearCategories.map((category) => ({
          id: category.id,
          name: category.name,
          menuColumnTitle: "Headwear",
          menuColumnColor: "primary",
          menuColumnOrder: 0,
        })),
      }
    : null;

export const buildBaseMenuItems = ({
  promotionalDefault,
  clothingDefault,
  collections = [],
}) => [
  {
    name: "Promotional",
    path: promotionalDefault
      ? `/promotional?categoryName=${encodeURIComponent(promotionalDefault.name)}&category=${encodeURIComponent(promotionalDefault.id)}&type=Promotional`
      : "/promotional?type=Promotional",
    hasSubmenu: true,
  },
  {
    name: "Clothing",
    path: clothingDefault
      ? `/promotional?categoryName=${encodeURIComponent(clothingDefault.name)}&category=${encodeURIComponent(clothingDefault.id)}&type=Clothing`
      : "/promotional?type=Clothing",
    hasSubmenu: true,
  },
  { name: "Hampers", path: "/return-gifts", hasSubmenu: true },
  {
    name: "Rush Order",
    path: "/24hr-production?expressWindow=sameday",
    hasSubmenu: true,
  },
  { name: "Bundle", path: "/deals" },
  { name: "Clearance", path: "/clearance?category=clearance" },
];
