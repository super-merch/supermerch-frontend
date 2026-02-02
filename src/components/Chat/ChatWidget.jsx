import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Siri-like orb animation styles
const orbStyles = `
  @keyframes orbRotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes orbPulse {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.05); opacity: 1; }
  }
  @keyframes orbGlow {
    0%, 100% { box-shadow: 0 0 15px rgba(255, 100, 150, 0.5), 0 0 30px rgba(100, 200, 255, 0.3); }
    33% { box-shadow: 0 0 15px rgba(100, 255, 200, 0.5), 0 0 30px rgba(255, 150, 100, 0.3); }
    66% { box-shadow: 0 0 15px rgba(150, 100, 255, 0.5), 0 0 30px rgba(255, 200, 100, 0.3); }
  }
  .ai-orb {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      #ff6b9d,
      #ffa64d,
      #ffed4a,
      #4ade80,
      #22d3ee,
      #818cf8,
      #e879f9,
      #ff6b9d
    );
    animation: orbRotate 3s linear infinite, orbPulse 2s ease-in-out infinite, orbGlow 3s ease-in-out infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }
  .ai-orb:hover {
    transform: scale(1.1);
    box-shadow: 0 0 25px rgba(255, 100, 150, 0.6), 0 0 50px rgba(100, 200, 255, 0.4);
  }
  .ai-orb:disabled {
    cursor: not-allowed;
  }
  .ai-orb.loading {
    animation: orbRotate 0.8s linear infinite, orbPulse 0.5s ease-in-out infinite, orbGlow 1s ease-in-out infinite;
  }
  .ai-orb-inner {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.2) 50%, transparent 70%);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @keyframes aiPing {
    0% { transform: scale(0.85); opacity: 0.7; }
    70% { transform: scale(1.55); opacity: 0; }
    100% { transform: scale(1.7); opacity: 0; }
  }
  @keyframes aiOrbit {
    0% { transform: translate(-50%, -50%) rotate(0deg) translateX(18px); }
    100% { transform: translate(-50%, -50%) rotate(360deg) translateX(18px); }
  }
  .chatbot-fab {
    position: relative;
    overflow: visible;
    isolation: isolate;
  }
  .chatbot-fab::before {
    content: "";
    position: absolute;
    inset: -8px;
    border-radius: 9999px;
    background: conic-gradient(
      from 0deg,
      rgba(255, 110, 160, 0.7),
      rgba(255, 190, 120, 0.7),
      rgba(80, 220, 255, 0.7),
      rgba(130, 140, 255, 0.7),
      rgba(255, 110, 160, 0.7)
    );
    filter: blur(8px);
    opacity: 0;
    transform: scale(0.95);
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: -2;
    pointer-events: none;
  }
  .chatbot-fab::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    opacity: 0;
    transform: scale(0.9);
    z-index: -1;
    pointer-events: none;
  }
  .chatbot-fab:hover::before,
  .chatbot-fab:focus-visible::before {
    opacity: 0.9;
    transform: scale(1.05);
  }
  .chatbot-fab:hover::after,
  .chatbot-fab:focus-visible::after {
    opacity: 0.7;
    animation: aiPing 1.6s ease-out infinite;
  }
  .chatbot-fab-orbit {
    position: absolute;
    inset: -6px;
    border-radius: 9999px;
    opacity: 0;
    pointer-events: none;
  }
  .chatbot-fab:hover .chatbot-fab-orbit,
  .chatbot-fab:focus-visible .chatbot-fab-orbit {
    opacity: 1;
  }
  .orbit-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0.2));
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
    animation: aiOrbit 2.6s linear infinite;
  }
  .orbit-dot-2 {
    width: 4px;
    height: 4px;
    animation-delay: -0.9s;
  }
  .orbit-dot-3 {
    width: 5px;
    height: 5px;
    animation-delay: -1.7s;
  }
  @media (prefers-reduced-motion: reduce) {
    .chatbot-fab::before,
    .chatbot-fab::after,
    .orbit-dot {
      animation: none !important;
      transition: none !important;
    }
  }
`;

