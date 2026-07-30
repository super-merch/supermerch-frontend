# Shirts (PU) "Under $5" budget bucket — verification report

Requested: confirm whether "Under $5" is genuinely unavailable for Shirts, or whether the
verifier removed it for some other reason. Checked directly against the live API
(`/api/params-products`, the real endpoint Category Finder pages call), not inferred.

## 1. Qualifying count under $5, for all six quantity buckets

| Quantity bucket | `moq` value used | `min_price=0&max_price=5` item_count |
|---|---|---|
| 1–24 | 24 | **0** |
| 25–49 | 49 | **0** |
| 50–99 | 99 | **0** |
| 100–249 | 249 | **0** |
| 250–499 | 499 | **0** |
| 500+ | 500 | **0** |

Budget alone (no quantity filter at all): `min_price=0&max_price=5` → **item_count: 0**.
For comparison, the very next bucket up, `$5–$10` alone, is **also 0**. The category is
genuinely unfiltered-baseline **2,952** products.

## 2. Qualifying product examples

None exist to show — there are zero products in this price range at any quantity. This is not
a sampling gap; it's a real zero across the whole category.

## 3. Displayed price vs. API/filter price

Both are the exact same field: `product.pricingSummary.finalMinPrice`. Confirmed by reading
`src/components/Common/ProductCard.jsx` (renders `pricingSummary.finalMinPrice` under
"Starting From") and comparing against what the budget filter check reads
(`lib/verifyFilterMappings.mjs`'s `productPrice()`, same field). There is no drift between what
a customer sees and what the filter tests against for this category.

The actual cheapest real products in the whole 2,952-product category, sorted by price:

| Product | Displayed / API price (`finalMinPrice`) |
|---|---|
| Hecom Kids Colour T-Shirt | $10.96 |
| Hecom Adult Colour T-Shirt | $11.10 |
| Yuk Adult T-Shirt | $11.10 |
| Slem Women T-Shirt | $11.10 |
| Premium Adult Colour T-Shirt | $11.52 |

The floor of the entire category is **$10.96** — more than double the top of the "Under $5"
bucket and still above "$5–$10".

## 4. Correct quantity tier

Verified the tier resolution directly from a real product's `price_groups[0].base_price.price_breaks`
(the same array `productIsOrderableAtQuantity` walks): each quantity bucket's `moq` value
correctly resolves to the highest price break `<= moq`. No tier-resolution bug found — the
per-bucket check introduced in the previous round tests each of the 6 real buckets individually
and every one legitimately returns zero matching products in the $0–$5 range.

## 5. Standard one-colour decoration cost

`finalMinPrice` (the displayed/base price) is for the **undecorated** product only. Decoration
is priced as a separate `additions` entry with its own per-quantity price breaks, e.g. for the
cheapest real product (Hecom Kids Colour T-Shirt, base $10.96):

| Decoration option | Price at qty 50 | Price at qty 1000 |
|---|---|---|
| Screen Printing (8cm x 5cm, 1 colour, max 6 colours available) | $8.06 | $2.40 |
| Screen Transfer (8cm x 8cm) | $8.06 | (lower at higher qty) |

Adding even the cheapest one-colour decoration option to the cheapest real product in the
category (base $10.96 + decoration from $2.40–$8.06 depending on quantity) puts the genuine
landed cost well above $10 at every quantity tested, and nowhere close to $5. Factoring in
decoration makes "Under $5" even less achievable than the undecorated base price alone already
shows.

## Conclusion

**"Under $5" (and "$5–$10") were correctly removed.** This is not a verifier artifact, not a
quantity-tier bug, and not a stale sample: the entire 2,952-product Shirts category has no
product priced below $10.96 undecorated, at any quantity, and decoration only pushes real
landed cost higher. Per the mandate ("Keep Under $5 only when quantity-aware live pricing
returns genuine products... hide or revise the bucket if it produces misleading/empty
experiences"), removing it is the correct, honest outcome, not a defect to fix.
