import React from "react";
import { FaArrowRight } from "react-icons/fa6";
import { IoMdEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Complete Google {isSignup ? "Sign Up" : "Sign In"}</h3>
        <p className="text-gray-600 mb-4">
          Email: <strong>{googleData?.email}</strong>
          {isSignup && googleData?.name && (
            <>
              <br />
              Name: <strong>{googleData?.name}</strong>
            </>
          )}
        </p>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-normal mb-2">Enter a password</label>
            <div className="relative">
              <input
                type={showGooglePassword ? "text" : "password"}
                value={googlePassword}
                onChange={(e) => setGooglePassword(e.target.value)}
                className="w-full px-3 py-2 border rounded outline-none"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-2"
                onClick={() => setShowGooglePassword(!showGooglePassword)}
              >
                {showGooglePassword ? <IoMdEye /> : <IoIosEyeOff />}
              </button>
            </div>
          </div>

          {googleError && <p className="text-red-500 mb-4">{googleError}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              disabled={loadingGoogle}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
              disabled={loadingGoogle}
            >
              {loadingGoogle ? "Processing..." : isSignup ? "Sign Up" : "Sign In"}
              {!loadingGoogle && <FaArrowRight />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
