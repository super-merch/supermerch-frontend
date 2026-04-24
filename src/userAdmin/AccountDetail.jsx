import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const AccountDetail = () => {
  const { fetchWebUser, userData, token} = useContext(AuthContext);
  const { backendUrl } = useContext(AppContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  const inputClass =
    "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  useEffect(() => {
    fetchWebUser();
  }, []);

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setEmail(userData.email);
    }
  }, [userData]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your current password!");
      return;
    }
    if (!newPassword && !confirmNewPassword) {
      toast.error("Please enter a new password!");
      return;
    }
    if (newPassword && newPassword !== confirmNewPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }
    if (newPassword.includes(" ")) {
      toast.error("Password cannot contain spaces!");
      return;
    }
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{6,}$/;

    if (!passwordPattern.test(newPassword)) {
      toast.error(
        "Password must contain a letter and a number, and no spaces!"
      );
      return;
    }
    try {
      const payload = {
        userId: userData._id, // Assuming `userData` contains the user's ID
        name,
        email,
        currentPassword: password,
        newPassword,
      };
      const { data } = await axios.put(
        `${backendUrl}/api/auth/updateWeb-user`,
        payload,
        { headers: { token } }
      );
      if (data.success) {
        toast.success("Changes saved successfully!");
        await fetchWebUser();
        setPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast.error(data.message || "Failed to save changes.");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message || "Failed to save changes.");
    }
  };
  return (
    <div className="w-full px-4 pt-2 pb-10 text-xl lg:px-8 md:px-8 lg:pt-6 md:pt-6 ">
      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>
      <form onSubmit={handleSaveChanges}>
        {/* Name and Email */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              disabled
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Name"
            />
          </div>
          <div>
            <label className={labelClass}>
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              disabled
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="Email address"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Password Change */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Password change</h2>
          <div className="space-y-6">
            <div>
              <label className={labelClass}>
                Current password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Current password"
              />
            </div>
            <div>
              <label className={labelClass}>
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="New password"
              />
            </div>
            <div>
              <label className={labelClass}>
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={inputClass}
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountDetail;
