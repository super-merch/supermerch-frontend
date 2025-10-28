import React from "react";
import { IoCartOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

const PricingTab = ({
  productId,
  selectedPrintMethod,
  selectedSize,
  currentQuantity,
  availablePriceGroups,
  parseSizing,
  setSelectedPrintMethod,
  setCurrentQuantity,
  setActiveIndex,
  handleAddToCart,
  setShowSizeGuide,
  getPriceForQuantity,
  marginApi,
  discountMultiplier,
  setSelectedSize,
}) => {
  const getTrimmedDescription = (description) => {
    return description.trim().split(" (")[0];
  };

  const printMethods = availablePriceGroups.filter(
    (method) => method.undecorated === false
  );

  const addOns = availablePriceGroups.filter(
    (method) => method.undecorated === true
  );

  return (
    <div className="overflow-x-auto space-y-1 !text-black">
      {availablePriceGroups?.length > 0 && (
        <div className="flex justify-between items-center gap-4">
          <label
            htmlFor="print-method"
            className="w-full my-2  font-medium text-black"
          >
            Print Method:
          </label>
          <select
            id="print-method"
            value={selectedPrintMethod?.key}
            onChange={(e) => {
              const selected = availablePriceGroups.find(
                (method) => method.key === e.target.value
              );
              setSelectedPrintMethod(selected);
              // Reset quantity to first price break of new selection
              if (selected?.price_breaks?.length > 0) {
                setCurrentQuantity(selected.price_breaks[0].qty);
              }
            }}
            className="w-full px-2 py-2 border rounded-md outline-none pr-3"
          >
            {availablePriceGroups?.map((method, index) => (
              <option key={method.key} value={method.key}>
                {getTrimmedDescription(method.description)}
              </option>
            ))}
          </select>
        </div>
      )}{" "}
      {/* {addOns.length > 0 && (
        <div className="flex justify-between items-center gap-4">
          <label htmlFor="print-method" className="w-full my-2  font-medium">
            Add ons:
          </label>
          <select
            id="print-method"
            value={selectedPrintMethod?.key}
            onChange={(e) => {
              const selected = addOns.find(
                (method) => method.key === e.target.value
              );
              setSelectedPrintMethod(selected);
              // Reset quantity to first price break of new selection
              if (selected?.price_breaks?.length > 0) {
                setCurrentQuantity(selected.price_breaks[0].qty);
              }
            }}
            className="w-full px-2 py-2 border rounded-md outline-none pr-3"
          >
            {addOns.map((method, index) => (
              <option key={method.key} value={method.key}>
                {getTrimmedDescription(method.description)}
              </option>
            ))}
          </select>
        </div>
      )} */}
      {parseSizing()?.sizes?.length > 1 && (
        <div className="flex flex-col w-full mb-3">
          <div className="flex justify-between items-center gap-4 my-2">
            <label htmlFor="print-method" className="w-full my-2  font-medium">
              Size:
            </label>
            <select
              id="print-method"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-2 py-2 border rounded-md outline-none"
            >
              {parseSizing().sizes?.map((size, index) => (
                <option key={index} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <p
            className="w-full text-right hover:underline text-sm text-black cursor-pointer"
            onClick={() => setShowSizeGuide(true)}
          >
            * See Size Guide
          </p>
        </div>
      )}
      <span className="text-sm text-black mt-3">
        * The pricing includes 1 col - 1 position
      </span>
      {/* <div className="flex justify-between items-center gap-4 mb-4 ">
                      <label
                        htmlFor="logo-color"
                        className="w-full pt-3 mb-2 font-medium"
                      >
                        Logo Colour:
                      </label>
                      <select
                        value={logoColor}
                        onChange={(e) => setLogoColor(e.target.value)}
                        id="logo-color"
                        className="w-full px-2 py-2 border rounded-md outline-none"
                      >
                        <option>1 Colour Print</option>
                        <option>2 Colour Print</option>
                      </select>
                    </div> */}
      {/* Custom Quantity Input */}
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-black">
            <th className="py-2 pr-4">Select</th>
            <th className="py-2 pr-4">Qty</th>
            <th className="py-2 pr-4">Unit</th>
            <th className="py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {selectedPrintMethod?.price_breaks?.map((item, i) => {
            const marginEntry = marginApi[productId];
            const baseProductPrice = getPriceForQuantity(item.qty);
            const methodUnit =
              selectedPrintMethod.type === "base"
                ? item.price
                : baseProductPrice + item.price;
            const unitWithMargin = marginEntry
              ? methodUnit + marginEntry.marginFlat
              : methodUnit;
            const unitDiscounted = unitWithMargin * discountMultiplier;
            const total = unitDiscounted * item.qty;
            // Check if this price tier applies to the current quantity
            const isSelected =
              currentQuantity >= item.qty &&
              (i === selectedPrintMethod.price_breaks.length - 1 ||
                currentQuantity < selectedPrintMethod.price_breaks[i + 1].qty);
            return (
              <tr
                key={item.qty}
                className={`border-t cursor-pointer hover:bg-blue-50/80 text-black ${
                  isSelected ? "bg-blue-50/80" : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  setCurrentQuantity(item.qty);
                  setActiveIndex(i);
                }}
              >
                <td className="py-2 pr-4 align-middle text-md text-black">
                  <input
                    type="radio"
                    name="priceTier"
                    aria-label={`Select ${item.qty}+ tier`}
                    checked={isSelected}
                    onChange={() => {
                      setCurrentQuantity(item.qty);
                      setActiveIndex(i);
                    }}
                  />
                </td>
                <td className="py-2 pr-4 align-middle text-md text-black">
                  {item.qty}+
                </td>
                <td className="py-2 pr-4 align-middle text-md text-black">
                  ${unitDiscounted.toFixed(2)}
                </td>
                <td className="py-2 align-middle text-md text-black">
                  ${total.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-4">
          <label className="md:text-lg text-md font-medium text-gray-700 whitespace-nowrap">
            Order Quantity:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={currentQuantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setCurrentQuantity(value);
                // Find the appropriate price tier for this quantity
                const sortedBreaks = [
                  ...(selectedPrintMethod?.price_breaks || []),
                ].sort((a, b) => a.qty - b.qty);
                let newActiveIndex = 0;
                for (let i = 0; i < sortedBreaks.length; i++) {
                  if (value >= sortedBreaks[i].qty) {
                    newActiveIndex = i;
                  } else {
                    break;
                  }
                }
                setActiveIndex(newActiveIndex);
              }}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md text-md md:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter qty"
            />
            <span className="text-md md:text-lg text-black">pieces</span>
          </div>
          {/* <div className="ml-auto text-sm text-black">
                          <Button>Large Order?</Button>
                        </div> */}
        </div>
      </div>
      {/* Enhanced Drag and Drop Section */}
      {/* <div
                      className={`mt-2 px-6 py-2 mb-4 text-center border-2 border-dashed cursor-pointer bg-dots transition-all duration-200 ${
                        isDragging
                          ? "border-blue-500 bg-blue-50"
                          : "border-smallHeader"
                      }`}
                      onClick={handleDivClick}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <img
                        src={selectedFile || "/drag.png"}
                        alt="Uploaded File"
                        className="flex m-auto max-w-[100px] max-h-[100px] object-contain"
                      />
                      <p className=" text-lg font-medium text-smallHeader">
                        {selectedFile
                          ? "Logo image Uploaded"
                          : isDragging
                          ? "Drop files here"
                          : "Click or Drag your Artwork/Logo to upload"}
                      </p>
                      <p className="text-smallHeader  m-auto text-sm">
                        Supported formats: AI, EPS, SVG, PDF, JPG, JPEG, PNG.
                        Max file size: 16 MB
                      </p>
                      <input
                        type="file"
                        id="fileUpload"
                        accept=".ai, .eps, .svg, .pdf, .jpg, .jpeg, .png"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div> */}
      <Link
        onClick={(e) => {
          handleAddToCart(e);
        }}
        className="flex items-center justify-center w-full gap-3 px-2 py-3 mt-6 text-white rounded-sm cursor-pointer bg-primary hover:bg-primary/80 transition-all duration-300"
      >
        <button className="text-lg uppercase">Add to cart</button>
        <IoCartOutline className="text-xl" />
      </Link>
    </div>
  );
};

export default PricingTab;
