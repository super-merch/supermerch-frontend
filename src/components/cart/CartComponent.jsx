import React, { useRef, useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiPlus } from "react-icons/fi";
import { FiMinus } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { IoArrowBack } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";

import {
  updateCartItemQuantity,
  removeFromCart,
  updateCartItemImage,
  incrementQuantity,
  decrementQuantity,
} from "../../redux/slices/cartSlice";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const CartComponent = () => {
  const { totalDiscount } = useContext(AppContext);
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const [value, setValue] = useState("");

  const [customQuantities, setCustomQuantities,orderDone] = useState({});

  useEffect(() => {
    const quantities = {};
    items.forEach((item) => {
      quantities[item.id] = item.quantity;
    });
    setCustomQuantities(quantities);
  }, [items]);

  const totalDiscountPercent = items.reduce(
    (sum, item) => sum + (totalDiscount[item.id] || 0),
    0
  );
  

  // 3) Compute your base total:
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.totalPrice || item.price * item.quantity),
    0
  );

  // 4) Apply totalDiscountPercent *exactly* as before:
  const discountedAmount =
    totalAmount - (totalAmount * totalDiscountPercent) / 100;
  const gstAmount = discountedAmount * 0.1; // 10%
  const total = discountedAmount + gstAmount;

  const [uploadedImage, setUploadedImage] = useState("/drag.png");
  const fileInputRef = useRef(null);

  const handleFileChange = (e, productId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        dispatch(
          updateCartItemImage({ id: productId, dragdrop: reader.result })
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };
  

  // Handle direct input changes
  const handleQuantityChange = (e, id) => {
    const value = e.target.value;
    setCustomQuantities({
      ...customQuantities,
      [id]: value === "" ? "" : parseInt(value, 10),
    });
  };

  const handleUpdateCart = () => {
    Object.entries(customQuantities).forEach(([id, quantity]) => {
      dispatch(
        updateCartItemQuantity({
          id: Number(id),
          quantity: Math.max(quantity, 1),
        })
      );
    });
  };

  return (
    <div className="flex flex-wrap justify-between gap-4 Mycontainer md:flex-wrap lg:flex-nowrap">
      <div className="w-full max-w-5xl">
        <h2 className="mt-2 mb-3 text-base font-medium">Shopping Cart</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="flex flex-col lg:table-header-group md:table-header-group sm:table-header-group">
              <tr className="flex bg-activeFilter lg:table-row md:table-row sm:table-row">
                <th className="flex-1 p-3 pl-4 text-xs font-medium text-left lg:pl-20 md:pl-20 lg:table-cell">
                  PRODUCTS
                </th>
                <th className="flex-1 p-3 text-xs font-medium lg:table-cell">
                  LOGO UPDATE
                </th>
                <th className="flex-1 p-3 text-xs font-medium lg:table-cell">
                  PRICE
                </th>
                <th className="flex-1 p-3 text-xs font-medium lg:table-cell">
                  QUANTITY
                </th>
                <th className="flex-1 p-3 text-xs font-medium lg:table-cell">
                  SUB-TOTAL
                </th>
              </tr>
            </thead>
            <tbody className="flex flex-col lg:table-header-group md:table-header-group sm:table-header-group">
              {items.map((item) => {
                const subTotal = item.totalPrice || item.price * item.quantity;

                return (
                  <tr key={item.id}>
                    <td className="flex items-start p-3 space-x-3">
                      <button
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="p-1 text-lg border rounded-full border-category"
                      >
                        <IoClose className="text-category" />
                      </button>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12"
                      />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        {/* <p className='py-1 text-xs font-normal'>{item.code}</p> */}
                        <p className="text-xs font-normal">
                          COLOUR: {item.color}
                        </p>
                        <p className="text-xs font-normal">
                          PRINT METHOD: {item.print}
                        </p>
                        <p className="text-xs font-normal">
                          LOGO COLOUR: {item.logoColor}
                        </p>
                        <p className="text-xs font-normal">
                          Est Delivery Date: {item.deliveryDate}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div
                        onClick={() => fileInputRef.current.click()}
                        className="cursor-pointer"
                      >
                        <img
                          key={item.dragdrop || uploadedImage}
                          src={item.dragdrop || uploadedImage}
                          alt="Upload"
                          className="flex w-10 h-10 p-2 m-auto lg:w-16 md:w-16 lg:h-16 md:h-16 bg-drag"
                        />
                      </div>
                      <input
                        type="file"
                        id="fileUpload"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => handleFileChange(e, item.id)}
                        accept="image/*"
                      />
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-center">
                        ${item.price.toFixed(2)}
                        
                      </p>
                    </td>
                    
                    <td className="p-3">
                      <div className="flex w-28 m-auto justify-center gap-3 bg-line border border-border2 items-center py-2.5">
                        <button
                          onClick={() =>
                            dispatch(
                              incrementQuantity({
                                id: item.id,
                              })
                            )
                          }
                        >
                          <FiPlus />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={customQuantities[item.id]}
                          onChange={(e) => handleQuantityChange(e, item.id)}
                          className="w-10 text-center outline-none no-arrows"
                          placeholder="0"
                        />
                        <button
                          onClick={() =>
                            dispatch(
                              decrementQuantity({
                                id: item.id,
                              })
                            )
                          }
                        >
                          <FiMinus />
                        </button>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-center">
                      $
                      {subTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
          <Link
            to={"/shop"}
            className="flex items-center px-6 justify-center gap-2 py-3.5 text-heading border-4 border-heading"
          >
            <IoArrowBack className="text-xl" />
            <button className="text-sm font-bold">RETURN TO SHOP</button>
          </Link>
          <button
            onClick={handleUpdateCart}
            className="px-6 py-4 text-sm font-bold border-4 rounded text-smallHeader border-smallHeader hover:bg-gray-100"
          >
            UPDATE CART
          </button>
        </div>
      </div>
      <div className="w-full mt-10 max-w-96">
        <div className="p-6 bg-white border">
          <h3 className="pb-2 mb-4 text-lg font-medium border-b-4 text-brand">
            Cart Totals
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-normal text-stock">Sub-total:</span>
              <span className="text-sm font-medium text-brand">
                $
                {totalAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-normal text-stock">Shipping:</span>
              <span className="text-sm font-medium text-brand">Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-normal text-stock">Discount:</span>
              <span className="text-sm font-medium text-brand">
                {totalDiscountPercent}%
              </span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-sm font-normal text-stock">GST(10%):</span>
              <span className="text-sm font-medium text-brand">
                ${gstAmount.toFixed(2)}
              </span>
            </div>
            <hr />
          </div>
          <div>
            <input
              type="text"
              value={value}
              placeholder="Enter promo code"
              className="w-full p-3 mt-4 border outline-none"
              onChange={handleChange}
            />
            <button className="w-full py-4 mt-4 text-sm font-bold text-white bg-pink">
              APPLY COUPON
            </button>
          </div>
          <div className="flex justify-between mt-8 text-lg font-bold">
            <span className="font-normal text-brand">Total:</span>
            <span className="font-semibold text-brand">
              $
              {total.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <Link
            to={"/checkout"}
            className="flex items-center justify-center w-full gap-2 py-4 mt-8 text-white bg-smallHeader"
          >
            <button  >PROCEED TO CHECKOUT</button>
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartComponent;
