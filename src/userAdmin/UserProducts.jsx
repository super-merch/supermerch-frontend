import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { IoMdArrowRoundBack } from "react-icons/io";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UserProducts = () => {
  const {
    userOrder,
    loading,
    newId,
    setActiveTab,
    backednUrl,
    fetchProductDiscount,
    setTotalDiscount,
    totalDiscount,
    marginApi,
  } = useContext(AppContext);
  const navigate = useNavigate();

  const handleReOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signup");
      return toast.error("Please login to re-order.");
    }

    const batchPromises = async (promises, batchSize = 10) => {
      const results = [];

      for (let i = 0; i < promises.length; i += batchSize) {
        const batch = promises.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch);
        results.push(...batchResults);
      }

      return results;
    };

    const getDiscount = async () => {
      try {
        const discountPromises = userOrder.products?.map((item) =>
          fetchProductDiscount(item.id)
        );

        // Process in batches of 10 concurrent requests
        const discountResults = await batchPromises(discountPromises, 10);

        return discountResults.map((result) => result.discount || 0);
      } catch (error) {
        console.error("Error fetching discounts:", error);
        return userOrder.products.map(() => 0);
      }
    };

    const discountsArray = await getDiscount();

    // 2) Populate context.totalDiscount as { [id]: pct }
    const discountMap = {};
    userOrder.products.forEach((p, i) => {
      discountMap[p.id] = discountsArray[i];
    });
    setTotalDiscount(discountMap);

    // 3) Build line items with margin + discount baked in
    const latestProducts = [];
    const gstRate = 0.1;

    for (let i = 0; i < userOrder.products.length; i++) {
      const product = userOrder.products[i];
      const discountPct = discountsArray[i];

      const resp = await axios.get(
        `${backednUrl}/api/single-product/${product.id}`
      );
      const data = resp.data.data;

      // get base price from your price breaks
      const groups = data.product?.prices?.price_groups || [];
      const base = groups.find((g) => g.base_price) || {};
      const breaks = base.base_price?.price_breaks || [];
      const realPrice = breaks.length ? breaks[0].price : 0;

      // 3a) add margin
      const marginEntry = marginApi[product.id] || { marginFlat: 0 };
      const priceWithMargin = realPrice + marginEntry.marginFlat;

      // 3b) subtract this product’s discount
      const discountedPrice = priceWithMargin * (1 - discountPct / 100);

      // 3c) line‐item total
      const subTotal = discountedPrice * product.quantity;

      latestProducts.push({
        id: data.meta.id,
        name: data.product.name,
        image: product.image,
        quantity: product.quantity,
        price: discountedPrice, // final per‐unit
        subTotal, // final line total
        discount: discountPct, // % for admin
        color: product.color,
        print: product.print,
        logoColor: product.logoColor,
        logo: product.logo,
      });
    }

    const netAmount = latestProducts.reduce((sum, p) => sum + p.subTotal, 0);

    // Step 1: Get combined discount percentage (e.g., 3 + 5 = 8)
    const totalDiscountPct = discountsArray.reduce(
      (acc, curr) => acc + curr,
      0
    );

    // Step 2: Apply discount to netAmount
    const discountedAmount = netAmount - (netAmount * totalDiscountPct) / 100;

    // Step 3: Apply GST to discounted amount
    const gstAmount = discountedAmount * gstRate;

    // Step 4: Final total
    const total = discountedAmount + gstAmount;

    // 5) Build your payload
    const reOrderData = {
      user: userOrder.user,
      billingAddress: userOrder.billingAddress,
      shippingAddress: userOrder.shippingAddress,
      products: latestProducts.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        quantity: p.quantity,
        price: p.price,
        subTotal: p.subTotal,
        discount: p.discount,
        color: p.color,
        print: p.print,
        logoColor: p.logoColor,
        logo: p.logo,
      })),
      shipping: userOrder.shipping,
      discount: totalDiscountPct, // <— A single number now
      gst: gstAmount,
      total: total,
    };

    try {
      const res = await axios.post(
        `${backednUrl}/api/checkout/checkout`,
        reOrderData,
        { headers: { token } }
      );
      toast.success("Order placed successfully!");
      navigate("/");
    } catch (err) {
      console.error("Re-order failed:", err.response?.data || err.message);
      toast.error("Re-order failed. Try again.");
    }
  };

  // const handleReOrder = async () => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     navigate('/signup');
  //     toast.error('Please login to re-order.');
  //     return;
  //   }

  //   // 1) Fetch current discounts for each product
  //   const getDiscounts = async () => {
  //     try {
  //       return await Promise.all(
  //         userOrder.products.map((item) =>
  //           fetchProductDiscount(item.id)
  //             .then((r) => r.discount || 0)
  //             .catch(() => 0)
  //         )
  //       );
  //     } catch {
  //       return userOrder.products.map(() => 0);
  //     }
  //   };
  //   const discountsArray = await getDiscounts();

  //   // 2) Build discountMap for context
  //   const discountMap = {};
  //   userOrder.products.forEach((p, i) => {
  //     discountMap[p.id] = discountsArray[i];
  //   });
  //   setTotalDiscount(discountMap);

  //   // 3) Rebuild line‑items using baseMarginPrice from marginApi
  //   const latestProducts = [];
  //   const gstRate = 0.1;

  //   for (let i = 0; i < userOrder.products.length; i++) {
  //     const cartItem = userOrder.products[i];
  //     const discountPct = discountsArray[i];

  //     // fetch fresh product data
  //     const resp = await axios.get(
  //       `${backednUrl}/api/single-product/${cartItem.id}`
  //     );
  //     const data = resp.data.data;

  //     // pull backend price+margin+discount
  //     const marginEntry = marginApi[cartItem.id] || {};
  //     const finalUnitPrice = Number(marginEntry.baseMarginPrice ?? 0);

  //     // line subtotal
  //     const subTotal = finalUnitPrice * cartItem.quantity;

  //     latestProducts.push({
  //       id: data.meta.id,
  //       name: data.product.name,
  //       image: cartItem.image,
  //       quantity: cartItem.quantity,
  //       price: finalUnitPrice, // already includes margin & discount
  //       subTotal, // per‑line total
  //       discount: discountPct, // for admin/reference
  //       color: cartItem.color,
  //       print: cartItem.print,
  //       logoColor: cartItem.logoColor,
  //       logo: cartItem.logo,
  //     });
  //   }
  //   const netAmount = latestProducts.reduce((sum, p) => sum + p.subTotal, 0);
  //   //   // const validDiscount = latestProducts
  //   //   //   .filter((p) => p.discount && p.discount > 0)
  //   //   //   .map((p) => p.subTotal * (p.discount / 100));
  //   //   //   const totalDiscount = validDiscount.reduce((sum, val) => sum + val, 0);

  //     const discountedAmount = netAmount - (netAmount * discountsArray) / 100;

  //     const gstAmount =  discountedAmount * gstRate; // 10%
  //     const total = discountedAmount + gstAmount;

  //     console.log(netAmount, 'netAmount Re‑Order'); // ~148.09
  //     console.log(discountedAmount, 'discountedAmount Re‑Order');
  //     console.log(gstAmount, 'gstAmount Re‑Order'); // ~14.81
  //     console.log(total, 'total Re‑Order'); // ~162.90

  //   // 5) Build payload
  //   const reOrderData = {
  //     user: userOrder.user,
  //     billingAddress: userOrder.billingAddress,
  //     shippingAddress: userOrder.shippingAddress,
  //     products: latestProducts.map((p) => ({
  //       id: p.id,
  //       name: p.name,
  //       image: p.image,
  //       quantity: p.quantity,
  //       price: p.price,
  //       subTotal: p.subTotal,
  //       discount: p.discount,
  //       color: p.color,
  //       print: p.print,
  //       logoColor: p.logoColor,
  //       logo: p.logo,
  //     })),
  //     shipping: userOrder.shipping,
  //     discountMap,
  //     gst: gstAmount,
  //     total,
  //   };

  //   console.log('reOrderData →', reOrderData);

  //   // 6) Send to backend
  //   // try {
  //   //   await axios.post(`${backednUrl}/api/checkout/checkout`, reOrderData, {
  //   //     headers: { token },
  //   //   });
  //   //   toast.success('Order placed successfully!');
  //   //   navigate('/');
  //   // } catch (err) {
  //   //   console.error('Re-order failed:', err.response?.data || err.message);
  //   //   toast.error('Re-order failed. Try again.');
  //   // }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        <p className="ml-4 text-lg font-semibold">Loading checkout data...</p>
      </div>
    );
  }

  if (!userOrder) {
    return <div>No checkout data available for this order.</div>;
  }

  return (
    <div className="w-full px-2 lg:px-8 md:px-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab("dashboard")}
          className="bg-black flex items-center gap-1 mt-6 text-white w-fit px-3 text-lg py-1.5 hover:bg-red-600 transition duration-75 rounded cursor-pointer uppercase"
        >
          <IoMdArrowRoundBack />
          Back
        </button>
        <div className="mt-6">
          <button
            onClick={handleReOrder}
            className="px-4 py-2 font-semibold text-white bg-primary rounded hover:bg-primary/90"
          >
            Re-order
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="my-8">
        <p className="flex flex-wrap items-center gap-2 font-medium text-gray-800">
          Order{" "}
          <span className="px-2 font-semibold text-black bg-yellow">
            {userOrder.orderId}
          </span>{" "}
          was placed on{" "}
          <span className="px-2 font-semibold text-black bg-yellow">
            {new Date(userOrder.orderDate).toLocaleDateString()}
          </span>{" "}
          and is currently{" "}
          <span
            className={`${
              userOrder.status === "Cancelled"
                ? "text-red-600"
                : "bg-yellow text-black"
            } font-semibold px-2`}
          >
            {userOrder.status}
          </span>
        </p>
      </div>

      {/* Order Details Table */}
      <div className="px-3 py-3 border rounded shadow lg:px-6 md:px-6 ">
        <div className="overflow-x-auto ">
          <h2 className="mb-4 text-lg font-semibold">Order Details</h2>
          <table className="w-full border-gray-300">
            <thead className="text-left ">
              <tr>
                <th className="border-gray-300 ">Product</th>
                <th className="text-right border-gray-300 ">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {userOrder?.products?.map((product, index) => (
                <tr key={index}>
                  <td>
                    <span className="text-blue-500">{product?.name}</span>{" "}
                    <span className="font-medium text-gray-800">
                      x {product?.quantity}
                    </span>
                    <span className="">
                      <img src={product.image} className="w-20" alt="" />
                    </span>
                  </td>
                  <td className="py-2 text-right border-gray-300">
                    <p>${product?.subTotal.toFixed(2)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-2 text-gray-600">Sub Total:</td>
                <td className="py-2 font-medium text-right">
                  ${userOrder?.total.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Shipping:</td>
                <td className="py-2 font-medium text-right">
                  ${userOrder?.shipping}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Tax:</td>
                <td className="py-2 font-medium text-right">
                  ${userOrder?.gst}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Discount:</td>
                <td className="py-2 font-medium text-right">
                  ${userOrder?.discount}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Total:</td>
                <td className="py-2 text-lg font-bold text-right">
                  ${userOrder?.total.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ✅ Re-order Button */}
      </div>

      {/* Address Section */}
      <div className="flex flex-wrap justify-between gap-8 px-2 mt-6 mb-8 lg:justify-around md:justify-around sm:justify-around">
        {/* Billing Address */}
        <div>
          <h2 className="mb-2 font-semibold">Billing Address</h2>
          <p className="pb-1">
            {userOrder?.user?.firstName} {userOrder?.user?.lastName}
          </p>
          <p className="pb-1">{userOrder.billingAddress?.companyName}</p>
          <p className="pb-1">{userOrder.billingAddress?.addressLine}</p>
          <p className="pb-1">
            {userOrder.billingAddress?.city},{" "}
            {userOrder.billingAddress?.state}
          </p>
          <p className="pb-1">{userOrder.billingAddress?.country}</p>
          <p className="pb-1">{userOrder.billingAddress?.postalCode}</p>
          <p className="pb-1">{userOrder.user?.email}</p>
          <p>{userOrder.user?.phone}</p>
        </div>

        {/* Shipping Address */}
        <div>
          <h2 className="mb-2 font-semibold">Shipping Address</h2>
          <p className="pb-1">
            {userOrder.user.firstName} {userOrder.user.lastName}
          </p>
          <p className="pb-1">{userOrder.shippingAddress?.companyName}</p>
          <p className="pb-1">{userOrder.shippingAddress?.addressLine}</p>
          <p className="pb-1">
            {userOrder.shippingAddress?.city},{" "}
            {userOrder.shippingAddress?.state}
          </p>
          <p className="pb-1">{userOrder.shippingAddress?.country}</p>
          <p className="pb-1">{userOrder.shippingAddress?.postalCode}</p>
          <p className="pb-1">{userOrder.user?.email}</p>
          <p>{userOrder.user?.phone}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProducts;
