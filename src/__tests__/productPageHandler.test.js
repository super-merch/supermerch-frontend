import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "../../api/product-page";

const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
  text: async () => String(body),
});

const createResponse = () => {
  const result = { headers: {}, statusCode: null, body: "" };
  return {
    result,
    setHeader: (key, value) => {
      result.headers[key] = value;
    },
    status: (statusCode) => {
      result.statusCode = statusCode;
      return {
        send: (body) => {
          result.body = body;
        },
      };
    },
  };
};

// Real app shell shape: the SPA's mount point. api/product-page.js's
// injectBody() only replaces content inside <div id="root"></div> — a
// fixture without it would let body injection silently no-op while every
// <head> tag assertion still passes.
const SHELL_WITH_ROOT =
  '<html><head><title>Fallback</title></head><body><div id="root"></div></body></html>';

const SHELL_WITHOUT_ROOT =
  "<html><head><title>Fallback</title></head><body></body></html>";

const baseProduct = {
  meta: { id: 42 },
  pricingSummary: { finalMinPrice: 6.25 },
  overview: {
    hero_image: "https://images.example.test/bottle.jpg",
    sku_number: "BOT-42",
    slug: "ocean-bottle",
  },
  product: {
    name: "Ocean Bottle",
    slug: "ocean-bottle",
    description: "<p>Reusable &amp; insulated bottle for the outdoors.</p>",
    categorisation: {
      promodata_product_type: { type_name: "Drink Bottles", type_id: "PE-02" },
    },
  },
};

