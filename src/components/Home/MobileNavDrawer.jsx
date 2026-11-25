import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  LogIn,
  LogOut,
  Mail,
  RotateCcw,
  Truck,
  Upload,
  User,
  X,
} from "lucide-react";
import logo from "@/assets/logo.png";

const LG_QUERY = "(min-width: 1024px)";

const isPlainLeftClick = (event) =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

/**
 * Link for a menu entry. Menu entries built by RefactoredNavbar carry an
 * `onClick` that also resets shop filters / category context, so a plain
 * left click runs that handler (same as the desktop mega menu) while the
 * real href keeps open-in-new-tab and long-press working.
 */
const MenuEntryLink = ({ href, onSelect, onNavigate, className, children }) => {
  if (!href) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          onSelect?.();
          onNavigate();
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <Link
      to={href}
      className={className}
      onClick={(event) => {
        // Modified clicks (new tab etc.) are left to the browser / Link.
        if (!isPlainLeftClick(event)) return;
        if (onSelect) {
          // Link skips its own navigation when the event is defaultPrevented;
          // onSelect navigates to the same URL and resets shop state.
          event.preventDefault();
          onSelect();
        }
        onNavigate();
      }}
    >
      {children}
    </Link>
  );
};

MenuEntryLink.propTypes = {
  href: PropTypes.string,
  onSelect: PropTypes.func,
  onNavigate: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node,
};

const TOP_ROW =
  "flex min-h-[52px] w-full items-center justify-between gap-3 px-5 text-left text-base font-semibold text-sm-deep transition-colors hover:bg-sm-tint/60";
const SUB_ROW =
  "flex min-h-[48px] w-full items-center justify-between gap-3 pl-8 pr-5 text-left text-[15px] font-medium text-sm-deep transition-colors hover:bg-sm-tint/60";
const LEAF_ROW =
  "flex min-h-[44px] w-full items-center pl-12 pr-5 text-left text-sm text-sm-muted transition-colors hover:bg-sm-tint/60 hover:text-sm-deep";
const UTIL_ROW =
  "flex min-h-[48px] w-full items-center gap-3 px-5 text-left text-[15px] font-medium text-sm-deep transition-colors hover:bg-sm-tint/60";

const hasChildren = (entry) =>
  Array.isArray(entry?.subItems) && entry.subItems.length > 0;

// A submenu is worth expanding only if it offers more than one destination
// (e.g. "Hampers" has a single "Gift Hampers" entry pointing at the same page).
const isExpandable = (item) =>
  Array.isArray(item?.submenu) &&
  (item.submenu.length > 1 || item.submenu.some(hasChildren));

