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
import { useAuth } from "../hooks/useAuth";

const Signup = () => {
  const { backednUrl } = useContext(AppContext);

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
    setLoading,
    setError,
    clearError,
    googleLogin,
    handleGoogleAuth,
    handleGoogleCancel,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      clearError();
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the Terms & Conditions and Privacy Policy");
      setLoading(false);
      clearError();
      return;
    }

    try {
      const response = await axios.post(`${backednUrl}/api/auth/signup`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setError("");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      toast.success("SignUp successful!");
      localStorage.setItem("isNewUser", "true");

      // Redirect to login page after successful signup
      window.location.href = "/login";
    } catch (err) {
      setError(err?.response?.data?.message);
      clearError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Hello Again!"
      subtitle="Sign up to get great deals."
      linkText="Already have an account?"
      linkPath="/login"
      linkLabel="Sign In"
    >
      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
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
          placeholder="Create a password"
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        {/* Confirm Password Field */}
        <PasswordInput
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm your password"
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        {/* Terms and Conditions */}
        <div>
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">
              I agree to Super Merch's{" "}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

        {/* Signup Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}
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

      {/* Google Signup Button */}
      <div className="mt-6">
        <button
          onClick={() => googleLogin()}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <FcGoogle className="h-5 w-5 mr-3" />
          Sign up with Google
        </button>
      </div>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={showGooglePasswordPrompt}
        onClose={handleGoogleCancel}
        onSubmit={(e) => handleGoogleAuth(e, true)}
        googleData={googleData}
        googlePassword={googlePassword}
        setGooglePassword={setGooglePassword}
        showGooglePassword={showGooglePassword}
        setShowGooglePassword={setShowGooglePassword}
        googleError={googleError}
        loadingGoogle={loadingGoogle}
        isSignup={true}
      />
    </AuthLayout>
  );
};

export default Signup;
