import { useState, useEffect } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Module-level cache to avoid refetching on re-renders
const seoCache = new Map();

export default function useSeoMeta(entityType, entityId) {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!backendUrl || !entityType || !entityId) return;

    const normalizedId = String(entityId).trim();
    if (!normalizedId) return;

    const cacheKey = `${entityType}:${normalizedId}`;

    if (seoCache.has(cacheKey)) {
      setSeoData(seoCache.get(cacheKey));
      return;
    }

    let cancelled = false;
    setLoading(true);

    axios
      .get(`${backendUrl}/api/seo-meta/by-entity/${entityType}/${encodeURIComponent(normalizedId)}`)
      .then((res) => {
        if (!cancelled && res.data?.success && res.data?.data) {
          seoCache.set(cacheKey, res.data.data);
          setSeoData(res.data.data);
        }
      })
      .catch(() => {
        // Graceful fallback — no SEO data is fine
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [entityType, entityId]);

  return { seoData, loading };
}
