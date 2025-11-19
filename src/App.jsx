import { useContext } from "react";
import Navbar from "./components/Home/Navbar";
import { Routes, Route } from "react-router-dom";
import RouteTransition from "./components/Common/RouteTransition";
import Home from "./pages/Home";
import ProducPage from "./pages/ProducPage";
import Footer from "./components/Home/Footer";
import CategoryPage from "./pages/CategoryPage";
import ShopPage from "./pages/ShopPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ContactPage from "./pages/ContactPage";
import Cart from "./pages/Cart";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CheckoutPage from "./pages/CheckoutPage";
import AboutPage from "./pages/AboutPage";
import { AppContext } from "./context/AppContext";
import Sidebar from "./userAdmin/Sidebar";
import { ToastContainer } from "react-toastify";
import BlogDetails from "./pages/BlogDetails";
import FavouritePage from "./pages/FavouritePage";
import { HelmetProvider } from "react-helmet-async";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import AllBlogs from "./pages/AllBlogs";
import FAQs from "./pages/FAQs";
import ArtWorkPolicy from "./pages/ArtWorkPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import ClearancePage from "./pages/CLearance";
import PMSColorChart from "./pages/PMS";
import HelpCenter from "./pages/HelpCenter";
import MailOffer from "./pages/MailOffer";
import TrackOrder from "./pages/TrackOrder";
import UploadArtwork from "./pages/UploadArtwork";
import Terms from "./pages/Terms";
import QuoteResponse from "./pages/QuoteResponse";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const { token } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

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
    <div>
      <ToastContainer position="bottom-center" autoClose={2000} />

      <Navbar onCouponClick={handleCouponClick} />
      <ScrollToTop />
      <HelmetProvider>
        <RouteTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProducPage />} />
            {/* Product details page */}
            {/* Akash */}
            {/* Other routes */}
            <Route
              path="/promotional"
              element={<ShopPage category="promotional" />}
            />

            <Route path="hot-deals" element={<ShopPage category="sales" />} />
            <Route path="/favourites" element={<FavouritePage />} />
            <Route path="/Clothing" element={<ShopPage category="dress" />} />
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
            <Route path="/sales" element={<ShopPage category="sales" />} />
            {/* SHOPPAGE  */}
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/shop" element={<ShopPage general={true} />} />
            <Route
              path="/australia-made"
              element={<ShopPage category="australia" />}
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
            <Route path="/terms" element={<Terms />} />

            {token && <Route path="/admin" element={<Sidebar />} />}
            {/* <Route path="/order-details/:id" element={<UserProducts />} /> */}
          </Routes>
        </RouteTransition>
      </HelmetProvider>
      {/* <Sidebar /> */}
      {/* <Sidebar /> */}
      <Footer />
    </div>
  );
};

export default App;
