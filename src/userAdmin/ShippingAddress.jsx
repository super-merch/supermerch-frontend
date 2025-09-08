import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const ShippingAddress = () => {
  const { token, shippingAddressData, setShippingAddressData, backednUrl } = useContext(AppContext);
  
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

  return (
    <>
      <div className="w-full  pt-2 pb-10 text-xl  lg:pt-6 md:pt-6">
        <h1 className="pt-4 pb-6 text-2xl font-semibold">Shipping Address</h1>
        <div className="space-y-6">
          {/* 1st line - First and Last Name */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="pb-1 text-lg">First Name</p>
              <input
                type="text"
                name="firstName"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your First Name"
                value={shippingAddressData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <p className="pb-1 text-lg">Last Name</p>
              <input
                type="text"
                name="lastName"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your Last Name"
                value={shippingAddressData.lastName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* 2nd line - Company Name (optional) */}
          <div className="grid grid-cols-1">
            <div>
              <p className="pb-1 text-lg">Company Name</p>
              <input
                type="text"
                name="companyName"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your Company Name"
                value={shippingAddressData.companyName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* 3rd line - Address */}
          <div className="grid grid-cols-1">
            <div>
              <p className="pb-1 text-lg">Address</p>
              <input
                type="text"
                name="addressLine"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your Address"
                value={shippingAddressData.addressLine}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* 4th line - Suburb and Postcode */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="pb-1 text-lg">Suburb</p>
              <input
                type="text"
                name="city"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your Suburb"
                value={shippingAddressData.city}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <p className="pb-1 text-lg">Postal Code</p>
              <input
                type="text"
                name="postalCode"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your Postal Code"
                value={shippingAddressData.postalCode}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* 5th line - State and Country */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="pb-1 text-lg">Region/State</p>
              <input
                type="text"
                name="state"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your State"
                value={shippingAddressData.state}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <p className="pb-1 text-lg">Country</p>
              <input
                type="text"
                name="country"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your Country"
                value={shippingAddressData.country}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* 6th line - Email and Phone Number */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="pb-1 text-lg">Email</p>
              <input
                type="email"
                name="email"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your Email"
                value={shippingAddressData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <p className="pb-1 text-lg">Phone Number</p>
              <input
                type="tel"
                name="phone"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your Phone Number"
                value={shippingAddressData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="px-5 py-2 mt-5 text-white bg-red-500 rounded"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default ShippingAddress;