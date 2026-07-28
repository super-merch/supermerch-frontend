// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import CategoryFinder from "../components/shop/CategoryFinder";

afterEach(cleanup);

// Exposes the router's current search string so tests can prove the URL --
// and therefore everything that reads filters from it (the sidebar, the
// product list) -- never changed as a side effect of collapsing the Finder
// without submitting.
const LocationProbe = () => {
  const [searchParams] = useSearchParams();
  return <div data-testid="location-probe">{searchParams.toString()}</div>;
};

const renderFinder = (initialEntry = "/") =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocationProbe />
      <CategoryFinder productTypeId="PE-02" />
    </MemoryRouter>
  );

// Regression guard: "Cancel editing" (formerly "Hide my answers") must never
// silently apply a draft answer. Only "Show my matches" is a submission
// action -- collapsing any other way must discard unsubmitted edits and
// leave the URL, the collapsed summary, and (by extension) the sidebar and
// results exactly as they were.
describe("CategoryFinder: draft answers vs applied answers", () => {
  it("Cancel editing discards a draft change -- URL and collapsed summary both stay at the previously applied values", () => {
    renderFinder("/?moq=99&minPrice=10&maxPrice=20");
    const appliedSearch = screen.getByTestId("location-probe").textContent;

    fireEvent.click(screen.getByRole("button", { name: /edit my answers/i }));

    const quantitySelect = screen.getByLabelText("Order quantity");
    const budgetSelect = screen.getByLabelText("Unit budget (ex GST)");
    fireEvent.change(quantitySelect, { target: { value: "249" } });
    fireEvent.change(budgetSelect, { target: { value: "20:35" } });
    // The draft is visible locally while still expanded...
    expect(quantitySelect.value).toBe("249");
    expect(budgetSelect.value).toBe("20:35");

    fireEvent.click(screen.getByRole("button", { name: /cancel editing/i }));

    // ...but it must never have reached the URL (== the sidebar/results'
    // source of truth).
    expect(screen.getByTestId("location-probe").textContent).toBe(appliedSearch);

    // The collapsed summary must reflect only what was actually applied
    // (50-99 / $10-$20), never the discarded draft (100-249 / $20-$35) --
    // otherwise the customer would reasonably believe the draft was applied.
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/50–99/);
    expect(status).toHaveTextContent(/\$10–\$20/);
    expect(status).not.toHaveTextContent(/100–249/);
    expect(status).not.toHaveTextContent(/\$20–\$35/);

    // Reopening shows the applied values, not the discarded draft.
    fireEvent.click(screen.getByRole("button", { name: /edit my answers/i }));
    expect(screen.getByLabelText("Order quantity").value).toBe("99");
    expect(screen.getByLabelText("Unit budget (ex GST)").value).toBe("10:20");
  });

  it("on a fresh page with no applied filters, Cancel editing after a draft change returns to 'showing all', URL untouched, and reopening shows empty selections", () => {
    renderFinder("/");
    const appliedSearch = screen.getByTestId("location-probe").textContent;

    // No applied filters -- the Finder already starts expanded.
    const quantitySelect = screen.getByLabelText("Order quantity");
    fireEvent.change(quantitySelect, { target: { value: "99" } });
    expect(quantitySelect.value).toBe("99");

    fireEvent.click(screen.getByRole("button", { name: /cancel editing/i }));

    expect(screen.getByTestId("location-probe").textContent).toBe(appliedSearch);
    expect(screen.getByRole("status")).toHaveTextContent(/showing all bottles/i);

    fireEvent.click(screen.getByRole("button", { name: /edit my answers/i }));
    expect(screen.getByLabelText("Order quantity").value).toBe("");
  });

  it("Show my matches (the real submission action) still applies the draft to the URL and summary", () => {
    renderFinder("/");
    fireEvent.change(screen.getByLabelText("Order quantity"), { target: { value: "99" } });
    fireEvent.click(screen.getByRole("button", { name: /show my matches/i }));

    expect(screen.getByTestId("location-probe").textContent).toContain("moq=99");
    expect(screen.getByRole("status")).toHaveTextContent(/50–99/);
  });
});
