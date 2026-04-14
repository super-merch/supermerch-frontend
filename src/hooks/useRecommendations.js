import { useEffect, useMemo, useState } from "react";

const getSessionId = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rv_session") || null;
};

const serializeIds = (ids = []) =>
  ids
    .map((id) => String(id || "").trim())
    .filter(Boolean)
    .join(",");

export default function useRecommendations({
  backendUrl,
  type = "product",
  productId = null,
  cartProductIds = [],
  userId = null,
  limit = 8,
  enabled = true,
}) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const stableCartIds = useMemo(() => serializeIds(cartProductIds), [cartProductIds]);

  useEffect(() => {
    if (!enabled || !backendUrl) return;
    if (type === "product" && !productId) return;
    if (type === "cart" && !stableCartIds) return;

    const controller = new AbortController();
    const sessionId = getSessionId();

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", String(limit || 8));
        if (userId) params.set("userId", String(userId));
        if (sessionId) params.set("sessionId", String(sessionId));

        let url = "";
        if (type === "product") {
          url = `${backendUrl}/api/recommendations/product/${encodeURIComponent(
            String(productId)
          )}?${params.toString()}`;
        } else {
          params.set("productIds", stableCartIds);
          url = `${backendUrl}/api/recommendations/cart?${params.toString()}`;
        }

        const res = await fetch(url, { signal: controller.signal });
        const json = await res.json();
        if (res.ok && json?.success) {
          setRecommendations(Array.isArray(json.data) ? json.data : []);
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setRecommendations([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
    return () => controller.abort();
  }, [backendUrl, enabled, limit, productId, stableCartIds, type, userId]);

  return {
    recommendations,
    recommendationsLoading: loading,
  };
}
