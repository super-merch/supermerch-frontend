import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "../../api/seo-page";

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

describe("SEO page handler", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the selected category record and keeps only its canonical query", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        response("<html><head><title>Fallback</title></head><body></body></html>"),
      )
      .mockResolvedValueOnce(
        response({
          success: true,
          data: {
            metaTitle:
              "Wooden Pens Promotional Products | Super Merch Australia",
            canonicalUrl:
              "https://supermerch.com.au/shop?category=wooden-pens&page=2&utm_source=test",
          },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const res = createResponse();

    await handler(
      {
        query: {
          path: "/shop",
          category: "wooden-pens",
          page: "2",
        },
        headers: { host: "www.supermerch.com.au" },
      },
      res,
    );

    expect(fetchMock.mock.calls[1][0]).toContain(
      "/api/seo-meta/by-entity/category/wooden-pens",
    );
    expect(res.result.statusCode).toBe(200);
    expect(res.result.body).toContain(
      "<title>Wooden Pens Promotional Products | Super Merch Australia</title>",
    );
    expect(res.result.body).toContain(
      '<link rel="canonical" href="https://www.supermerch.com.au/shop?category=wooden-pens">',
    );
  });
});