const MobileNavDrawer = ({
  open,
  onOpenChange,
  menuItems,
  isAuthenticated,
  onLogout,
  returnFocusRef,
}) => {
  const [expandedTop, setExpandedTop] = useState(null);
  const [expandedSub, setExpandedSub] = useState(null);

  const close = () => onOpenChange(false);

  // The drawer is mobile-only; if the viewport grows to desktop while it is
  // open, close it so the scroll lock doesn't linger on desktop.
  useEffect(() => {
    if (!open || typeof window.matchMedia !== "function") return undefined;
    const mq = window.matchMedia(LG_QUERY);
    if (mq.matches) {
      onOpenChange(false);
      return undefined;
    }
    const handleChange = (e) => {
      if (e.matches) onOpenChange(false);
    };
    mq.addEventListener?.("change", handleChange);
    return () => mq.removeEventListener?.("change", handleChange);
  }, [open, onOpenChange]);

  const toggleTop = (id) => {
    setExpandedTop((prev) => (prev === id ? null : id));
    setExpandedSub(null);
  };

  const toggleSub = (id) => setExpandedSub((prev) => (prev === id ? null : id));

  const reorderHref = isAuthenticated
    ? "/my-account#orders"
    : "/login?redirect=/my-account%23orders";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            // Opened from the header button or the bottom tab bar (no Radix
            // Trigger), so hand focus back to whichever one opened it.
            event.preventDefault();
            returnFocusRef?.current?.focus?.({ preventScroll: true });
          }}
          className="fixed inset-y-0 left-0 z-[1000] flex h-full w-[88vw] max-w-sm flex-col bg-white shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left lg:hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sm-line px-5 py-3">
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <Link to="/" onClick={close} className="block">
              <img src={logo} alt="SuperMerch home" className="h-11 w-auto object-contain" />
            </Link>
            <Dialog.Close
              aria-label="Close menu"
              className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-sm-deep transition-colors hover:bg-sm-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-sm-teal"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
            {/* Categories */}
            <nav aria-label="Shop categories" className="py-2">
              <p className="px-5 pb-1 pt-3 text-xs font-bold uppercase tracking-[0.14em] text-sm-muted">
                Shop
              </p>
              <ul>
                {menuItems.map((item) => {
                  const itemKey = item.id || item.name;

                  if (!isExpandable(item)) {
                    return (
                      <li key={itemKey}>
                        <MenuEntryLink
                          href={item.path}
                          onSelect={item.onClick}
                          onNavigate={close}
                          className={TOP_ROW}
                        >
                          {item.name}
                          <ChevronRight className="h-5 w-5 text-sm-muted" aria-hidden="true" />
                        </MenuEntryLink>
                      </li>
                    );
                  }

                  const isOpen = expandedTop === itemKey;
                  const panelId = `mobile-nav-${itemKey}`;

                  return (
                    <li key={itemKey}>
                      <button
                        type="button"
                        className={TOP_ROW}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => toggleTop(itemKey)}
                      >
                        {item.name}
                        <ChevronDown
                          className={`h-5 w-5 text-sm-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        />
                      </button>

                      {isOpen && (
                        <ul id={panelId} className="bg-sm-paper/60 pb-2">
                          <li>
                            <MenuEntryLink
                              href={item.path}
                              onSelect={item.onClick}
                              onNavigate={close}
                              className={`${SUB_ROW} text-sm-teal`}
                            >
                              Shop all {item.name}
                            </MenuEntryLink>
                          </li>
                          {item.submenu.map((sub) => {
                            const subKey = `${itemKey}-${sub.id || sub.name}`;

                            if (!hasChildren(sub)) {
                              return (
                                <li key={subKey}>
                                  <MenuEntryLink
                                    href={sub.href}
                                    onSelect={sub.onClick}
                                    onNavigate={close}
                                    className={SUB_ROW}
                                  >
                                    {sub.name}
                                  </MenuEntryLink>
                                </li>
                              );
                            }

                            const isSubOpen = expandedSub === subKey;
                            const subPanelId = `mobile-nav-${subKey}`;

                            return (
                              <li key={subKey}>
                                <button
                                  type="button"
                                  className={SUB_ROW}
                                  aria-expanded={isSubOpen}
                                  aria-controls={subPanelId}
                                  onClick={() => toggleSub(subKey)}
                                >
                                  {sub.name}
                                  <ChevronDown
                                    className={`h-4 w-4 text-sm-muted transition-transform ${isSubOpen ? "rotate-180" : ""}`}
                                    aria-hidden="true"
                                  />
                                </button>
                                {isSubOpen && (
                                  <ul id={subPanelId}>
                                    <li>
                                      <MenuEntryLink
                                        href={sub.href}
                                        onSelect={sub.onClick}
                                        onNavigate={close}
                                        className={`${LEAF_ROW} font-medium text-sm-teal`}
                                      >
                                        All {sub.name}
                                      </MenuEntryLink>
                                    </li>
                                    {sub.subItems.map((leaf) => (
                                      <li key={`${subKey}-${leaf.id || leaf.name}`}>
                                        <MenuEntryLink
                                          href={leaf.href}
                                          onSelect={leaf.onClick}
                                          onNavigate={close}
                                          className={LEAF_ROW}
                                        >
                                          {leaf.name}
                                        </MenuEntryLink>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Utility links */}
            <nav aria-label="Account and help" className="border-t border-sm-line py-2">
              <ul>
                <li>
                  <Link to={reorderHref} onClick={close} className={UTIL_ROW}>
                    <RotateCcw className="h-5 w-5 text-sm-teal" aria-hidden="true" />
                    Reorder
                  </Link>
                </li>
                <li>
                  <Link to="/track-order" onClick={close} className={UTIL_ROW}>
                    <Truck className="h-5 w-5 text-sm-teal" aria-hidden="true" />
                    Track order
                  </Link>
                </li>
                <li>
                  <Link to="/upload-artwork" onClick={close} className={UTIL_ROW}>
                    <Upload className="h-5 w-5 text-sm-teal" aria-hidden="true" />
                    Upload artwork
                  </Link>
                </li>
                <li>
                  <Link to="/contact" onClick={close} className={UTIL_ROW}>
                    <Mail className="h-5 w-5 text-sm-teal" aria-hidden="true" />
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/favourites" onClick={close} className={UTIL_ROW}>
                    <Heart className="h-5 w-5 text-sm-teal" aria-hidden="true" />
                    Favourites
                  </Link>
                </li>
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link to="/my-account" onClick={close} className={UTIL_ROW}>
                        <User className="h-5 w-5 text-sm-teal" aria-hidden="true" />
                        Account
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        className={UTIL_ROW}
                        onClick={() => {
                          close();
                          onLogout?.();
                        }}
                      >
                        <LogOut className="h-5 w-5 text-sm-teal" aria-hidden="true" />
                        Log out
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link to="/login" onClick={close} className={UTIL_ROW}>
                      <LogIn className="h-5 w-5 text-sm-teal" aria-hidden="true" />
                      Sign in
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

MobileNavDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string.isRequired,
      path: PropTypes.string,
      onClick: PropTypes.func,
      submenu: PropTypes.array,
    }),
  ).isRequired,
  isAuthenticated: PropTypes.bool,
  onLogout: PropTypes.func,
  returnFocusRef: PropTypes.shape({ current: PropTypes.any }),
};

export default MobileNavDrawer;
