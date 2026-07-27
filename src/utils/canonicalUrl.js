const SITE_URL = "https://www.supermerch.com.au";
const REMOVED_QUERY_PARAMS = new Set([
  "page",
  "sort",
  "view",
  "gclid",
  "fbclid",
]);

export const toCanonicalUrl = (value, pathname) => {
  const path =
    pathname ||
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const url =
    value && String(value).trim() ? String(value).trim() : `${SITE_URL}${path}`;

  try {
    const parsed = new URL(url, SITE_URL);
    parsed.protocol = "https:";
    if (parsed.hostname === "supermerch.com.au") {
      parsed.hostname = "www.supermerch.com.au";
    }
    [...parsed.searchParams.keys()].forEach((key) => {
      const normalizedKey = key.toLowerCase();
      if (
        REMOVED_QUERY_PARAMS.has(normalizedKey) ||
        normalizedKey.startsWith("utm_")
      ) {
        parsed.searchParams.delete(key);
      }
    });
    parsed.hash = "";
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }
    return parsed.toString();
  } catch {
    return `${SITE_URL}${path}`;
  }
};

