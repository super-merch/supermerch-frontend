import { useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Search, ShoppingCart, User } from "lucide-react";

// Body class that (below lg) pads the page so the bar never covers content
// or the footer, and lifts the chat launcher above the bar. See index.css.
const BODY_CLASS = "has-mobile-tabbar";

// Routes that already have their own fixed bottom UI or shouldn't get site
// navigation: the clothing/headwear PDP renders a sticky add-to-cart bar
// (StickyAddToCart) in the same spot, and checkout is kept distraction-free.
const HIDDEN_ROUTE_PREFIXES = ["/product/", "/checkout"];

const TAB =
  "relative flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium leading-none transition-colors";

const tabClass = (active) =>
  `${TAB} ${active ? "text-sm-teal" : "text-sm-muted hover:text-sm-deep"}`;

const MobileBottomBar = ({
  cartQuantity = 0,
  isAuthenticated = false,
  isMenuOpen = false,
  onOpenMenu,
  onSearch,
}) => {
  const { pathname } = useLocation();
  const isHidden = HIDDEN_ROUTE_PREFIXES.some((prefix) =>
    pathname.toLowerCase().startsWith(prefix),
  );

  useEffect(() => {
    if (isHidden) return undefined;
    document.body.classList.add(BODY_CLASS);
    return () => document.body.classList.remove(BODY_CLASS);
  }, [isHidden]);

  if (isHidden) return null;

  // While the drawer is open, "Categories" is the active tab.
  const isActive = (match) => !isMenuOpen && match;
  const accountActive = ["/my-account", "/login", "/signup"].includes(pathname);
  const cartCount = Number(cartQuantity) || 0;

  return (
    <nav
      aria-label="Quick links"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sm-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        <li>
          <Link
            to="/"
            className={tabClass(isActive(pathname === "/"))}
            aria-current={isActive(pathname === "/") ? "page" : undefined}
          >
            <Home className="h-6 w-6" aria-hidden="true" />
            Home
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={onOpenMenu}
            className={tabClass(isMenuOpen)}
            aria-haspopup="dialog"
            aria-expanded={isMenuOpen}
          >
            <LayoutGrid className="h-6 w-6" aria-hidden="true" />
            Categories
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={onSearch}
            className={tabClass(isActive(pathname === "/search"))}
          >
            <Search className="h-6 w-6" aria-hidden="true" />
            Search
          </button>
        </li>
        <li>
          <Link
            to="/cart"
            className={tabClass(isActive(pathname === "/cart"))}
            aria-current={isActive(pathname === "/cart") ? "page" : undefined}
          >
            <span className="relative">
              <ShoppingCart className="h-6 w-6" aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  className="absolute -right-2.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-sm-teal px-1 text-[10px] font-bold text-white"
                  aria-hidden="true"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
            Cart
            {cartCount > 0 && (
              <span className="sr-only">
                , {cartCount} {cartCount === 1 ? "item" : "items"}
              </span>
            )}
          </Link>
        </li>
        <li>
          <Link
            to={isAuthenticated ? "/my-account" : "/login"}
            className={tabClass(isActive(accountActive))}
            aria-current={isActive(accountActive) ? "page" : undefined}
          >
            <User className="h-6 w-6" aria-hidden="true" />
            Account
          </Link>
        </li>
      </ul>
    </nav>
  );
};

MobileBottomBar.propTypes = {
  cartQuantity: PropTypes.number,
  isAuthenticated: PropTypes.bool,
  isMenuOpen: PropTypes.bool,
  onOpenMenu: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default MobileBottomBar;
