import { describe, it, expect } from "vitest";
import {
  computeReorderTotals,
  getPriceForQuantity,
  identifiesProduct,
  isOrderableQuantity,
  repriceLines,
  resolveUnitPrice,
} from "../utils/reorderPricing";

/**
 * Every test here locks down a defect that actually shipped in the re-order
 * flow, and each was found by review rather than by a test — which is the
 * reason this file exists. Where a test can show the old wrong number next to
 * the new right one, it does, so a regression reports the amount rather than
 * just going red.
 */

// A supplier ladder: cheaper per unit as the quantity climbs.
const LADDER = [
  { qty: 1, price: 8.0 },
  { qty: 50, price: 7.0 },
  { qty: 100, price: 6.0 },
];

const productWith = (priceBreaks, id = 123) => ({
  meta: { id },
  product: { prices: { price_groups: [{ base_price: { price_breaks: priceBreaks } }] } },
});

describe("getPriceForQuantity", () => {
  it("picks the break the quantity has reached, not the next one up", () => {
    expect(getPriceForQuantity(1, LADDER)).toBe(8.0);
    expect(getPriceForQuantity(49, LADDER)).toBe(8.0);
    expect(getPriceForQuantity(50, LADDER)).toBe(7.0);
    expect(getPriceForQuantity(99, LADDER)).toBe(7.0);
    expect(getPriceForQuantity(100, LADDER)).toBe(6.0);
    expect(getPriceForQuantity(10000, LADDER)).toBe(6.0);
  });

  it("does not depend on the ladder arriving sorted", () => {
    const shuffled = [LADDER[2], LADDER[0], LADDER[1]];
    expect(getPriceForQuantity(50, shuffled)).toBe(7.0);
  });

  it("falls back to the lowest break below the first threshold", () => {
    expect(getPriceForQuantity(0, LADDER)).toBe(8.0);
  });
});

describe("resolveUnitPrice separates 'cannot price' from 'costs nothing'", () => {
  // The bug: getPriceForQuantity returns 0 for an empty ladder, which is
  // indistinguishable from a genuinely free product — and that 0 was written
  // straight onto the line. So a product whose current data carries no price
  // breaks dropped to $0 the moment anyone touched the quantity, and stayed
  // confirmable, because its status was still AVAILABLE.
  it("returns null when there are no price breaks", () => {
    expect(resolveUnitPrice(productWith([]), 100)).toBeNull();
    expect(resolveUnitPrice(productWith(undefined), 100)).toBeNull();
    expect(resolveUnitPrice({ meta: { id: 1 } }, 100)).toBeNull();
    expect(resolveUnitPrice(null, 100)).toBeNull();
    expect(resolveUnitPrice(undefined, 100)).toBeNull();
  });

  it("and specifically NOT zero, which is what used to be charged", () => {
    // The distinction is the entire fix. If this ever returns 0 again, a
    // product nobody can price becomes a product sold for nothing.
    expect(resolveUnitPrice(productWith([]), 100)).not.toBe(0);
    expect(getPriceForQuantity(100, [])).toBe(0); // the raw helper still does
  });

  it("returns the live price when the product can be priced", () => {
    expect(resolveUnitPrice(productWith(LADDER), 100)).toBe(6.0);
    expect(resolveUnitPrice(productWith(LADDER), 50)).toBe(7.0);
  });

  it("finds the base price group among several", () => {
    const multi = {
      meta: { id: 9 },
      product: {
        prices: {
          price_groups: [
            { decoration: { price_breaks: [{ qty: 1, price: 99 }] } },
            { base_price: { price_breaks: LADDER } },
          ],
        },
      },
    };
    expect(resolveUnitPrice(multi, 100)).toBe(6.0);
  });
});

describe("isOrderableQuantity", () => {
  // min="1" does not stop React's onChange accepting 0 or "", and Confirm was
  // never gated on HTML validity.
  it("accepts a whole number of at least one", () => {
    expect(isOrderableQuantity(1)).toBe(true);
    expect(isOrderableQuantity(100)).toBe(true);
    expect(isOrderableQuantity("100")).toBe(true); // inputs give strings
  });

  it("rejects the values that produced a $0 quote and a real charge", () => {
    for (const bad of [0, "0", "", " ", null, undefined, -1, 1.5, "1.5", NaN, "abc", [], {}]) {
      expect(isOrderableQuantity(bad)).toBe(false);
    }
  });

  it("rejects a blank string in particular", () => {
    // Number("") is 0 and Number.isInteger(0) is true, so a naive check passes
    // this. It is the exact value a customer produces by clearing the box.
    expect(Number.isInteger(Number(""))).toBe(true);
    expect(isOrderableQuantity("")).toBe(false);
  });
});

