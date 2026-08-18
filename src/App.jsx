import { lazy, Suspense, useContext } from "react";
import Navbar from "./components/Home/Navbar";
import { Routes, Route } from "react-router-dom";
import RouteTransition from "./components/Common/RouteTransition";
import Footer from "./components/Home/Footer";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import { HelmetProvider } from "react-helmet-async";
import ChatWidget from "./components/Chat/ChatWidget";
import SitePopups from "./components/Home/SitePopups";
import RouteSeo from "./components/Common/RouteSeo";
import CookieConsentBanner from "./components/Common/CookieConsentBanner";
import { trackPageView } from "./lib/analytics";

// Home and the product detail page are the highest-traffic routes, but they
// are also (via their shared sub-components) the biggest pullers of heavy
// third-party libraries (swiper/slick carousels, lightgallery, etc.) into the
// bundle. Because they were previously imported eagerly, every one of those
// dependencies ended up in the main entry chunk and was downloaded on every
// route — checkout, account, about, everything. Both already render inside
// the <Suspense> boundary below, so lazy-loading them is a drop-in change
// with no synchronous-availability requirement to preserve.
const Home = lazy(() => import("./pages/Home/Home"));
const ProductPageResolver = lazy(() => import("./pages/ProductPageResolver"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const Cart = lazy(() => import("./pages/Cart"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const Sidebar = lazy(() => import("./userAdmin/Sidebar"));
const BlogDetails = lazy(() => import("./pages/BlogDetails"));
const FavouritePage = lazy(() => import("./pages/FavouritePage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Success = lazy(() => import("./pages/Success"));
const Cancel = lazy(() => import("./pages/Cancel"));
const AllBlogs = lazy(() => import("./pages/AllBlogs"));
const FAQs = lazy(() => import("./pages/FAQs"));
const ArtWorkPolicy = lazy(() => import("./pages/ArtWorkPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ClearancePage = lazy(() => import("./pages/CLearance"));
const PMSColorChart = lazy(() => import("./pages/PMS"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const MailOffer = lazy(() => import("./pages/MailOffer"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const CmsPage = lazy(() => import("./pages/CmsPage"));
const UploadArtwork = lazy(() => import("./pages/UploadArtwork"));
const Terms = lazy(() => import("./pages/Terms"));
const QuoteResponse = lazy(() => import("./pages/QuoteResponse"));
const AustraliaMade = lazy(() => import("./pages/AustraliaMade"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DealsPage = lazy(() => import("./pages/DealsPage"));
const DealDetailPage = lazy(() => import("./pages/DealDetailPage"));
const CollectionDetailPage = lazy(
  () => import("./pages/Collections/CollectionDetailPage"),
);

export const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const { token } = useContext(AuthContext);
  const location = useLocation();

  // When navigating away from /my-account, immediately restore body state.
  // Sidebar locks body.overflow="hidden" and hides footer; AnimatePresence mode="wait"
  // freezes the exiting component so Sidebar's cleanup never runs during the transition.
  // This effect runs in App (outside AnimatePresence) so it always gets the latest location.
  useEffect(() => {
    if (location.pathname !== "/my-account") {
      if (document.body.style.overflow === "hidden") {
        document.body.style.overflow = "";
      }
      const footer = document.querySelector("footer");
      if (footer && footer.style.display === "none") {
        footer.style.display = "";
      }
    }
  }, [location.pathname]);

  // Track SPA page views — route changes here don't trigger a real browser
  // navigation, so GA4/Meta Pixel wouldn't otherwise see them.
  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  const handleCouponClick = () => {
    // Ensure we are on Home so the modal listener exists, then trigger it
    if (location.pathname !== "/") {
      // navigate("/");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("triggerDiscountModal"));
      }, 150);
    } else {
      window.dispatchEvent(new CustomEvent("triggerDiscountModal"));
    }
  };

  return (
    <>
      <ToastContainer position="bottom-center" autoClose={2000} />

      <Navbar onCouponClick={handleCouponClick} />
      <ScrollToTop />
      <HelmetProvider>
        <RouteSeo />
        <RouteTransition>
          <Suspense
            fallback={
              <div className="min-h-[50vh]" aria-label="Loading page" />
            }
          >
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id/:productId" element={<ProductPageResolver />} />
            <Route path="/product/:id" element={<ProductPageResolver />} />
            {/* Product details page */}
            {/* Akash */}
            {/* Other routes */}
            <Route
              path="/promotional"
              element={<ShopPage category="promotional" />}
            />

            <Route path="hot-deals" element={<DealsPage />} />
            <Route path="/deals/:slug" element={<DealDetailPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/favourites" element={<FavouritePage />} />
            <Route path="/collections/:slug" element={<CollectionDetailPage />} />
            <Route path="/Clothing" element={<ShopPage category="clothing" />} />
            <Route
              path="/Headwear"
              element={<ShopPage category="headwear" />}
            />
            <Route
              path="/return-gifts"
              element={<ShopPage category="return-gifts" />}
            />
            <Route
              path="/24hr-production"
              element={<ShopPage category="24hr-production" />}
            />
            <Route path="/quote/respond/:id" element={<QuoteResponse />} />
            {/* SHOPPAGE  */}
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/shop" element={<ShopPage general={true} />} />
            <Route
              path="/australia-made"
              element={<AustraliaMade category="australia" />}
            />
            <Route path="/search" element={<ShopPage category="search" />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
            {!token && <Route path="/signup" element={<Signup />} />}
            {!token && <Route path="/login" element={<Login />} />}
            <Route path="/cart" element={<Cart />} />
            <Route path="/upload-artwork" element={<UploadArtwork />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blogs/:id" element={<BlogDetails />} />
            <Route path="/all-blogs" element={<AllBlogs />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/artwork-policy" element={<ArtWorkPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/clearance" element={<ClearancePage />} />
            <Route path="/pms" element={<PMSColorChart />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/mail-offer" element={<MailOffer />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/page/:slug" element={<CmsPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/" element={<Home />} />
            {token && <Route path="/my-account" element={<Sidebar />} />}
            {/* <Route path="/order-details/:id" element={<UserProducts />} /> */}
            {/* Catch-all route for 404 - must be last */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </RouteTransition>
      </HelmetProvider>
      {/* <Sidebar /> */}
      {/* <Sidebar /> */}
      <ChatWidget />
      <SitePopups />
      <CookieConsentBanner />
      <Footer />
    </>
  );
};

export default App;
