import { createContext, useContext } from "react";

/** `"workwearShell"` = apply Workwear-like outer chrome around PDP; default = legacy chrome. */
export const ProductLayoutContext = createContext(null);

export function useProductLayout() {
  return useContext(ProductLayoutContext);
}