describe("identifiesProduct", () => {
  // AVAILABLE used to mean Boolean(result.value?.product). A 200 carrying {},
  // [] or a different product is truthy, and would be charged at the price
  // frozen in the old order.
  it("accepts a response naming the product asked about", () => {
    expect(identifiesProduct({ meta: { id: 123 } }, 123)).toBe(true);
    expect(identifiesProduct({ meta: { id: 123 } }, "123")).toBe(true);
    expect(identifiesProduct({ id: 123 }, 123)).toBe(true);
  });

  it("refuses a truthy response that identifies nothing", () => {
    expect(identifiesProduct({}, 123)).toBe(false);
    expect(identifiesProduct([], 123)).toBe(false);
    expect(identifiesProduct([{ meta: { id: 123 } }], 123)).toBe(false);
    expect(identifiesProduct("ok", 123)).toBe(false);
    expect(identifiesProduct(null, 123)).toBe(false);
  });

  it("refuses a response about a DIFFERENT product", () => {
    // The worst case: plausible, well-formed, and about something else.
    expect(identifiesProduct({ meta: { id: 999 } }, 123)).toBe(false);
  });
});

describe("computeReorderTotals matches what the server will charge", () => {
  // Mirrors controllers/checkoutSessionController.js. The modal used to add the
  // ORIGINAL order's GST to a filtered subtotal, and never showed the setup fee
  // at all despite still sending it — so the quote was wrong on EVERY re-order
  // that had a setup fee, and wrong twice over on a partial one.
  const A = { price: 100, quantity: 1 };
  const B = { price: 100, quantity: 1 };

  // The server's arithmetic, written out independently so the test is not just
  // the implementation restated.
  const serverCharge = ({ products, shipping = 0, setupFee = 0, gstPercent = 10 }) => {
    const subtotal = products.reduce(
      (s, p) => s + (Math.round((Number(p.price) || 0) * 100) / 100) * (Number(p.quantity) || 0),
      0
    );
    const preTax = Math.max(subtotal + setupFee, 0) + shipping;
    return preTax + (preTax * gstPercent) / 100;
  };

  const cases = [
    { label: "one line dropped, no setup fee", lines: [A], shipping: 0, setupFee: 0, oldModal: 120.0 },
    { label: "one line dropped, with setup fee", lines: [A], shipping: 15, setupFee: 50, oldModal: 135.0 },
    { label: "nothing dropped at all", lines: [A, B], shipping: 15, setupFee: 50, oldModal: 241.5 },
    {
      label: "fractional prices",
      lines: [{ price: 19.95, quantity: 3 }],
      shipping: 9.9,
      setupFee: 12.345,
      oldModal: 77.52,
    },
  ];

  it.each(cases)("$label: quote equals charge", ({ lines, shipping, setupFee }) => {
    const quoted = computeReorderTotals({
      orderableLines: lines,
      shipping,
      setupFee,
      gstPercent: 10,
    }).total;
    const charged = serverCharge({ products: lines, shipping, setupFee, gstPercent: 10 });
    expect(quoted.toFixed(2)).toBe(charged.toFixed(2));
  });

  it("shows how far out the old modal was, including when nothing was dropped", () => {
    // The last row is the one that matters most: an UNTOUCHED re-order was
    // misquoted by exactly the invisible setup fee.
    for (const c of cases) {
      const quoted = computeReorderTotals({
        orderableLines: c.lines,
        shipping: c.shipping,
        setupFee: c.setupFee,
        gstPercent: 10,
      }).total;
      expect(Number(quoted.toFixed(2))).not.toBe(c.oldModal);
    }

    const untouched = computeReorderTotals({
      orderableLines: [A, B],
      shipping: 15,
      setupFee: 50,
      gstPercent: 10,
    });
    expect(untouched.total.toFixed(2)).toBe("291.50"); // old modal said 241.50
    expect(untouched.setupFee).toBe(50); // and never showed this at all
  });

  it("quantises each line to cents the way the server does", () => {
    // Summing raw floats here and cents there is how a quote drifts by a cent.
    const line = { price: 3.3249999999999997, quantity: 3 };
    const quoted = computeReorderTotals({ orderableLines: [line], gstPercent: 10 });
    const charged = serverCharge({ products: [line], gstPercent: 10 });
    expect(quoted.total.toFixed(2)).toBe(charged.toFixed(2));
    expect(quoted.subtotal).toBe(Math.round(3.3249999999999997 * 100) / 100 * 3);
  });

  it("defaults a missing GST rate to 10 rather than zero", () => {
    const t = computeReorderTotals({ orderableLines: [A], gstPercent: undefined });
    expect(t.gstPercent).toBe(10);
    expect(t.total.toFixed(2)).toBe("110.00");
  });

  it("an empty orderable set is zero, not NaN", () => {
    const t = computeReorderTotals({ orderableLines: [], shipping: 0, setupFee: 0 });
    expect(t.subtotal).toBe(0);
    expect(t.total).toBe(0);
    expect(Number.isNaN(t.total)).toBe(false);
  });

  it("survives being called with nothing at all", () => {
    expect(computeReorderTotals().total).toBe(0);
  });
});

