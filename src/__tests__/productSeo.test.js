import { describe, expect, it } from "vitest";
import { buildProductSeo, cleanSeoText } from "@/utils/productSeo";

const completeProduct = {
  meta: { id: 42 },
  overview: {
    hero_image: "https://images.example.test/bottle.jpg",
    supplier: "Acme",
    sku_number: "BOT-42",
  },
  product: {
    name: "Ocean Bottle",
    description: "<p>Reusable &amp; insulated bottle.</p>",
    categorisation: {
      promodata_product_type: { type_name: "Drink Bottles" },
    },
    prices: {
      price_groups: [
        { base_price: { price_breaks: [{ price: "8.50" }, { price: "6.25" }] } },
      ],
    },
  },
};

describe("buildProductSeo", () => {
  it("builds indexable metadata and Product, Offer, and Breadcrumb schemas", () => {
    const result = buildProductSeo({
      data: completeProduct,
      pathname: "/product/ocean-bottle",
      slug: "ocean-bottle",
    });

    expect(result.entityId).toBe("42");
    expect(result.fallback.title).toContain("Ocean Bottle");
    expect(result.fallback.description).toBe("Reusable & insulated bottle.");
    expect(result.fallback.canonicalUrl).toBe(
      "https://www.supermerch.com.au/product/ocean-bottle",
    );
    expect(result.fallback.robots).toBe("index, follow");
    expect(result.imageAlt).toBe("Ocean Bottle – Drink Bottles");
    expect(result.structuredData[0]).toMatchObject({
      "@type": "Product",
      name: "Ocean Bottle",
      sku: "42",
      offers: { "@type": "Offer", price: "6.25", priceCurrency: "AUD" },
    });
    expect(result.structuredData[1]["@type"]).toBe("BreadcrumbList");
  });

  it("noindexes incomplete product data and omits unsafe Product markup", () => {
    const result = buildProductSeo({
      data: null,
      pathname: "/product/mystery-item",
      slug: "mystery-item",
    });

    expect(result.fallback.robots).toBe("noindex, follow");
    expect(result.fallback.title).toContain("mystery item");
    expect(result.structuredData).toEqual([]);
  });

  it("does not invent an Offer when Promodata has no valid price", () => {
    const result = buildProductSeo({
      data: { ...completeProduct, product: { ...completeProduct.product, prices: null } },
      pathname: "/product/ocean-bottle",
      slug: "ocean-bottle",
    });

    expect(result.structuredData[0].offers).toBeUndefined();
  });
});

describe("cleanSeoText", () => {
  it("turns Promodata HTML into safe plain text", () => {
    expect(cleanSeoText("<p>A &amp; B</p>\n<p>products</p>")).toBe("A & B products");
  });
});
