import { describe, expect, it } from "vitest";
import { toCanonicalUrl } from "../utils/canonicalUrl";
import { getShopSeoContext, hasShopFilterParams } from "../utils/shopSeo";

describe("dynamic category SEO", () => {
  it("uses the selected category as the SEO entity", () => {
    expect(getShopSeoContext("?category=wooden-pens")).toEqual({
      entityId: "wooden-pens",
      canonicalPath: "/shop?category=wooden-pens",
    });
  });

  it("falls back to the general shop SEO record", () => {
    expect(getShopSeoContext("")).toEqual({
      entityId: "shop",
      canonicalPath: "/shop",
    });
  });

  it("keeps category while removing duplicate and tracking parameters", () => {
    expect(
      toCanonicalUrl(
        "https://supermerch.com.au/shop?category=wooden-pens&page=2&sort=price&utm_source=test&gclid=1#products",
      ),
    ).toBe("https://www.supermerch.com.au/shop?category=wooden-pens");
  });
});

describe("hasShopFilterParams", () => {
  it("is false with no query params", () => {
    expect(hasShopFilterParams("")).toBe(false);
  });

  it("is false for the canonical category view", () => {
    expect(hasShopFilterParams("?category=wooden-pens")).toBe(false);
  });

  it("is false for benign params: page, sort, view, utm_*, gclid, fbclid", () => {
    expect(
      hasShopFilterParams(
        "?category=wooden-pens&page=2&sort=price&view=grid&utm_source=newsletter&utm_campaign=x&gclid=abc&fbclid=xyz",
      ),
    ).toBe(false);
  });

  it("is true for a color facet param", () => {
    expect(hasShopFilterParams("?color=blue")).toBe(true);
  });

  it("is true for a size facet param", () => {
    expect(hasShopFilterParams("?size=large")).toBe(true);
  });

  it("is true for a price-range facet param even alongside a category", () => {
    expect(hasShopFilterParams("?category=wooden-pens&priceMin=10&priceMax=50")).toBe(
      true,
    );
  });

  it("is case-insensitive when matching benign param names", () => {
    expect(hasShopFilterParams("?Category=wooden-pens&Page=2")).toBe(false);
  });
});

