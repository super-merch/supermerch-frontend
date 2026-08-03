// @vitest-environment jsdom

/**
 * src/App.jsx — route-tracking is the single source of truth for PageView.
 *
 * (c) Proves exactly one trackPageView() call fires on initial load, and
 * exactly one more per subsequent client-side route navigation — no
 * duplicates. (analytics.test.js separately proves initMetaPixel() itself
 * no longer queues a PageView on init, which is what used to double-count
 * the very first page load; this test proves the App-level effect that is
 * now the sole source is itself dedup-safe.)
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

// Keep the tree small and dependency-free: mock every heavy/global child so
// this test exercises only App's own route-tracking effect.
vi.mock("../components/Home/Navbar", () => ({ default: () => null }));
vi.mock("../components/Home/Footer", () => ({ default: () => null }));
vi.mock("../components/Chat/ChatWidget", () => ({ default: () => null }));
vi.mock("../components/Home/SitePopups", () => ({ default: () => null }));
vi.mock("../components/Common/RouteSeo", () => ({ default: () => null }));
vi.mock("../components/Common/CookieConsentBanner", () => ({ default: () => null }));
vi.mock("../pages/Home/Home", () => ({ default: () => <div>HomePage</div> }));
vi.mock("../pages/ProductPageResolver", () => ({
  default: () => <div>ProductPage</div>,
}));

const trackPageViewMock = vi.fn();
vi.mock("../lib/analytics", () => ({
  trackPageView: (...args) => trackPageViewMock(...args),
}));

import App from "../App";
import { AuthContext } from "../context/AuthContext";
import { store } from "../redux/store";

afterEach(() => {
  cleanup();
  trackPageViewMock.mockClear();
});

const NavigateOnClick = ({ to }) => {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}>
      go-to-{to}
    </button>
  );
};

NavigateOnClick.propTypes = {
  to: PropTypes.string.isRequired,
};

const renderApp = (initialEntries) =>
  render(
    <AuthContext.Provider value={{ token: null }}>
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <NavigateOnClick to="/product/1" />
          <App />
        </MemoryRouter>
      </Provider>
    </AuthContext.Provider>,
  );

describe("App PageView tracking", () => {
  it("fires exactly one trackPageView on initial mount", () => {
    renderApp(["/"]);

    expect(screen.getByText("HomePage")).toBeInTheDocument();
    expect(trackPageViewMock).toHaveBeenCalledTimes(1);
    expect(trackPageViewMock).toHaveBeenCalledWith("/");
  });

  it("fires exactly one additional trackPageView per subsequent navigation, no duplicates", () => {
    renderApp(["/"]);
    expect(trackPageViewMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("go-to-/product/1"));

    expect(screen.getByText("ProductPage")).toBeInTheDocument();
    expect(trackPageViewMock).toHaveBeenCalledTimes(2);
    expect(trackPageViewMock).toHaveBeenNthCalledWith(2, "/product/1");
  });
});
