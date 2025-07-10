import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa6';
import axios from 'axios';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import CreditCard from '../creditcard/CreditCard';


const Checkout = () => {
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);

  const { token, addressData, backednUrl, totalDiscount } = useContext(AppContext);

  const [checkoutTab, setCheckoutTab] = useState('billing');

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
  } = useForm({
    defaultValues: {
      billing: {
        firstName: addressData?.firstName || '',
        lastName: addressData?.lastName || '',
        companyName: addressData?.companyName || '',
        address: addressData?.addressLine || '',
        country: addressData?.country || '',
        region: addressData?.state || '',
        city: addressData?.city || '',
        zip: addressData?.postalCode || '',
        email: addressData?.email || '',
        phone: addressData?.phone || '',
      },
      shipping: {
        firstName: '',
        lastName: '',
        companyName: '',
        address: '',
        country: '',
        region: '',
        city: '',
        zip: '',
        email: '',
        phone: '',
      },
      paymentMethod: 'card',
    },
  });

  const paymentMethod = watch('paymentMethod');
  
  const totalDiscountPercent = items.reduce(
    (sum, item) => sum + (totalDiscount[item.id] || 0),
    0
  );

  // 3) Compute your base total:
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 4) Apply totalDiscountPercent *exactly* as before:
  const discountedAmount =
    totalAmount - (totalAmount * totalDiscountPercent) / 100;
  const gstAmount = discountedAmount * 0.1; // 10%
  const total = discountedAmount + gstAmount;

  const onSubmit = async (data) => {
    const checkoutData = {
      user: {
        firstName: data.billing.firstName || addressData.firstName,
        lastName: data.billing.lastName || addressData.lastName,
        email: data.billing.email || addressData.email,
        phone: data.billing.phone || addressData.phone,
      },
      billingAddress: {
        country: data.billing.country || addressData.country,
        state: data.billing.region || addressData.state,
        city: data.billing.city || addressData.city,
        postalCode: data.billing.zip || addressData.postalCode,
        addressLine: data.billing.address || addressData.addressLine,
        companyName: data.billing.companyName || addressData.companyName,
      },
      shippingAddress: {
        firstName: data.shipping.firstName,
        lastName: data.shipping.lastName,
        country: data.shipping.country,
        state: data.shipping.region,
        city: data.shipping.city,
        postalCode: data.shipping.zip,
        addressLine: data.shipping.address,
        companyName: data.shipping.companyName,
        email: data.shipping.email,
        phone: data.shipping.phone,
      },
      products: items.map((item) => ({
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
        subTotal: item.price * item.quantity,
        color: item.color,
        print: item.print,
        logoColor: item.logoColor,
        logo: item.dragdrop,
        id: item.id,
      })),
      shipping: 0,
      discount: totalDiscountPercent,
      gst: gstAmount,
      // tax,
      total,
    };

    if (!token) {
      navigate('/signup');
      return toast.error('Please Login to continue');
    }

    try {
      const response = await axios.post(
        `${backednUrl}/api/checkout/checkout`,
        checkoutData,
        { headers: { token } }
      );
      navigate('/');
      toast.success('Order placed successfully!');
      
    } catch (error) {
      console.error('Order Failed:', error.response?.data || error.message);
      alert('Failed to place the order. Please try again.');
    }
  };

  const isBillingComplete = () => {
    const billing = getValues('billing');
    return (
      billing.firstName &&
      billing.lastName &&
      billing.address &&
      billing.country &&
      billing.region &&
      billing.city &&
      billing.zip &&
      billing.email &&
      billing.phone
    );
  };

  const [showCreditCard, setShowCreditCard] = useState(true);

  return (
    <div className='py-8 Mycontainer'>
      <h2 className='mb-6 text-3xl font-bold'>Checkout</h2>
      <div className='flex items-center'>
        <div className='flex items-center p-1 space-x-1 overflow-x-auto text-sm text-black rtl:space-x-reverse bg-slate-300/50 rounded-xl'>
          <button
            role='tab'
            type='button'
            className={`flex whitespace-nowrap items-center h-8 px-5 font-medium rounded-lg outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-inset text-yellow-600 transition-all
              ${
                checkoutTab === 'billing' && 'shadow bg-smallHeader text-white'
              }`}
            onClick={() => setCheckoutTab('billing')}
            aria-selected=''
          >
            Billing
          </button>

          <button
            role='tab'
            type='button'
            className={`flex whitespace-nowrap items-center h-8 px-5 font-medium rounded-lg outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-inset text-yellow-600 transition-all ${
              checkoutTab === 'shipping' && 'shadow bg-smallHeader text-white'
            }`}
            onClick={() => setCheckoutTab('shipping')}
          >
            Shipping
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-wrap items-start gap-5 lg:flex-nowrap'>
          {checkoutTab === 'billing' && (
            <div className='w-full lg:w-[70%] border lg:p-6 md:p-6 p-3'>
              <h3 className='mb-4 text-xl font-medium'>Billing Information</h3>
              <div className='grid items-center gap-4 lg:grid-cols-3 md:grid-cols-3'>
                <div>
                  <p className='pb-1'>
                    First Name <span className='text-red-600 '>*</span>{' '}
                  </p>
                  <input
                    type='text'
                    defaultValue={addressData?.firstName || ''}
                    placeholder='First Name'
                    {...register('billing.firstName', { required: true })}
                    className='w-full p-2 border'
                  />
                </div>
                <div>
                  <p className='pb-1'>
                    Last name <span className='text-red-600 '>*</span>{' '}
                  </p>
                  <input
                    type='text'
                    placeholder='Last Name'
                    {...register('billing.lastName')}
                    className='w-full p-2 border'
                  />
                </div>
                <div>
                  <p className='pb-1'>
                    Company Name <span className='text-red-600 '>*</span>{' '}
                  </p>
                  <input
                    type='text'
                    placeholder='Company Name'
                    {...register('billing.companyName')}
                    className='w-full p-2 border '
                  />
                </div>
              </div>
              <div className='mt-4'>
                <p>
                  Adress <span className='text-red-600 '>*</span>
                </p>
                <input
                  type='text'
                  placeholder='Address'
                  {...register('billing.address', { required: true })}
                  className='w-full p-2 mt-2 border'
                />
              </div>
              <div className='grid grid-cols-1 gap-4 mt-4 lg:grid-cols-4 md::grid-cols-4 sm:grid-cols-3'>
                <div className='flex flex-col'>
                  <label htmlFor='country' className='mb-1 text-sm'>
                    Country <span className='text-red-600 '>*</span>
                  </label>
                  <select
                    id='country'
                    {...register('billing.country', { required: true })}
                    className='p-2 border'
                  >
                    {addressData?.country && (
                      <option value={addressData?.country}>
                        {addressData?.country}
                      </option>
                    )}
                    <option value='Australia'>Australia</option>
                  </select>
                </div>
                <div className='flex flex-col'>
                  <label htmlFor='region' className='mb-1 text-sm'>
                    Region/State <span className='text-red-600 '>*</span>
                  </label>
                  <select
                    id='region'
                    {...register('billing.region', { required: true })}
                    className='p-2 border'
                  >
                    {addressData?.state && (
                      <option value={addressData?.state}>
                        {addressData?.state}
                      </option>
                    )}
                    <option value='New South Wales'>New South Wales</option>
                    <option value='Victoria'>Victoria</option>
                    <option value='Queensland'>Queensland</option>
                    <option value='Western Australia'>Western Australia</option>
                    <option value='South Australia'>South Australia</option>
                    <option value='Tasmania'>Tasmania</option>
                    <option value='Northern Territory'>
                      Northern Territory
                    </option>
                    <option value='Australian Capital Territory'>
                      Australian Capital Territory
                    </option>
                  </select>
                </div>
                <div className='flex flex-col'>
                  <label htmlFor='city' className='mb-1 text-sm'>
                    City <span className='text-red-600 '>*</span>
                  </label>
                  <select
                    id='city'
                    {...register('billing.city', { required: true })}
                    className='p-2 border'
                  >
                    {addressData?.city && (
                      <option value={addressData.city}>
                        {addressData?.city}
                      </option>
                    )}
                    <option value='Sydney'>Sydney</option>
                    <option value='Melbourne'>Melbourne</option>
                    <option value='Brisbane'>Brisbane</option>
                    <option value='Perth'>Perth</option>
                    <option value='Adelaide'>Adelaide</option>
                    <option value='Gold Coast'>Gold Coast</option>
                    <option value='Canberra'>Canberra</option>
                    <option value='Newcastle'>Newcastle</option>
                    <option value='Wollongong'>Wollongong</option>
                    <option value='Hobart'>Hobart</option>
                  </select>
                </div>
                <div className='flex flex-col'>
                  <label htmlFor='zip' className='mb-1 text-sm'>
                    Postal Code <span className='text-red-600 '>*</span>
                  </label>
                  <input
                    id='zip'
                    type='text'
                    placeholder=''
                    {...register('billing.zip', { required: true })}
                    className='p-2 border'
                  />
                </div>
              </div>
              <div className='grid gap-4 mt-4 lg:grid-cols-2 md:grid-cols-2'>
                <div>
                  <p>
                    Email <span className='text-red-600 '>*</span>
                  </p>
                  <input
                    type='email'
                    placeholder='Email'
                    {...register('billing.email', { required: true })}
                    className='w-full p-2 mt-1 border'
                  />
                </div>
                <div>
                  <p>
                    Phone Number <span className='text-red-600 '>*</span>
                  </p>
                  <input
                    type='tel'
                    placeholder='Phone Number'
                    {...register('billing.phone', { required: true })}
                    className='w-full p-2 mt-1 border'
                  />
                </div>
              </div>
            </div>
          )}

          {checkoutTab === 'shipping' && (
            <div className='w-full lg:w-[70%] border lg:p-6 md:p-6 p-3'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-xl font-medium'>Shipping Information</h3>
                <button
                  type='button'
                  onClick={() => {
                    const billingValues = getValues('billing');
                    Object.keys(billingValues).forEach((key) => {
                      setValue(`shipping.${key}`, billingValues[key]);
                    });
                  }}
                  disabled={!isBillingComplete()}
                  className={`inline-flex justify-center items-center gap-2 font-medium px-4 py-2 text-sm text-white rounded ${
                    isBillingComplete()
                      ? 'bg-smallHeader'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FaCheck className='text-base' />
                  Copy Billing Details
                </button>
              </div>
              <div className='grid items-center gap-4 lg:grid-cols-3 md:grid-cols-3'>
                <div>
                  <p className='pb-1'>
                    First Name <span className='text-red-600 '>*</span>{' '}
                  </p>
                  <input
                    type='text'
                    placeholder='First Name'
                    {...register('shipping.firstName', { required: true })}
                    className='w-full p-2 border'
                  />
                </div>
                <div>
                  <p className='pb-1'>
                    Last name <span className='text-red-600 '>*</span>{' '}
                  </p>
                  <input
                    type='text'
                    placeholder='Last Name'
                    {...register('shipping.lastName')}
                    className='w-full p-2 border'
                  />
                </div>
                <div>
                  <p className='pb-1'>
                    Company Name <span className='text-red-600 '>*</span>{' '}
                  </p>
                  <input
                    type='text'
                    placeholder='Company Name'
                    {...register('shipping.companyName')}
                    className='w-full p-2 border '
                  />
                </div>
              </div>
              <div className='mt-4'>
                <p>
                  Adress <span className='text-red-600 '>*</span>
                </p>
                <input
                  type='text'
                  placeholder='Address'
                  {...register('shipping.address', { required: true })}
                  className='w-full p-2 mt-2 border'
                />
              </div>
              <div className='grid grid-cols-1 gap-4 mt-4 lg:grid-cols-4 md::grid-cols-4 sm:grid-cols-3'>
                <div className='flex flex-col'>
                  <label htmlFor='country' className='mb-1 text-sm'>
                    Country <span className='text-red-600 '>*</span>
                  </label>
                  <select
                    id='country'
                    {...register('shipping.country', { required: true })}
                    className='p-2 border'
                  >
                    {addressData?.country && (
                      <option value={addressData?.country}>
                        {addressData?.country}
                      </option>
                    )}
                    <option value='Australia'>Australia</option>
                  </select>
                </div>
                <div className='flex flex-col'>
                  <label htmlFor='region' className='mb-1 text-sm'>
                    Region/State <span className='text-red-600 '>*</span>
                  </label>
                  <select
                    id='region'
                    {...register('shipping.region', { required: true })}
                    className='p-2 border'
                  >
                    {addressData?.state && (
                      <option value={addressData?.state}>
                        {addressData?.state}
                      </option>
                    )}
                    <option value='New South Wales'>New South Wales</option>
                    <option value='Victoria'>Victoria</option>
                    <option value='Queensland'>Queensland</option>
                    <option value='Western Australia'>Western Australia</option>
                    <option value='South Australia'>South Australia</option>
                    <option value='Tasmania'>Tasmania</option>
                    <option value='Northern Territory'>
                      Northern Territory
                    </option>
                    <option value='Australian Capital Territory'>
                      Australian Capital Territory
                    </option>
                  </select>
                </div>
                <div className='flex flex-col'>
                  <label htmlFor='city' className='mb-1 text-sm'>
                    City <span className='text-red-600 '>*</span>
                  </label>
                  <select
                    id='city'
                    {...register('shipping.city', { required: true })}
                    className='p-2 border'
                  >
                    {addressData?.city && (
                      <option value={addressData.city}>
                        {addressData?.city}
                      </option>
                    )}
                    <option value='Sydney'>Sydney</option>
                    <option value='Melbourne'>Melbourne</option>
                    <option value='Brisbane'>Brisbane</option>
                    <option value='Perth'>Perth</option>
                    <option value='Adelaide'>Adelaide</option>
                    <option value='Gold Coast'>Gold Coast</option>
                    <option value='Canberra'>Canberra</option>
                    <option value='Newcastle'>Newcastle</option>
                    <option value='Wollongong'>Wollongong</option>
                    <option value='Hobart'>Hobart</option>
                  </select>
                </div>
                <div className='flex flex-col'>
                  <label htmlFor='zip' className='mb-1 text-sm'>
                    Postal Code <span className='text-red-600 '>*</span>
                  </label>
                  <input
                    id='zip'
                    type='text'
                    placeholder=''
                    {...register('shipping.zip', { required: true })}
                    className='p-2 border'
                  />
                </div>
              </div>
              <div className='grid gap-4 mt-4 lg:grid-cols-2 md:grid-cols-2'>
                <div>
                  <p>
                    Email <span className='text-red-600 '>*</span>
                  </p>
                  <input
                    type='email'
                    placeholder='Email'
                    {...register('shipping.email', { required: true })}
                    className='w-full p-2 mt-1 border'
                  />
                </div>
                <div>
                  <p>
                    Phone Number <span className='text-red-600 '>*</span>
                  </p>
                  <input
                    type='tel'
                    placeholder='Phone Number'
                    {...register('shipping.phone', { required: true })}
                    className='w-full p-2 mt-1 border'
                  />
                </div>
              </div>
            </div>
          )}

          <div className='w-full h-fit lg:w-[30%] border p-5 bg-line'>
            <h3 className='mb-4 text-xl font-medium'>Order Summary</h3>
            <ul>
              {items.map((item) => {
                const total = item.price * item.quantity;
                return (
                  <li key={item.id} className='flex justify-between py-2'>
                    <div className='flex gap-4'>
                      <div className=''>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='object-cover w-12 h-12'
                        />
                      </div>

                      <div>
                        <p className='font-medium'>{item.name}</p>
                        <div className='flex items-center gap-2'>
                          <p className='text-sm text-gray-600'>
                            {item.quantity} x
                          </p>
                          <p className='text-sm font-medium text-smallHeader'>
                            {/* $ {total.toFixed(2)} */}${item.price}
                          </p>
                        </div>

                        <p className='py-1 text-sm font-medium '>
                          Color: {item.color || 'No Color'}
                        </p>
                        <p className='text-sm font-medium'>
                          Print: {item.print || 'No print method selected'}
                        </p>
                        <p className='text-sm font-medium'>
                          Logo Color: {item.logoColor || 'No color selected'}
                        </p>
                        <p className='text-sm font-medium'>
                          Est Delivery Date:{' '}
                          {item.deliveryDate || 'No delivery date'}
                        </p>
                        <div className='flex gap-3 mt-1 text-sm font-medium'>
                          <p>Logo:</p>
                          {item.dragdrop ? (
                            <img
                              src={item.dragdrop}
                              alt=''
                              className='w-8 h-8 rounded-md'
                            />
                          ) : (
                            'No Logo image'
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className='mt-6 space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Sub-total:</span>
                <span>
                  {/* ${totalAmount.toFixed(2)} */}$
                  {totalAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Discount:</span>
                <span>{totalDiscountPercent}%</span>
              </div>

              <div className='flex justify-between text-sm'>
                <span>GST(10%):</span>
                <span>${gstAmount.toFixed(2)}</span>
              </div>
            </div>
            <hr className='my-4' />
            <div className='flex flex-col'>
              <div
                onClick={() => setShowCreditCard(false)}
                className='flex items-center gap-2 mt-2'
              >
                <input
                  type='radio'
                  id='paypal'
                  name='payment'
                  value='paypal'
                  className='w-4 h-4 border-gray-300 text-smallHeader focus:ring-smallHeader'
                />
                <label htmlFor='credit-card' className='text-sm font-semibold'>
                  Paypal
                </label>
              </div>
              <div
                onClick={() => setShowCreditCard(true)}
                className='flex items-center gap-2 mt-2'
              >
                <input
                  type='radio'
                  id='credit-card'
                  name='payment'
                  value='credit-card'
                  checked={showCreditCard}
                  className='w-4 h-4 border-gray-300 text-smallHeader focus:ring-smallHeader'
                />
                <label htmlFor='credit-card' className='text-sm font-semibold'>
                  Credit Card or GooglePay
                </label>
              </div>
            </div>
            {showCreditCard && <CreditCard />}
            <hr className='my-4' />
            <div className='flex justify-between text-lg font-semibold'>
              <span>Total:</span>
              <span>
                {/* ${total.toFixed(2)} */}$
                {total.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <button
              type='submit'
              className='w-full py-3 mt-4 font-medium text-white bg-smallHeader'
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
