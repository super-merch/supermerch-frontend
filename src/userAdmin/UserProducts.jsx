

import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { IoMdArrowRoundBack } from 'react-icons/io';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const UserProducts = () => {
  const {
    userOrder,
    loading,
    newId,
    setActiveTab,
    backednUrl,
    fetchProductDiscount,
    fetchBatchProductDiscounts,
    setTotalDiscount,
    totalDiscount,
    marginApi,
  } = useContext(AppContext);
  const [checkoutData, setCheckoutData] = useState(null);
  const navigate = useNavigate();

  const fetchOrdersData = () => {
    userOrder.forEach((item) => {
      if (newId === item._id) {
        setCheckoutData(item);
      }
    });
  };

  useEffect(() => {
    fetchOrdersData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [newId, userOrder]);

  const handleReOrder = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/signup');
    return toast.error('Please login to re-order.');
  }

  try {
    // 1) Get all product IDs
    const productIds = checkoutData.products.map(item => item.id);
    
    // 2) Fetch all discounts in one batch request
    const discountsArray = await fetchBatchProductDiscounts(productIds);
    
    // 3) Create discount map for context
    const discountMap = {};
    discountsArray.forEach(item => {
      discountMap[item.productId] = item.discount;
    });
    setTotalDiscount(discountMap);

    // 4) Batch fetch all product details
    const productRequests = checkoutData.products.map(product =>
      axios.get(`${backednUrl}/api/single-product/${product.id}`)
    );
    
    const productResponses = await Promise.all(productRequests);
    
    // 5) Build line items with all data available
    const latestProducts = [];
    const gstRate = 0.1;

    checkoutData.products.forEach((product, index) => {
      const productData = productResponses[index].data.data;
      const discountItem = discountsArray.find(d => d.productId == product.id);
      const discountPct = discountItem ? discountItem.discount : 0;

      // Get base price from price breaks
      const groups = productData.product?.prices?.price_groups || [];
      const base = groups.find((g) => g.base_price) || {};
      const breaks = base.base_price?.price_breaks || [];
      const realPrice = breaks.length ? breaks[0].price : 0;

      // Add margin
      const marginEntry = marginApi[product.id] || { marginFlat: 0 };
      const priceWithMargin = realPrice + marginEntry.marginFlat;

      // Apply discount
      const discountedPrice = priceWithMargin * (1 - discountPct / 100);
      const subTotal = discountedPrice * product.quantity;

      latestProducts.push({
        id: productData.meta.id,
        name: productData.product.name,
        image: product.image,
        quantity: product.quantity,
        price: discountedPrice,
        subTotal,
        discount: discountPct,
        color: product.color,
        print: product.print,
        logoColor: product.logoColor,
        logo: product.logo,
      });
    });

    // 6) Calculate totals
    const netAmount = latestProducts.reduce((sum, p) => sum + p.subTotal, 0);
    const totalDiscountPct = discountsArray.reduce((acc, curr) => acc + curr.discount, 0);
    const discountedAmount = netAmount - (netAmount * totalDiscountPct) / 100;
    const gstAmount = discountedAmount * gstRate;
    const total = discountedAmount + gstAmount;

    console.log('Optimized Re-order calculations:', {
      netAmount,
      totalDiscountPct,
      gstAmount,
      total
    });

    // 7) Build payload and submit
    const reOrderData = {
      user: checkoutData.user,
      billingAddress: checkoutData.billingAddress,
      shippingAddress: checkoutData.shippingAddress,
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
      shipping: checkoutData.shipping,
      discount: totalDiscountPct,
      gst: gstAmount,
      total: total,
    };

    const res = await axios.post(
      `${backednUrl}/api/checkout/checkout`,
      reOrderData,
      { headers: { token } }
    );
    
    toast.success('Order placed successfully!');
    navigate('/');
    
  } catch (err) {
    console.error('Re-order failed:', err.response?.data || err.message);
    toast.error('Re-order failed. Try again.');
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
  //         checkoutData.products.map((item) =>
  //           fetchProductDiscount(item.id)
  //             .then((r) => r.discount || 0)
  //             .catch(() => 0)
  //         )
  //       );
  //     } catch {
  //       return checkoutData.products.map(() => 0);
  //     }
  //   };
  //   const discountsArray = await getDiscounts();

  //   // 2) Build discountMap for context
  //   const discountMap = {};
  //   checkoutData.products.forEach((p, i) => {
  //     discountMap[p.id] = discountsArray[i];
  //   });
  //   setTotalDiscount(discountMap);

  //   // 3) Rebuild line‑items using baseMarginPrice from marginApi
  //   const latestProducts = [];
  //   const gstRate = 0.1;

  //   for (let i = 0; i < checkoutData.products.length; i++) {
  //     const cartItem = checkoutData.products[i];
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
  //     user: checkoutData.user,
  //     billingAddress: checkoutData.billingAddress,
  //     shippingAddress: checkoutData.shippingAddress,
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
  //     shipping: checkoutData.shipping,
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
      <div className='flex items-center justify-center'>
        <div className='w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin'></div>
        <p className='ml-4 text-lg font-semibold'>Loading checkout data...</p>
      </div>
    );
  }

  if (!checkoutData) {
    return <div>No checkout data available for this order.</div>;
  }

  return (
    <div className='w-full px-2 lg:px-8 md:px-8'>
      <div className='flex items-center justify-between'>
        <button
          onClick={() => setActiveTab('orders')}
          className='bg-black flex items-center gap-1 mt-6 text-white w-fit px-3 text-lg py-1.5 hover:bg-red-600 transition duration-75 rounded cursor-pointer uppercase'
        >
          <IoMdArrowRoundBack />
          Back
        </button>
        <div className='mt-6'>
          <button
            onClick={handleReOrder}
            className='px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700'
          >
            Re-order
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className='my-8'>
        <p className='flex flex-wrap items-center gap-2 font-medium text-gray-800'>
          Order{' '}
          <span className='px-2 font-semibold text-black bg-yellow'>
            #{checkoutData._id}
          </span>{' '}
          was placed on{' '}
          <span className='px-2 font-semibold text-black bg-yellow'>
            {new Date(checkoutData.orderDate).toLocaleDateString()}
          </span>{' '}
          and is currently{' '}
          <span
            className={`${
              checkoutData.status === 'Cancelled'
                ? 'text-red-600'
                : 'bg-yellow text-black'
            } font-semibold px-2`}
          >
            {checkoutData.status}
          </span>
        </p>
      </div>

      {/* Order Details Table */}
      <div className='px-3 py-3 border rounded shadow lg:px-6 md:px-6 '>
        <div className='overflow-x-auto '>
          <h2 className='mb-4 text-lg font-semibold'>Order Details</h2>
          <table className='w-full border-gray-300'>
            <thead className='text-left '>
              <tr>
                <th className='border-gray-300 '>Product</th>
                <th className='text-right border-gray-300 '>Total</th>
              </tr>
            </thead>
            <tbody className='text-sm'>
              {checkoutData?.products?.map((product, index) => (
                <tr key={index}>
                  <td>
                    <span className='text-blue-500'>{product?.name}</span>{' '}
                    <span className='font-medium text-gray-800'>
                      x {product?.quantity}
                    </span>
                  </td>
                  <td className='py-2 text-right border-gray-300'>
                    <p>${product?.subTotal.toFixed(2)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className='mt-4'>
          <table className='w-full text-sm'>
            <tbody>
              <tr>
                <td className='py-2 text-gray-600'>Sub Total:</td>
                <td className='py-2 font-medium text-right'>
                  ${checkoutData?.total.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className='py-2 text-gray-600'>Shipping:</td>
                <td className='py-2 font-medium text-right'>
                  ${checkoutData?.shipping}
                </td>
              </tr>
              <tr>
                <td className='py-2 text-gray-600'>Tax:</td>
                <td className='py-2 font-medium text-right'>
                  ${checkoutData?.gst}
                </td>
              </tr>
              <tr>
                <td className='py-2 text-gray-600'>Discount:</td>
                <td className='py-2 font-medium text-right'>
                  ${checkoutData?.discount}
                </td>
              </tr>
              <tr>
                <td className='py-2 text-gray-600'>Total:</td>
                <td className='py-2 text-lg font-bold text-right'>
                  ${checkoutData?.total.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ✅ Re-order Button */}
      </div>

      {/* Address Section */}
      <div className='flex flex-wrap justify-between gap-8 px-2 mt-6 mb-8 lg:justify-around md:justify-around sm:justify-around'>
        {/* Billing Address */}
        <div>
          <h2 className='mb-2 font-semibold'>Billing Address</h2>
          <p className='pb-1'>
            {checkoutData?.user?.firstName} {checkoutData?.user?.lastName}
          </p>
          <p className='pb-1'>{checkoutData.billingAddress?.companyName}</p>
          <p className='pb-1'>{checkoutData.billingAddress?.addressLine}</p>
          <p className='pb-1'>
            {checkoutData.billingAddress?.city},{' '}
            {checkoutData.billingAddress?.state}
          </p>
          <p className='pb-1'>{checkoutData.billingAddress?.country}</p>
          <p className='pb-1'>{checkoutData.billingAddress?.postalCode}</p>
          <p className='pb-1'>{checkoutData.user?.email}</p>
          <p>{checkoutData.user?.phone}</p>
        </div>

        {/* Shipping Address */}
        <div>
          <h2 className='mb-2 font-semibold'>Shipping Address</h2>
          <p className='pb-1'>
            {checkoutData.user.firstName} {checkoutData.user.lastName}
          </p>
          <p className='pb-1'>{checkoutData.shippingAddress?.companyName}</p>
          <p className='pb-1'>{checkoutData.shippingAddress?.addressLine}</p>
          <p className='pb-1'>
            {checkoutData.shippingAddress?.city},{' '}
            {checkoutData.shippingAddress?.state}
          </p>
          <p className='pb-1'>{checkoutData.shippingAddress?.country}</p>
          <p className='pb-1'>{checkoutData.shippingAddress?.postalCode}</p>
          <p className='pb-1'>{checkoutData.user?.email}</p>
          <p>{checkoutData.user?.phone}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProducts;
