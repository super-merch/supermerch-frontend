/**
 * Cleans decoration method names by stripping lead time prefixes and setup suffixes.
 * @param {string} name - The raw description or promodata_decoration string.
 * @returns {string} - The cleaned name.
 */
export const getCleanArtworkName = (input) => {
  if (!input) return "";

  let name = "";
  if (typeof input === "object") {
    // Priority: promodata_decoration, then description, then type
    name = input.promodata_decoration || input.description || input.type || "Artwork";
  } else {
    name = String(input);
  }

  return cleanStringName(name);
};

const cleanStringName = (name) => {
  if (!name || typeof name !== "string") return String(name || "");

  let cleanName = name;
  
  // 1. Strip lead time prefix like "8 week, " or "10-15 working days, " or "3 week "
  // Matches: 
  // - "8 week, "
  // - "10-15 working days, "
  // - "3 week " (no comma)
  cleanName = cleanName.replace(
    /^\d+[-\d]*\s*(week|day)s?(\s+working\s+days)?(\s*,\s*|\s+)/i,
    "",
  );

  // 2. Strip common setup/charge suffixes
  // Remove everything after " - Set up" or " - Setup"
  cleanName = cleanName.replace(/\s*-\s*set\s*up.*$/i, "");
  
  // 3. Strip parentheses content (often contains setup/charge info)
  cleanName = cleanName.split(" (")[0];

  return cleanName.trim();
};

export const isNonArtworkAddition = (group) => {
  const decoration = String(group?.promodata_decoration || "").toLowerCase();
  const description = String(group?.description || "").toLowerCase();

  const nonArtworkPatterns = [
    "polybag",
    "packaging",
    "surcharge",
    "metallic thread",
    "additional charge",
    "additional 5,000",
    "additional 5000",
  ];

  return nonArtworkPatterns.some(
    (token) => description.includes(token) || decoration.includes(token),
  );
};