describe("the repricing rule the lookup applies", () => {
  // CRITICAL 1: repricing lived only inside the quantity-change handler, so a
  // customer who opened a re-order and pressed Confirm paid the price frozen in
  // the historical order.
  it("a live price change is picked up without touching the quantity", () => {
    const historicalLine = { id: 123, price: 5.0, quantity: 100 };
    const liveDetail = productWith([{ qty: 100, price: 6.0 }], 123);

    const unitPrice = resolveUnitPrice(liveDetail, historicalLine.quantity);
    expect(unitPrice).toBe(6.0);

    const repriced = { ...historicalLine, price: unitPrice };
    const quoted = computeReorderTotals({ orderableLines: [repriced], gstPercent: 10 });
    const stale = computeReorderTotals({ orderableLines: [historicalLine], gstPercent: 10 });

    expect(quoted.subtotal).toBe(600); // what it costs now
    expect(stale.subtotal).toBe(500); // what the customer used to be charged
  });

  it("an unpriceable product is refused rather than repriced to zero", () => {
    const historicalLine = { id: 123, price: 5.0, quantity: 100 };
    const liveDetail = productWith([], 123); // still exists, no current ladder

    expect(identifiesProduct(liveDetail, 123)).toBe(true); // identity alone says yes
    expect(resolveUnitPrice(liveDetail, historicalLine.quantity)).toBeNull(); // pricing says no
  });
});

describe("repriceLines — the loop, not just the functions", () => {
  // This block exists because the first version of these tests proved the
  // pricing functions and never exercised the loop that calls them. The loop
  // iterated Object.entries(), whose keys are ALWAYS STRINGS, and then compared
  // them with `p.id === id`. With numeric product ids nothing ever matched its
  // own line: every line fell through to "cannot price", was demoted to
  // UNVERIFIED, and the whole re-order feature was dead. Fail-closed, so nobody
  // was overcharged — but a green test suite said it was fine.
  const detail = productWith(LADDER, 123);

  it("reprices a line whose id is a NUMBER", () => {
    const priced = new Map([[123, detail]]);
    const lines = [{ id: 123, price: 5.0, quantity: 100 }];

    const { repriced, unpriceable } = repriceLines(priced, lines);

    expect(unpriceable).toEqual([]);
    expect(repriced.get(123)).toBe(6.0); // live price, not the historical 5.00
  });

  it("reprices a line whose id is a STRING", () => {
    const priced = new Map([["abc-123", productWith(LADDER, "abc-123")]]);
    const lines = [{ id: "abc-123", price: 5.0, quantity: 100 }];

    const { repriced } = repriceLines(priced, lines);
    expect(repriced.get("abc-123")).toBe(6.0);
  });

  it("does not silently lose a numeric id to string coercion", () => {
    // The exact regression, stated as an invariant: the key that comes back out
    // must be the key that went in, same type included.
    const priced = new Map([[123, detail]]);
    const { repriced } = repriceLines(priced, [{ id: 123, quantity: 100 }]);

    expect([...repriced.keys()]).toEqual([123]);
    expect(repriced.has("123")).toBe(false);
    expect(repriced.has(123)).toBe(true);
  });

  it("marks a line unpriceable rather than repricing it to zero", () => {
    const priced = new Map([[123, productWith([], 123)]]);
    const { repriced, unpriceable } = repriceLines(priced, [
      { id: 123, price: 5.0, quantity: 100 },
    ]);

    expect(unpriceable).toEqual([123]);
    expect(repriced.size).toBe(0);
  });

  it("marks a line unpriceable when its quantity is invalid", () => {
    const priced = new Map([[123, detail]]);
    for (const bad of [0, "", null, undefined, 1.5]) {
      const { unpriceable } = repriceLines(priced, [{ id: 123, quantity: bad }]);
      expect(unpriceable).toEqual([123]);
    }
  });

  it("marks a line unpriceable when it has no matching order line at all", () => {
    const priced = new Map([[999, detail]]);
    const { repriced, unpriceable } = repriceLines(priced, [{ id: 123, quantity: 100 }]);

    expect(unpriceable).toEqual([999]);
    expect(repriced.size).toBe(0);
  });

  it("handles a mixed batch without letting one bad line affect the others", () => {
    const priced = new Map([
      [1, productWith(LADDER, 1)],
      [2, productWith([], 2)], // identified, cannot be priced
      [3, productWith(LADDER, 3)],
    ]);
    const lines = [
      { id: 1, quantity: 100 },
      { id: 2, quantity: 100 },
      { id: 3, quantity: 50 },
    ];

    const { repriced, unpriceable } = repriceLines(priced, lines);

    expect(repriced.get(1)).toBe(6.0);
    expect(repriced.get(3)).toBe(7.0);
    expect(unpriceable).toEqual([2]);
  });

  it("copes with an empty batch", () => {
    const { repriced, unpriceable } = repriceLines(new Map(), []);
    expect(repriced.size).toBe(0);
    expect(unpriceable).toEqual([]);
  });
});
