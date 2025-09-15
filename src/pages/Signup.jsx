import React, { useContext, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { IoMdEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";
import { Link } from "react-router-dom";
import { MdKeyboardArrowRight } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loadFavouritesFromDB, clearFavourites } from "../redux/slices/favouriteSlice";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { initializeCartFromStorage, setCurrentUser } from "@/redux/slices/cartSlice";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, setToken, backednUrl } = useContext(AppContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Google authentication states
  const [googleData, setGoogleData] = useState(null);
  const [showGooglePasswordPrompt, setShowGooglePasswordPrompt] = useState(false);
  const [googlePassword, setGooglePassword] = useState("");
  const [showGooglePassword, setShowGooglePassword] = useState(false);

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
      setTimeout(() => {
        setError("");
      }, 2000);
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the Terms & Conditions and Privacy Policy");
      setLoading(false);
      setTimeout(() => {
        setError("");
      }, 2000);
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
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message);
      console.log(err);
      setTimeout(() => {
        setError("");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  // Custom Google Login using useGoogleLogin hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`, {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const userInfo = await userInfoResponse.json();
        console.log(userInfo);

        setGoogleData({
          email: userInfo.email,
          name: userInfo.given_name || userInfo.name,
        });
        setShowGooglePasswordPrompt(true);
      } catch (error) {
        console.error("Error fetching user info:", error);
        toast.error("Failed to get user information from Google");
      }
    },
    onError: () => {
      console.log("Login Failed");
      toast.error("Google authentication failed");
    },
  });

  const [googleError, setGoogleError] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // Handle Google authentication with password
  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    if (!googlePassword.trim()) {
      setGoogleError("Password is required");
      setTimeout(() => setGoogleError(""), 2000);
      return;
    }

    setLoadingGoogle(true);

    try {
      const response = await axios.post(`${backednUrl}/api/auth/signup`, {
        name: googleData.name,
        email: googleData.email,
        password: googlePassword,
      });

      setGoogleError("");
      toast.success("Google SignUp successful!");

      // Reset states and switch to login
      setGoogleData(null);
      setShowGooglePasswordPrompt(false);
      setGooglePassword("");

      // Redirect to login page
      navigate("/login");
    } catch (err) {
      setGoogleError(err?.response?.data?.message || "Authentication failed");
      console.log(err);
      setTimeout(() => {
        setGoogleError("");
      }, 2000);
    } finally {
      setLoadingGoogle(false);
    }
  };

  // Cancel Google authentication
  const handleGoogleCancel = () => {
    setGoogleData(null);
    setShowGooglePasswordPrompt(false);
    setGooglePassword("");
    setError("");
  };

  return (
    <div className="h-screen flex flex-col justify-start pt-4 pb-2 px-8 bg-white">
      {/* Main Content Container */}
      <div className="flex w-full max-w-6xl mx-auto mt-12">
        {/* Left Panel - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative mr-12">
          <div
            className="w-full h-full min-h-[600px] rounded-lg overflow-hidden"
            style={{
              backgroundImage: `url('/pgHome1.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "scroll",
              width: "100%",
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>

            {/* Content on the left panel - moved to bottom center */}
            <div className="relative z-10 flex flex-col justify-end items-center h-full p-12 text-white">
              <div className="text-center max-w-md">
                <div className="bg-blue-900 bg-opacity-80 rounded-lg p-6 text-center">
                  <h2 className="text-2xl font-bold mb-3">Change The Quality Of Your Life</h2>
                  <p className="text-lg opacity-90">We define the new ways of comfort and style, which will uplift your spirit.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-8">
              <img src="/authimg/supermerch.svg" alt="Super Merch" className="h-16 w-auto" />
            </div>

            {/* Welcome Text */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hello Again!</h1>
              <p className="text-gray-600">Sign up to get great deals.</p>
            </div>

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <IoMdEye className="h-5 w-5 text-gray-400" /> : <IoIosEyeOff className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <IoMdEye className="h-5 w-5 text-gray-400" />
                    ) : (
                      <IoIosEyeOff className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

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

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Google Password Prompt Modal */}
        {showGooglePasswordPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Complete Google Sign Up</h3>
              <p className="text-gray-600 mb-4">
                Email: <strong>{googleData?.email}</strong>
                <br />
                Name: <strong>{googleData?.name}</strong>
              </p>
              <form onSubmit={handleGoogleAuth}>
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
                    onClick={handleGoogleCancel}
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
                    {loadingGoogle ? "Processing..." : "Sign Up"}
                    {!loadingGoogle && <FaArrowRight />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
