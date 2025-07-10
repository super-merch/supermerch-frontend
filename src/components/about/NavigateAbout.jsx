import React from 'react'
import { Link } from "react-router-dom";
import { MdKeyboardArrowRight } from "react-icons/md";
const NavigateAbout = () => {
  return (
      <div className="Mycontainer pb-2">
        <div className="flex flex-wrap items-center gap-3 text-smallHeader mt-4 text-lg">
          <Link to={"/"} className="flex items-center gap-1">
            <p>Home</p>
            <MdKeyboardArrowRight className="text-xl" />
          </Link>
          <p>About Us</p>
        </div>
      </div>
  );
}

export default NavigateAbout