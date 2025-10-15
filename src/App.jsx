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
import PromotionalPage from "./components/miniNavLinks/promotionalComps/PromotionalPage";
import SpromotionalPage from "./components/sminiNavLink/SpromotionalPage";
import FavouritePage from "./pages/FavouritePage";
import BestSellers from "./pages/BestSellers";
import NewArrival from "./pages/NewArrival";
import { HelmetProvider } from "react-helmet-async";
import SalesPage from "./pages/SalesPage";
import BestSellerPage from "./pages/BestSellerPage";
import SearchPage from "./pages/SearchPage";
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
import Australia from "./pages/Australia";
import HourProduction24 from "./pages/HourProduction24";
import UploadArtwork from "./pages/UploadArtwork";
import { useModals } from "./hooks/useModals";
import HotDeals from "./pages/HotDeals";
import HourProduction24Products from "./components/shop/HourProduction24Products";
import AustraliaProducts from "./components/shop/AusProducts";

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
      <ToastContainer />

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
            <Route path="/Promotional" element={<PromotionalPage />} />
            <Route
              path="/Spromotional"
              element={<ShopPage category="promotional" />}
            />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
            <Route path="hot-deals" element={<HotDeals />} />
            <Route path="/favourites" element={<FavouritePage />} />
            <Route path="/Clothing" element={<ShopPage category="dress" />} />
            <Route
              path="/Headwear"
              element={<ShopPage category="headwear" />}
            />
            <Route path="/ReturnGifts" element={<ShopPage category="allProducts" />} />
            <Route
              path="/Australia"
              element={<ShopPage category="australia" />}
            />
            <Route
              path="/production"
              element={<ShopPage category="24hr-production" />}
            />
            <Route path="/Sale" element={<ShopPage />} />
            {/* SHOPPAGE  */}
            {/* <Route path="/category" element={<CategoryPage />} /> */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/trendings" element={<BestSellers />} />
            {/* <Route path="/australia-made" element={<Australia />} />
            <Route path="/hour-production" element={<HourProduction24 />} /> */}
            <Route path="/search" element={<ShopPage category="search" />} />
            <Route path="/new-arrivals" element={<NewArrival />} />
            <Route path="/sales" element={<ShopPage category="sales" />} />
            {/* <Route path="/bestSellers" element={<BestSellerPage />} /> */}
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
