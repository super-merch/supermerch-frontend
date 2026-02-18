import React, { useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const ShippingAddress = () => {
  const { token, shippingAddressData, setShippingAddressData } =
    useContext(AuthContext);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddressData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/update-shipping-address`,
        { defaultShippingAddress: shippingAddressData },
        {
          headers: {
            token,
          },
        }
      );

      if (response.data.success) {
        toast.success("Shipping address saved successfully!");
      } else {
        toast.error("Failed to save shipping address.");
      }
    } catch (error) {
      console.error("Error saving shipping address:", error);
      toast.error("An error occurred while saving the shipping address.");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Where your orders will be delivered.
        </p>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="shipping-firstName" className={labelClass}>
              First Name
            </label>
            <input
              id="shipping-firstName"
              type="text"
              name="firstName"
              className={inputClass}
              placeholder="Enter first name"
              value={shippingAddressData.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="shipping-lastName" className={labelClass}>
              Last Name
            </label>
            <input
              id="shipping-lastName"
              type="text"
              name="lastName"
              className={inputClass}
              placeholder="Enter last name"
              value={shippingAddressData.lastName}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="shipping-companyName" className={labelClass}>
            Company Name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="shipping-companyName"
            type="text"
            name="companyName"
            className={inputClass}
            placeholder="Enter company name"
            value={shippingAddressData.companyName}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="shipping-addressLine" className={labelClass}>
            Street Address
          </label>
          <input
            id="shipping-addressLine"
            type="text"
            name="addressLine"
            className={inputClass}
            placeholder="Enter street address"
            value={shippingAddressData.addressLine}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="shipping-city" className={labelClass}>
              Suburb
            </label>
            <input
              id="shipping-city"
              type="text"
              name="city"
              className={inputClass}
              placeholder="Enter suburb"
              value={shippingAddressData.city}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="shipping-postalCode" className={labelClass}>
              Postal Code
            </label>
            <input
              id="shipping-postalCode"
              type="text"
              name="postalCode"
              className={inputClass}
              placeholder="Enter postal code"
              value={shippingAddressData.postalCode}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="shipping-state" className={labelClass}>
              Region / State
            </label>
            <input
              id="shipping-state"
              type="text"
              name="state"
              className={inputClass}
              placeholder="Enter state or region"
              value={shippingAddressData.state}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="shipping-country" className={labelClass}>
              Country
            </label>
            <input
              id="shipping-country"
              type="text"
              name="country"
              className={inputClass}
              placeholder="Enter country"
              value={shippingAddressData.country}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="shipping-email" className={labelClass}>
              Email
            </label>
            <input
              id="shipping-email"
              type="email"
              name="email"
              className={inputClass}
              placeholder="Enter email"
              value={shippingAddressData.email}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="shipping-phone" className={labelClass}>
              Phone Number
            </label>
            <input
              id="shipping-phone"
              type="tel"
              name="phone"
              className={inputClass}
              placeholder="Enter phone number"
              value={shippingAddressData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          Save Shipping Address
        </button>
      </div>
    </div>
  );
};

export default ShippingAddress;
