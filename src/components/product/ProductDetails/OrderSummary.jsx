import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaCheck } from "react-icons/fa";
import { addToCart } from "../../../redux/slices/cartSlice";
import { FaMoneyBill1Wave } from "react-icons/fa6";

const OrderSummary = ({
  rawPerUnit,
  discountedUnitPrice,
  discountPct,
  currentQuantity,
  currentPrice,
  showQuoteForm,
  setShowQuoteForm,
  productId,
  product,
  priceGroups,
  perUnitWithMargin,
  selectedColor,
  selectedPrintMethod,
  logoColor,
  selectedSize,
  selectedFile,
  deliveryDate,
  freightFee,
  userEmail,
  setupFee,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleBuySample = () => {
    // if (!userEmail) {
    //   toast.error("Please login to add items to cart");
    //   navigate("/signup");
    //   return;
    // }

    dispatch(
      addToCart({
        id: productId,
        name: product.name,
        image: product.images?.[0] || "",
        // add basePrices so reducer can compute correct unit price
        basePrices:
          priceGroups.find((g) => g.base_price)?.base_price?.price_breaks || [],
        // price optional — reducer currently ignores passed-in price for computation
        price: perUnitWithMargin,
        discountPct,
        totalPrice: perUnitWithMargin * 1, // optional: a helpful hint, reducer recalculates
        code: product.code,
        color: selectedColor,
        quantity: 1, // Force quantity to 1 for sample
        print: selectedPrintMethod?.description || "",
        logoColor: logoColor,
        size: selectedSize,
        setupFee: setupFee || 0,
        dragdrop: selectedFile,
        deliveryDate,
        priceBreaks: selectedPrintMethod?.price_breaks || [],
        printMethodKey: selectedPrintMethod?.key || "",
        freightFee: freightFee,
        userEmail: userEmail || "guest@gmail.com",
      })
    );

    navigate("/cart");
  };

  return (
    <div className="">
      {/* Consolidated Order Summary */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm lg:sticky lg:top-4">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white rounded-t-md">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div>
              <p className="text-xs font-medium text-gray-600 tracking-wide">
                Per unit
              </p>
              <div className="flex items-baseline gap-2">
                {discountPct > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    ${rawPerUnit.toFixed(2)}
                  </span>
                )}
                <p className="sm:text-2xl text-xl font-bold text-smallHeader">
                  $
                  {discountedUnitPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              {discountPct > 0 && (
                <span className="mt-2 inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700 ring-1 ring-inset ring-green-200">
                  Save {discountPct}%
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-600 tracking-wide">
                Total
              </p>
              <div className="flex items-center justify-end gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 leading-3 text-[12px] sm:text-[13px] text-gray-700 ring-1 ring-inset ring-gray-200">
                  {currentQuantity} pcs
                </span>
                <p className="sm:text-3xl text-2xl font-extrabold text-smallHeader">
                  $
                  {currentPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="px-6 py-2 rounded-lg">
          {/* Action Buttons */}
          <div className="space-y-3 mt-2">
            <div
              onClick={() =>
                setShowQuoteForm?.({ state: true, from: "quoteButton" })
              }
              className="flex items-center justify-center gap-2 py-2 text-primary cursor-pointer border border-primary transition-all duration-300 rounded-sm hover:shadow-md"
            >
              <FaMoneyBill1Wave className="text-primary" />
              <button className="text-sm">Get Express Quote</button>
            </div>
            <div
              onClick={handleBuySample}
              className="flex items-center justify-center gap-2 py-2 mt-2 text-white cursor-pointer bg-primary hover:bg-primary/80 transition-all duration-300 rounded-sm"
            >
              <img src="/buy2.png" alt="" />
              <button className="text-sm">BUY 1 SAMPLE</button>
            </div>
          </div>

          {/* Product Details */}
          <div className="mt-6">
            <p className="text-sm text-black">
              Est Delivery Date: {deliveryDate}
            </p>
            <p className="pt-2 text-xs text-black ">
              ${discountedUnitPrice.toFixed(2)} (Non-Branded sample) + $
              {freightFee} delivery
            </p>
          </div>

          <div className="pb-4 mt-2 mb-4 border-b">
            <div className="flex items-start gap-2 pt-3 ">
              <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                <FaCheck />
              </p>
              <p className="text-sm">
                Selected Color:{" "}
                {selectedColor ? selectedColor : "No color selected"}
              </p>
            </div>
            <div className="flex items-start gap-2 pt-3 ">
              <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                <FaCheck />
              </p>
              <p className="text-sm">
                Print Method:{" "}
                {selectedPrintMethod?.description || "Not selected"}
              </p>
            </div>
            <div className="flex items-start gap-2 pt-3 ">
              <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                <FaCheck />
              </p>
              <p className="text-sm">
                Selected Size: &nbsp;
                {selectedSize || "Not selected"}
              </p>
            </div>

            <div className="flex items-start gap-2 pt-3 ">
              <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                <FaCheck />
              </p>
              <p className="text-sm">Quantity: {currentQuantity}</p>
            </div>

            <div className="flex items-start gap-2 pt-3 ">
              <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                <FaCheck />
              </p>
              <p className="text-sm">
                Setup Charge: ${setupFee?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="flex items-start gap-2 pt-3 ">
              <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                <FaCheck />
              </p>
              <p className="text-sm">
                Freight Charge:
                {freightFee > 0 ? `$${freightFee.toFixed(2)}` : " TBD"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
