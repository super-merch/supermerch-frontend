import React, { useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import { FaArrowRight } from "react-icons/fa6";
import twitter from "../../assets/twitter.png";
import facebook from "../../assets/facebook.png";
import p from "../../assets/p.png";
import reddit from "../../assets/reddit.png";
import youtube from "../../assets/youtube.png";
import insta from "../../assets/insta.png";
import visa from "../../assets/visa.png";
import paypal from "../../assets/paypal.png";
import amex from "../../assets/amex.png";
import gpay from "../../assets/gpay.png";
import discover from "../../assets/discover.png";
import colors from "../../assets/colors.png";
import apple from "../../assets/apple.png";
import pay from "../../assets/pay.png";
import { Link, useNavigate } from "react-router-dom";
import PopUps from "./PopUps";
import supermerch from "../../assets/supermerch.png";
import { IoMail } from "react-icons/io5";
import { toast } from "react-toastify";

const Footer = () => {
  const miniNav = [
    { img: facebook, path: "https://www.facebook.com/share/1DztGRWqfA/" },
    {
      img: insta,
      path: "https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw",
    },
  ];
  const paymethod = [visa, paypal, amex, gpay, discover, colors, apple, pay];
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
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="Mycontainer py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={supermerch}
                className="w-32 object-contain brightness-0 invert"
                alt="Super Merch"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Quality promotional products with fast delivery and competitive
              pricing. Your trusted partner for custom branded merchandise.
            </p>
            <div className="flex items-center gap-3">
              {miniNav.map((icon, i) => (
                <button
                  key={i}
                  onClick={() => window.open(icon.path, "_blank")}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <img src={icon.img} alt="social" className="w-5 h-5" />
                </button>
              ))}
              <button
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                onClick={() =>
                  window.open(
                    "https://mail.google.com/mail/?view=cm&to=Info@supermerch.com.au",
                    "_blank"
                  )
                }
              >
                <IoMail className="text-lg" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/all-blogs"
                  className="text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/faqs"
                  className="text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/clearance"
                  className="text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  Clearance
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  Shop
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/artwork-policy"
                  className="text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  Artwork Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-white hover:underline transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <button
                  onClick={goToTrack}
                  className="text-gray-300 hover:text-white hover:underline transition-colors text-left"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  onClick={goToCheckout}
                  className="text-gray-300 hover:text-white hover:underline transition-colors text-left"
                >
                  Pay Invoice
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-300 text-sm">Phone</p>
                <a
                  href="tel:+61466468528"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  +61 466 468 528
                </a>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Email</p>
                <a
                  href="mailto:Info@supermerch.com.au"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  Info@supermerch.com.au
                </a>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Business Hours</p>
                <p className="text-white text-sm">Mon–Fri: 7am–6pm CST</p>
                <p className="text-white text-sm">Sat: 8am–5pm CST</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 mt-2 pt-2">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-gray-300 text-sm mb-3">We Accept</p>
              <div className="flex items-center gap-3">
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
            <div className=" border-gray-800">
              <div className="max-w-2xl mx-auto text-left">
                <p className="text-gray-300 mb-2">
                  Subscribe to our newsletter for exclusive offers and new
                  product updates
                </p>
                <div className="flex max-w-md">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="px-6 py-3 bg-smallHeader text-white rounded-r-lg hover:opacity-90 transition-opacity font-medium">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <PopUps />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="Mycontainer py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Super Merch. All rights reserved. |
              Developed by DEVSRANK
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white transition-colors"
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
