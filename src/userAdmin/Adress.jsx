import React, { useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import ShippingAddress from "./ShippingAddress";

const Adress = () => {
  const { token, addressData, setAddressData } = useContext(AuthContext);
  const { backendUrl } = useContext(AppContext);

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
        `${backendUrl}/api/auth/update-address`,
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

  const inputClass =
    "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="w-full px-3 lg:px-8 md:px-6 py-4 space-y-6">
      {/* Billing Address Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Billing Address</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Used for invoices and payment details.
          </p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={labelClass}>
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                className={inputClass}
                placeholder="Enter first name"
                value={addressData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                className={inputClass}
                placeholder="Enter last name"
                value={addressData.lastName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="companyName" className={labelClass}>
              Company Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="companyName"
              type="text"
              name="companyName"
              className={inputClass}
              placeholder="Enter company name"
              value={addressData.companyName}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="addressLine" className={labelClass}>
              Street Address
            </label>
            <input
              id="addressLine"
              type="text"
              name="addressLine"
              className={inputClass}
              placeholder="Enter street address"
              value={addressData.addressLine}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className={labelClass}>
                Suburb
              </label>
              <input
                id="city"
                type="text"
                name="city"
                className={inputClass}
                placeholder="Enter suburb"
                value={addressData.city}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="postalCode" className={labelClass}>
                Postal Code
              </label>
              <input
                id="postalCode"
                type="text"
                name="postalCode"
                className={inputClass}
                placeholder="Enter postal code"
                value={addressData.postalCode}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className={labelClass}>
                Region / State
              </label>
              <input
                id="state"
                type="text"
                name="state"
                className={inputClass}
                placeholder="Enter state or region"
                value={addressData.state}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="country" className={labelClass}>
                Country
              </label>
              <input
                id="country"
                type="text"
                name="country"
                className={inputClass}
                placeholder="Enter country"
                value={addressData.country}
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
            Save Billing Address
          </button>
        </div>
      </div>

      <ShippingAddress />
    </div>
  );
};

export default Adress;
