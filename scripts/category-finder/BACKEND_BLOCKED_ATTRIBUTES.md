# Owner-requested attributes blocked by the current backend

Verified live against the production API (`api.supermerch.com.au`), not assumed:

```
GET /api/params-products?product_type_ids=PR-05&attribute_name=Size&attribute_value=A5&limit=3&page=1
  -> item_count: 0
GET /api/params-products?product_type_ids=PR-05&limit=1&page=1   (unfiltered baseline)
  -> item_count: 29
```

Diaries (`PR-05`) has a real `Size=A5`-style value on many products -- but it lives in
`product.details` (a raw, per-supplier free-text field), not in
`product.categorisation.promodata_attributes`. `attribute_name`/`attribute_value` filtering
only ever matches `promodata_attributes` (confirmed by reading
`supermerch-backend/controllers/allProductsController.js` and
`supermerch-backend/utils/getAllV2Products.js`: the filter builds a regex OR strictly against
that one array field). There is also no generic keyword/search parameter that narrows within a
category -- `search=A5` and `searchTerm=A5` both returned the full unfiltered count (29), proving
neither is wired to do anything inside a category listing.

**This means: any owner-requested attribute whose only real signal lives in `product.details`,
the product name, or the description cannot be shipped as a genuine, working Finder filter from
the frontend alone.** Building a dropdown for it anyway would either do nothing (if wired to a
param the backend ignores) or lie to the customer (if the UI implies narrowing that never
actually happens server-side). Neither is acceptable, so these are documented here as blocked,
not implemented with a fake filter.

## Blocked (backend change required)

| Owner decision | Real signal found | Where it lives | Why `attribute_value` can't use it |
|---|---|---|---|
| Caps -- Cap Type | No structured attribute at all; only inferable from product name ("Trucker Cap", "Snapback", ...) | product name/description | Not in `promodata_attributes`; no keyword/search param exists in the category listing endpoints |
| Notebooks -- Notebook Size | `Size=A5` (some SKUs), `Item Size=150 x 208mm (LxH)` (most), title often contains "A5" etc. | `product.details`, product name | Not in `promodata_attributes` |
| Diaries -- Diary Size | `Size=A5` (e.g. Moleskine planners) | `product.details` | Not in `promodata_attributes` |
| Umbrellas -- Size | `Rib Length=76cm`/`Style=Full` vs `Rib Length=52cm`/`Style=Compact` | `product.details` | Not in `promodata_attributes` |
| Paper Bags / Grocery Bags / Tote Bags -- Size | `Product Size=33.5 x 36 x 12cm  Handle Size: 45.5 x 3cm` (handle called out separately -- good, but still not usable) | `product.details` | Not in `promodata_attributes` |
| Lanyards -- Width | Three different raw formats across suppliers: `Product Size=900x15/20/25mm loop`, `Item Size=450 x 15mm (LxH), ...`, `Dimensions=L 490 x W 20`; some products encode width directly in the name (`"Custom Printed Lanyard - 12mm"`) | `product.details`, product name | Not in `promodata_attributes` |
| Candles -- Size | `Dimensions=H 30` or `Size=100mm(h) x 90mm Ø` (inconsistent per-supplier field naming) | `product.details` | Not in `promodata_attributes` |

## Not blocked (implemented in this PR)

These reuse the real `Material` value(s) already present in `promodata_attributes` -- no new
data source, just a documented per-product remapping (see `lib/materialClassifiers.mjs`):

- Beanies -- Fabric
- Coasters -- Material
- Metal Pens -- primary body material

