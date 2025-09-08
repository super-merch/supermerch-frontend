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
 const miniNav = [ {img:facebook, path:"https://www.facebook.com/share/1DztGRWqfA/"}, {img:insta, path:"https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw"}];
  const paymethod = [visa, paypal, amex, gpay, discover, colors, apple, pay];
  const navigate = useNavigate()
  const goToCheckout = ()=>{
    //check tokens first
    if(!localStorage.getItem("token")){
      toast.error("Please login first")
      navigate("/signup")
      return
    }
    navigate("/checkout")
  }
  const goToTrack = ()=>{
    //check tokens first
    if(!localStorage.getItem("token")){
      toast.error("Please login first")
      navigate("/signup")
      return
    }
    navigate("/track-order")
  }
  return (
    <div className="bg-smallHeader mt-12">
      <div className=" Mycontainer grid grid-cols-2 lg:grid-cols-5 md:grid-cols-2  pt-7 lg:space-x-10 md:space-x-0 gap-y-8">
        <div className="w-fit text-white">
          {/* <h1 className=" uppercase text-3xl font-bold ">pgshop</h1> */}
          <img
            src={supermerch}
            className="lg:w-36 w-24 object-contain"
            alt=""
          />
          <div className="mt-3 max-sm:text-sm">
            <h2 className="font-bold  mb-1">Customer Support</h2>
            {/* <p className=" py-1 text-sm  ">Live Chat</p>
            <p className=" py-1 text-sm hover:text-white ">Email Us</p> */}
            <p className="text-sm max-sm:text-xs py-0.5 text-white cursor-pointer font-normal hover:underline ">
              Call Us +61 466 468 528
            </p>
            <p className="text-sm max-sm:text-xs py-0.5 text-white cursor-pointer font-normal hover:underline ">
              Mon-Fri: 7am-6pm CST
            </p>
            <p className="text-sm max-sm:text-xs py-0.5 text-white cursor-pointer font-normal hover:underline ">
              Sat: 8am–5pm CST
            </p>
          </div>
        </div>
        <div className="w-fit  text-white">
          <h1 className="text-white max-sm:text-sm capitalize text-base font-bold">
            Get to Know Us{" "}
          </h1>
          <div className="flex  flex-col mt-1">
            <Link
              to={"/all-blogs"}
              className=" py-0.5 max-sm:text-xs text-sm font-normal hover:underline"
            >
              Our blogs
            </Link>
            <Link
              to={"/about"}
              className=" py-0.5 max-sm:text-xs text-sm font-normal hover:underline"
            >
              About us
            </Link>
            <Link
              to={"/faqs"}
              className=" py-0.5 max-sm:text-xs text-sm font-normal hover:underline"
            >
              FAQ
            </Link>
            <Link
              to={"/contact"}
              className=" py-0.5 max-sm:text-xs  text-sm font-normal hover:underline"
            >
              Contact Us
            </Link>
            {/* <Link
              to={"/about"}
              className=" py-0.5  text-sm font-normal hover:underline"
            >
              Our responsibility
            </Link> */}
          </div>
        </div>

        <div className="w-fit  text-white">
          <h1 className="text-white capitalize max-sm:text-ss text-base font-bold">
            Policies{" "}
          </h1>
          <div className="flex flex-col mt-1">
            <Link to={'/artwork-policy'} className="py-0.5 max-sm:text-xs cursor-pointer text-sm font-normal hover:underline   ">
              Artwork policy
            </Link>
            <Link to={'/refund-policy'} className="py-0.5 cursor-pointer max-sm:text-xs text-sm font-normal hover:underline  ">
              Refund policy
            </Link>
            {/* <p className="py-0.5 cursor-pointer text-sm font-normal hover:underline">
              Sample policy
            </p> */}
            <p className="py-0.5 cursor-pointer text-sm font-normal hover:underline max-sm:text-xs">
              Privacy and cookie policy
            </p>
            {/* <p className="py-0.5 cursor-pointer text-sm font-normal hover:underline">
              TnC
            </p> */}
          </div>
        </div>

        <div className="w-fit flex flex-col text-white">
          <h1 className="text-white max-sm:text-sm capitalize text-base font-bold">
            Offers & Resources
          </h1>
          <div className="flex flex-col mt-1">
            <Link to={'/clearance'} className=" py-0.5 max-sm:text-xs  text-sm font-normal hover:underline">
              Clearance
            </Link>
            <Link
              to={"/shop"}
              className="py-0.5   text-sm font-normal  hover:underline max-sm:text-xs"
            >
              Category details
            </Link>
            <Link
              to={"/cart"}
              className="py-0.5   text-sm font-normal hover:underline max-sm:text-xs"
            >
              Cart
            </Link>
            <Link to={'/pms'} className=" py-0.5  text-sm font-normal hover:underline max-sm:text-xs">
              PMS colour chart
            </Link>
          </div>
          <PopUps />
        </div>

        <div className="w-fit">
          <h1 className="text-white capitalize text-base font-bold max-sm:text-sm">
            How Can We Help?{" "}
          </h1>
          <div className="flex gap-3 mt-1 flex-wrap ">
            <div className=" text-line">
              <Link to={"/help-center"} className=" py-0.5 max-sm:text-xs text-sm font-normal  cursor-pointer hover:underline ">
                Help Center
              </Link>
              <p onClick={goToTrack} className=" py-0.5 text-sm block max-sm:text-xs font-normal  cursor-pointer hover:underline">
                Track My Order / Reorder
              </p>
              <p onClick={goToCheckout} className=" py-0.5 text-sm font-normal max-sm:text-xs  cursor-pointer hover:underline">
                Pay My Invoice
              </p>
              <Link to={"/mail-offer"} className=" py-0.5 text-sm block font-normal max-sm:text-xs cursor-pointer hover:underline">
                Redeem Mail Offer
              </Link>
              {/* <p className=" py-0.5 text-sm font-normal  cursor-pointer hover:underline">
                Sitemap
              </p> */}
            </div>
          </div>
        </div>
      </div>
      {/* SIGNUP  */}
      <div className="Mycontainer pb-5 pt-5 ">
        <h1 className="text-xl text-white font-bold">
          Sign Up for 15% Off Your First Order
        </h1>
        <div className="lg:flex md:flex block items-center text-white gap-6 mt-4 ">
          <div className=" lg:w-[40%] py-2 lg:px-4 md::px-4 sm:px-4 px-2 bg-white flex items-center ">
            <input
              type="text"
              placeholder="Email address"
              className="bg-transparent outline-none w-full text-black"
            />
            <div className="flex items-center lg:px-6 md:px-6 px-3 py-3 justify-center gap-2 bg-smallHeader text-white">
              <button className="uppercase text-sm ">Subscribe</button>
              <FaArrowRight />
            </div>
          </div>
          <div className="">
            <p className="font-[400] text-xs text-[#FFFFFF] lg:pt-0 md:pt-0 pt-8">
              Follow us:
            </p>
            <div className="flex items-center mt-2 gap-5">
              {miniNav.map((icon, i) => {
                return (
                  <div key={i} onClick={() => window.open(icon.path, "_blank")} className="cursor-pointer ">
                    <img src={icon.img} alt="" className="w-5" />
                  </div>
                );
              })}
              <div
                className="cursor-pointer "
                onClick={() =>
                  window.open(
                    "https://mail.google.com/mail/?view=cm&to=Info@supermerch.com.au",
                    "_blank"
                  )
                }
              >
                <IoMail className="font-[400] text-2xl text-[#FFFFFF]" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* POLICY  */}
      <div className="Mycontainer pb-10 text-footer flex lg:flex-nowrap md:flex-nowrap  flex-wrap justify-between gap-6 ">
        <div>
          <Link to={"/privacy"}>
            <p className="underline text-sm font-normal ">Privacy Policy</p>
          </Link>
          <p className="pt-2 text-footer  text-[10px] font-medium  hover:text-white ">
            © Copyright 2025 Super Merch. All rights reserved | Developed
            By DEVSRANK
          </p>
        </div>
        <div className="flex  flex-wrap items-center gap-3">
          {paymethod.map((pay, ind) => {
            return (
              <div key={ind}>
                <img src={pay} alt="" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Footer;
