import React from "react";
import { IoMdEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";

const PasswordInput = ({ name, value, onChange, placeholder, showPassword, onTogglePassword, required = true, className = "" }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {name === "password" ? "Password" : name === "confirmPassword" ? "Confirm Password" : "Password"} *
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${className}`}
          placeholder={placeholder}
          required={required}
        />
        <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={onTogglePassword}>
          {showPassword ? <IoMdEye className="h-5 w-5 text-gray-400" /> : <IoIosEyeOff className="h-5 w-5 text-gray-400" />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
