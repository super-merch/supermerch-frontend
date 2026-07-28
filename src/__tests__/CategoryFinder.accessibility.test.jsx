// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import CategoryFinder from "../components/shop/CategoryFinder";

afterEach(cleanup);

const renderFinder = (initialEntry = "/") =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <CategoryFinder productTypeId="PE-02" />
    </MemoryRouter>
  );

describe("CategoryFinder accessibility", () => {
  it("every visible select has a correctly associated label", () => {
    renderFinder();
    // getByLabelText throws if the association is broken (missing/duplicate
    // htmlFor-id pairing), so a passing lookup here IS the assertion.
    expect(screen.getByLabelText("Order quantity")).toBeInTheDocument();
    expect(screen.getByLabelText("Unit budget (ex GST)")).toBeInTheDocument();
    expect(screen.getByLabelText("Capacity")).toBeInTheDocument();
    expect(screen.getByLabelText("Bottle type")).toBeInTheDocument();
    expect(screen.getByLabelText("Colour")).toBeInTheDocument();
  });

  it("generates unique element IDs across two GENUINELY SIMULTANEOUS instances in the same tree", () => {
    // Both instances mounted together in one render/one tree -- not
    // render-cleanup-render, which never actually proves two instances can
    // coexist without colliding (React could reuse the same useId() counter
    // state across successive mounts of the same tree position and this
    // would still incorrectly pass).
    render(
      <MemoryRouter initialEntries={["/"]}>
        <div>
          <div data-testid="instance-a">
            <CategoryFinder productTypeId="PE-02" />
          </div>
          <div data-testid="instance-b">
            <CategoryFinder productTypeId="PE-02" />
          </div>
        </div>
      </MemoryRouter>
    );

    const instanceA = screen.getByTestId("instance-a");
    const instanceB = screen.getByTestId("instance-b");
    const firstQuantitySelect = within(instanceA).getByLabelText("Order quantity");
    const secondQuantitySelect = within(instanceB).getByLabelText("Order quantity");

    expect(firstQuantitySelect.id).not.toBe(secondQuantitySelect.id);

    // Each instance operates independently -- changing one's selection must
    // not affect the other's.
    fireEvent.change(firstQuantitySelect, { target: { value: "99" } });
    expect(firstQuantitySelect.value).toBe("99");
    expect(secondQuantitySelect.value).toBe("");
  });

  it("collapsed view: Edit my answers has correct static aria-expanded/aria-controls pointing at a real element", () => {
    renderFinder("/?moq=99&minPrice=10&maxPrice=20");
    const editButton = screen.getByRole("button", { name: /edit my answers/i });
    expect(editButton).toHaveAttribute("aria-expanded", "false");
    const controlsId = editButton.getAttribute("aria-controls");
    expect(controlsId).toBeTruthy();
  });

  it("expanding via Edit my answers renders the panel with the id aria-controls points at, and moves focus into it", () => {
    renderFinder("/?moq=99&minPrice=10&maxPrice=20");
    const editButton = screen.getByRole("button", { name: /edit my answers/i });
    const controlsId = editButton.getAttribute("aria-controls");

    fireEvent.click(editButton);

    const panel = document.getElementById(controlsId);
    expect(panel).not.toBeNull();
    expect(within(panel).getByLabelText("Order quantity")).toBeInTheDocument();
    // Focus management: the first question's select should receive focus once
    // the panel expands, rather than focus being lost to <body>.
    expect(document.activeElement).toBe(screen.getByLabelText("Order quantity"));
  });

  it("a disclosure control reflects aria-expanded accurately in BOTH states, not only the collapsed one", () => {
    // Regression guard: "Edit my answers" only ever renders in the collapsed
    // branch, so on its own it can never be observed with aria-expanded set
    // to "true" -- there must be a second, expanded-state control that does.
    renderFinder();

    // Starts expanded (no filter params in the URL) -- the expanded-state
    // toggle should already report aria-expanded="true".
    const hideButton = screen.getByRole("button", { name: /hide my answers/i });
    expect(hideButton).toHaveAttribute("aria-expanded", "true");
    const controlsId = hideButton.getAttribute("aria-controls");
    expect(controlsId).toBeTruthy();
    expect(document.getElementById(controlsId)).not.toBeNull();

    fireEvent.click(hideButton);

    const editButton = screen.getByRole("button", { name: /edit my answers/i });
    expect(editButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: /hide my answers/i })).not.toBeInTheDocument();

    fireEvent.click(editButton);

    const hideButtonAgain = screen.getByRole("button", { name: /hide my answers/i });
    expect(hideButtonAgain).toHaveAttribute("aria-expanded", "true");
  });

  it("the collapsed summary region is an accessible live status region", () => {
    renderFinder("/?moq=99&minPrice=10&maxPrice=20");
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/order quantity/i);
  });

  it("Show my matches is a plain submit action, not marked as a disclosure toggle", () => {
    renderFinder();
    const submitButton = screen.getByRole("button", { name: /view all bottles/i });
    expect(submitButton).not.toHaveAttribute("aria-expanded");
  });

  it("Show my matches is keyboard-operable and moves focus to Edit my answers after collapsing", () => {
    renderFinder();
    const quantitySelect = screen.getByLabelText("Order quantity");
    fireEvent.change(quantitySelect, { target: { value: "99" } });
    // Once a preference is selected, the button's label switches from
    // "View all bottles" to config.submitLabel ("Show my matches").
    const submitButton = screen.getByRole("button", { name: /show my matches/i });

    submitButton.focus();
    fireEvent.click(submitButton);

    const editButton = screen.getByRole("button", { name: /edit my answers/i });
    expect(document.activeElement).toBe(editButton);
  });
});
