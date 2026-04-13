import { Link } from "react-router-dom";
import { User } from "lucide-react";

const ChevronDown = ({ open }) => (
  <svg
    className={`w-8 h-8 text-gray-600 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
      clipRule="evenodd"
    />
  </svg>
);

export default function CustomerStep({
  open,
  setOpen,
  token,
  openLoginModal,
  setOpenLoginModal,
  loginModalRef,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loginError,
  setLoginError,
  loginLoading,
  handleInlineLogin,
  register,
  watch,
  onContinue,
}) {
  const shippingEmail = watch("shipping.email");
  const shippingPhone = watch("shipping.phone");

  return (
    <>
      {!token && (
        <div className="relative">
          <span>
            Already have an account?{" "}
            <span
              onClick={() => setOpenLoginModal(true)}
              className="text-primary hover:text-blue-500 hover:underline cursor-pointer"
            >
              Login
            </span>
          </span>

          {openLoginModal && (
            <div
              ref={loginModalRef}
              className="absolute top-8 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
            >
              <form onSubmit={handleInlineLogin} className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Login</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenLoginModal(false);
                      setLoginError("");
                      setLoginEmail("");
                      setLoginPassword("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {loginError && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{loginError}</div>
                )}

                <div className="flex items-center justify-between">
                  <Link
                    to="/login"
                    onClick={() => setOpenLoginModal(false)}
                    className="text-sm text-primary hover:underline"
                  >
                    Full login page
                  </Link>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenLoginModal(false);
                        setLoginError("");
                        setLoginEmail("");
                        setLoginPassword("");
                      }}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loginLoading ? "Logging in..." : "Login"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div
          className="px-4 py-3 cursor-pointer flex items-center justify-between border-b border-gray-200 bg-white"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Customer Details</h3>
              <p className="text-sm text-gray-500">Basic contact info</p>
            </div>
          </div>
          <button type="button" aria-label="Toggle customer" className="flex-shrink-0">
            <ChevronDown open={open} />
          </button>
        </div>
        {open && (
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  {...register("shipping.email")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  {...register("shipping.phone")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-smallHeader focus:border-transparent transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onContinue}
                disabled={!shippingEmail || !shippingPhone}
                className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Shipping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
