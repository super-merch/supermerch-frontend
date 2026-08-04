import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// api/seo-page.js now reads the app shell straight off disk (readFileSync)
// instead of self-fetching "/" over HTTP, and caches it in module scope for
// the lifetime of the module (see getShell() in api/seo-page.js). To give
// each test control over the shell content, mock node:fs and force a fresh
// module instance (via resetModules + dynamic import) per test so the cache
// never leaks between tests.
vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}));

const { readFileSync } = await import("node:fs");

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

// Real app shell shape: a #root mount point the SPA hydrates into. The
// injection logic (injectBody in api/seo-page.js) only replaces content
// inside <div id="root"></div> — a fixture without it would let the handler
// silently no-op on body injection while every assertion on <head> tags
// still passes, hiding a broken injectBody() completely.
const SHELL_WITH_ROOT =
  '<html><head><title>Fallback</title></head><body><div id="root"></div></body></html>';

// Used to prove the handler fails safely (doesn't throw, doesn't corrupt the
// response) if the app shell is ever missing its mount point.
const SHELL_WITHOUT_ROOT =
  "<html><head><title>Fallback</title></head><body></body></html>";

let handler;

// Forces a fresh api/seo-page.js module instance with readFileSync stubbed
// to return `html`, so the module's module-scoped shell cache can never
// carry a previous test's shell into this one.
const useShell = async (html) => {
  vi.resetModules();
  readFileSync.mockReturnValue(html);
  handler = (await import("../../api/seo-page")).default;
};

