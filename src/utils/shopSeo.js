export const getShopSeoContext = (search = "") => {
  const params = new URLSearchParams(search);
  const category = params.get("category")?.trim() || "";

  return {
    entityId: category || "shop",
    canonicalPath: category
      ? `/shop?category=${encodeURIComponent(category)}`
      : "/shop",
  };
};

