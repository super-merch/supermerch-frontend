import React, { useState } from "react";
import twitter from "../../assets/twitter.png";
import facebook from "../../assets/facebook.png";
import p from "../../assets/p.png";
import reddit from "../../assets/reddit.png";
import youtube from "../../assets/youtube.png";
import insta from "../../assets/insta.png";
import SMiniNav from "../sminiNavLink/SMiniNav";
import { IoMail } from "react-icons/io5";


// import MiniNav from "./MiniNav";

const Navbar = () => {
  const miniNav = [ {img:facebook, path:"https://www.facebook.com/share/1DztGRWqfA/"}, {img:insta, path:"https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw"}];
  return (
    <>
      <div className="bg-smallHeader text-white py-2 lg:block md:block hidden">
        <div className="Mycontainer flex items-center justify-between flex-wrap gap-4">
          <div className=" flex gap-6 flex-wrap mx-auto">
            <p className="text-xl font-light">50% Promotion is going on</p>
          </div>
          <div className="flex items-center flex-wrap	">
            <div className="flex items-center gap-3  flex-wrap">
              <p className="font-[400] text-xs text-[#FFFFFF]">Follow us:</p>
              {miniNav.map((icon, i) => {
                return (
                  <div key={i} onClick={() => window.open(icon.path, "_blank")} className="cursor-pointer ">
                    <img src={icon.img} alt="" className="" />
                  </div>
                );
              })}
              <div className="cursor-pointer"
              onClick={() => window.open("https://mail.google.com/mail/?view=cm&to=Info@supermerch.com.au", "_blank")}
              >
                    <IoMail  className="font-[400] text-lg text-[#FFFFFF]" />
                  </div>
            </div>
          </div>
        </div>
      </div>

      <SMiniNav />
    </>
  );
};

export default Navbar;
