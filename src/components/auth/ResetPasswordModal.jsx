import React from "react";
import { FaArrowRight } from "react-icons/fa6";
import { IoMdEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";

const ResetPasswordModal = ({
  isOpen,
  onClose,
  resetStep,
  resetEmail,
  setResetEmail,
  resetCode,
  setResetCode,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmNewPassword,
  setShowConfirmNewPassword,
  resetError,
  resetLoading,
  onResetStep1,
  onResetStep2,
  onResetStep3,
  onBack,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Reset Password - Step {resetStep} of 3</h3>

        {/* Step 1: Enter Email */}
        {resetStep === 1 && (
          <>
            <p className="text-gray-600 mb-4">Enter your email address and we&apos;ll send you a reset code.</p>
            <form onSubmit={onResetStep1}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-normal mb-2">Email Address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded outline-none"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {resetError && <p className="text-red-500 mb-4">{resetError}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={resetLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Sending..." : "Send Code"}
                  {!resetLoading && <FaArrowRight />}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 2: Enter Reset Code */}
        {resetStep === 2 && (
          <>
            <p className="text-gray-600 mb-4">
              Enter the 6-digit code sent to <strong>{resetEmail}</strong>
            </p>
            <form onSubmit={onResetStep2}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-normal mb-2">Reset Code</label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded outline-none text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
              </div>

              {resetError && <p className="text-red-500 mb-4">{resetError}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={resetLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Verifying..." : "Verify Code"}
                  {!resetLoading && <FaArrowRight />}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 3: Set New Password */}
        {resetStep === 3 && (
          <>
            <p className="text-gray-600 mb-4">Enter your new password below.</p>
            <form onSubmit={onResetStep3}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-normal mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded outline-none"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <IoMdEye /> : <IoIosEyeOff />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-normal mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded outline-none"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-2"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  >
                    {showConfirmNewPassword ? <IoMdEye /> : <IoIosEyeOff />}
                  </button>
                </div>
              </div>

              {resetError && <p className="text-red-500 mb-4">{resetError}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={resetLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                  {!resetLoading && <FaArrowRight />}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
