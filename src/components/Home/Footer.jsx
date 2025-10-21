import { IoMail } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import amex from "../../assets/amex.png";
import apple from "../../assets/apple.png";
import colors from "../../assets/colors.png";
import discover from "../../assets/discover.png";
import facebook from "../../assets/facebook.png";
import gpay from "../../assets/gpay.png";
import insta from "../../assets/insta.png";
import pay from "../../assets/pay.png";
import paypal from "../../assets/paypal.png";
import supermerch from "../../assets/supermerch.png";
import visa from "../../assets/visa.png";
import PopUps from "./PopUps";
import { FaFacebookF, FaInstagram, FaMailchimp } from "react-icons/fa6";
import { FaMailBulk } from "react-icons/fa";

const Footer = () => {
  const miniNav = [
    {
      img: <FaFacebookF className="w-5 h-5" />,
      path: "https://www.facebook.com/share/1DztGRWqfA/",
    },
    {
      img: <FaInstagram className="w-5 h-5" />,
      path: "https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw",
    },
  ];
  const paymethod = [visa, paypal, gpay, apple];
  const navigate = useNavigate();
  const goToCheckout = () => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login first");
      navigate("/signup");
      return;
    }
    navigate("/checkout");
  };
  const goToTrack = () => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login first");
      navigate("/signup");
      return;
    }
    navigate("/track-order");
  };

  return (
    <footer className="bg-secondary pt-8 md:pt-0">
      {/* Main Footer Content */}
      <div className="Mycontainer py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={supermerch}
                className="w-32 object-contain brightness-0 invert"
                alt="Super Merch"
              />
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Quality promotional products with fast delivery and competitive
              pricing. Your trusted partner for custom branded merchandise.
            </p>
            <div className="flex items-center gap-1 sm:gap-3">
              {miniNav.map((icon, i) => (
                <button
                  key={i}
                  onClick={() => window.open(icon.path, "_blank")}
                  className="text-white sm:w-10 sm:h-10 w-8 h-8 bg-primary rounded-lg flex items-center justify-center hover:bg-primary/80 transition-colors"
                >
                  {icon.img}
                </button>
              ))}
              <button
                className="text-white sm:w-10 sm:h-10 w-8 h-8 bg-primary rounded-lg flex items-center justify-center hover:bg-primary/80 transition-colors"
                onClick={() =>
                  window.open(
                    "https://mail.google.com/mail/?view=cm&to=Info@supermerch.com.au",
                    "_blank"
                  )
                }
              >
                <FaMailBulk className="text-lg" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-1 sm:space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-white/80 hover:text-white hover:underline transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/80 hover:text-white hover:underline transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/all-blogs"
                  className="text-white/80 hover:text-white hover:underline transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/faqs"
                  className="text-white/80 hover:text-white hover:underline transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/clearance"
                  className="text-white/80 hover:text-white hover:underline transition-colors"
                >
                  Clearance
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-white/80 hover:text-white hover:underline transition-colors"
                >
                  Shop
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Customer Service
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/artwork-policy"
                  className="text-white/80 hover:text-white hover:underline transition-colors"
                >
                  Artwork Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-white/80 hover:text-white hover:underline transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-white/80 hover:text-white hover:underline transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <button
                  onClick={goToTrack}
                  className="text-white/80 hover:text-white hover:underline transition-colors text-left"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  onClick={goToCheckout}
                  className="text-white/80 hover:text-white hover:underline transition-colors text-left"
                >
                  Pay Invoice
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Contact Us
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-white/80 text-sm">Phone</p>
                <a
                  href="tel:+61466468528"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  +61 466 468 528
                </a>
              </div>
              <div>
                <p className="text-white/80 text-sm">Email</p>
                <a
                  href="mailto:Info@supermerch.com.au"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Info@supermerch
                  <br className="block sm:hidden" />
                  .com.au
                </a>
              </div>
              <div>
                <p className="text-white/80 text-sm">Business Hours</p>
                <p className="text-white text-sm">Mon–Fri: 7am–6pm CST</p>
                <p className="text-white text-sm">Sat: 8am–5pm CST</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-white/10 mt-2 pt-2">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white/80 text-sm mb-3">We Accept</p>
              <div className="sm:flex grid grid-cols-4 items-center gap-3">
                {paymethod.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt="payment"
                    className="h-6 object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="max-w-2xl mx-auto text-left">
                <p className="text-white/80 mb-2">
                  Subscribe to our newsletter for exclusive offers and new
                  product updates
                </p>
                <div className="flex max-w-md">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 sm:px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder:text-white/60"
                  />
                  <button className="px-3 sm:px-6 py-3 bg-primary text-white rounded-r-lg hover:bg-primary/90 transition-colors font-medium">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-2 md:mb-0">
              <PopUps />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-white/10 bg-secondary/90 py-4 md:py-0">
        <div className="Mycontainer py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/80 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Super Merch. All rights reserved. |
              Developed by DEVSRANK
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/privacy"
                className="text-white/80 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-white/80 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
