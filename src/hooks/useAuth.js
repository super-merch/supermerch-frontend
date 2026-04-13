import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";
import { loadFavouritesFromDB } from "../redux/slices/favouriteSlice";
import { initializeCartFromStorage } from "../redux/slices/cartSlice";

export const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setToken } = useContext(AuthContext);
  const { backendUrl } = useContext(AppContext);

  // Common auth states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Google auth states
  const [googleError, setGoogleError] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // Reset password states
  const [showResetPrompt, setShowResetPrompt] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Clear error helper
  const clearError = () => {
    setTimeout(() => setError(""), 2000);
  };

  // Google login configuration (true SSO - no local password prompt)
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoadingGoogle(true);
      setGoogleError("");
      try {
        const response = await axios.post(`${backendUrl}/api/auth/google`, {
          accessToken: tokenResponse.access_token,
        });

        if (response.data.success) {
          const { user, token } = response.data;
          localStorage.setItem("token", token);
          toast.success("Google login successful!");
          if (user?.email) {
            dispatch(initializeCartFromStorage({ email: user.email }));
          }
          dispatch(loadFavouritesFromDB(user.email));
          setLoadingGoogle(false);
          // Full reload avoids 404: setToken removes Login route while on /login
          window.location.replace("/");
        } else {
          setGoogleError(
            response.data.message || "Google authentication failed",
          );
          setTimeout(() => setGoogleError(""), 2000);
        }
      } catch (err) {
        setGoogleError(
          err?.response?.data?.message || "Google authentication failed",
        );
        setTimeout(() => setGoogleError(""), 2000);
      } finally {
        setLoadingGoogle(false);
      }
    },
    onError: () => {
      setGoogleError("Google authentication failed");
      toast.error("Google authentication failed");
    },
  });

  // Reset password handlers
  const handleResetStep1 = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError("Email is required");
      setTimeout(() => setResetError(""), 2000);
      return;
    }

    setResetLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/auth/reset`, {
        email: resetEmail,
      });

      if (response.data.success) {
        toast.success("Reset code sent to your email!");
        setResetStep(2);
        setResetError("");
      } else {
        setResetError(response.data.message || "Failed to send reset code");
        setTimeout(() => setResetError(""), 3000);
      }
    } catch (err) {
      setResetError(
        err?.response?.data?.message || "Failed to send reset email",
      );
      setTimeout(() => setResetError(""), 3000);
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetStep2 = async (e) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      setResetError("Reset code is required");
      setTimeout(() => setResetError(""), 2000);
      return;
    }

    setResetLoading(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/verify-reset-code`,
        {
          email: resetEmail,
          code: resetCode,
        },
      );

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
      const response = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        {
          email: resetEmail,
          code: resetCode,
          newPassword: newPassword,
        },
      );

      if (response.data.success) {
        toast.success("Password reset successfully!");
        handleResetCancel();
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

  return {
    // States
    loading,
    error,
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

    // Actions
    setLoading,
    setError,
    clearError,
    googleLogin,
    setShowResetPrompt,
    handleResetStep1,
    handleResetStep2,
    handleResetStep3,
    handleResetCancel,
  };
};
