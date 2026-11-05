// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Cards from "../components/shop/Cards";
import { AppContext } from "../context/AppContext";
import { ProductsContext } from "../context/ProductsContext";

vi.mock("react-redux", () => ({
  useDispatch: () => vi.fn(),
  useSelector: () => ({ minPrice: 0, maxPrice: 1000000 }),
}));

vi.mock("../components/Common/ProductCard", () => ({
  default: ({ product }) => <div data-testid="product-card">{product?.overview?.name}</div>,
}));
vi.mock("../components/Common/SkeletonLoadingCards", () => ({
  default: () => <div data-testid="skeleton" />,
}));
vi.mock("../components/Common/EmptyState", () => ({
  default: ({ title }) => <div>{title}</div>,
}));
vi.mock("../components/shared/UnifiedSidebar", () => ({
  default: () => <aside data-testid="sidebar" />,
}));
vi.mock("../components/shop/CategoryFinder", () => ({
  default: () => null,
}));
vi.mock("../config/sidebarConfig", () => ({
  getPageTypeFromRoute: () => "shop",
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const product = {
  meta: { id: 1 },
  overview: { name: "Recovered Bottle" },
};

const baseContext = {
  paginationData: {
    productTypeId: "PE-02",
    page: 1,
    limit: 20,
    sortOption: "",
    filter: true,
    category: null,
    searchTerm: "",
    pricerange: undefined,
    colors: [],
    attributes: null,
    sendAttributes: true,
    expressWindow: null,
    moq: null,
  },
  setPaginationData: vi.fn(),
  getProducts: { data: [], item_count: 0 },
  productsLoading: false,
  productsFetching: false,
  productsIsError: false,
  productsError: null,
  refetchProducts: vi.fn(),
};

function renderCards(overrides = {}) {
  const value = { ...baseContext, ...overrides };
  return {
    ...render(
      <MemoryRouter initialEntries={["/shop?category=PE-02"]}>
        <AppContext.Provider value={{ backendUrl: "https://api.example.test" }}>
          <ProductsContext.Provider value={value}>
            <Cards />
          </ProductsContext.Provider>
        </AppContext.Provider>
      </MemoryRouter>
    ),
    value,
  };
}

describe("Cards catalogue request states", () => {
  it("renders a retryable service error for an API failure", () => {
    renderCards({
      productsIsError: true,
      productsError: new Error("Product request failed with HTTP 500"),
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Products are temporarily unavailable"
    );
    expect(screen.getByText(/filters have been preserved/i)).toBeInTheDocument();
    expect(screen.queryByText("No Products Found")).not.toBeInTheDocument();
  });

  it("invokes the existing React Query refetch action", () => {
    const refetchProducts = vi.fn();
    renderCards({ productsIsError: true, refetchProducts });

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetchProducts).toHaveBeenCalledTimes(1);
  });

  it("keeps the genuine empty-catalogue state for a successful empty response", () => {
    renderCards({
      productsIsError: false,
      getProducts: { data: [], item_count: 0 },
    });

    expect(screen.getByText("No Products Found")).toBeInTheDocument();
    expect(
      screen.queryByText("Products are temporarily unavailable")
    ).not.toBeInTheDocument();
  });

  it("hides stale products during failure and restores successful retry data", () => {
    const initial = {
      productsIsError: true,
      getProducts: { data: [product], item_count: 1 },
    };
    const { rerender } = renderCards(initial);

    expect(screen.queryByTestId("product-card")).not.toBeInTheDocument();

    rerender(
      <MemoryRouter initialEntries={["/shop?category=PE-02"]}>
        <AppContext.Provider value={{ backendUrl: "https://api.example.test" }}>
          <ProductsContext.Provider
            value={{
              ...baseContext,
              productsIsError: false,
              getProducts: { data: [product], item_count: 1 },
            }}
          >
            <Cards />
          </ProductsContext.Provider>
        </AppContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("product-card")).toHaveTextContent(
      "Recovered Bottle"
    );
  });
});
