import { describe, expect, it } from "vitest";
import { toCanonicalUrl } from "../utils/canonicalUrl";
import { getShopSeoContext } from "../utils/shopSeo";

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

