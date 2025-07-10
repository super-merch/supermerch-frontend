import React from 'react'
import { Link } from 'react-router-dom';
import { MdKeyboardArrowRight } from "react-icons/md";

const ProductNavigate = () => {
  return (
    <div className='Mycontainer'>
      <div className="flex flex-wrap items-center gap-2 text-smallHeader mt-4 text-lg">
        <Link to={"/"} className="flex items-center gap-2">
          <p>Home</p>
          <MdKeyboardArrowRight className="text-xl" />
        </Link>
        <p>Product</p>
      </div>
    </div>
  );
}

export default ProductNavigate