const BOT_API_URL =
  import.meta.env.VITE_BOT_API_URL || "http://localhost:8001";

const SESSION_STORAGE_KEY = "supermerch.chatSessionId";
const DEFAULT_MARGIN = 20;
const DEFAULT_POPULAR_QUERIES = [
  "pen",
  "water bottle",
  "tote bag",
  "hoodie",
  "notebook",
  "mug",
  "keyring",
  "usb drive",
];

const HISTORY_STORAGE_KEY = "supermerch.chatHistory";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [error, setError] = useState("");
  const [visibleCounts, setVisibleCounts] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenOffset, setFullscreenOffset] = useState(0);
  const [expandedPosition, setExpandedPosition] = useState(null);
  const [panelPosition, setPanelPosition] = useState({
    left: DEFAULT_MARGIN,
    top: DEFAULT_MARGIN,
  });
  const widgetRef = useRef(null);
  const panelRef = useRef(null);
  const expandedCardRef = useRef(null);
  const historyRef = useRef(null);
  const scrollTopRef = useRef(0);
  const ignoreNextToggleRef = useRef(false);
  const sessionIdRef = useRef("");
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const fullscreenOffsetRef = useRef(0);

  const getSessionId = () => {
    if (sessionIdRef.current) return sessionIdRef.current;
    let sessionId = "";
    try {
      const existing = localStorage.getItem(SESSION_STORAGE_KEY);
      if (existing) {
        sessionId = existing;
      } else {
        sessionId =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
      }
    } catch {
      sessionId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    sessionIdRef.current = sessionId;
    return sessionId;
  };

  const makeId = () =>
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const buildProductUrl = (item) => {
    if (item?.url && item.url.includes("ref=")) {
      return item.url;
    }
    const name = item?.name || "";
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const encoded = item?.id ? btoa(String(item.id)) : "";
    if (!encoded) {
      return item?.url || "#";
    }
    return `/product/${slug || "item"}?ref=${encodeURIComponent(encoded)}`;
  };

  const sendQuery = async (nextQuery) => {
    const trimmed = nextQuery.trim();
    if (!trimmed) return;

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError("");
    setHistory((prev) => [
      ...prev,
      { id: makeId(), role: "user", text: trimmed },
    ]);
    setQuery("");

    try {
      const res = await fetch(`${BOT_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": getSessionId(),
        },
        body: JSON.stringify({ query: trimmed }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();
      const displayLimit = Number(data.display_limit) || 10;
      const assistantId = makeId();
      setHistory((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          text: data.message || "",
          items: data.items || [],
          extras: data.extras || [],
          popularQueries: data.popular_queries || [],
          similarQueries: data.similar_queries || [],
          displayLimit,
        },
      ]);
      setVisibleCounts((prev) => ({
        ...prev,
        [assistantId]: displayLimit,
      }));
    } catch (err) {
      // Don't show error for aborted requests
      if (err.name === "AbortError") return;
      setError("Could not reach the merch assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = async (term) => {
    if (!term || loading) return;
    await sendQuery(term);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendQuery(query);
  };

  // Keep ref in sync for use in drag handlers (avoids stale closure)
  fullscreenOffsetRef.current = fullscreenOffset;

  const clampExpanded = (next) => {
    const node = expandedCardRef.current;
    if (!node) return next;
    const rect = node.getBoundingClientRect();
    const offset = fullscreenOffsetRef.current;
    const maxX = Math.max(DEFAULT_MARGIN, window.innerWidth - rect.width - DEFAULT_MARGIN);
    const maxY = Math.max(
      DEFAULT_MARGIN,
      window.innerHeight - offset - rect.height - DEFAULT_MARGIN
    );
    return {
      x: Math.min(Math.max(DEFAULT_MARGIN, next.x), maxX),
      y: Math.min(Math.max(DEFAULT_MARGIN, next.y), maxY),
    };
  };

  useEffect(() => {
    try {
      sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage errors.
    }
  }, [history]);

  useEffect(() => {
    if (open) {
      const timer = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [open]);

  const recalcPanelPosition = () => {
    if (isFullscreen) return;
    const panel = panelRef.current;
    const widget = widgetRef.current;
    if (!panel || !widget) return;
    const panelRect = panel.getBoundingClientRect();
    const widgetRect = widget.getBoundingClientRect();
    const gap = 12;
    let left = widgetRect.left;
    let top = widgetRect.top - panelRect.height - gap;

    if (top < DEFAULT_MARGIN) {
      top = widgetRect.bottom + gap;
    }

    const maxLeft = window.innerWidth - panelRect.width - DEFAULT_MARGIN;
    const maxTop = window.innerHeight - panelRect.height - DEFAULT_MARGIN;
    left = Math.min(Math.max(DEFAULT_MARGIN, left), Math.max(DEFAULT_MARGIN, maxLeft));
    top = Math.min(Math.max(DEFAULT_MARGIN, top), Math.max(DEFAULT_MARGIN, maxTop));

    setPanelPosition({ left, top });
  };

  const calculateTopOffset = () => {
    const banner = document.querySelector('[data-chat-offset="top-banner"]');
    const nav = document.querySelector('[data-chat-offset="main-nav"]');
    let offset = 0;
    if (banner) {
      offset += banner.getBoundingClientRect().height || 0;
    }
    if (nav) {
      offset += nav.getBoundingClientRect().height || 0;
    }
    return Math.max(0, Math.round(offset));
  };

  useEffect(() => {
    if (!open || isFullscreen) return;
    const frame = requestAnimationFrame(recalcPanelPosition);
    return () => cancelAnimationFrame(frame);
  }, [open, history.length, isFullscreen]);

  useEffect(() => {
    if (!open || isFullscreen) return;
    const handleResize = () => {
      recalcPanelPosition();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, history.length, isFullscreen]);

  useEffect(() => {
    if (!open || !isFullscreen) return;
    const updateOffset = () => {
      setFullscreenOffset(calculateTopOffset());
    };
    const frame = requestAnimationFrame(updateOffset);
    window.addEventListener("resize", updateOffset);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateOffset);
    };
  }, [open, isFullscreen]);

  useEffect(() => {
    if (!open || !isFullscreen) return;
    const node = expandedCardRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const centered = {
      x: Math.max(DEFAULT_MARGIN, (window.innerWidth - rect.width) / 2),
      y: DEFAULT_MARGIN,
    };
    setExpandedPosition((prev) => prev || clampExpanded(centered));
  }, [open, isFullscreen, fullscreenOffset]);

  const handleHistoryScroll = () => {
    const node = historyRef.current;
    if (!node) return;
    scrollTopRef.current = node.scrollTop;
  };

  useEffect(() => {
    if (!open) return;
    const node = historyRef.current;
    if (!node) return;
    const frame = requestAnimationFrame(() => {
      node.scrollTop = scrollTopRef.current;
    });
    return () => cancelAnimationFrame(frame);
  }, [open, history.length]);

  return (
    <>
      <style>{orbStyles}</style>
      <div
        ref={widgetRef}
        className="fixed z-50"
        style={{ right: DEFAULT_MARGIN, bottom: DEFAULT_MARGIN }}
      >
      {open && (
        <div
          ref={panelRef}
          className={
            isFullscreen
              ? "fixed inset-0 px-4 sm:px-8 py-6"
              : "fixed w-[320px] sm:w-[360px] bg-white border border-gray-200 shadow-[0_0_30px_rgba(0,150,136,0.15)] rounded-2xl overflow-hidden"
          }
          style={
            isFullscreen
              ? {
                  top: `${fullscreenOffset}px`,
                }
              : {
                  left: `${panelPosition.left}px`,
                  top: `${panelPosition.top}px`,
                }
          }
        >
          <div
            className={
              isFullscreen
                ? "absolute h-full w-full max-w-5xl bg-white border border-gray-200 shadow-[0_0_40px_rgba(0,150,136,0.2)] rounded-3xl overflow-hidden flex flex-col"
                : "w-full"
            }
            style={
              isFullscreen
                ? {
                    left: `${expandedPosition?.x ?? DEFAULT_MARGIN}px`,
                    top: `${expandedPosition?.y ?? DEFAULT_MARGIN}px`,
                    width: "min(100%, 960px)",
                    height: "min(calc(100% - 40px), 700px)",
                  }
                : undefined
            }
            ref={isFullscreen ? expandedCardRef : null}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 bg-primary">
              <div className="flex flex-col select-none">
                <span className="font-semibold text-white">Super AI</span>
                <span className="text-[11px] text-white/80">
                  Ask our AI for the best deal.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!isFullscreen) {
                      setExpandedPosition(null);
                    }
                    setIsFullscreen(!isFullscreen);
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded px-2 py-1 transition-colors"
                  aria-label={isFullscreen ? "Exit full screen" : "Expand chat"}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {isFullscreen ? (
                      <>
                        <path d="M6 2H2v4" />
                        <path d="M2 2l4 4" />
                        <path d="M10 14h4v-4" />
                        <path d="M14 14l-4-4" />
                      </>
                    ) : (
                      <>
                        <path d="M10 2h4v4" />
                        <path d="M14 2l-4 4" />
                        <path d="M2 10v4h4" />
                        <path d="M2 14l4-4" />
                      </>
                    )}
                  </svg>
                  <span className="sr-only">
                    {isFullscreen ? "Restore" : "Expand"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    ignoreNextToggleRef.current = true;
                    setOpen(false);
                    setTimeout(() => {
                      ignoreNextToggleRef.current = false;
                    }, 0);
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded p-1 transition-colors"
                  aria-label="Close chat"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 4L4 12" />
                    <path d="M4 4l8 8" />
                  </svg>
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>

            <div
              ref={historyRef}
              onScroll={handleHistoryScroll}
              className={
                isFullscreen
                  ? "px-6 py-5 flex-1 overflow-auto bg-gray-50"
                  : "px-4 py-3 max-h-[360px] overflow-auto"
              }
            >
            {history.length === 0 && (
              <div>
                {isFullscreen && (
                  <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary via-blue-400 to-teal-400 text-white px-6 py-5 shadow-lg">
                    <div className="text-lg sm:text-2xl font-semibold">
                      Ask our Merch Assistant
                    </div>
                    <div className="mt-1 text-sm sm:text-base opacity-90">
                      Get instant recommendations across promotional products,
                      apparel, and gifting.
                    </div>
                  </div>
                )}
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Popular searches
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DEFAULT_POPULAR_QUERIES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleChipClick(term)}
                      className="px-3 py-1.5 text-xs rounded-full border border-gray-200 bg-white hover:border-primary hover:text-primary transition"
                    >
                      {term}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-700">
                  <div className="font-medium text-gray-900">
                    Hey! I'm SuperAI 👋
                  </div>
                  <div className="mt-1">What can I help you find today</div>
                  <div className="mt-2 text-xs text-gray-600">
                    • Quick gift ideas
                    <br />
                    • Trending merch picks
                    <br />
                    • Eco-friendly options
                  </div>
                </div>
              </div>
            )}

            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

            {history.map((entry) => {
              if (entry.role === "user") {
                return (
                  <div
                    key={entry.id}
                    className="mt-3 text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2"
                  >
                    {entry.text}
                  </div>
                );
              }

              return (
                <div key={entry.id} className="mt-3">
                  {entry.text && (
                    <div className="text-sm text-gray-900">{entry.text}</div>
                  )}

                  {!!entry.items?.length && (
                    <div className="mt-3 grid gap-2">
                      {(() => {
                        const currentCount =
                          visibleCounts[entry.id] ??
                          entry.displayLimit ??
                          10;
                        const visibleCount = Math.min(
                          currentCount,
                          entry.items.length
                        );
                        return entry.items.slice(0, visibleCount).map((item) => (
                        <Link
                          key={item.id}
                          to={buildProductUrl(item)}
                          state={{ productId: item.id }}
                          className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 hover:border-primary hover:shadow-sm transition"
                        >
                          <img
                            src={item.image || "/noimage.png"}
                            alt={item.name}
                            className="w-12 h-12 object-contain bg-white rounded"
                            onLoad={recalcPanelPosition}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.price ? `$${item.price}` : "Contact for price"}
                            </div>
                          </div>
                        </Link>
                        ));
                      })()}
                    </div>
                  )}

                  {Array.isArray(entry.items) && (() => {
                    const itemCount = entry.items.length;
                    const current =
                      visibleCounts[entry.id] ?? entry.displayLimit ?? 10;
                    const canLoadMore = itemCount > 0 && current < itemCount;
                    if (!canLoadMore) return null;
                    return (
                      <button
                        type="button"
                        className="mt-3 text-sm font-semibold text-primary hover:underline"
                        onClick={() => {
                          setVisibleCounts((prev) => {
                            const next = Math.min(itemCount, current + 10);
                            return { ...prev, [entry.id]: next };
                          });
                        }}
                      >
                        Load more
                      </button>
                    );
                  })()}

                  {!!entry.extras?.length && (
                    <div className="mt-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500">
                        Presentation extras
                      </div>
                      <div className="mt-2 grid gap-2">
                        {entry.extras.slice(0, 4).map((item) => (
                          <Link
                            key={item.id}
                            to={buildProductUrl(item)}
                            state={{ productId: item.id }}
                            className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 hover:border-primary hover:shadow-sm transition"
                          >
                            <img
                              src={item.image || "/noimage.png"}
                              alt={item.name}
                              className="w-12 h-12 object-contain bg-white rounded"
                              onLoad={recalcPanelPosition}
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.price ? `$${item.price}` : "Contact for price"}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {!!(entry.similarQueries?.length || entry.popularQueries?.length) && (
                    <div className="mt-3">
                      <div className="text-xs uppercase tracking-wide text-gray-500">
                        {entry.items?.length && entry.similarQueries?.length
                          ? "Similar searches"
                          : "Popular searches"}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(entry.similarQueries?.length
                          ? entry.similarQueries
                          : entry.popularQueries
                        ).map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => handleChipClick(term)}
                            className="px-2.5 py-1 text-xs rounded-full border border-gray-200 hover:border-primary hover:text-primary transition"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="mt-3 inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
                <span>Assistant is typing</span>
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "120ms" }}
                  />
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "240ms" }}
                  />
                </span>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className={
              isFullscreen
                ? "p-4 border-t border-gray-100 bg-white"
                : "p-3 border-t border-gray-100"
            }
          >
            <div>
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`ai-orb ${loading ? "loading" : ""}`}
                  aria-label="Send message"
                >
                  <span className="ai-orb-inner">
                    {loading ? (
                      <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13" />
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
              <div className="mt-2 text-[11px] text-gray-500">
                AI-powered search across our entire product range.
              </div>
            </div>
          </form>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (ignoreNextToggleRef.current) {
            return;
          }
          setOpen(!open);
        }}
        className="chatbot-fab w-14 h-14 rounded-full bg-primary text-white shadow-[0_0_20px_rgba(0,150,136,0.5)] hover:shadow-[0_0_30px_rgba(0,150,136,0.7)] transition-all duration-300 flex items-center justify-center"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <span className="chatbot-fab-orbit" aria-hidden="true">
          <span className="orbit-dot orbit-dot-1" />
          <span className="orbit-dot orbit-dot-2" />
          <span className="orbit-dot orbit-dot-3" />
        </span>
        {open ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {history.length > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
            {history.filter((h) => h.role === "assistant").length}
          </span>
        )}
      </button>
      </div>
    </>
  );
};

export default ChatWidget;
