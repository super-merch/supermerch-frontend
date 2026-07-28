import { getCategoryFinderConfig } from "@/config/categoryFinderConfig";
import { ChevronUp, Pencil, Search, SlidersHorizontal, X } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

const getAttributeSelections = (searchParams) => {
  const names = searchParams.getAll("attrName");
  const values = searchParams.getAll("attrValue");
  return names.reduce((result, name, index) => {
    result[name] = values[index] || "";
    return result;
  }, {});
};

const readSelections = (config, searchParams) => {
  const attributes = getAttributeSelections(searchParams);
  return config.questions.reduce((result, question) => {
    if (question.type === "attribute") {
      result[question.id] = attributes[question.attributeName] || "";
    } else if (question.type === "price") {
      const min = searchParams.get("minPrice") || "";
      const max = searchParams.get("maxPrice") || "";
      result[question.id] = min || max ? `${min}:${max}` : "";
    } else {
      result[question.id] = searchParams.get(question.queryParam) || "";
    }
    return result;
  }, {});
};

const CategoryFinder = ({ productTypeId }) => {
  const config = useMemo(
    () => getCategoryFinderConfig(productTypeId),
    [productTypeId]
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const [selections, setSelections] = useState(() =>
    config ? readSelections(config, searchParams) : {}
  );
  // Collapsed once the customer has already answered (either by submitting the
  // Finder this visit, or by arriving with the same params already in the URL,
  // e.g. a bookmarked/shared link) — the sidebar already reflects the same
  // selections, so re-showing the full question grid would just be asking again.
  const [collapsed, setCollapsed] = useState(() =>
    config
      ? Object.values(readSelections(config, searchParams)).some(Boolean)
      : false
  );

  // Unique per rendered instance (not a fixed string like "category-finder-*")
  // so IDs never collide if more than one Finder ever renders on a page.
  const instanceId = useId();
  const panelId = `${instanceId}-panel`;
  const editButtonRef = useRef(null);
  const firstSelectRef = useRef(null);
  const wasCollapsedRef = useRef(collapsed);
  // Effects always run once after the initial mount too, not just on
  // dependency changes -- without this guard, the "reset on config change"
  // effect below would unconditionally collapse=false itself on first mount,
  // discarding the useState initializer's "start collapsed if the URL
  // already has params" result on every single page load, every time.
  const isInitialConfigEffectRef = useRef(true);

  useEffect(() => {
    if (config) {
      setSelections(readSelections(config, new URLSearchParams(searchParamsKey)));
    }
  }, [config, searchParamsKey]);

  // A different category's Finder (new config identity) starts fresh/expanded
  // -- but only on an ACTUAL change after mount, not on the initial mount
  // itself (see isInitialConfigEffectRef above).
  useEffect(() => {
    if (isInitialConfigEffectRef.current) {
      isInitialConfigEffectRef.current = false;
      return;
    }
    setCollapsed(false);
  }, [config]);

  // Move focus to whatever becomes interactive after a collapse/expand
  // transition, instead of letting it fall back to <body> when the
  // previously-focused button disappears from the DOM.
  useEffect(() => {
    if (wasCollapsedRef.current === collapsed) return;
    wasCollapsedRef.current = collapsed;
    if (collapsed) {
      editButtonRef.current?.focus();
    } else {
      firstSelectRef.current?.focus();
    }
  }, [collapsed]);

  if (!config) return null;

  const selectedCount = Object.values(selections).filter(Boolean).length;
  // Deterministic order regardless of how a config lists its questions: quantity,
  // then budget, then up to two category-specific attributes (natural array order),
  // then colour last. Explicit colour priority means colour reliably sorts last
  // even for a config with zero or three attribute questions, not just by
  // coincidence of array position.
  const questionPriority = { moq: 0, budget: 1, colour: 98 };
  const orderedQuestions = [...config.questions].sort(
    (left, right) =>
      (questionPriority[left.id] ?? 2) - (questionPriority[right.id] ?? 2)
  );

  const summaryText = orderedQuestions
    .map((question) => {
      const value = selections[question.id];
      if (!value) return null;
      const matchedOption = question.options.find((option) => option.value === value);
      return `${question.label}: ${matchedOption?.label || value}`;
    })
    .filter(Boolean)
    .join(" · ");

  const applyFinder = () => {
    const next = new URLSearchParams(searchParams);
    const existingAttributes = getAttributeSelections(next);

    config.questions.forEach((question) => {
      const value = selections[question.id] || "";

      if (question.type === "attribute") {
        if (value) existingAttributes[question.attributeName] = value;
        else delete existingAttributes[question.attributeName];
      } else if (question.type === "price") {
        next.delete("minPrice");
        next.delete("maxPrice");
        if (value) {
          const [min, max] = value.split(":");
          if (min) next.set("minPrice", min);
          if (max) next.set("maxPrice", max);
        }
      } else if (value) {
        next.set(question.queryParam, value);
      } else {
        next.delete(question.queryParam);
      }
    });

    next.delete("attrName");
    next.delete("attrValue");
    Object.entries(existingAttributes).forEach(([name, value]) => {
      if (!value) return;
      next.append("attrName", name);
      next.append("attrValue", value);
    });
    next.set("page", "1");
    next.delete("scrollTo");
    setSearchParams(next);
    setCollapsed(true);
  };

  const clearFinder = () => {
    const next = new URLSearchParams(searchParams);
    config.questions.forEach((question) => {
      if (question.type === "attribute") return;
      if (question.type === "price") {
        next.delete("minPrice");
        next.delete("maxPrice");
      } else {
        next.delete(question.queryParam);
      }
    });

    const finderAttributeNames = new Set(
      config.questions
        .filter((question) => question.type === "attribute")
        .map((question) => question.attributeName)
    );
    const attributes = getAttributeSelections(next);
    next.delete("attrName");
    next.delete("attrValue");
    Object.entries(attributes).forEach(([name, value]) => {
      if (!finderAttributeNames.has(name) && value) {
        next.append("attrName", name);
        next.append("attrValue", value);
      }
    });
    next.set("page", "1");
    next.delete("scrollTo");
    setSelections(readSelections(config, new URLSearchParams()));
    setSearchParams(next);
    setCollapsed(false);
  };

  // Discards any unsubmitted draft edits and returns to the collapsed
  // summary of what's actually applied. Draft `selections` (changed via the
  // <select> onChange handlers below) only ever reach the URL/sidebar/results
  // through applyFinder -- collapsing WITHOUT going through applyFinder must
  // never leave stale draft values sitting in `selections`, or the collapsed
  // summary would show picks that were never actually applied, disagreeing
  // with the sidebar and the results on screen.
  const cancelEditing = () => {
    setSelections(readSelections(config, searchParams));
    setCollapsed(true);
  };

  return (
    <section className="mb-5 overflow-hidden rounded-2xl border border-[#d9e7ff] bg-gradient-to-br from-white via-[#f7faff] to-[#eef5ff] shadow-sm">
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(190px,0.72fr)_minmax(0,2.28fr)] lg:items-end lg:p-6">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {config.eyebrow}
          </div>
          <h2 className="text-xl font-bold leading-tight text-gray-950 sm:text-2xl">
            {config.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-5 text-gray-600">
            {config.description}
          </p>
        </div>

        {collapsed ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700" role="status" aria-live="polite">
              {summaryText ? (
                <>
                  <span className="font-semibold text-gray-900">Your picks: </span>
                  {summaryText}
                </>
              ) : (
                `Showing all ${config.itemNamePlural}.`
              )}
              {" "}Adjust anything below, or edit your answers here.
            </p>
            <button
              ref={editButtonRef}
              type="button"
              onClick={() => setCollapsed(false)}
              aria-expanded={!collapsed}
              aria-controls={panelId}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              Edit my answers
            </button>
          </div>
        ) : (
          <div id={panelId}>
            <div className="mb-3 flex justify-end">
              {/* A disclosure control must exist in BOTH states for aria-expanded
                  to ever be observably true -- "Edit my answers" (below, collapsed
                  branch) is the only other element carrying aria-expanded, and it
                  never renders while expanded, so without this button no control
                  anywhere in the tree would ever show aria-expanded="true".
                  This calls cancelEditing (not a bare setCollapsed(true)) so
                  collapsing here can never apply an unsubmitted draft answer --
                  only "Show my matches" below is the real submission action. */}
              <button
                type="button"
                onClick={cancelEditing}
                aria-expanded={!collapsed}
                aria-controls={panelId}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                Cancel editing
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {orderedQuestions.map((question, index) => {
                const inputId = `${instanceId}-${question.id}`;
                return (
                  <label key={question.id} className="block" htmlFor={inputId}>
                    <span className="mb-1.5 block text-xs font-semibold text-gray-700">
                      {question.label}
                    </span>
                    <select
                      id={inputId}
                      ref={index === 0 ? firstSelectRef : undefined}
                      aria-label={question.label}
                      value={selections[question.id] || ""}
                      onChange={(event) =>
                        setSelections((current) => ({
                          ...current,
                          [question.id]: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    >
                      <option value="">{question.placeholder}</option>
                      {question.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                {selectedCount
                  ? `${selectedCount} preference${selectedCount === 1 ? "" : "s"} selected`
                  : `Choose one or more preferences, or continue with all ${config.itemNamePlural}.`}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                {selectedCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFinder}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={applyFinder}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                >
                  <Search className="h-4 w-4" />
                  {selectedCount ? config.submitLabel : `View all ${config.itemNamePlural}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

CategoryFinder.propTypes = {
  productTypeId: PropTypes.string,
};

export default CategoryFinder;
