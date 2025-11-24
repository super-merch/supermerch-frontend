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
    dispatch(
      addToCart({
        id: productId,
        name: product.name,
        image: product.images?.[0] || "",
        basePrices:
          priceGroups.find((g) => g.base_price)?.base_price?.price_breaks || [],
        price: perUnitWithMargin,
        discountPct,
        totalPrice: perUnitWithMargin * 1, // optional: a helpful hint, reducer recalculates
        code: product.code,
        color: selectedColor,
        quantity: 1, // Force quantity to 1 for sample
        print: selectedPrintMethod?.description || "",
        logoColor: logoColor,
        size: selectedSize,
        setupFee:  0,
        dragdrop: selectedFile,
        deliveryDate,
        priceBreaks: selectedPrintMethod?.price_breaks || [],
        printMethodKey: selectedPrintMethod?.key || "",
        freightFee: freightFee,
        userEmail: userEmail || "guest@gmail.com",
        sample: true,
      })
    );

    navigate("/cart");
  };

  return (
    <div className="w-full">
      {/* Consolidated Order Summary */}
      <div className="bg-white rounded-lg border border-primary shadow-sm ">
        {/* Header */}
        <div className="px-6 py-5 border-b border-primary bg-white rounded-t-md">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div>
              <p className="text-xs font-medium text-gray-600 tracking-wide">
                Per unit <br />{" "}
                <span className="text-gray-500">(excl GST)</span>
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
            <div className="text-right flex flex-col">
              <span className="text-xs font-medium text-gray-600 tracking-wide">
                Total
              </span>{" "}
              <span className="text-gray-500 text-sm">
                {currentQuantity} units
              </span>
              <div className="flex items-center justify-end gap-2">
                <p className="sm:text-2xl text-xl font-extrabold text-smallHeader">
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

          <div className="pb-4 mt-2 mb-4">
            <div className="flex items-start gap-2 pt-3 ">
              <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                <FaCheck />
              </p>
              <p className="text-sm">
                <span className="font-bold">Selected Color:</span>{" "}
                {selectedColor ? selectedColor : "No color selected"}
              </p>
            </div>
            <div className="flex items-start gap-2 pt-3 ">
              <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                <FaCheck />
              </p>
              <p className="text-sm">
                <span className="font-bold">Print Method:</span>{" "}
                {selectedPrintMethod?.promodata_decoration || "Not selected"}
              </p>
            </div>
            <div className="flex items-start gap-2 pt-3 ">
              <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                <FaCheck />
              </p>
              <p className="text-sm">
                <span className="font-bold">Selected Size:</span> &nbsp;
                {selectedSize || "Not selected"}
              </p>
            </div>

            <div className="flex items-start gap-2 pt-3 ">
              <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                <FaCheck />
              </p>
              <p className="text-sm">
                <span className="font-bold">Quantity:</span> {currentQuantity}
              </p>
            </div>

            <div className="flex items-start gap-2 pt-3 ">
              <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                <FaCheck />
              </p>
              <p className="text-sm">
                <span className="font-bold">Setup Charge:</span> $
                {setupFee?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="flex items-start gap-2 pt-3 ">
              <p className="text-white bg-primary p-1 rounded-[50%] text-xs ">
                <FaCheck />
              </p>
              <p className="text-sm">
                <span className="font-bold">Freight Charge:</span>
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
