/**
 * Generate a URL-friendly slug from product name
 * Examples:
 *   "Shirt - Jacket (Unisex)" => "shirt-jacket-unisex"
 *   "SOLS Prime Men's Polo Shirt" => "sols-prime-mens-polo-shirt"
 */
export function generateProductSlug(productName) {
  if (!productName) return "";
  
  return String(productName)
    .toLowerCase()
    .replace(/[&]/g, "and")                    // Replace & with and
    .replace(/[^\w\s-]/g, "")                  // Remove special chars except hyphen
    .replace(/\s+/g, "-")                      // Replace spaces with hyphens
    .replace(/-+/g, "-")                       // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, "");                  // Remove leading/trailing hyphens
}

export default generateProductSlug;
