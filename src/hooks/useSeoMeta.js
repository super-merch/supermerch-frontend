import { useState, useEffect } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Module-level cache to avoid refetching on re-renders
const seoCache = new Map();

export default function useSeoMeta(entityType, entityId) {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (!backendUrl || !entityType || !entityId) return;

    const normalizedId = String(entityId).trim();
    if (!normalizedId) return;

    const cacheKey = `${entityType}:${normalizedId}`;

    if (seoCache.has(cacheKey)) {
      setSeoData(seoCache.get(cacheKey));
      setResolved(true);
      return;
    }

    let cancelled = false;
    // Do not briefly apply the previous entity's manual overrides while the
    // newly resolved product ID is loading.
    setSeoData(null);
    setResolved(false);
    setLoading(true);

    axios
      .get(`${backendUrl}/api/seo-meta/by-entity/${entityType}/${encodeURIComponent(normalizedId)}`)
      .then((res) => {
        if (!cancelled && res.data?.success && res.data?.data) {
          seoCache.set(cacheKey, res.data.data);
          setSeoData(res.data.data);
        } else if (!cancelled) {
          seoCache.set(cacheKey, null);
        }
      })
      .catch(() => {
        // Graceful fallback — no SEO data is fine
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setResolved(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [entityType, entityId]);

  return { seoData, loading, resolved };
}
