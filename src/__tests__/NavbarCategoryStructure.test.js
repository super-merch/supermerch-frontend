import { describe, expect, it } from "vitest";

import {
  buildBaseMenuItems,
  buildHeadwearEntry,
  CLOTHING_MENU_ORDER,
} from "@/components/Home/navigationConfig";

describe("navbar category structure", () => {
  it("keeps the approved Clothing menu order", () => {
    expect(CLOTHING_MENU_ORDER).toEqual([
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
    ]);
  });

  it("links the Headwear parent to the aggregate PK group", () => {
    const entry = buildHeadwearEntry([
      { id: "caps-id", name: "Caps" },
      { id: "beanies-id", name: "Beanies" },
    ]);

    expect(entry.id).toBe("PK");
    expect(entry.name).toBe("Headwear");
    expect(entry.subTypes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "caps-id", name: "Caps" }),
        expect.objectContaining({ id: "beanies-id", name: "Beanies" }),
      ]),
    );
  });

  it("does not create an empty Headwear entry", () => {
    expect(buildHeadwearEntry([])).toBeNull();
  });

  it("uses the approved top-level labels and existing destination routes", () => {
    const items = buildBaseMenuItems({
      promotionalDefault: { id: "PE", name: "Drinkware" },
      clothingDefault: { id: "PU", name: "Shirts & Tee" },
      collections: [{ slug: "new" }],
    });

    expect(items.map((item) => item.name)).toEqual([
      "Promotional",
      "Clothing",
      "Hampers",
      "Rush Order",
      "Collections",
      "Clearance",
      "Bundle",
      "Australia Made",
    ]);
    expect(items.find((item) => item.name === "Hampers").path).toBe(
      "/return-gifts",
    );
    expect(items.find((item) => item.name === "Rush Order").path).toBe(
      "/24hr-production?expressWindow=sameday",
    );
    expect(items.find((item) => item.name === "Bundle").path).toBe("/deals");
  });
});