describe("SEO page handler", () => {
  beforeEach(async () => {
    await useShell(SHELL_WITH_ROOT);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the selected category record and keeps only its canonical query", async () => {
    // PE-02 is a real leaf category ID (Drink Bottles) in the authoritative
    // category inventory -- an admin SEO override is only ever consulted for
    // a valid category, so this test uses a real one.
    const fetchMock = vi.fn().mockResolvedValueOnce(
      response({
        success: true,
        data: {
          metaTitle:
            "Drink Bottles Promotional Products | Super Merch Australia",
          canonicalUrl:
            "https://supermerch.com.au/shop?category=PE-02&page=2&utm_source=test",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const res = createResponse();

    await handler(
      {
        query: {
          path: "/shop",
          category: "PE-02",
          page: "2",
        },
        headers: { host: "www.supermerch.com.au" },
      },
      res,
    );

    expect(fetchMock.mock.calls[0][0]).toContain(
      "/api/seo-meta/by-entity/category/PE-02",
    );
    expect(res.result.statusCode).toBe(200);
    expect(res.result.body).toContain(
      "<title>Drink Bottles Promotional Products | Super Merch Australia</title>",
    );
    expect(res.result.body).toContain(
      '<link rel="canonical" href="https://www.supermerch.com.au/shop?category=PE-02">',
    );
  });

  it("stays self-canonical and indexable for a real category with no admin SEO override configured", async () => {
    // Whether an admin has configured a custom SEO override for a category
    // is unrelated to whether that category's own URL is the canonical
    // page. Collapsing to plain "/shop" here for every un-overridden
    // category (the vast majority of them) contradicted the robots tag
    // ("index, follow") set on this exact same URL just above in the
    // handler, and disagreed with the client-side canonical logic in
    // src/utils/shopSeo.js, which has never gated on override existence.
    // "PE-02" is a real leaf category ID (Drink Bottles) in the
    // authoritative category inventory.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ success: false }, 404));
    vi.stubGlobal("fetch", fetchMock);
    const res = createResponse();

    await handler(
      {
        query: {
          path: "/shop",
          category: "PE-02",
        },
        headers: { host: "www.supermerch.com.au" },
      },
      res,
    );

    expect(res.result.statusCode).toBe(200);
    expect(res.result.body).toContain(
      '<link rel="canonical" href="https://www.supermerch.com.au/shop?category=PE-02">',
    );
    expect(res.result.body).toContain(
      '<meta name="robots" content="index, follow">',
    );
  });

  it("canonicalizes an invalid/nonexistent category to plain /shop and keeps it out of the index", async () => {
    // A category value that isn't a real leaf/parent ID must never become
    // self-canonical or indexable -- that would let unlimited junk category
    // URLs consume crawl budget and appear as thin/duplicate pages, which
    // is the exact problem this endpoint exists to fix, not reintroduce.
    // Admin SEO override presence is never used as the validity signal.
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ success: false }, 404));
    vi.stubGlobal("fetch", fetchMock);
    const res = createResponse();

    await handler(
      {
        query: {
          path: "/shop",
          category: "does-not-exist-xyz",
        },
        headers: { host: "www.supermerch.com.au" },
      },
      res,
    );

    expect(res.result.statusCode).toBe(200);
    expect(res.result.body).toContain(
      '<link rel="canonical" href="https://www.supermerch.com.au/shop">',
    );
    expect(res.result.body).toContain(
      '<meta name="robots" content="noindex, follow">',
    );
  });

  it("ignores a stale/mistaken admin SEO override for an invalid category, rather than letting its canonicalUrl win", async () => {
    // If a category is ever removed, or an admin previously created an
    // override keyed to a bad value, that override must never resurrect an
    // invalid category as self-canonical/indexable -- the validity check
    // must win regardless of what admin data happens to exist for this ID.
    const fetchMock = vi.fn().mockResolvedValueOnce(
      response({
        success: true,
        data: {
          canonicalUrl:
            "https://www.supermerch.com.au/shop?category=does-not-exist-xyz",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const res = createResponse();

    await handler(
      {
        query: {
          path: "/shop",
          category: "does-not-exist-xyz",
        },
        headers: { host: "www.supermerch.com.au" },
      },
      res,
    );

    expect(res.result.statusCode).toBe(200);
    expect(res.result.body).toContain(
      '<link rel="canonical" href="https://www.supermerch.com.au/shop">',
    );
    expect(res.result.body).toContain(
      '<meta name="robots" content="noindex, follow">',
    );
    // Proves the override endpoint was never even queried for an invalid
    // category, not just that its response was ignored -- the shell now
    // comes from disk (readFileSync), so no fetch call at all should have
    // happened.
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });

  it("adds organisation structured data to the homepage", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({ success: false }, 404));
    vi.stubGlobal("fetch", fetchMock);
    const res = createResponse();

    await handler(
      {
        query: { path: "/" },
        headers: { host: "www.supermerch.com.au" },
      },
      res,
    );

    expect(res.result.statusCode).toBe(200);
    expect(res.result.body).toContain('data-sm-seo-jsonld="true"');
    expect(res.result.body).toContain('"@type":"Organization"');
    expect(res.result.body).toContain('"areaServed":"AU"');
  });

  it("noindexes thin blog posts", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          data: {
            _id: "thin-post",
            title: "Short update",
            content: "<p>Only a few words.</p>",
          },
        }),
      )
      .mockResolvedValueOnce(response({ success: false }, 404));
    vi.stubGlobal("fetch", fetchMock);
    const res = createResponse();

    await handler(
      {
        query: { path: "/blogs/thin-post" },
        headers: { host: "www.supermerch.com.au" },
      },
      res,
    );

    expect(res.result.statusCode).toBe(200);
    expect(res.result.body).toContain(
      '<meta name="robots" content="noindex, follow">',
    );
  });

  describe("#root body injection", () => {
    it("injects a real, crawlable H1 and description for a static/CMS page into #root", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(response({ success: false }, 404));
      vi.stubGlobal("fetch", fetchMock);
      const res = createResponse();

      await handler(
        {
          query: { path: "/about" },
          headers: { host: "www.supermerch.com.au" },
        },
        res,
      );

      expect(res.result.statusCode).toBe(200);
      // Injected inside #root, not left as an untouched empty mount point.
      expect(res.result.body).not.toContain('<div id="root"></div>');
      expect(res.result.body).toContain('<div id="root">');
      expect(res.result.body).toContain('data-ssr-content="page"');
      expect(res.result.body).toContain("<h1>About Super Merch Australia</h1>");
      expect(res.result.body).toContain("Learn about Super Merch");
    });

    it("injects breadcrumb links for a category page, consistent with the visible Shop crumb", async () => {
      // PE-02 is a real leaf category ID (Drink Bottles) -- the admin
      // override this test exercises is only ever consulted for a valid
      // category.
      const fetchMock = vi.fn().mockResolvedValueOnce(
        response({
          success: true,
          data: {
            metaTitle:
              "Drink Bottles Promotional Products | Super Merch Australia",
          },
        }),
      );
      vi.stubGlobal("fetch", fetchMock);
      const res = createResponse();

      await handler(
        {
          query: { path: "/shop", category: "PE-02" },
          headers: { host: "www.supermerch.com.au" },
        },
        res,
      );

      expect(res.result.statusCode).toBe(200);
      expect(res.result.body).toContain('<nav aria-label="Breadcrumb">');
      expect(res.result.body).toContain('<a href="/">Home</a>');
      expect(res.result.body).toContain(
        "<h1>Drink Bottles Promotional Products</h1>",
      );
    });

    it("HTML-escapes a hostile/malicious blog title and content before injecting into #root", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          response({
            data: {
              _id: "hostile-post",
              title: '<img src=x onerror=alert(1)>Big "Sale" & <b>More</b>',
              content:
                "<script>alert('xss')</script>" +
                "This blog post has plenty of real words in it so it clears the thin-content threshold and stays indexable, which means it must still be escaped safely. ".repeat(
                  5,
                ),
            },
          }),
        )
        .mockResolvedValueOnce(response({ success: false }, 404));
      vi.stubGlobal("fetch", fetchMock);
      const res = createResponse();

      await handler(
        {
          query: { path: "/blogs/hostile-post" },
          headers: { host: "www.supermerch.com.au" },
        },
        res,
      );

      expect(res.result.statusCode).toBe(200);
      // No raw, executable markup anywhere in the response: cleanText()
      // strips all HTML tags from the source before the result is ever
      // embedded, so no <script> or <img onerror=...> tag can survive
      // (the sanitizer removes the tag itself, not just its attributes).
      expect(res.result.body.toLowerCase()).not.toContain("<script");
      expect(res.result.body.toLowerCase()).not.toContain("<img");
      expect(res.result.body).not.toContain("onerror=");
      // The surviving text is safely HTML-entity-escaped wherever it's
      // embedded (title, H1, breadcrumb, meta attributes).
      expect(res.result.body).toContain("&amp;");
      expect(res.result.body).toContain("&quot;Sale&quot;");
      expect(res.result.body).toContain("<h1>Big &quot;Sale&quot; &amp; More</h1>");
    });

    it("fails safely and returns the untouched shell when #root is missing from the page shell", async () => {
      await useShell(SHELL_WITHOUT_ROOT);
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(response({ success: false }, 404));
      vi.stubGlobal("fetch", fetchMock);
      const res = createResponse();

      await expect(
        handler(
          {
            query: { path: "/about" },
            headers: { host: "www.supermerch.com.au" },
          },
          res,
        ),
      ).resolves.not.toThrow();

      // Head tags (title/meta/robots) still get applied even when body
      // injection has nothing to attach to.
      expect(res.result.statusCode).toBe(200);
      expect(res.result.body).toContain("<title>About Super Merch Australia</title>");
      expect(res.result.body).toContain("</head>");
      expect(res.result.body).toContain("</html>");
      // No corruption: the (missing) #root mount point is simply absent —
      // never a broken/duplicated/partial tag.
      expect(res.result.body).not.toContain('id="root">undefined');
      expect(res.result.body).not.toContain("[object Object]");
    });
  });

  describe("faceted /shop noindex handling", () => {
    it("noindexes a /shop URL with a color facet param", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(response({ success: false }, 404));
      vi.stubGlobal("fetch", fetchMock);
      const res = createResponse();

      await handler(
        {
          query: { path: "/shop", color: "blue" },
          headers: { host: "www.supermerch.com.au" },
        },
        res,
      );

      expect(res.result.statusCode).toBe(200);
      expect(res.result.body).toContain(
        '<meta name="robots" content="noindex, follow">',
      );
    });

    it("noindexes a /shop URL with a price-range facet param even with a category selected", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(response({ success: false }, 404));
      vi.stubGlobal("fetch", fetchMock);
      const res = createResponse();

      await handler(
        {
          query: { path: "/shop", category: "wooden-pens", priceMin: "10" },
          headers: { host: "www.supermerch.com.au" },
        },
        res,
      );

      expect(res.result.statusCode).toBe(200);
      expect(res.result.body).toContain(
        '<meta name="robots" content="noindex, follow">',
      );
    });

    it("keeps the plain /shop URL indexable", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(response({ success: false }, 404));
      vi.stubGlobal("fetch", fetchMock);
      const res = createResponse();

      await handler(
        {
          query: { path: "/shop" },
          headers: { host: "www.supermerch.com.au" },
        },
        res,
      );

      expect(res.result.statusCode).toBe(200);
      expect(res.result.body).toContain(
        '<meta name="robots" content="index, follow">',
      );
    });

    it("keeps a /shop?category=X URL indexable", async () => {
      // "PE-02" is a real leaf category ID (Drink Bottles) in the
      // authoritative category inventory -- indexability now depends on
      // that, not just on the absence of facet params.
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(response({ success: false }, 404));
      vi.stubGlobal("fetch", fetchMock);
      const res = createResponse();

      await handler(
        {
          query: { path: "/shop", category: "PE-02" },
          headers: { host: "www.supermerch.com.au" },
        },
        res,
      );

      expect(res.result.statusCode).toBe(200);
      expect(res.result.body).toContain(
        '<meta name="robots" content="index, follow">',
      );
    });

    it("keeps benign params (page/sort/view/utm/gclid) indexable", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(response({ success: false }, 404));
      vi.stubGlobal("fetch", fetchMock);
      const res = createResponse();

      await handler(
        {
          query: {
            path: "/shop",
            category: "PE-02",
            page: "2",
            sort: "price",
            view: "grid",
            utm_source: "newsletter",
            gclid: "abc123",
          },
          headers: { host: "www.supermerch.com.au" },
        },
        res,
      );

      expect(res.result.statusCode).toBe(200);
      expect(res.result.body).toContain(
        '<meta name="robots" content="index, follow">',
      );
    });
  });
});
