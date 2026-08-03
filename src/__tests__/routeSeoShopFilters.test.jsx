// @vitest-environment jsdom

/**
 * RouteSeo drives the client-side <meta name="robots"> tag for /shop. Faceted
 * URLs (color, size, price, etc.) must get noindex,follow so search engines
 * don't index combinatorial duplicate variants, while the canonical /shop and
 * /shop?category=X views must stay indexable. This must match the
 * server-side decision in api/seo-page.js (see hasShopFilterParams there).
 */

import { cleanup, render } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import RouteSeo from "../components/Common/RouteSeo";

afterEach(() => {
  cleanup();
  document.head
    .querySelectorAll('meta[data-sm-seo="true"]')
    .forEach((node) => node.remove());
});

const robotsContent = () =>
  document.head.querySelector('meta[name="robots"]')?.getAttribute("content");

const canonicalHref = () =>
  document.head.querySelector('link[rel="canonical"]')?.getAttribute("href");

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <RouteSeo />
    </MemoryRouter>,
  );

// PE-02 is a real leaf category ID (Drink Bottles) in
// authoritative-category-ids.json -- used wherever a test needs a genuinely
// valid category, as opposed to "wooden-pens", which is not a real ID.
describe("RouteSeo client-side robots tag for /shop", () => {
  it("keeps the plain /shop page indexable", () => {
    renderAt("/shop");
    expect(robotsContent()).toBe("index, follow");
  });

  it("keeps a real category view of /shop indexable", () => {
    renderAt("/shop?category=PE-02");
    expect(robotsContent()).toBe("index, follow");
  });

  it("keeps benign params (page/sort/view/utm/gclid) indexable", () => {
    renderAt("/shop?category=PE-02&page=2&sort=price&view=grid&utm_source=x&gclid=1");
    expect(robotsContent()).toBe("index, follow");
  });

  it("noindexes /shop with a color facet param", () => {
    renderAt("/shop?color=blue");
    expect(robotsContent()).toBe("noindex, follow");
  });

  it("noindexes /shop with a size facet param", () => {
    renderAt("/shop?size=large");
    expect(robotsContent()).toBe("noindex, follow");
  });

  it("noindexes /shop with a price facet param even alongside a category", () => {
    renderAt("/shop?category=PE-02&priceMin=10&priceMax=50");
    expect(robotsContent()).toBe("noindex, follow");
  });

  it("noindexes /shop with a category value that isn't a real leaf/parent ID", () => {
    renderAt("/shop?category=wooden-pens");
    expect(robotsContent()).toBe("noindex, follow");
  });
});

// Must stay in parity with the server-side canonical decision in
// api/seo-page.js -- both consume the same shared isValidCategoryId() check,
// so hydration can never contradict the tags the server already sent.
describe("RouteSeo client-side canonical tag for /shop", () => {
  it("/shop -> self-canonical, indexable", () => {
    renderAt("/shop");
    expect(canonicalHref()).toBe("https://www.supermerch.com.au/shop");
    expect(robotsContent()).toBe("index, follow");
  });

  it("/shop?category=<valid> -> self-canonical (same category URL), indexable", () => {
    renderAt("/shop?category=PE-02");
    expect(canonicalHref()).toBe(
      "https://www.supermerch.com.au/shop?category=PE-02",
    );
    expect(robotsContent()).toBe("index, follow");
  });

  it("/shop?category=<invalid> -> canonicalizes to plain /shop, noindex", () => {
    renderAt("/shop?category=wooden-pens");
    expect(canonicalHref()).toBe("https://www.supermerch.com.au/shop");
    expect(robotsContent()).toBe("noindex, follow");
  });

  it("/shop?category=<valid>&<facet> -> canonicalizes to the category-only URL, noindex", () => {
    renderAt("/shop?category=PE-02&color=blue");
    expect(canonicalHref()).toBe(
      "https://www.supermerch.com.au/shop?category=PE-02",
    );
    expect(robotsContent()).toBe("noindex, follow");
  });
});
