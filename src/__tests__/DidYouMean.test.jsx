// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import DidYouMean from "@/components/shop/DidYouMean";

const renderIt = (props) =>
  render(
    <MemoryRouter>
      <DidYouMean {...props} />
    </MemoryRouter>,
  );

describe("DidYouMean", () => {
  it("shows the corrected word as a link to that search", () => {
    renderIt({ suggestion: "bottle", searched: "botle" });

    expect(screen.getByRole("status")).toHaveTextContent(
      'Did you mean bottle? Showing results for “bottle”.',
    );
    expect(screen.getByRole("link", { name: "bottle" })).toHaveAttribute(
      "href",
      "/search?search=bottle",
    );
  });

  it("encodes multi-word suggestions in the link", () => {
    renderIt({ suggestion: "blue tshirt", searched: "blue tshrit" });

    expect(screen.getByRole("link", { name: "blue tshirt" })).toHaveAttribute(
      "href",
      "/search?search=blue%20tshirt",
    );
  });

  it("shows nothing when there was no correction", () => {
    const { container } = renderIt({ suggestion: undefined, searched: "bottle" });
    expect(container).toBeEmptyDOMElement();
  });

  it("shows nothing when the suggestion is what was searched", () => {
    const { container } = renderIt({ suggestion: "Bottle", searched: "bottle " });
    expect(container).toBeEmptyDOMElement();
  });
});