And Workwear Visibility, which reuses the real `Compliance` attribute already in
`promodata_attributes` (see `lib/customAttributeDerivation.mjs`'s `splitWorkwearCompliance`) --
though note Visibility itself is also constrained: the SAME positive-match-only limitation means
only "Hi-Vis" can be offered, never a genuine "Non-Hi-Vis" (see the `workwear_visibility` family
comment in `families.js` for the full writeup, and this doc's next section).

## Newly found: a derived CLASSIFICATION LABEL is not automatically a real filter value

Caught by the live-verification pass, not assumed in advance. `attribute_name`/`attribute_value`
does an exact (word-boundary) regex match against the LITERAL strings already present in
`product.categorisation.promodata_attributes` -- it has no concept of a "classification label"
that groups several raw supplier strings together. Confirmed live:

```
GET .../params-products?product_type_ids=PY-06&attribute_name=Material&attribute_value=Metal+with+Bamboo+Accent
  -> item_count: 0        (never exists verbatim -- it's a derived label, not a raw tag)
GET .../params-products?product_type_ids=PY-06&attribute_name=Material&attribute_value=Aluminium
  -> item_count: 150      (a REAL literal raw value -- works)
```

This split the 3 owner-requested Material-reclassification filters into two different outcomes:

- **Coasters' "Coaster Material" and Beanies' "Fabric"** group several raw supplier synonyms
  into one clean bucket (e.g. real observed values like "Bamboo"/"Wood"/"Timber" -> the single
  label "Bamboo/Wood"). This is architecturally fixable the same way colour normalization already
  works (`lib/colourNormalization.mjs`): build each option's filter `value` as a comma-joined list
  of the REAL raw synonyms that map to that bucket (the backend's attribute filter already ORs
  comma-separated values under one `attribute_name`, confirmed by reading
  `getAllV2Products.js`'s `groupedValues`/`$or` construction) instead of the bucket label itself.
  **Not yet implemented** -- currently ships with only the literal-match subset (e.g. Coasters:
  "Cork" alone survived live verification; every grouped-synonym option was correctly stripped
  rather than shipped broken). Tracked as follow-up engineering work, not abandoned.
- **Metal Pens' compound buckets ("Metal with Bamboo Accent", "Metal with Recycled/Other
  Accent")** are fundamentally different: `classifyMetalPenMaterial` requires CO-OCCURRENCE of
  two raw tags on the SAME product (e.g. a metal keyword AND "Bamboo" together). No comma-joined
  value list can express this: the backend's filter is OR-only within one `attribute_name`, with
  no AND/compound-condition mechanism for two facts about the same product. Even a perfectly
  constructed synonym list would over-match (e.g. a plain Aluminium pen with no bamboo accent
  would incorrectly match a filter built from "Aluminium,Bamboo"). **This is a genuine backend
  limitation, not an implementation gap** -- live verification correctly stripped these 3 options,
  leaving Metal Pens' "Primary Body Material" filter shipping with only the 2 real literal values
  (Aluminium, Stainless Steel) it can honestly support today.

## Also blocked: a genuine "Non-Hi-Vis" filter

Separate from the 7 attributes above, but the same root cause: `getAllV2Products.js`'s attribute
filter builds only a positive OR-of-regexes against `promodata_attributes`. There is no
negation/exclude mechanism anywhere in that code path. A customer selecting "Hi-Vis" narrows
correctly (positive match); there is no way to ask the backend for "does NOT have
Compliance:Hi-Vis" today. Workwear Visibility therefore ships as a positive-only filter --
selecting "Hi-Vis" narrows to Hi-Vis products, leaving it unselected shows everything (Hi-Vis and
non-Hi-Vis alike, via the Finder's existing "Any" default) -- and never claims to support an
explicit "Non-Hi-Vis" toggle.

## What a backend fix would look like

All 7 blocked attributes above share the same fix shape: compute the derived value at
product-sync/classification time (wherever `promodata_attributes` is currently populated from
supplier data) and write it into that same array, e.g. `"Cap Type: Trucker Cap"` or
`"Notebook Size: A5"`. Once the value exists in `promodata_attributes`, the EXISTING
`attribute_name`/`attribute_value` filter mechanism works for it with zero further backend
changes -- this is not a request to build a new filter mechanism, only to populate the field the
current one already reads correctly. A genuine Non-Hi-Vis filter would additionally need a real
negation mechanism (e.g. an `attribute_value_excludes` param), which is a materially bigger change
than the other 7 and should be scoped separately.

See the companion backend PR (branch, not merged/deployed) for a concrete proposal covering
Cap Type, Notebook/Diary Size, Umbrella Size, Bag Size, Lanyard Width, and Candle Size.
