// Dedupes products sampled across paginated strata by catalogue-record
// identity. MongoDB's `_id` is the authoritative identity for a catalogue
// record; `meta.id` is a lighter-weight identifier that can be absent, or --
// more importantly -- shared across genuinely distinct product records (e.g.
// variants sharing a display/meta id), which would otherwise wrongly
// collapse two different products into a single sampled record. `_id` is
// therefore preferred, with `meta.id` used only as a fallback when `_id`
// isn't present.
export function dedupeProductsById(products) {
  const seenIds = new Set();
  const deduped = [];
  for (const product of products) {
    const id = product?._id ?? product?.meta?.id;
    if (id != null && seenIds.has(id)) continue;
    if (id != null) seenIds.add(id);
    deduped.push(product);
  }
  return deduped;
}
