import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const AccountDetail = () => {
    const { fetchWebUser, userData, token, backednUrl } = useContext(AppContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
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
        if(!newPassword && !confirmNewPassword) {
            toast.error("Please enter a new password!");
            return;
        }
        if (newPassword && newPassword !== confirmNewPassword) {
            toast.error("New password and confirm password do not match!");
            return;
        }
        if(newPassword && newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long!");
            return;
        }
        if(newPassword.includes(" ")) {
            toast.error("Password cannot contain spaces!");
            return;
        }
        if(newPassword && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(newPassword)) {
            toast.error("Password must contain at least one letter and one number!");
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
            const { data } = await axios.put(`${backednUrl}/api/auth/updateWeb-user`,  payload, { headers: { token } });
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
                        <label className="block text-sm font-medium text-gray-700">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full p-2 mt-1 text-sm border border-gray-400 rounded"
                            placeholder="Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full p-2 mt-1 text-sm border border-gray-400 rounded"
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
                            <label className="block text-sm font-medium text-gray-700">
                                Current password (leave blank to leave unchanged)
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full p-2 mt-1 text-sm border border-gray-400 rounded"
                                placeholder="Current password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                New password (leave blank to leave unchanged)
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full p-2 mt-1 text-sm border border-gray-400 rounded"
                                placeholder="New password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Confirm new password
                            </label>
                            <input
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="block w-full p-2 mt-1 text-sm border border-gray-400 rounded"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-6">
                    <button
                        type="submit"
                        className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AccountDetail;
