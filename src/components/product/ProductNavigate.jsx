import React from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { MdKeyboardArrowRight, MdArrowBack } from "react-icons/md";

const ProductNavigate = ({ product }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get return URL from query params or location state
  const returnUrl = searchParams.get("return") || location.state?.returnUrl;

  const handleBackClick = () => {
    if (returnUrl) {
      // Navigate to the stored return URL which includes scrollTo parameter
      navigate(returnUrl);
    } else {
      // Fallback to browser back
      navigate(-1);
    }
  };

  return (
    <div className="Mycontainer">
      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mt-4 mb-2 font-medium"
      >
        <MdArrowBack className="text-xl" />
        <span>Back to Products</span>
      </button>

      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-smallHeader text-lg">
        <Link to={"/"} className="flex items-center gap-2 hover:text-primary transition-colors">
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
