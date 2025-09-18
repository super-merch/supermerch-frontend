import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

// Reusable components
import AuthLayout from "../components/auth/AuthLayout";
import PasswordInput from "../components/auth/PasswordInput";
import GoogleAuthModal from "../components/auth/GoogleAuthModal";
import ResetPasswordModal from "../components/auth/ResetPasswordModal";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { setToken, backednUrl } = useContext(AppContext);

  const {
    loading,
    error,
    googleData,
    showGooglePasswordPrompt,
    googlePassword,
    setGooglePassword,
    showGooglePassword,
    setShowGooglePassword,
    googleError,
    loadingGoogle,
    showResetPrompt,
    resetStep,
    setResetStep,
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
    setLoading,
    setError,
    clearError,
    googleLogin,
    handleGoogleAuth,
    handleGoogleCancel,
    setShowResetPrompt,
    handleResetStep1,
    handleResetStep2,
    handleResetStep3,
    handleResetCancel,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backednUrl}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        const { user } = response.data;

        if (user.email !== formData.email) {
          setError("Email not found.");
          clearError();
        } else {
          setError("");
          const { token } = response.data;
          setToken(token);

          toast.success("Login successful!");
          localStorage.setItem("token", token);
          // Additional logic for cart and favorites would go here
          window.location.href = "/";
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message);
      clearError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-start justify-center px-8 pt-20 pb-8 relative"
      style={{
        backgroundImage: `url('/authimg/authbg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>
      {/* Login Form Container with card design */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300 relative z-10">
        {/* Welcome Text */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hello Again!</h1>
          <p className="text-gray-600">Login to get great deals.</p>
        </div>
        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@email.com"
              required
            />
          </div>

          {/* Password Field */}
          <PasswordInput
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setShowResetPrompt(true)}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Forgot password?
            </button>
          </div>

          {/* Error Message */}
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
        </div>

        {/* Google Login Button */}
        <div className="mt-6">
          <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <FcGoogle className="h-5 w-5 mr-3" />
            Login with Google
          </button>
        </div>

        {/* Modals */}
        <GoogleAuthModal
          isOpen={showGooglePasswordPrompt}
          onClose={handleGoogleCancel}
          onSubmit={(e) => handleGoogleAuth(e, false)}
          googleData={googleData}
          googlePassword={googlePassword}
          setGooglePassword={setGooglePassword}
          showGooglePassword={showGooglePassword}
          setShowGooglePassword={setShowGooglePassword}
          googleError={googleError}
          loadingGoogle={loadingGoogle}
          isSignup={false}
        />

        <ResetPasswordModal
          isOpen={showResetPrompt}
          onClose={handleResetCancel}
          resetStep={resetStep}
          resetEmail={resetEmail}
          setResetEmail={setResetEmail}
          resetCode={resetCode}
          setResetCode={setResetCode}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmNewPassword={confirmNewPassword}
          setConfirmNewPassword={setConfirmNewPassword}
          showNewPassword={showNewPassword}
          setShowNewPassword={setShowNewPassword}
          showConfirmNewPassword={showConfirmNewPassword}
          setShowConfirmNewPassword={setShowConfirmNewPassword}
          resetError={resetError}
          resetLoading={resetLoading}
          onResetStep1={handleResetStep1}
          onResetStep2={handleResetStep2}
          onResetStep3={handleResetStep3}
          onBack={() => {
            if (resetStep > 1) {
              setResetStep(resetStep - 1);
            }
          }}
        />

        {/* Auth Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have account yet?{" "}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
