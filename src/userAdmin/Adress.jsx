
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Adress = () => {
  const { token, addressData, setAddressData,backednUrl } = useContext(AppContext);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${backednUrl}/api/auth/update-address`,
        { defaultAddress: addressData },
        {
          headers: {
            token,
          },
        }
      );

      if (response.data.success) {
        toast.success("Address saved successfully!");
      } else {
        toast.error("Failed to save address.");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("An error occurred while saving the address.");
    }
  };

  
  

  return (
    <>
      {/* {activeTab === "addresses" && ( */}
      <div className="w-full px-4 pt-2 pb-10 text-xl lg:px-8 md:px-8 lg:pt-6 md:pt-6">
          <h1 className="pt-4 pb-6 text-2xl font-semibold">Billing Address</h1>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 ">
            {/* Input fields for address */}
            <div className="">
              <p className="pb-1 text-lg ">First Name</p>
              <input
                type="text"
                name="firstName"
                className="w-full p-2 text-lg border rounded "
                placeholder="Enter Your First Name"
                value={addressData.firstName }
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
                value={addressData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <p className="pb-1 text-lg">Company Name</p>
              <input
                type="text"
                name="companyName"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your Company Name"
                value={addressData.companyName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <p className="pb-1 text-lg">Address</p>
              <input
                type="text"
                name="addressLine"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your Address"
                value={addressData.addressLine}
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
                value={addressData.country}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <p className="pb-1 text-lg">Region/State</p>
              <input
                type="text"
                name="state"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your State"
                value={addressData.state}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <p className="pb-1 text-lg">City</p>
              <input
                type="text"
                name="city"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your City"
                value={addressData.city}
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
                value={addressData.postalCode}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <p className="pb-1 text-lg">Email</p>
              <input
                type="text"
                name="email"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your Email"
                value={addressData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <p className="pb-1 text-lg">Phone Number</p>
              <input
                type="text"
                name="phone"
                className="w-full p-2 text-lg border rounded"
                placeholder="Enter Your Phone Number"
                value={addressData.phone}
                onChange={handleInputChange}
              />
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
      {/* )} */}
    </>
  );
};

export default Adress;