import { FaArrowRight } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { IoMdEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";

// Helper component for password toggle icons
const PasswordToggleIcon = ({ showPassword }) => {
  return showPassword ? <IoMdEye className="h-5 w-5 text-gray-400" /> : <IoIosEyeOff className="h-5 w-5 text-gray-400" />;
};

const GoogleAuthModal = ({
  isOpen,
  onClose,
  onSubmit,
  googleData,
  googlePassword,
  setGooglePassword,
  showGooglePassword,
  setShowGooglePassword,
  googleError,
  loadingGoogle,
  isSignup = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Complete Google {isSignup ? "Sign Up" : "Sign In"}</h3>
            <p className="text-sm text-gray-500 mt-1">Enter a password to continue</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaTimes className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 text-center">
              Email: <span className="font-semibold text-gray-900">{googleData?.email}</span>
              {isSignup && googleData?.name && (
                <>
                  <br />
                  Name: <span className="font-semibold text-gray-900">{googleData?.name}</span>
                </>
              )}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <div className="relative">
                <input
                  type={showGooglePassword ? "text" : "password"}
                  value={googlePassword}
                  onChange={(e) => setGooglePassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowGooglePassword(!showGooglePassword)}
                >
                  <PasswordToggleIcon showPassword={showGooglePassword} />
                </button>
              </div>
            </div>

            {googleError && <div className="text-red-500 text-sm text-center">{googleError}</div>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                disabled={loadingGoogle}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loadingGoogle}
              >
                {loadingGoogle ? "Processing..." : isSignup ? "Sign Up" : "Sign In"}
                {!loadingGoogle && <FaArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
