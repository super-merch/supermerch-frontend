import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const contextSource = readFileSync(
  new URL("../context/ProductsContext.jsx", import.meta.url),
  "utf8"
);
const cardsSource = readFileSync(
  new URL("../components/shop/Cards.jsx", import.meta.url),
  "utf8"
);

describe("catalogue request error handling", () => {
  it("rejects non-successful and malformed product responses", () => {
    expect(contextSource).toContain("if (!res.ok)");
    expect(contextSource).toContain("Product request failed with HTTP");
    expect(contextSource).toContain("!Array.isArray(data.data)");
  });

  it("exposes React Query error state through ProductsContext", () => {
    expect(contextSource).toContain("isError: productsIsError");
    expect(contextSource).toContain("error: productsError");
    expect(contextSource).toMatch(/productsIsError,\s*productsError,\s*refetchProducts/);
  });

  it("renders a retryable service error instead of a genuine empty result", () => {
    const errorBranch = cardsSource.indexOf("productsIsError ? (");
    const emptyState = cardsSource.indexOf('title="No Products Found"');
    expect(errorBranch).toBeGreaterThan(-1);
    expect(emptyState).toBeGreaterThan(errorBranch);
    expect(cardsSource).toContain("Products are temporarily unavailable");
    expect(cardsSource).toContain("onClick={() => refetchProducts()}");
  });
});
