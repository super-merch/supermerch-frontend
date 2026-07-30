const stableAttributes = (attributes) => {
  const list = Array.isArray(attributes)
    ? attributes
    : attributes?.name && attributes?.value
      ? [attributes]
      : [];

  return list
    .map((attribute) => ({
      name: String(attribute?.name || ""),
      value: String(attribute?.value || ""),
    }))
    .sort((a, b) =>
      a.name === b.name
        ? a.value.localeCompare(b.value)
        : a.name.localeCompare(b.name),
    );
};

export const buildProductsFilterKey = (paginationData = {}) =>
  JSON.stringify({
    productTypeId: paginationData.productTypeId || "",
    category: paginationData.category || "",
    searchTerm: paginationData.searchTerm || "",
    sortOption: paginationData.sortOption || "",
    pricerange: paginationData.pricerange || null,
    colors: paginationData.colors || null,
    expressWindow: paginationData.expressWindow || "",
    moq: paginationData.moq || "",
    attributes: stableAttributes(paginationData.attributes),
  });
