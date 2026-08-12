// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import PopularCategories from "@/components/Home/PopularCategories";
import { popularCategories } from "@/components/Home/popularCategoriesData";

describe("PopularCategories", () => {
  it("renders every category as an accessible, lazy-loaded link", () => {
    render(
      <MemoryRouter>
        <PopularCategories />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("link")).toHaveLength(popularCategories.length);

    for (const category of popularCategories) {
      const link = screen.getByRole("link", {
        name: `Shop ${category.name}`,
      });
      const image = screen.getByRole("img", { name: category.name });

      expect(link).toHaveAttribute("href", category.path);
      expect(image).toHaveAttribute("loading", "lazy");
      expect(image).toHaveAttribute("decoding", "async");
      expect(image).toHaveAttribute("width", "800");
      expect(image).toHaveAttribute("height", "800");
    }
  });

  it("links Water Bottles to Drink Bottles rather than all Drinkware", () => {
    const category = popularCategories.find(
      (item) => item.name === "Water Bottles",
    );
    const params = new URLSearchParams(category.path.split("?")[1]);

    expect(params.get("category")).toBe("PE-02");
    expect(params.get("subCategory")).toBe("Drink Bottles");
  });

  it("opens Polo Shirts in the Clothing navigation context", () => {
    const category = popularCategories.find(
      (item) => item.name === "Polo Shirts",
    );
    const params = new URLSearchParams(category.path.split("?")[1]);

    expect(params.get("category")).toBe("PU-03");
    expect(params.get("type")).toBe("Clothing");
  });
});
