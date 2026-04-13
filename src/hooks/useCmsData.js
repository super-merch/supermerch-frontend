import { useState, useEffect } from "react";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const cmsCache = new Map();

/**
 * Fetch CMS data from backend with module-level cache.
 * @param {string} url — relative API path (e.g. "/api/general-cms/by-slug/why-us")
 */
export default function useCmsData(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("empty-initial");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const fullUrl = `${backendUrl}${url}`;

    if (cmsCache.has(fullUrl)) {
      setData(cmsCache.get(fullUrl));
      setSource("api-cache");
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    axios
      .get(fullUrl)
      .then((res) => {
        const nextData = res?.data?.data;
        if (!cancelled && res.data?.success) {
          cmsCache.set(fullUrl, nextData);
          setData(nextData);
          setSource("api");
          setError(null);
        } else if (!cancelled) {
          setData(null);
          setSource("api-invalid");
          setError("Invalid CMS response");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setSource("api-error");
          setError(err?.message || "Request failed");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (import.meta.env.DEV) {
    // Dev-only tracing for quickly validating API vs fallback behavior.
    console.debug("[useCmsData]", {
      url,
      source,
      hasData: Array.isArray(data) ? data.length > 0 : Boolean(data),
      error,
    });
  }

  return { data, loading, source, error };
}
