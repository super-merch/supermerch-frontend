import React from "react";
import { Link } from "react-router-dom";
import { MdKeyboardArrowRight } from "react-icons/md";
const CartNavigate = () => {
  return (
    <div className="Mycontainer pb-2">
      <div className="flex flex-wrap items-center gap-6 text-smallHeader mt-8 text-lg">
        <Link to={"/"} className="flex items-center gap-3">
          <p>Home</p>
          <MdKeyboardArrowRight className="text-xl" />
        </Link>
        <p>Cart</p>
      </div>
    </div>
  );
};

export default CartNavigate;
