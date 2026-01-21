import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const BOT_API_URL =
  import.meta.env.VITE_BOT_API_URL || "http://localhost:8001";

const POSITION_STORAGE_KEY = "supermerch.chatWidgetPosition";
const DEFAULT_MARGIN = 20;

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState(null);
  const [error, setError] = useState("");
  const [position, setPosition] = useState(() => {
    try {
      const raw = localStorage.getItem(POSITION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [dragging, setDragging] = useState(false);
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);
  const panelRef = useRef(null);
  const panelOffsetRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragMovedRef = useRef(false);
  const ignoreNextToggleRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BOT_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();
      setReply(data);
    } catch (err) {
      setError("Could not reach the merch assistant. Please try again.");
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    panelOffsetRef.current = panelOffset;
  }, [panelOffset]);

  const recalcPanelOffset = () => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const currentOffset = panelOffsetRef.current;
    const baseRect = {
      left: rect.left - currentOffset.x,
      right: rect.right - currentOffset.x,
      top: rect.top - currentOffset.y,
      bottom: rect.bottom - currentOffset.y,
    };
    let offsetX = 0;
    let offsetY = 0;

    if (baseRect.right > window.innerWidth) {
      offsetX = window.innerWidth - baseRect.right - DEFAULT_MARGIN;
    } else if (baseRect.left < 0) {
      offsetX = -baseRect.left + DEFAULT_MARGIN;
    }

    if (baseRect.bottom > window.innerHeight) {
      offsetY = window.innerHeight - baseRect.bottom - DEFAULT_MARGIN;
    } else if (baseRect.top < 0) {
      offsetY = -baseRect.top + DEFAULT_MARGIN;
    }

    setPanelOffset({ x: offsetX, y: offsetY });
  };

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(recalcPanelOffset);
    return () => cancelAnimationFrame(frame);
  }, [open, position, reply?.items?.length, reply?.message]);

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
          className="mb-3 w-[320px] sm:w-[360px] bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden"
          style={{
            transform: `translate(${panelOffset.x}px, ${panelOffset.y}px)`,
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

          <div className="px-4 py-3 max-h-[360px] overflow-auto">
            <div className="text-sm text-gray-700">
              Tell me what you are looking for and I will recommend the best
              matches.
            </div>

            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

            {reply?.message && (
              <div className="mt-3 text-sm text-gray-900">
                {reply.message}
              </div>
            )}

            {!!reply?.items?.length && (
              <div className="mt-3 grid gap-2">
                {reply.items.map((item) => (
                  <Link
                    key={item.id}
                    to={item.url || "#"}
                    className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 hover:border-primary hover:shadow-sm transition"
                    onClick={() => setOpen(false)}
                  >
                    <img
                      src={item.image || "/noimage.png"}
                      alt={item.name}
                      className="w-12 h-12 object-contain bg-white rounded"
                      onLoad={recalcPanelOffset}
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
        Chat
      </button>
    </div>
  );
};

export default ChatWidget;
