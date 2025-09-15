import { useState, useEffect, useCallback } from "react";

export const useCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [coupenLoading, setCoupenLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  const fetchCurrentCoupon = useCallback(async () => {
    try {
      setCoupenLoading(true);
      const response = await fetch(`${API_BASE}/api/coupen/get`);
      const data = await response.json();

      if (response.ok && data.length > 0) {
        setCoupons(data);

        // Strategy 1: Show the coupon with highest discount
        const bestCoupon = data.reduce((best, current) => (current.discount > best.discount ? current : best));

        setSelectedCoupon(bestCoupon);
        setCoupenLoading(false);
      } else {
        setCoupons([]);
        setSelectedCoupon(null);
        setCoupenLoading(false);
      }
    } catch (error) {
      setCoupenLoading(false);
      setCoupons([]);
      setSelectedCoupon(null);
      console.error("Error fetching current coupon:", error);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchCurrentCoupon();
  }, [fetchCurrentCoupon]);

  return {
    coupons,
    selectedCoupon,
    coupenLoading,
    fetchCurrentCoupon,
  };
};
