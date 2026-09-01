import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { ProductsContext } from "../context/ProductsContext";
import { AuthContext } from "../context/AuthContext";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaCheckCircle, FaTimesCircle, FaCommentDots, FaImage, FaClock } from "react-icons/fa";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  computeReorderTotals,
  identifiesProduct,
  isOrderableQuantity,
  resolveUnitPrice,
} from "../utils/reorderPricing";
import { loadStripe } from "@stripe/stripe-js";
import { slugify, toProductUrl } from "@/utils/utils";

const LINE_STATUS = {
  UNKNOWN: "unknown",
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
  UNVERIFIED: "unverified",
};

// One stalled lookup must not hold the whole modal open indefinitely.
const REORDER_LOOKUP_TIMEOUT_MS = 15000;

const UserProducts = () => {
  const { userOrder, loading, user, loadUserOrder } = useContext(AuthContext);
  const { marginAdd, marginApi } = useContext(ProductsContext);
  const { newId, setActiveTab, backendUrl } = useContext(AppContext);
  const hasRequestedMarginRef = useRef(false);

  useEffect(() => {
    if (!hasRequestedMarginRef.current && !Object.keys(marginApi || {}).length) {
      hasRequestedMarginRef.current = true;
      marginAdd();
    }
  }, [marginApi, marginAdd]);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || newId;
  const reorderStorageKey = orderId
    ? `reorder_modal_open_${orderId}`
    : "reorder_modal_open";

  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderResolveLoading, setOrderResolveLoading] = useState(true);
  const [reOrderModal, setReOrderModal] = useState(false);
  const [reOrderLoading, setReOrderLoading] = useState(false);
  const [editableProducts, setEditableProducts] = useState([]);
  const [productDetails, setProductDetails] = useState({});

  // Availability is FOUR states, not two. The obvious design — a Set of
  // unavailable ids — quietly means "anything not in the Set is fine", so a
  // product is presumed orderable before it has been checked at all, and a
  // network blip is indistinguishable from a product that genuinely cannot be
  // sold. Both of those let a switched-off product through to Stripe.
  //
  //   UNKNOWN     not checked yet, or a check is in flight
  //   AVAILABLE   live lookup succeeded and returned a usable product
  //   UNAVAILABLE the backend says no — 404/410, or 200 with no product
  //   UNVERIFIED  we could not find out: timeout, 5xx, offline, rate limited
  //
  // Only AVAILABLE may be ordered. UNAVAILABLE is excluded and the rest of the
  // order proceeds. UNKNOWN or UNVERIFIED blocks Confirm entirely rather than
  // silently turning the customer's re-order into a partial one.
  const [lineStatus, setLineStatus] = useState({});

  // Guards against an obsolete lookup committing over the current one. Opening
  // order A, closing it and opening order B, then having A's slow response land
  // would otherwise overwrite B's availability and make a switched-off product
  // orderable again.
  const reorderRequestRef = useRef(0);
  const [popupLoading, setPopupLoading] = useState(false);

  // Proof review state
  const [proofs, setProofs] = useState([]);
  const [proofsLoading, setProofsLoading] = useState(false);
  const [respondingProofId, setRespondingProofId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [activeCommentProofId, setActiveCommentProofId] = useState(null);

  // Fetch proofs when order is loaded
  useEffect(() => {
    if (!selectedOrder?._id) return;
    const fetchProofs = async () => {
      setProofsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${backendUrl}/api/checkout/order/${selectedOrder._id}/proofs`,
          { headers: { token } },
        );
        if (data.success) setProofs(data.data || []);
      } catch (err) {
        console.error("Failed to fetch proofs:", err);
      } finally {
        setProofsLoading(false);
      }
    };
    fetchProofs();
  }, [selectedOrder?._id, backendUrl]);

  const handleProofRespond = async (proofId, status) => {
    setRespondingProofId(proofId);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${backendUrl}/api/checkout/proofs/${proofId}/respond`,
        { status, customerFeedback: feedbackText || undefined },
        { headers: { token } },
      );
      if (data.success) {
        toast.success(data.message);
        setProofs((prev) =>
          prev.map((p) =>
            p._id === proofId ? { ...p, status, respondedAt: new Date(), customerFeedback: feedbackText || p.customerFeedback } : p,
          ),
        );
        setFeedbackText("");
      }
    } catch (err) {
      toast.error("Failed to respond to proof");
    } finally {
      setRespondingProofId(null);
    }
  };

  const handleAddComment = async (proofId) => {
    if (!commentText.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const userName = selectedOrder?.user?.firstName
        ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName || ""}`.trim()
        : "Customer";
      const { data } = await axios.post(
        `${backendUrl}/api/checkout/proofs/${proofId}/comments`,
        { message: commentText.trim(), senderName: userName },
        { headers: { token } },
      );
      if (data.success) {
        setProofs((prev) =>
          prev.map((p) =>
            p._id === proofId ? { ...p, comments: [...(p.comments || []), data.data] } : p,
          ),
        );
        setCommentText("");
        toast.success("Comment added");
      }
    } catch (err) {
      toast.error("Failed to add comment");
    }
  };

  const getProofStatusBadge = (status) => {
    switch (status) {
      case "PENDING_REVIEW":
        return { label: "Awaiting Your Review", cls: "bg-amber-100 text-amber-800", icon: <FaClock className="w-3 h-3" /> };
      case "APPROVED":
        return { label: "Approved", cls: "bg-green-100 text-green-800", icon: <FaCheckCircle className="w-3 h-3" /> };
      case "REVISION_REQUESTED":
        return { label: "Revision Requested", cls: "bg-red-100 text-red-800", icon: <FaTimesCircle className="w-3 h-3" /> };
      case "SUPERSEDED":
        return { label: "Superseded", cls: "bg-gray-100 text-gray-500", icon: null };
      default:
        return { label: status, cls: "bg-gray-100 text-gray-600", icon: null };
    }
  };

  useEffect(() => {
    let cancelled = false;

    const resolveOrder = async () => {
      if (!orderId) {
        if (!cancelled) {
          setSelectedOrder(null);
          setOrderResolveLoading(false);
        }
        return;
      }

      if (loading) {
        if (!cancelled) setOrderResolveLoading(true);
        return;
      }

      const localMatch = (userOrder || []).find(
        (order) => String(order?._id) === String(orderId),
      );

      if (localMatch) {
        if (!cancelled) {
          setSelectedOrder(localMatch);
          setOrderResolveLoading(false);
        }
        return;
      }

      if (!cancelled) setOrderResolveLoading(true);

      try {
        const token = localStorage.getItem("token");
        const headers = token ? { token } : {};
        // A guest (no account) has no other way to prove this order is
        // theirs — the token was handed to them once, right after checkout.
        // Sent as a dedicated header, not a query string, which would leak
        // into browser history/logs/referrers.
        try {
          const guestAccessToken = localStorage.getItem(`guestOrderToken_${orderId}`);
          if (guestAccessToken) headers["x-guest-order-token"] = guestAccessToken;
        } catch {
          // localStorage unavailable — fall through with no token; a
          // logged-in customer's own auth still works via the `token` header.
        }
        const { data } = await axios.get(
          `${backendUrl}/api/checkout/products/${orderId}`,
          { headers },
        );
        const fetchedOrder = data?.data?.[0] || null;
        if (!cancelled) setSelectedOrder(fetchedOrder);
      } catch (error) {
        if (!cancelled) setSelectedOrder(null);
      } finally {
        if (!cancelled) setOrderResolveLoading(false);
      }
    };

    resolveOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId, userOrder, loading, backendUrl]);

  const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

  const extractSizesFromProduct = (productData) => {
    const details = productData?.product?.details || [];
    const detailString =
      details.find((d) =>
        ["sizing", "sizes", "size", "product sizes"].includes(
          String(d?.name || "").toLowerCase()
        )
      )?.detail || "";

    const headerSizes = String(detailString)
      .split("\n")[0]
      .split(/[|, ;:]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (headerSizes.length) return headerSizes;

    const description = productData?.product?.description || "";
    const sizesMatch = description.match(/Sizes:\s*([^\n]+)/i);
    if (!sizesMatch) return [];

    const sizesString = sizesMatch[1].trim();
    if (sizesString.includes(" - ")) {
      const [start, end] = sizesString.split(" - ").map((s) => s.trim());
      const startIndex = SIZE_ORDER.indexOf(start);
      const endIndex = SIZE_ORDER.indexOf(end);
      if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
        return SIZE_ORDER.slice(startIndex, endIndex + 1);
      }
    }

    return sizesString
      .split(/[|, ;:]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };


  const getColorsFromProduct = (productData) => {
    if (!productData?.product?.colours?.list) return [];
    return productData.product.colours.list
      .flatMap((colorObj) => colorObj.colours)
      .filter((color, index, array) => array.indexOf(color) === index);
  };

  const getPrintMethods = (productData) => {
    const priceGroups = productData?.product?.prices?.price_groups || [];
    if (!priceGroups.length) return [];

    const appaTypes = Object.keys(
      productData?.product?.categorisation?.appa_product_type || {}
    ).map((k) => k.toLowerCase());

    const typeGroup = String(
      productData?.product?.categorisation?.promodata_product_type?.type_group_name || ""
    ).toLowerCase();

    const isClothingLike =
      appaTypes.includes("clothing") ||
      typeGroup.includes("cloth") ||
      typeGroup.includes("workwear");

    const supplier = String(productData?.supplier?.supplier || "");

    if (isClothingLike) {
      const methods = [
        { key: "pocket-size-front-print", description: "Pocket size Front print" },
        { key: "pocket-size-front-embroidery", description: "Pocket size Front embroidery" },
        { key: "big-print-in-back", description: "Big Print in Back" },
        { key: "pocket-front-big-back", description: "Pocket size front + Big print back" },
        { key: "unbranded", description: "Unbranded" },
      ];
      return supplier === "AS Colour"
        ? methods.filter((m) => m.key !== "unbranded")
        : methods;
    }

    const groupMethods = priceGroups
      .map((group, groupIndex) => {
        const label =
          group?.description?.trim() ||
          group?.promodata_decoration?.trim() ||
          "";
        if (!label) return null;
        return { key: group?.key || `group-${groupIndex}-${label}`, description: label };
      })
      .filter(Boolean);

    const additionMethods = priceGroups.flatMap((group, groupIndex) =>
      (group?.additions || []).map((add, addIndex) => {
        const label =
          add?.description?.trim() ||
          add?.promodata_decoration?.trim() ||
          "";
        if (!label) return null;
        return {
          key: add?.key || `add-${groupIndex}-${addIndex}-${label}`,
          description: label,
        };
      })
    ).filter(Boolean);

    const seen = new Set();
    return [...groupMethods, ...additionMethods].filter((m) => {
      const k = m.description.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

const openReOrderModal = useCallback(async () => {
  if (!selectedOrder?._id) return;

  sessionStorage.setItem(reorderStorageKey, "1");

  const requestId = ++reorderRequestRef.current;
  const ids = [...new Set((selectedOrder?.products || []).map((p) => p.id))];

  setReOrderModal(true);
  setPopupLoading(true);
  setEditableProducts((selectedOrder?.products || []).map((p) => ({ ...p })));

  // Reset to UNKNOWN before anything is checked. Carrying the previous order's
  // verdicts over would present a stale result as current truth.
  setProductDetails({});
  setLineStatus(ids.reduce((acc, id) => ({ ...acc, [id]: LINE_STATUS.UNKNOWN }), {}));

  // allSettled, not all: a single 404 previously rejected the whole batch, so
  // EVERY line lost its details and fell back to the prices frozen in the old
  // order. Each request is bounded so one stalled lookup cannot hold the
  // others hostage indefinitely.
  const results = await Promise.allSettled(
    ids.map(async (id) => {
      const { data } = await axios.get(
        `${backendUrl}/api/single-product/${id}`,
        { timeout: REORDER_LOOKUP_TIMEOUT_MS }
      );
      return { id, product: data?.data };
    })
  );

  // A newer open superseded this one — discard rather than overwrite it.
  if (requestId !== reorderRequestRef.current) return;

  const details = {};
  const status = {};


  results.forEach((result, index) => {
    const id = ids[index];

    if (result.status === "fulfilled") {
      // Truthiness is not identification. A 200 carrying {}, [], or some
      // other product is truthy, and treating that as AVAILABLE would let the
      // line be charged at the price frozen in the old order on the strength of
      // a response that never confirmed this product exists. For a path built
      // to fail closed, the response has to actually name the thing we asked
      // about.
      const returned = result.value?.product;
      const identifies = identifiesProduct(returned, id);

      if (identifies) {
        details[id] = returned;
        // AVAILABLE has to mean PRICEABLE, not merely "the server named this
        // product". Identity alone left two ways to charge the wrong amount:
        // an untouched line kept the price frozen in the historical order even
        // though the live price had moved, and a product whose current data
        // carries no price breaks went to zero the moment anyone touched the
        // quantity. Resolving the price here settles both - if we cannot price
        // it now, we will not sell it now.
        status[id] = LINE_STATUS.AVAILABLE;
      } else if (returned) {
        // Answered, but not about this product. We cannot call that gone, and
        // we certainly cannot call it available.
        status[id] = LINE_STATUS.UNVERIFIED;
      } else {
        // 200 with no product is the backend saying it has nothing to sell.
        status[id] = LINE_STATUS.UNAVAILABLE;
      }
      return;
    }

    // Distinguish "the answer is no" from "we could not get an answer".
    // Treating an outage as unavailability would tell a customer their
    // perfectly saleable products are gone — and during a full outage, that
    // every item is gone, which is simply false.
    const httpStatus = result.reason?.response?.status;
    status[id] =
      httpStatus === 404 || httpStatus === 410
        ? LINE_STATUS.UNAVAILABLE
        : LINE_STATUS.UNVERIFIED;
  });

  // NOT REPRICED HERE, DELIBERATELY. See the note in utils/reorderPricing.js.
  //
  // A previous version of this reset each line to a freshly resolved price and
  // it was WORSE than the stale price it replaced: the resolver reads the first
  // base-price group and ignores both the line's colour and its decoration,
  // while the storefront matches the group by colour and ADDS the decoration.
  // On a business where nearly every line is branded, that silently
  // undercharged every decorated re-order. It also applied one price per
  // product id to every variant line sharing that id, which could move the
  // total in either direction by hundreds of dollars.
  //
  // Pricing a configured line correctly needs colour matching, decoration and
  // setup fees across two different product structures - the model the
  // server-side pricing branch is centralising. A simplified second copy of it
  // living here is how the existing mispricing defects were created, so this
  // no longer guesses. Re-order still carries the historical price; that is
  // unchanged from today and is tracked as a critical for the pricing branch,
  // where the whole model already lives.
  setProductDetails(details);
  setLineStatus(status);
  setPopupLoading(false);

  const counts = Object.values(status);
  const unavailable = counts.filter((s) => s === LINE_STATUS.UNAVAILABLE).length;
  const unverified = counts.filter((s) => s === LINE_STATUS.UNVERIFIED).length;

  if (unverified > 0) {
    toast.error("Couldn't check availability for every item. Please try again.");
  } else if (unavailable > 0) {
    toast.error(
      unavailable === ids.length
        ? "None of these items are available to re-order."
        : `${unavailable} item${unavailable > 1 ? "s are" : " is"} no longer available and will not be re-ordered.`
    );
  }
}, [selectedOrder, backendUrl, reorderStorageKey]);

const closeReOrderModal = useCallback(() => {
  // Bump the generation so any lookup still in flight discards itself when it
  // lands. Without this, closing was not a cancellation: the batch continued,
  // then wrote its statuses and fired a toast about an order the customer had
  // already dismissed - and did the same after the component unmounted. It
  // could not re-open the payment hole, because the next open resets everything
  // to UNKNOWN behind a fresh generation, but it is still a stale write and the
  // guard already existed for exactly this shape of problem.
  reorderRequestRef.current += 1;
  sessionStorage.removeItem(reorderStorageKey);
  setReOrderModal(false);
}, [reorderStorageKey]);

useEffect(() => {
  if (
    selectedOrder?._id &&
    !reOrderModal &&
    !popupLoading &&
    sessionStorage.getItem(reorderStorageKey) === "1"
  ) {
    openReOrderModal();
  }
}, [
  selectedOrder?._id,
  reOrderModal,
  popupLoading,
  openReOrderModal,
  reorderStorageKey,
]);


const updateEditableProduct = (index, field, value) => {
  setEditableProducts((prev) => {
    const updated = [...prev];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "quantity") {
      const detail = productDetails[updated[index].id];
      const unitPrice = isOrderableQuantity(value)
        ? resolveUnitPrice(detail, value)
        : null;
      if (unitPrice !== null) {
        updated[index].price = unitPrice;
        updated[index].subTotal = unitPrice * Number(value);
      }
    }
    return updated;
  });
};

const removeEditableProduct = (index) => {
  setEditableProducts((prev) => prev.filter((_, i) => i !== index));
};

// Only a line we have positively verified may be ordered. Everything else —
// unavailable, unverified, or not yet checked — is excluded from the money.
const isLineOrderable = (product) =>
  lineStatus[product.id] === LINE_STATUS.AVAILABLE;

const getEditableProductTotal = () => {
  // Excluded lines must not appear in the total either — otherwise the
  // customer is quoted a figure they will never be charged.
  //
  // Quantised to cents per line, because that is what the server does before
  // it builds the Stripe line items. Summing raw floats here and cents there
  // is how a quote drifts from a charge by a cent.
  return computeReorderTotals({
    orderableLines: editableProducts.filter(isLineOrderable),
  }).subtotal;
};

/**
 * What the customer will ACTUALLY be charged, computed the same way the server
 * computes it.
 *
 * The bug this replaces: the modal subtracted excluded lines from the subtotal
 * but then added the ORIGINAL order's GST, while the server recalculates GST
 * from whatever products it is sent. Two $100 lines with $20 GST, one line now
 * unavailable, and the modal said $120 while Stripe charged $110. The setup fee
 * was not shown at all, yet was still sent and still charged — so the quote
 * could be wrong in either direction.
 *
 * Mirrors controllers/checkoutSessionController.js:
 *   base   = subtotal + setupFee
 *   preTax = base - couponDiscount + shipping   (no coupon on a re-order)
 *   gst    = preTax * gstPercent / 100
 * Change one and change the other, or this silently drifts back apart.
 */
const getReorderTotals = () =>
  computeReorderTotals({
    orderableLines: editableProducts.filter(isLineOrderable),
    setupFee: selectedOrder?.setupFee,
    shipping: selectedOrder?.shipping,
    gstPercent: selectedOrder?.gstPercent,
  });

const orderableCount = editableProducts.filter(isLineOrderable).length;
const unavailableCount = editableProducts.filter(
  (p) => lineStatus[p.id] === LINE_STATUS.UNAVAILABLE
).length;
// Anything we could not check, or have not checked yet. These block the whole
// re-order rather than being quietly dropped: turning "we don't know" into a
// partial order would charge for some items and silently abandon others the
// customer still wants.
const unresolvedCount = editableProducts.filter(
  (p) =>
    lineStatus[p.id] === LINE_STATUS.UNVERIFIED ||
    lineStatus[p.id] === LINE_STATUS.UNKNOWN ||
    lineStatus[p.id] === undefined
).length;

// A quantity of 0 or "" is not a small order, it is an invalid one, and the
// three places that see it disagree about what it means. This modal treated it
// as zero units and quoted $0. The checkout controller computes its subtotal
// and GST with (Number(quantity) || 0) but bills Stripe with
// (Number(quantity) || 1), so the customer is charged for one unit of
// something the quote priced at nothing. The order-save path then reconstructs
// one unit, expects GST on it, finds the paid amount does not match, and
// rejects the order - taking the money and losing the record.
//
// None of that is fixable from here: two of those coercions are in a
// controller reserved for the pricing branch. What IS fixable from here is
// refusing to send an invalid quantity in the first place.
const invalidQuantityCount = editableProducts.filter(
  (p) => isLineOrderable(p) && !isOrderableQuantity(p.quantity)
).length;

const canConfirmReorder =
  !popupLoading &&
  unresolvedCount === 0 &&
  invalidQuantityCount === 0 &&
  orderableCount > 0;


const handleReOrder = async () => {
  if (editableProducts.length === 0) {
    return toast.error("No products to re-order.")
  }

  // Drop anything we could not price live. Reordering these would charge the
  // price frozen in the original order, which we may no longer be able to
  // honour — the supplier may have been switched off entirely.
  //
  // This re-reads the STATUS at submit rather than trusting the disabled
  // button, which is a UI convenience and not a guarantee. It is NOT a fresh
  // availability check, and an earlier comment here wrongly implied it was.
  // The lookup happens when the modal opens, so a product can be withdrawn
  // while the modal sits open and still reach checkout. Narrowing that window
  // with a second fetch here would not close it either — only the server
  // creating the Stripe session can, because it is the last point that sees
  // the order before money moves. That belongs with the server-side pricing
  // work, and is tracked there rather than papered over here.
  if (unresolvedCount > 0) {
    return toast.error(
      "Still checking availability for some items. Please try again in a moment."
    );
  }

  if (invalidQuantityCount > 0) {
    return toast.error(
      "Enter a quantity of at least 1 for every item you want to re-order."
    );
  }

  const orderableProducts = editableProducts.filter(isLineOrderable);
  if (orderableProducts.length === 0) {
    return toast.error("None of these items are available to re-order.");
  }
  setReOrderLoading(true);
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/signup");
    return toast.error("Please login to re-order.");
  }
  try {
    const checkoutData = {
      ...selectedOrder,
      products: orderableProducts,
      paymentStatus: "Paid",
      // Coupons are not re-applied on re-orders — the Stripe session is
      // created without one, so the server must not recompute a discount.
      coupon: null,
      couponCode: null,
      stripeSessionId: null,
    };

    localStorage.setItem("pendingCheckoutData", JSON.stringify(checkoutData));

    const stripe = await loadStripe(
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    );
    const body = {
      products: orderableProducts.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        quantity: p.quantity,
        price: p.price,
        subTotal: p.subTotal,
        discount: p.discount || 0,
        color: p.color,
        print: p.print,
        logoColor: p.logoColor,
        logo: p.logo,
      })),
      gst: selectedOrder.gst,
      shipping: selectedOrder.shipping,
      setupFee: selectedOrder.setupFee,
      coupon: null,
      gstPercent: selectedOrder.gstPercent || 10,
    };

    const resp = await axios.post(
      `${backendUrl}/api/create-checkout-session`,
      body,
    );
    const session = await resp.data;
    if (!session.id) {
      setReOrderLoading(false);
      localStorage.removeItem("pendingCheckoutData");
      return toast.error(
        "Failed to create payment session. Please try again."
      );
    }
    setReOrderLoading(false);
    await stripe.redirectToCheckout({ sessionId: session.id });
  } catch (err) {
    console.error("Re-order failed:", err.response?.data || err.message);
    toast.error("Re-order failed. Try again.")
  } finally {
    setReOrderLoading(false);
    closeReOrderModal();
  }
};


if (loading || orderResolveLoading) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      <p className="ml-4 text-lg font-semibold">Loading checkout data...</p>
    </div>
  );
}

if (!selectedOrder?._id) {
  return <div>No checkout data available for this order.</div>;
}

return (
  <div className="w-full px-3 lg:px-8 md:px-6 py-4 space-y-6">
    {/* Header: Back + Re-order */}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        onClick={() => setActiveTab("dashboard")}
        className="inline-flex items-center gap-2 px-3 py-2 mt-2 text-sm font-semibold text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <IoMdArrowRoundBack className="w-4 h-4" />
        Back to dashboard
      </button>
      <div className="flex items-center gap-2">
        <button
          onClick={() => { window.location.href = `/track-order?order=${selectedOrder.orderId || ""}`; }}
          className="inline-flex items-center gap-2 px-4 py-2 mt-2 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors"
        >
          Track Order
        </button>
        <button
          onClick={openReOrderModal}
          className="inline-flex items-center gap-2 px-4 py-2 mt-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          Re-order this order
        </button>
      </div>
    </div>

    {/* Order summary card */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Order Summary
          </p>
          <p className="text-sm text-gray-700">
            Order{" "}
            <span className="font-semibold text-gray-900">
              #{selectedOrder.orderId?.slice(-8)?.toUpperCase()}
            </span>{" "}
            placed on{" "}
            <span className="font-semibold text-gray-900">
              {selectedOrder.orderDate
                ? new Date(selectedOrder.orderDate).toLocaleDateString()
                : "-"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status</span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedOrder.status === "Cancelled"
              ? "bg-red-100 text-red-700"
              : selectedOrder.status === "completed" ||
                selectedOrder.status === "delivered"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-800"
              }`}
          >
            {selectedOrder.status || "Pending"}
          </span>
        </div>
      </div>
    </div>

    {/* Main content: Order details + totals + addresses */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: products + totals */}
      <div className="lg:col-span-2 space-y-6">
        {/* Order items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Items in this order
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">
                    Product
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">
                    Details
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-gray-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedOrder?.products?.map((product, index) => {
                  const encodedId = btoa(product?.id);
                  const slug = slugify(product?.name);
                  return (
                    <tr key={index} className="align-top">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              className="w-16 h-16 rounded border object-cover"
                              alt={product?.name || "Product image"}
                            />
                          )}
                          <div>
                            <Link
                              to={`/product/${encodeURIComponent(slug)}?ref=${encodedId}`}
                            >
                              <p className="font-medium text-gray-900 hover:text-primary cursor-pointer">
                                {product?.name}
                              </p>
                            </Link>
                            {product?.color && (
                              <p className="text-xs text-gray-500">
                                Color: {product.color}
                              </p>
                            )}
                            {product?.adminCustomization ? (
                              <p className="text-xs text-purple-700 font-medium">
                                {product.adminCustomization.applicationMethod}
                                {" — "}{product.adminCustomization.applicationType}
                                {product.adminCustomization.position && (
                                  <> ({product.adminCustomization.position.positionName})</>
                                )}
                              </p>
                            ) : product?.print ? (
                              <p className="text-xs text-gray-500">
                                Print: {product.print}
                              </p>
                            ) : null}
                            {product?.size && (
                              <p className="text-xs text-gray-500">
                                Size: {product.size}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700">
                        <p>
                          Quantity:{" "}
                          <span className="font-semibold">
                            {product?.quantity}
                          </span>
                        </p>
                        {product?.logoColor && (
                          <p className="text-xs text-gray-500">
                            Artwork: {product.logoColor}
                          </p>
                        )}
                        {product?.proofStatus && product.proofStatus !== "NOT_REQUIRED" && (() => {
                          const badge = getProofStatusBadge(
                            product.proofStatus === "AWAITING_APPROVAL" ? "PENDING_REVIEW" : product.proofStatus,
                          );
                          return (
                            <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.cls}`}>
                              {badge.icon}
                              {badge.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-medium text-gray-900">
                        ${product?.subTotal?.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {(selectedOrder?.artworkOption || selectedOrder?.artworkMessage) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <h2 className="mb-3 text-base font-semibold text-gray-900">
              Artwork Information
            </h2>
            <p className="text-sm text-gray-700">
              {selectedOrder?.artworkOption && (
                <span className="font-semibold capitalize">
                  {selectedOrder.artworkOption}
                </span>
              )}
              {selectedOrder?.artworkOption && selectedOrder?.artworkMessage && " : "}
              {selectedOrder?.artworkMessage}
            </p>
          </div>
        )}

        {/* Customization Proofs */}
        {(proofs.length > 0 || proofsLoading) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <h2 className="mb-4 text-base font-semibold text-gray-900 flex items-center gap-2">
              <FaImage className="w-4 h-4 text-primary" />
              Customization Proofs
            </h2>
            {proofsLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Loading proofs...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Group proofs by item */}
                {(() => {
                  const itemMap = {};
                  proofs.forEach((p) => {
                    const key = p.itemId;
                    if (!itemMap[key]) itemMap[key] = [];
                    itemMap[key].push(p);
                  });

                  return Object.entries(itemMap).map(([itemId, itemProofs]) => {
                    const product = selectedOrder?.products?.find(
                      (prod) => String(prod._id) === String(itemId),
                    );
                    // Only show the latest (non-superseded) proof prominently
                    const latestProof = itemProofs.find((p) => p.status !== "SUPERSEDED") || itemProofs[0];
                    const olderProofs = itemProofs.filter((p) => p._id !== latestProof._id);

                    return (
                      <div key={itemId} className="border border-gray-200 rounded-xl p-4">
                        {/* Item header */}
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                          {product?.image && (
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded border object-cover" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{product?.name || "Order Item"}</p>
                            {product?.adminCustomization && (
                              <p className="text-xs text-purple-700">
                                {product.adminCustomization.applicationMethod} — {product.adminCustomization.applicationType}
                                {product.adminCustomization.position && ` (${product.adminCustomization.position.positionName})`}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Latest proof */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-4">
                            {/* Proof image */}
                            <a href={latestProof.proofFileUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                              {latestProof.proofFileType?.startsWith("image/") ? (
                                <img
                                  src={latestProof.proofFileUrl}
                                  alt="Proof"
                                  className="w-32 h-32 object-contain rounded-lg border border-gray-200 bg-gray-50 hover:shadow-md transition-shadow"
                                />
                              ) : (
                                <div className="w-32 h-32 rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                                  <FaImage className="w-8 h-8 mb-1" />
                                  <span className="text-xs">View file</span>
                                </div>
                              )}
                            </a>
                            {/* Proof details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {(() => {
                                  const badge = getProofStatusBadge(latestProof.status);
                                  return (
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                                      {badge.icon}
                                      {badge.label}
                                    </span>
                                  );
                                })()}
                                <span className="text-xs text-gray-400">v{latestProof.version}</span>
                              </div>
                              <p className="text-xs text-gray-500 mb-1">
                                Sent: {new Date(latestProof.createdAt).toLocaleDateString()} at{" "}
                                {new Date(latestProof.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                              {latestProof.adminNotes && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 mb-2">
                                  <p className="text-xs font-medium text-blue-800">Admin notes:</p>
                                  <p className="text-xs text-blue-700">{latestProof.adminNotes}</p>
                                </div>
                              )}
                              {latestProof.customerFeedback && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-2">
                                  <p className="text-xs font-medium text-gray-600">Your feedback:</p>
                                  <p className="text-xs text-gray-700">{latestProof.customerFeedback}</p>
                                </div>
                              )}

                              {/* Action buttons — only for PENDING_REVIEW */}
                              {latestProof.status === "PENDING_REVIEW" && (
                                <div className="mt-3 space-y-2">
                                  <textarea
                                    placeholder="Add feedback (optional)..."
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    rows={2}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleProofRespond(latestProof._id, "APPROVED")}
                                      disabled={respondingProofId === latestProof._id}
                                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
                                    >
                                      <FaCheckCircle className="w-3.5 h-3.5" />
                                      {respondingProofId === latestProof._id ? "..." : "Approve"}
                                    </button>
                                    <button
                                      onClick={() => handleProofRespond(latestProof._id, "REVISION_REQUESTED")}
                                      disabled={respondingProofId === latestProof._id}
                                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
                                    >
                                      <FaTimesCircle className="w-3.5 h-3.5" />
                                      {respondingProofId === latestProof._id ? "..." : "Request Revision"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Comments thread */}
                          {latestProof.comments?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                                <FaCommentDots className="w-3 h-3" /> Comments
                              </p>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {latestProof.comments.map((c) => (
                                  <div
                                    key={c._id}
                                    className={`flex ${c.senderType === "CUSTOMER" ? "justify-end" : "justify-start"}`}
                                  >
                                    <div
                                      className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${
                                        c.senderType === "CUSTOMER"
                                          ? "bg-primary/10 text-gray-800"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      <p className="font-semibold mb-0.5">
                                        {c.senderType === "CUSTOMER" ? "You" : c.senderName || "Admin"}
                                      </p>
                                      <p>{c.message}</p>
                                      <p className="text-gray-400 mt-0.5 text-[10px]">
                                        {new Date(c.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Add comment input */}
                          {latestProof.status !== "SUPERSEDED" && (
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                placeholder="Add a comment..."
                                value={activeCommentProofId === latestProof._id ? commentText : ""}
                                onFocus={() => setActiveCommentProofId(latestProof._id)}
                                onChange={(e) => {
                                  setActiveCommentProofId(latestProof._id);
                                  setCommentText(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(latestProof._id);
                                  }
                                }}
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                              <button
                                onClick={() => handleAddComment(latestProof._id)}
                                className="px-3 py-1.5 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
                              >
                                Send
                              </button>
                            </div>
                          )}

                          {/* Older versions collapsed */}
                          {olderProofs.length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                                {olderProofs.length} older version{olderProofs.length > 1 ? "s" : ""}
                              </summary>
                              <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-100">
                                {olderProofs.map((op) => {
                                  const badge = getProofStatusBadge(op.status);
                                  return (
                                    <div key={op._id} className="flex items-center gap-3 py-1">
                                      <a href={op.proofFileUrl} target="_blank" rel="noopener noreferrer">
                                        <img src={op.proofFileUrl} alt="Old proof" className="w-12 h-12 object-contain rounded border" />
                                      </a>
                                      <div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${badge.cls}`}>v{op.version} — {badge.label}</span>
                                        <p className="text-xs text-gray-400 mt-0.5">{new Date(op.createdAt).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}

        {/* Totals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Payment summary (
            <span className="text-green-500">
              {selectedOrder?.paymentStatus === "Paid" ? "paid" : "pending"}
            </span>
            )
          </h2>
          <table className="w-full text-sm">
            <tbody className="text-gray-700">
              <tr>
                <td className="py-1.5">Subtotal</td>
                <td className="py-1.5 text-right font-medium">
                  ${selectedOrder?.total?.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-1.5">Shipping</td>
                <td className="py-1.5 text-right font-medium">
                  $
                  {selectedOrder?.shipping?.toFixed?.(2) ??
                    selectedOrder?.shipping}
                </td>
              </tr>
              <tr>
                <td className="py-1.5">GST</td>
                <td className="py-1.5 text-right font-medium">
                  ${selectedOrder?.gst?.toFixed?.(2) ?? selectedOrder?.gst}
                </td>
              </tr>
              <tr>
                <td className="py-1.5">Discount</td>
                <td className="py-1.5 text-right font-medium">
                  $
                  {selectedOrder?.discount?.toFixed?.(2) ??
                    selectedOrder?.discount}
                </td>
              </tr>
              <tr>
                <td className="pt-2 text-sm font-semibold text-gray-900">
                  Total paid
                </td>
                <td className="pt-2 text-right text-lg font-bold text-gray-900">
                  ${selectedOrder?.total?.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: addresses */}
      <div className="space-y-6">
        {/* Billing Address */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Billing address
          </h2>
          <address className="not-italic text-sm text-gray-700 space-y-1">
            <p>
              <span className="text-gray-500">Name:</span>{" "}
              {selectedOrder?.user?.firstName} {selectedOrder?.user?.lastName}
            </p>
            {selectedOrder.billingAddress?.companyName && (
              <p>
                <span className="text-gray-500">Company Name:</span>{" "}
                {selectedOrder.billingAddress.companyName}
              </p>
            )}
            {selectedOrder.billingAddress?.addressLine && (
              <p>
                <span className="text-gray-500">Address:</span>{" "}
                {selectedOrder.billingAddress.addressLine}
              </p>
            )}
            {selectedOrder.billingAddress?.city && (
              <p>
                <span className="text-gray-500">City:</span>{" "}
                {selectedOrder.billingAddress.city}
              </p>
            )}
            {selectedOrder.billingAddress?.state && (
              <p>
                <span className="text-gray-500">State:</span>{" "}
                {selectedOrder.billingAddress.state}
              </p>
            )}
            {selectedOrder.billingAddress?.postalCode && (
              <p>
                <span className="text-gray-500">Postal Code:</span>{" "}
                {selectedOrder.billingAddress.postalCode}
              </p>
            )}
            {selectedOrder.billingAddress?.country && (
              <p>
                <span className="text-gray-500">Country:</span>{" "}
                {selectedOrder.billingAddress.country}
              </p>
            )}
            {selectedOrder.user?.email && (
              <p>
                <span className="text-gray-500">Email:</span>{" "}
                {selectedOrder.user.email}
              </p>
            )}
            {selectedOrder.user?.phone && (
              <p>
                <span className="text-gray-500">Phone:</span>{" "}
                {selectedOrder.user.phone}
              </p>
            )}
          </address>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Shipping address
          </h2>
          <address className="not-italic text-sm text-gray-700 space-y-1">
            <p>
              <span className="text-gray-500">Name:</span>{" "}
              {selectedOrder?.user?.firstName} {selectedOrder?.user?.lastName}
            </p>
            {selectedOrder.shippingAddress?.companyName && (
              <p>
                <span className="text-gray-500">Company Name:</span>{" "}
                {selectedOrder.shippingAddress.companyName}
              </p>
            )}
            {selectedOrder.shippingAddress?.addressLine && (
              <p>
                <span className="text-gray-500">Address:</span>{" "}
                {selectedOrder.shippingAddress.addressLine}
              </p>
            )}
            {selectedOrder.shippingAddress?.city && (
              <p>
                <span className="text-gray-500">City:</span>{" "}
                {selectedOrder.shippingAddress.city}
              </p>
            )}
            {selectedOrder.shippingAddress?.state && (
              <p>
                <span className="text-gray-500">State:</span>{" "}
                {selectedOrder.shippingAddress.state}
              </p>
            )}
            {selectedOrder.shippingAddress?.postalCode && (
              <p>
                <span className="text-gray-500">Postal Code:</span>{" "}
                {selectedOrder.shippingAddress.postalCode}
              </p>
            )}
            {selectedOrder.shippingAddress?.country && (
              <p>
                <span className="text-gray-500">Country:</span>{" "}
                {selectedOrder.shippingAddress.country}
              </p>
            )}
            {selectedOrder.user?.email && (
              <p>
                <span className="text-gray-500">Email:</span>{" "}
                {selectedOrder.user.email}
              </p>
            )}
            {selectedOrder.user?.phone && (
              <p>
                <span className="text-gray-500">Phone:</span>{" "}
                {selectedOrder.user.phone}
              </p>
            )}
          </address>
        </div>
      </div>
    </div>
    {/* Re-order editable modal */}
    {reOrderModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => !reOrderLoading && !popupLoading && closeReOrderModal()}
          aria-hidden="true"
        />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 pt-6 pb-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Edit & Re-order
            </h2>
            <button
              onClick={() => !reOrderLoading && !popupLoading && closeReOrderModal()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close re-order modal"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 overflow-y-auto flex-1">
            {popupLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-gray-500">Loading product details...</p>
              </div>
            ) : editableProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No products in this order.</p>
            ) : (
              <div className="space-y-4">
                {editableProducts.map((product, index) => {
                  const detail = productDetails[product.id];
                  // No live product means no live price. Show the line so the
                  // customer can see what is missing, but keep it out of the
                  // re-order rather than charging the old price.
                  const status = lineStatus[product.id];
                  const isUnavailable = status === LINE_STATUS.UNAVAILABLE;
                  const isUnverified = status === LINE_STATUS.UNVERIFIED;
                  const colors = detail ? getColorsFromProduct(detail) : [];
                  const parsedSizes = detail ? extractSizesFromProduct(detail) : [];
                  const sizes =
                    parsedSizes.length > 0 ? parsedSizes : product.size ? [product.size] : [];

                  const parsedPrintMethods = detail ? getPrintMethods(detail) : [];
                  const printMethods =
                    parsedPrintMethods.length > 0
                      ? parsedPrintMethods
                      : product.print
                        ? [{ key: "existing-print", description: product.print }]
                        : [];

                  return (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 relative ${
                        isUnavailable ? "bg-gray-50 border-gray-300" : ""
                      }`}
                    >
                      {isUnavailable && (
                        <div className="mb-3 flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2">
                          <FaTimesCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                          <p className="text-xs text-amber-800">
                            <span className="font-semibold">No longer available.</span>{" "}
                            This item won&apos;t be included in your re-order. The other available items still will be.
                          </p>
                        </div>
                      )}

                      {isUnverified && (
                        <div className="mb-3 flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2">
                          <FaTimesCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                          <p className="text-xs text-red-800">
                            <span className="font-semibold">
                              Couldn&apos;t check availability.
                            </span>{" "}
                            We don&apos;t know whether this item can still be ordered, so
                            we&apos;ve paused the re-order rather than guess. Close and try again.
                          </p>
                        </div>
                      )}

                      {/* Remove button */}
                      {editableProducts.length > 1 && (
                        <button
                          onClick={() => removeEditableProduct(index)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove product"
                        >
                          ✕
                        </button>
                      )}

                      {/* Product header */}
                      <div className="flex items-center gap-3 mb-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-14 h-14 rounded border object-cover"
                          />
                        )}
                        <p className="font-medium text-gray-900 text-sm pr-6">{product.name}</p>
                      </div>

                      {/* Editable fields */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Quantity */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => updateEditableProduct(index, "quantity", e.target.value)}
                            className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>

                        {/* Color */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Color</label>
                          {colors.length > 0 ? (
                            <select
                              value={product.color || ""}
                              onChange={(e) => updateEditableProduct(index, "color", e.target.value)}
                              className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                              {!colors.includes(product.color) && (
                                <option value={product.color}>{product.color || "None"}</option>
                              )}
                              {colors.map((color) => (
                                <option key={color} value={color}>{color}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={product.color || "None"}
                              disabled
                              className="w-full border rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-400"
                            />
                          )}
                        </div>

                        {/* Print Method */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Print</label>
                          {printMethods.length > 0 ? (
                            <select
                              value={product.print || ""}
                              onChange={(e) => updateEditableProduct(index, "print", e.target.value)}
                              className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                              {product.print &&
                                !printMethods.some((m) => m.description === product.print) && (
                                  <option value={product.print}>{product.print}</option>
                                )}
                              {printMethods.map((method) => (
                                <option key={method.key || method.description} value={method.description}>
                                  {method.description}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={product.print || "None"}
                              disabled
                              className="w-full border rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-400"
                            />
                          )}
                        </div>

                        {/* Size */}
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Size</label>
                          {sizes.length > 0 ? (
                            <select
                              value={product.size || ""}
                              onChange={(e) => updateEditableProduct(index, "size", e.target.value)}
                              className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                              {!sizes.includes(product.size) && product.size && (
                                <option value={product.size}>{product.size}</option>
                              )}
                              {sizes.map((size) => (
                                <option key={size} value={size}>{size}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={product.size || "None"}
                              disabled
                              className="w-full border rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-400"
                            />
                          )}
                        </div>
                      </div>

                      {/* Price row */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          Unit: ${product.price?.toFixed(2)} × {product.quantity}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ${product.subTotal?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with totals */}
          {!popupLoading && editableProducts.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              {/* Every figure here comes from getReorderTotals(), which mirrors
                  the server's own calculation. What this panel shows is what
                  Stripe will charge. It previously showed the ORIGINAL order's
                  GST beside a subtotal that had excluded lines removed, and did
                  not show the setup fee at all despite still sending it. */}
              {(() => {
                const t = getReorderTotals();
                return (
                  <>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="text-gray-600">
                        Subtotal
                        {unavailableCount > 0 && (
                          <span className="text-gray-500">
                            {" "}
                            ({orderableCount} of {editableProducts.length} items)
                          </span>
                        )}
                      </span>
                      <span className="font-medium">${t.subtotal.toFixed(2)}</span>
                    </div>
                    {t.setupFee > 0 && (
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span className="text-gray-600">Setup fee</span>
                        <span className="font-medium">${t.setupFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">${t.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3 text-sm">
                      <span className="text-gray-600">GST ({t.gstPercent}%)</span>
                      <span className="font-medium">${t.gst.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${t.total.toFixed(2)}
                      </span>
                    </div>
                    {unresolvedCount > 0 && (
                      <p className="mt-2 text-xs text-amber-700">
                        This is the total for the items we could verify. One or
                        more items could not be checked, so it is not the final
                        amount for this re-order.
                      </p>
                    )}
                    {unavailableCount > 0 && (
                      <p className="mt-2 text-xs text-gray-500">
                        {unavailableCount} item{unavailableCount > 1 ? "s are" : " is"} no
                        longer available and {unavailableCount > 1 ? "have" : "has"} been
                        removed. Shipping and any setup fee are carried over from your
                        original order.
                      </p>
                    )}
                  </>
                );
              })()}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={closeReOrderModal}
                  disabled={reOrderLoading}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReOrder}
                  // A single dead line must not stop the customer reordering
                  // the rest — but anything we could not CHECK does block, for
                  // every line, because a partial order built on an unknown is
                  // a guess about what the customer wanted. So this is blocked
                  // when nothing is orderable OR when any line is still
                  // unresolved; see canConfirmReorder.
                  disabled={reOrderLoading || !canConfirmReorder}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {reOrderLoading
                    ? "Re-ordering..."
                    : unresolvedCount > 0
                      ? "Can't check availability"
                      : orderableCount === 0
                        ? "Nothing available"
                        : unavailableCount > 0
                          ? `Re-order ${orderableCount} of ${editableProducts.length} items`
                          : "Confirm Re-order"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
};

export default UserProducts;
