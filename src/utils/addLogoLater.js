/**
 * Resolve "add logo later" from workwear-style customization payloads
 * (WorkwearCustomizationModal / deal slot customizations).
 */
export function resolveAddLogoLaterFromCustomizationData(customizationData) {
  if (!customizationData || typeof customizationData !== "object") {
    return false;
  }
  if (customizationData.addLogoLater === true) {
    return true;
  }
  const content = customizationData.content;
  if (content && typeof content === "object" && content.addLogoLater === true) {
    return true;
  }
  return false;
}
