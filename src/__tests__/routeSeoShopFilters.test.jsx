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

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <RouteSeo />
    </MemoryRouter>,
  );

describe("RouteSeo client-side robots tag for /shop", () => {
  it("keeps the plain /shop page indexable", () => {
    renderAt("/shop");
    expect(robotsContent()).toBe("index, follow");
  });

  it("keeps a category view of /shop indexable", () => {
    renderAt("/shop?category=wooden-pens");
    expect(robotsContent()).toBe("index, follow");
  });

  it("keeps benign params (page/sort/view/utm/gclid) indexable", () => {
    renderAt("/shop?category=wooden-pens&page=2&sort=price&view=grid&utm_source=x&gclid=1");
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
    renderAt("/shop?category=wooden-pens&priceMin=10&priceMax=50");
    expect(robotsContent()).toBe("noindex, follow");
  });
});
