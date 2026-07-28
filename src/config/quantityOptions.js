// Single source of truth for order-quantity bucket wording, shared by the guided
// Finder (CategoryFinder.jsx) and the category sidebar (MOQFilter.jsx). Both send
// the same `moq` query param with the same values, so the labels a customer sees
// must match exactly regardless of which control they used — picking "50-99" in
// one place and seeing "100 or less" for the same underlying value in the other
// reads as two disagreeing filters, not one filter shown twice.
export const QUANTITY_OPTIONS = [
  { label: "1–24", value: "24" },
  { label: "25–49", value: "49" },
  { label: "50–99", value: "99" },
  { label: "100–249", value: "249" },
  { label: "250–499", value: "499" },
  { label: "500+", value: "500" },
];

// Shared wording for the "nothing selected" state — the Finder shows this as a
// <select> placeholder, the sidebar shows it as an explicit radio option, but the
// text should read identically either way.
export const ANY_QUANTITY_LABEL = "Any quantity";
