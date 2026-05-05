import { createContext, useContext } from "react";

/** Prefetched payload from `GET /api/single-product/:id` (clothing/headwear branch only). */
export const ProductPrefetchContext = createContext(null);

export function useProductPrefetch() {
  return useContext(ProductPrefetchContext);
}
