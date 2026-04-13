import { useState, useCallback } from "react";
import { toast } from "react-toastify";

export const useEmailSubscription = () => {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailPattern.test(email);
  };

  const handleSubmit = useCallback(
    async (coupon, discount) => {
      setLoading(true);
      setError("");

      if (!emailInput) {
        setError("Email is required");
        setLoading(false);
        return;
      }

      if (!validateEmail(emailInput)) {
        setError("Invalid email");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscription/add-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailInput,
            coupon: coupon,
            discount: discount,
          }),
        });

        // Check if response is OK before parsing JSON
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response not OK:", response.status, errorText);
          toast.error(`Server error: ${response.status}`);
          setError(`Server error: ${response.status}`);
          setLoading(false);
          return;
        }

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const responseText = await response.text();
          console.error("Non-JSON response:", responseText);
          toast.error("Server returned invalid response");
          setError("Server returned invalid response");
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (data.success) {
          setEmailInput("");
          setError("");
          toast.success("You have successfully subscribed. Go get your code from your email.");
          setLoading(false);
          return { success: true };
        } else {
          toast.error(data.message);
          setError(data.message);
          setLoading(false);
          return { success: false };
        }
      } catch (error) {
        console.error("Network/Parse error:", error);
        toast.error("Connection failed. Please check if the server is running.");
        setError("Connection failed. Please check if the server is running.");
        setLoading(false);
        return { success: false };
      }
    },
    [emailInput]
  );

  const resetForm = useCallback(() => {
    setEmailInput("");
    setError("");
    setLoading(false);
  }, []);

  return {
    emailInput,
    setEmailInput,
    loading,
    error,
    handleSubmit,
    resetForm,
  };
};
