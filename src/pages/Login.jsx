import { useContext, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { IoMdEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loadFavouritesFromDB } from "../redux/slices/favouriteSlice";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { initializeCartFromStorage } from "@/redux/slices/cartSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setToken, backednUrl } = useContext(AppContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Google authentication states
  const [googleData, setGoogleData] = useState(null);
  const [showGooglePasswordPrompt, setShowGooglePasswordPrompt] = useState(false);
  const [googlePassword, setGooglePassword] = useState("");
  const [showGooglePassword, setShowGooglePassword] = useState(false);

  // Reset password states
  const [showResetPrompt, setShowResetPrompt] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: code, 3: new password
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

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
        console.log(user, "user");

        if (user.email !== formData.email) {
          setError("Email not found.");
          setTimeout(() => {
            setError("");
          }, 2000);
        } else {
          setError("");
          const { token } = response.data;
          console.log(response.data, "login");
          setToken(token);
          console.log(token, "token");

          toast.success("Login successful!");

          localStorage.setItem("token", token);
          dispatch(initializeCartFromStorage({ email: user.email }));

          // Load user's favourites from database
          dispatch(loadFavouritesFromDB(backednUrl));

          navigate("/");
        }
      }
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
      const response = await axios.post(`${backednUrl}/api/auth/login`, {
        name: googleData.name,
        email: googleData.email,
        password: googlePassword,
      });

      if (response.data.success) {
        const { user } = response.data;
        console.log(user, "Google user login");

        if (user.email !== googleData.email) {
          setGoogleError("Email not found.");
          setTimeout(() => {
            setGoogleError("");
          }, 2000);
        } else {
          setGoogleError("");
          const { token } = response.data;
          console.log(response.data, "Google login");
          setToken(token);
          console.log(token, "token");
          dispatch(initializeCartFromStorage({ email: user.email }));
          toast.success("Google Login successful!");

          localStorage.setItem("token", token);

          // Reset Google states
          setGoogleData(null);
          setShowGooglePasswordPrompt(false);
          setGooglePassword("");

          // Load user's favourites from database
          dispatch(loadFavouritesFromDB(backednUrl));

          navigate("/");
        }
      }
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

  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Step 1: Send reset code to email
  const handleResetStep1 = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError("Email is required");
      setTimeout(() => setResetError(""), 2000);
      return;
    }

    setResetLoading(true);

    try {
      const response = await axios.post(`${backednUrl}/api/auth/reset`, {
        email: resetEmail,
      });

      if (response.data.success) {
        toast.success("Reset code sent to your email!");
        setResetStep(2);
        setResetError("");
        // For demo purposes - remove in production
        if (response.data.resetCode) {
          console.log("Reset code (demo):", response.data.resetCode);
        }
      } else {
        setResetError(response.data.message || "Failed to send reset code");
        setTimeout(() => setResetError(""), 3000);
      }
    } catch (err) {
      setResetError(err?.response?.data?.message || "Failed to send reset email");
      setTimeout(() => setResetError(""), 3000);
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Verify reset code
  const handleResetStep2 = async (e) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      setResetError("Reset code is required");
      setTimeout(() => setResetError(""), 2000);
      return;
    }

    setResetLoading(true);

    try {
      const response = await axios.post(`${backednUrl}/api/auth/verify-reset-code`, {
        email: resetEmail,
        code: resetCode,
      });

      if (response.data.success) {
        toast.success("Code verified successfully!");
        setResetStep(3);
        setResetError("");
      } else {
        setResetError(response.data.message || "Invalid reset code");
        setTimeout(() => setResetError(""), 3000);
      }
    } catch (err) {
      setResetError(err?.response?.data?.message || "Failed to verify code");
      setTimeout(() => setResetError(""), 3000);
    } finally {
      setResetLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetStep3 = async (e) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmNewPassword.trim()) {
      setResetError("Both password fields are required");
      setTimeout(() => setResetError(""), 2000);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetError("Passwords do not match");
      setTimeout(() => setResetError(""), 2000);
      return;
    }

    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters long");
      setTimeout(() => setResetError(""), 2000);
      return;
    }

    setResetLoading(true);

    try {
      const response = await axios.post(`${backednUrl}/api/auth/reset-password`, {
        email: resetEmail,
        code: resetCode,
        newPassword: newPassword,
      });

      if (response.data.success) {
        toast.success("Password reset successfully!");
        handleResetCancel(); // Close modal and reset states
        setResetError("");
      } else {
        setResetError(response.data.message || "Failed to reset password");
        setTimeout(() => setResetError(""), 3000);
      }
    } catch (err) {
      setResetError(err?.response?.data?.message || "Failed to reset password");
      setTimeout(() => setResetError(""), 3000);
    } finally {
      setResetLoading(false);
    }
  };

  // Cancel Google authentication
  const handleGoogleCancel = () => {
    setGoogleData(null);
    setShowGooglePasswordPrompt(false);
    setGooglePassword("");
    setError("");
  };

  // Cancel reset password flow
  const handleResetCancel = () => {
    setShowResetPrompt(false);
    setResetStep(1);
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmNewPassword("");
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

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-8">
              <img src="/authimg/supermerch.svg" alt="Super Merch" className="h-16 w-auto" />
            </div>

            {/* Welcome Text */}
            <div className="mb-8">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Enter your password"
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

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have account yet?{" "}
                <Link to="/signup-new" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Google Password Prompt Modal */}
        {showGooglePasswordPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Complete Google Sign In</h3>
              <p className="text-gray-600 mb-4">
                Email: <strong>{googleData?.email}</strong>
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
                    {loadingGoogle ? "Processing..." : "Sign In"}
                    {!loadingGoogle && <FaArrowRight />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Reset Password - Step {resetStep} of 3</h3>

              {/* Step 1: Enter Email */}
              {resetStep === 1 && (
                <>
                  <p className="text-gray-600 mb-4">Enter your email address and we&apos;ll send you a reset code.</p>
                  <form onSubmit={handleResetStep1}>
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
                        onClick={handleResetCancel}
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
                  <form onSubmit={handleResetStep2}>
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
                        onClick={() => setResetStep(1)}
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
                  <form onSubmit={handleResetStep3}>
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
                        onClick={() => setResetStep(2)}
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
        )}
      </div>
    </div>
  );
};

export default Login;