describe("product page handler", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("injects a real H1, description, and breadcrumb links into #root", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(SHELL_WITH_ROOT))
      .mockResolvedValueOnce(response({ data: baseProduct }))
      .mockResolvedValueOnce(response({ success: false }, 404));
    vi.stubGlobal("fetch", fetchMock);
    const res = createResponse();

    await handler(
      { query: { id: "42" }, headers: { host: "www.supermerch.com.au" } },
      res,
    );

    expect(res.result.statusCode).toBe(200);
    // Actually injected into #root, not left as an empty mount point.
    expect(res.result.body).not.toContain('<div id="root"></div>');
    expect(res.result.body).toContain('data-ssr-content="product"');
    expect(res.result.body).toContain("<h1>Ocean Bottle</h1>");
    expect(res.result.body).toContain("Reusable & insulated bottle");
    expect(res.result.body).toContain('<nav aria-label="Breadcrumb">');
    expect(res.result.body).toContain('<a href="/">Home</a>');
    expect(res.result.body).toContain('<a href="/shop">Shop</a>');
    // Current-page crumb (the product itself) has no link, matching the
    // rendered pattern used for visible breadcrumbs elsewhere on the site.
    expect(res.result.body).toContain("<span>Ocean Bottle</span>");
  });

  it("keeps the product's category consistent between the visible breadcrumb and the BreadcrumbList JSON-LD, and links use the real type_id, not the display label", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(SHELL_WITH_ROOT))
      .mockResolvedValueOnce(response({ data: baseProduct }))
      .mockResolvedValueOnce(response({ success: false }, 404));
    vi.stubGlobal("fetch", fetchMock);
    const res = createResponse();

    await handler(
      { query: { id: "42" }, headers: { host: "www.supermerch.com.au" } },
      res,
    );

    const body = res.result.body;
    expect(res.result.statusCode).toBe(200);

    // Visible breadcrumb <a> for the category: Cards.jsx treats the
    // ?category= value as a productTypeId sent straight to the backend as
    // product_type_ids, so the URL must carry the real type_id ("PE-02"),
    // never the human-readable label -- the label is display text only.
    expect(body).toContain('<a href="/shop?category=PE-02">Drink Bottles</a>');
    expect(body).not.toContain("category=Drink");

    // BreadcrumbList JSON-LD must reference the exact same category name and
    // the exact same href — the visible crumb and the structured data must
    // never disagree about the product's category.
    const jsonLdMatches = [
      ...body.matchAll(
        /<script type="application\/ld\+json" data-sm-seo-jsonld="true">([\s\S]*?)<\/script>/g,
      ),
    ].map((match) => JSON.parse(match[1]));

    const productSchema = jsonLdMatches.find((v) => v["@type"] === "Product");
    const breadcrumbSchema = jsonLdMatches.find(
      (v) => v["@type"] === "BreadcrumbList",
    );

    expect(productSchema.category).toBe("Drink Bottles");

    const categoryCrumb = breadcrumbSchema.itemListElement.find(
      (item) => item.name === "Drink Bottles",
    );
    expect(categoryCrumb).toBeDefined();
    expect(categoryCrumb.item).toBe(
      "https://www.supermerch.com.au/shop?category=PE-02",
    );
  });

  it("omits the category breadcrumb link entirely when no reliable type_id is available, rather than publishing a broken URL", async () => {
    const productWithNoTypeId = {
      ...baseProduct,
      product: {
        ...baseProduct.product,
        // supplier_category has no ID equivalent anywhere in the codebase --
        // a category resolved only from this fallback must not get a link.
        categorisation: { supplier_category: "Drinkware" },
      },
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(SHELL_WITH_ROOT))
      .mockResolvedValueOnce(response({ data: productWithNoTypeId }))
      .mockResolvedValueOnce(response({ success: false }, 404));
    vi.stubGlobal("fetch", fetchMock);
    const res = createResponse();

    await handler(
      { query: { id: "44" }, headers: { host: "www.supermerch.com.au" } },
      res,
    );

    const body = res.result.body;
    expect(res.result.statusCode).toBe(200);
    // No category breadcrumb link -- "Drinkware" can still legitimately
    // appear elsewhere (e.g. the Product schema's plain category field,
    // which needs no URL), but nothing may link to a category with no
    // real type_id behind it.
    expect(body).not.toContain("shop?category=");

    const jsonLdMatches = [
      ...body.matchAll(
        /<script type="application\/ld\+json" data-sm-seo-jsonld="true">([\s\S]*?)<\/script>/g,
      ),
    ].map((match) => JSON.parse(match[1]));
    const breadcrumbSchema = jsonLdMatches.find(
      (v) => v["@type"] === "BreadcrumbList",
    );
    // Home, Shop, and the product itself -- no category crumb in between.
    expect(breadcrumbSchema.itemListElement).toHaveLength(3);
  });

  it("resolves the category label and its type_id from the same source object, never mixing the two", async () => {
    const mismatchedTaxonomyProduct = {
      ...baseProduct,
      product: {
        ...baseProduct.product,
        categorisation: {
          // Has a name but no ID -- must not be used for anything.
          promodata_product_type: { type_name: "Eco Drinkware" },
          // Has both a name and an ID -- this is the only valid source.
          product_type: { type_name: "Drink Bottles", type_id: "PE-02" },
        },
      },
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(SHELL_WITH_ROOT))
      .mockResolvedValueOnce(response({ data: mismatchedTaxonomyProduct }))
      .mockResolvedValueOnce(response({ success: false }, 404));
    vi.stubGlobal("fetch", fetchMock);
    const res = createResponse();

    await handler(
      { query: { id: "45" }, headers: { host: "www.supermerch.com.au" } },
      res,
    );

    const body = res.result.body;
    expect(res.result.statusCode).toBe(200);
    // The label and ID must both come from product_type, the same object --
    // never "Eco Drinkware" (promodata's name) paired with "PE-02"
    // (product_type's ID), which would describe one category while linking
    // to another.
    expect(body).toContain('<a href="/shop?category=PE-02">Drink Bottles</a>');
    expect(body).not.toContain("Eco Drinkware");
  });

  it("HTML-escapes a hostile/malicious product name and description before injecting into #root", async () => {
    const hostileProduct = {
      ...baseProduct,
      product: {
        ...baseProduct.product,
        name: '<img src=x onerror=alert(1)>Mugs & "Steins"',
        description:
          "<script>alert('xss')</script>Great for outdoor events & fundraisers.",
      },
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(SHELL_WITH_ROOT))
      .mockResolvedValueOnce(response({ data: hostileProduct }))
      .mockResolvedValueOnce(response({ success: false }, 404));
    vi.stubGlobal("fetch", fetchMock);
    const res = createResponse();

    await handler(
      { query: { id: "43" }, headers: { host: "www.supermerch.com.au" } },
      res,
    );

    const body = res.result.body;
    expect(res.result.statusCode).toBe(200);
    // cleanText() strips HTML tags from the source before anything is
    // embedded, so no hostile <script> or <img onerror=...> tag can survive
    // intact. The page's own JSON-LD <script type="application/ld+json">
    // tags are expected and safe, so assert on the hostile payload
    // specifically rather than banning "<script" outright.
    expect(body).not.toContain("<script>alert");
    expect(body.toLowerCase()).not.toContain("<img");
    expect(body).not.toContain("onerror=");
    // Every remaining <script> tag is one of our own trusted JSON-LD blocks.
    const scriptOpenTags = body.match(/<script(?![^>]*application\/ld\+json)[^>]*>/gi) || [];
    expect(scriptOpenTags).toEqual([]);
    // The surviving text is HTML-entity-escaped wherever it's embedded.
    expect(body).toContain("&amp;");
    expect(body).toContain("&quot;Steins&quot;");
    expect(body).toContain("Mugs &amp; &quot;Steins&quot;</h1>");
  });

  it("fails safely and still returns valid HTML when #root is missing from the page shell", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(SHELL_WITHOUT_ROOT))
      .mockResolvedValueOnce(response({ data: baseProduct }))
      .mockResolvedValueOnce(response({ success: false }, 404));
    vi.stubGlobal("fetch", fetchMock);
    const res = createResponse();

    await expect(
      handler(
        { query: { id: "42" }, headers: { host: "www.supermerch.com.au" } },
        res,
      ),
    ).resolves.not.toThrow();

    expect(res.result.statusCode).toBe(200);
    // Head tags still apply even with nothing to inject the body into.
    expect(res.result.body).toContain(
      "<title>Ocean Bottle | Custom Branded | Super Merch Australia</title>",
    );
    expect(res.result.body).toContain("</head>");
    expect(res.result.body).toContain("</html>");
    // No corruption from the failed injection attempt.
    expect(res.result.body).not.toContain('id="root">undefined');
    expect(res.result.body).not.toContain("[object Object]");
  });
});
