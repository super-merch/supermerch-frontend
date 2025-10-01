import { MdKeyboardArrowRight } from "react-icons/md";
import { Link } from "react-router-dom";

const Navigate = () => {
  const location = window.location.pathname;

  return (
    <div className="Mycontainer">
      <div className="flex items-center gap-2 text-smallHeader mt-4 text-lg">
        <Link to={"/"} className="flex items-center gap-1">
          <p>Home</p>
          <MdKeyboardArrowRight className="text-xl" />
        </Link>
        <Link to={"/category"} className="flex items-center gap-1">
          <p>Category</p>
          <MdKeyboardArrowRight className="text-xl" />
        </Link>
        <p>{location === "/Australia" ? "Australia Made" : "Shop"}</p>
      </div>
    </div>
  );
};

export default Navigate;
