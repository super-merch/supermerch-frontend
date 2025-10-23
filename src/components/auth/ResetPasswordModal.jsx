import { FaArrowRight } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { IoMdEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";

// Helper component for password toggle icons
const PasswordToggleIcon = ({ showPassword }) => {
  return showPassword ? (
    <IoMdEye className="h-5 w-5 text-gray-400" />
  ) : (
    <IoIosEyeOff className="h-5 w-5 text-gray-400" />
  );
};

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
            <p className="text-sm text-gray-500 mt-1">Step {resetStep} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Enter Email */}
          {resetStep === 1 && (
            <>
              <p className="text-gray-600 mb-6">
                Enter your email address and we&apos;ll send you a reset code.
              </p>
              <form onSubmit={onResetStep1} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@email.com"
                    required
                  />
                </div>

                {resetError && (
                  <div className="text-red-500 text-sm text-center">
                    {resetError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    disabled={resetLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Sending..." : "Send Code"}
                    {!resetLoading && <FaArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 2: Enter Reset Code */}
          {resetStep === 2 && (
            <>
              <p className="text-gray-600 mb-6 text-center">
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold text-gray-900">
                  {resetEmail}
                </span>
              </p>
              <form onSubmit={onResetStep2} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reset Code *
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest font-mono"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                </div>

                {resetError && (
                  <div className="text-red-500 text-sm text-center">
                    {resetError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    disabled={resetLoading}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Verifying..." : "Verify Code"}
                    {!resetLoading && <FaArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Set New Password */}
          {resetStep === 3 && (
            <>
              <p className="text-gray-600 mb-6 text-center">
                Enter your new password below.
              </p>
              <form onSubmit={onResetStep3} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <PasswordToggleIcon showPassword={showNewPassword} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() =>
                        setShowConfirmNewPassword(!showConfirmNewPassword)
                      }
                    >
                      <PasswordToggleIcon
                        showPassword={showConfirmNewPassword}
                      />
                    </button>
                  </div>
                </div>

                {resetError && (
                  <div className="text-red-500 text-sm text-center">
                    {resetError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    disabled={resetLoading}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Resetting..." : "Reset Password"}
                    {!resetLoading && <FaArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
