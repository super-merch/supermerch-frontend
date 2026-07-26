import { describe, expect, it } from "vitest";
import {
  buildProductSeo,
  cleanSeoText,
  getProductCategoryBreadcrumb,
} from "@/utils/productSeo";

const completeProduct = {
  meta: { id: 42 },
  pricingSummary: { finalMinPrice: 6.25 },
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
    expect(result.fallback.ogImage).toBe("https://images.example.test/bottle.jpg");
    expect(result.fallback.ogImageAlt).toBe("Ocean Bottle – Drink Bottles");
    expect(result.structuredData[0]).toMatchObject({
      "@type": "Product",
      name: "Ocean Bottle",
      sku: "BOT-42",
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
    expect(result.fallback.ogImage).toBe("https://www.supermerch.com.au/logo-teal.png");
    expect(result.fallback.ogImageAlt).toBe("Super Merch Australia logo");
    expect(result.structuredData).toEqual([]);
  });

  it("does not invent an Offer when Promodata has no authoritative price", () => {
    const result = buildProductSeo({
      data: { ...completeProduct, pricingSummary: null },
      pathname: "/product/ocean-bottle",
      slug: "ocean-bottle",
    });

    expect(result.structuredData[0].offers).toBeUndefined();
  });

  it("does not publish undecorated base pricing as an Offer", () => {
    const result = buildProductSeo({
      data: {
        ...completeProduct,
        pricingSummary: null,
        product: {
          ...completeProduct.product,
          prices: {
            price_groups: [
              {
                base_price: { price_breaks: [{ price: "6.25" }] },
                additions: [{ price_breaks: [{ price: "2.50" }] }],
              },
            ],
          },
        },
      },
      pathname: "/product/ocean-bottle",
      slug: "ocean-bottle",
    });

    expect(result.structuredData[0].offers).toBeUndefined();
  });

  it("noindexes discontinued products and omits their Offer", () => {
    const result = buildProductSeo({
      data: { ...completeProduct, meta: { ...completeProduct.meta, discontinued: "true" } },
      pathname: "/product/ocean-bottle",
      slug: "ocean-bottle",
    });

    expect(result.fallback.robots).toBe("noindex, follow");
    expect(result.structuredData[0].offers).toBeUndefined();
  });

  it("uses supplier_brand as Brand and never substitutes the supplier", () => {
    const branded = buildProductSeo({
      data: {
        ...completeProduct,
        product: { ...completeProduct.product, supplier_brand: "CamelBak" },
      },
      pathname: "/product/ocean-bottle",
      slug: "ocean-bottle",
    });
    const supplierOnly = buildProductSeo({
      data: completeProduct,
      pathname: "/product/ocean-bottle",
      slug: "ocean-bottle",
    });

    expect(branded.structuredData[0].brand).toEqual({
      "@type": "Brand",
      name: "CamelBak",
    });
    expect(supplierOnly.structuredData[0].brand).toBeUndefined();
  });

  it.each([
    ["clothing", "/Clothing"],
    ["headwear", "/Headwear"],
  ])("adds a crawlable %s breadcrumb URL for clothing/headwear products", (navGroup, path) => {
    const data = {
      ...completeProduct,
      product: {
        ...completeProduct.product,
        categorisation: {
          promodata_product_type: {
            type_group_id: "GROUP-1",
            type_name: navGroup === "clothing" ? "Polo Shirts" : "Caps",
          },
        },
      },
    };
    const categoryBreadcrumb = getProductCategoryBreadcrumb(data, [
      { id: "GROUP-1", name: navGroup === "clothing" ? "Clothing" : "Headwear", navGroup },
    ]);
    const result = buildProductSeo({
      data,
      pathname: "/product/ocean-bottle",
      slug: "ocean-bottle",
      categoryBreadcrumb,
    });
    const items = result.structuredData[1].itemListElement;

    expect(categoryBreadcrumb.url).toBe(`https://www.supermerch.com.au${path}`);
    expect(items.map((item) => item.name)).toEqual([
      "Home",
      "Shop",
      navGroup === "clothing" ? "Clothing" : "Headwear",
      "Ocean Bottle",
    ]);
    expect(items[2].item).toBe(`https://www.supermerch.com.au${path}`);
  });

  it("omits a category crumb when category metadata has no crawlable route", () => {
    const categoryBreadcrumb = getProductCategoryBreadcrumb(completeProduct, [
      { id: "unknown", name: "Unknown", navGroup: "other" },
    ]);
    const result = buildProductSeo({
      data: completeProduct,
      pathname: "/product/ocean-bottle",
      slug: "ocean-bottle",
      categoryBreadcrumb,
    });

    expect(categoryBreadcrumb).toBeNull();
    expect(result.structuredData[1].itemListElement.map((item) => item.name)).toEqual([
      "Home",
      "Shop",
      "Ocean Bottle",
    ]);
  });
});

describe("cleanSeoText", () => {
  it("turns Promodata HTML into safe plain text", () => {
    expect(cleanSeoText("<p>A &amp; B</p>\n<p>products</p>")).toBe("A & B products");
  });
});
