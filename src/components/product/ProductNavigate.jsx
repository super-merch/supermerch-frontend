import React from "react";
import { Link } from "react-router-dom";
import { MdKeyboardArrowRight } from "react-icons/md";

const ProductNavigate = ({ product }) => {
  console.log(product);

  return (
    <div className="Mycontainer">
      <div className="flex flex-wrap items-center gap-2 text-smallHeader mt-4 text-lg">
        <Link to={"/"} className="flex items-center gap-2">
          <p>Home</p>/
        </Link>
        <p>Product</p>/
        <p>{product?.product?.categorisation?.product_type?.type_group_name}</p>
        /<p>{product?.product?.categorisation?.product_type?.type_name}</p>
      </div>
    </div>
  );
};

export default ProductNavigate;
