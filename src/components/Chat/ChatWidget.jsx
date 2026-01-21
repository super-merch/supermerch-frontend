import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const BOT_API_URL =
  import.meta.env.VITE_BOT_API_URL || "http://localhost:8001";

const POSITION_STORAGE_KEY = "supermerch.chatWidgetPosition";
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

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [visibleCounts, setVisibleCounts] = useState({});
  const [position, setPosition] = useState(() => {
    try {
      const raw = localStorage.getItem(POSITION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [dragging, setDragging] = useState(false);
  const [panelPosition, setPanelPosition] = useState({
    left: DEFAULT_MARGIN,
    top: DEFAULT_MARGIN,
  });
  const widgetRef = useRef(null);
  const panelRef = useRef(null);
  const historyRef = useRef(null);
  const scrollTopRef = useRef(0);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragMovedRef = useRef(false);
  const ignoreNextToggleRef = useRef(false);
  const sessionIdRef = useRef("");

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
          popularQueries: data.popular_queries || [],
          similarQueries: data.similar_queries || [],
          displayLimit,
        },
      ]);
      setVisibleCounts((prev) => ({
        ...prev,
        [assistantId]: displayLimit,
      }));
      setQuery("");
    } catch (err) {
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

  const clampToViewport = (next) => {
    const node = widgetRef.current;
    if (!node) return next;
    const rect = node.getBoundingClientRect();
    const maxX = Math.max(0, window.innerWidth - rect.width);
    const maxY = Math.max(0, window.innerHeight - rect.height);
    return {
      x: Math.min(Math.max(0, next.x), maxX),
      y: Math.min(Math.max(0, next.y), maxY),
    };
  };

  const startDrag = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const node = widgetRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    dragMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setPosition({ x: rect.left, y: rect.top });
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      if (!dragMovedRef.current) {
        const dx = Math.abs(e.clientX - dragStartRef.current.x);
        const dy = Math.abs(e.clientY - dragStartRef.current.y);
        if (dx > 3 || dy > 3) {
          dragMovedRef.current = true;
        }
      }
      const next = {
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      };
      setPosition(clampToViewport(next));
    };
    const handleUp = () => {
      setDragging(false);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging]);

  useEffect(() => {
    if (!position) return;
    try {
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
    } catch {
      // Ignore storage errors.
    }
  }, [position]);

  useEffect(() => {
    const handleResize = () => {
      if (!position) return;
      setPosition((prev) => (prev ? clampToViewport(prev) : prev));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position]);

  const recalcPanelPosition = () => {
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

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(recalcPanelPosition);
    return () => cancelAnimationFrame(frame);
  }, [open, position, history.length]);

  useEffect(() => {
    if (!open) return;
    const handleResize = () => {
      recalcPanelPosition();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, position, history.length]);

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

  const lastAssistant = [...history]
    .reverse()
    .find((entry) => entry.role === "assistant");

  return (
    <div
      ref={widgetRef}
      className="fixed z-50"
      style={
        position
          ? { left: `${position.x}px`, top: `${position.y}px` }
          : { right: DEFAULT_MARGIN, bottom: DEFAULT_MARGIN }
      }
    >
      {open && (
        <div
          ref={panelRef}
          className="fixed w-[320px] sm:w-[360px] bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden"
          style={{
            left: `${panelPosition.left}px`,
            top: `${panelPosition.top}px`,
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50"
            onPointerDown={startDrag}
          >
            <div className="font-semibold text-gray-900 cursor-move select-none">
              Merch Assistant
            </div>
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
              className="text-gray-500 hover:text-gray-800"
              aria-label="Close chat"
            >
              X
            </button>
          </div>

          <div
            ref={historyRef}
            onScroll={handleHistoryScroll}
            className="px-4 py-3 max-h-[360px] overflow-auto"
          >
            {history.length === 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Popular searches
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DEFAULT_POPULAR_QUERIES.map((term) => (
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
                <div className="mt-3 text-sm text-gray-700">
                  Tell me what you are looking for and I will recommend the best
                  matches.
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

                  {entry.items && (() => {
                    const itemCount = entry.items.length;
                    const current =
                      visibleCounts[entry.id] ?? entry.displayLimit ?? 10;
                    const canLoadMore = itemCount > 0 && current < itemCount;
                    return (
                      <button
                        type="button"
                        className={`mt-3 text-sm font-semibold ${
                          canLoadMore
                            ? "text-primary hover:underline"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          if (!canLoadMore) return;
                          setVisibleCounts((prev) => {
                            const next = Math.min(itemCount, current + 10);
                            return { ...prev, [entry.id]: next };
                          });
                        }}
                        aria-disabled={!canLoadMore}
                      >
                        {canLoadMore ? "Load more" : "No more items"}
                      </button>
                    );
                  })()}

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

          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. eco pens under $5"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 text-sm font-semibold bg-primary text-white rounded-lg disabled:opacity-60"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => {
          if (dragMovedRef.current) {
            dragMovedRef.current = false;
            return;
          }
          if (ignoreNextToggleRef.current) {
            return;
          }
          setOpen(!open);
        }}
        onPointerDown={startDrag}
        className="w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition"
        aria-label="Open chat"
      >
        {lastAssistant?.items?.length ? "Chat" : "Chat"}
      </button>
    </div>
  );
};

export default ChatWidget;
