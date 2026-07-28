// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { QUANTITY_OPTIONS, ANY_QUANTITY_LABEL } from "../config/quantityOptions";
import { QUANTITY_OPTIONS as GENERATOR_QUANTITY_OPTIONS, ANY_QUANTITY_LABEL as GENERATOR_ANY_QUANTITY_LABEL } from "../../scripts/category-finder/families.js";
import { getCategoryFinderConfig } from "../config/categoryFinderConfig";
import MOQFilter from "../components/shared/MOQFilter";
import { store } from "../redux/store";

afterEach(cleanup);

// Regression guard: the Finder, the sidebar (MOQFilter.jsx), and the Node
// generator scripts must all resolve to the exact same QUANTITY_OPTIONS array
// -- not three independently-maintained copies that can drift. This test
// proves it by reference identity (ES modules are singleton-cached per
// process, so re-exporting instead of duplicating means these are literally
// the same array object) AND by actually rendering MOQFilter.jsx and reading
// its real DOM output -- the earlier version of this file only compared
// module-level exports to each other and never imported/rendered MOQFilter
// at all, so it could never have caught the sidebar itself drifting from
// QUANTITY_OPTIONS (e.g. a stray hardcoded label typo inside the component).
describe("quantity options: single source of truth", () => {
  it("the generator's re-export is the identical array object, not a copy", () => {
    expect(GENERATOR_QUANTITY_OPTIONS).toBe(QUANTITY_OPTIONS);
    expect(GENERATOR_ANY_QUANTITY_LABEL).toBe(ANY_QUANTITY_LABEL);
  });

  it("the exact required wording is present, in order", () => {
    expect(QUANTITY_OPTIONS.map((o) => o.label)).toEqual([
      "1–24",
      "25–49",
      "50–99",
      "100–249",
      "250–499",
      "500+",
    ]);
  });

  it("the Finder's resolved PE-02 config uses this exact same array for its moq question", () => {
    const config = getCategoryFinderConfig("PE-02");
    const moqQuestion = config.questions.find((q) => q.id === "moq");
    expect(moqQuestion.options).toBe(QUANTITY_OPTIONS);
  });

  describe("the sidebar (MOQFilter.jsx), actually rendered", () => {
    const renderMOQFilter = () =>
      render(
        <Provider store={store}>
          <BrowserRouter>
            <MOQFilter />
          </BrowserRouter>
        </Provider>
      );

    it("renders one radio option per QUANTITY_OPTIONS entry, plus the 'any quantity' option, with matching labels in the same order", () => {
      renderMOQFilter();
      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(QUANTITY_OPTIONS.length + 1);

      const expectedLabels = [ANY_QUANTITY_LABEL, ...QUANTITY_OPTIONS.map((o) => o.label)];
      expectedLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });

      radios.forEach((radio, index) => {
        const label = radio.closest("label");
        expect(label).toHaveTextContent(expectedLabels[index]);
      });
    });

    it("has 'Any quantity' selected by default (no moq filter active)", () => {
      renderMOQFilter();
      const radios = screen.getAllByRole("radio");
      expect(radios[0]).toBeChecked();
      radios.slice(1).forEach((radio) => expect(radio).not.toBeChecked());
    });
  });
});
