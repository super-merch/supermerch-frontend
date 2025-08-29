import { PiTruckFill } from "react-icons/pi";
import { MdOutlineLockOpen } from "react-icons/md";
import { MdOutlinePayment } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { CgList } from "react-icons/cg";
import { FaBook } from "react-icons/fa";
import { PiGiftBold } from "react-icons/pi";
import { MdKeyboardArrowRight } from "react-icons/md";
import { Link } from "react-router-dom";

const serviceCards = [
  { icon: <PiTruckFill />, title: "Track Order" },
  { icon: <MdOutlineLockOpen />, title: "Reset Password" },
  { icon: <MdOutlinePayment />, title: "Payment Option" },
  { icon: <FaRegUser />, title: "User & Account" },
  { icon: <CgList />, title: "Wishlist & Compare" },
  { icon: <FaBook />, title: "Shipping & Billing" },
  { icon: <MdOutlinePayment />, title: "Shopping Cart & Wallet" },
  { icon: <PiGiftBold />, title: "Sell on Clicon" },
];

const ContactUs = () => {
  return (
    <>
      <div className="Mycontainer">
        <div className="flex items-center gap-3 text-smallHeader mt-4 text-lg">
          <Link to={"/"} className="flex items-center gap-1">
            <p>Home</p>
            <MdKeyboardArrowRight className="text-xl" />
          </Link>

          <p>Contact Us</p>
        </div>
      </div>

      <div className="Mycontainer py-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          What can we assist you with today?
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          {serviceCards.map((card, index) => (
            <div
              key={index}
              tabIndex={0}
              role="button"
              className="flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-smallHeader/30 cursor-pointer"
              aria-label={`service-${index}`}
            >
              {/* icon in a soft circular background — keeps it subtle */}
              <div className="flex-none w-12 h-12 rounded-full bg-smallHeader/10 flex items-center justify-center text-2xl text-smallHeader">
                {card.icon}
              </div>

              {/* title + optional description */}
              <div className="flex-1">
                <span className="block text-base font-semibold text-gray-800">
                  {card.title}
                </span>
                {card.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {card.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ContactUs;
