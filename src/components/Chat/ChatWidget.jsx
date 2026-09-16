import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { orbStyles } from "./chatStyles";
import { useChatSession } from "./useChatSession";
import ChatConversation from "./ChatConversation";

const DEFAULT_MARGIN = 10;
const DEFAULT_POPULAR_QUERIES = [
  "What's a good gift for a client under $20?",
  "I need 100 branded pens for a conference",
  "Show me eco-friendly tote bags",
  "What's trending right now?",
  "Best options for a staff welcome pack",
  "Do you have any low minimum order items?",
];

const ChatWidget = () => {
  const location = useLocation();
  const { history, loading, error, visibleCounts, sendQuery, loadMore } = useChatSession();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [query, setQuery] = useState("");
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
  const prevHistoryLengthRef = useRef(0);
  const ignoreNextToggleRef = useRef(false);
  const inputRef = useRef(null);
  const fullscreenOffsetRef = useRef(0);
  const prevLocationKeyRef = useRef(`${location.pathname}${location.search}`);

  const closeChat = () => {
    ignoreNextToggleRef.current = true;
    setOpen(false);
    setIsFullscreen(false);
    setExpandedPosition(null);
    setTimeout(() => {
      ignoreNextToggleRef.current = false;
    }, 0);
  };

  const handleSend = async (text) => {
    const replied = await sendQuery(text);
    if (replied) setUnreadCount((c) => c + 1);
  };

  const handleChipClick = async (term) => {
    if (!term || loading) return;
    await handleSend(term);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Guards the same race handleChipClick already guards against: the
    // submit button's `disabled={loading}` only takes effect once React
    // re-renders, so a fast double-submit (double-click, or Enter racing a
    // click) can fire twice before that happens — sending two independent
    // requests and rendering two answers back to back.
    if (loading) return;
    const submitted = query;
    setQuery("");
    await handleSend(submitted);
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
    if (open) {
      setUnreadCount(0);
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
    const isNewMessage = history.length > prevHistoryLengthRef.current;
    prevHistoryLengthRef.current = history.length;
    const frame = requestAnimationFrame(() => {
      // A new message (user turn or reply) scrolls to the bottom so it's
      // actually visible; otherwise (e.g. re-opening the panel) restore
      // wherever the visitor had manually scrolled to.
      node.scrollTop = isNewMessage ? node.scrollHeight : scrollTopRef.current;
    });
    return () => cancelAnimationFrame(frame);
  }, [open, history.length]);

  useEffect(() => {
    const nextKey = `${location.pathname}${location.search}`;
    if (prevLocationKeyRef.current !== nextKey) {
      prevLocationKeyRef.current = nextKey;
      if (open) {
        closeChat();
      }
    }
  }, [location.pathname, location.search, open]);

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
                ? "fixed inset-0 px-4 sm:px-10 py-8 bg-black/25 backdrop-blur-sm"
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
                    width: "min(100%, 1120px)",
                    height: "min(calc(100% - 24px), 820px)",
                  }
                  : undefined
              }
              ref={isFullscreen ? expandedCardRef : null}
            >
              <div className="chat-header flex items-center justify-between px-4 py-3 border-b border-white/20">
                <div className="flex items-center gap-3 select-none">
                  <div className="ai-avatar" aria-hidden="true">
                    <div className="ai-avatar-inner" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Super AI</span>
                    <span className="text-[11px] text-white/80">
                      Ask our AI for the best deal.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-white/80">
                    <span className="online-dot" aria-hidden="true" />
                    <span>Online</span>
                  </div>
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
                    onClick={closeChat}
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
                    ? "px-6 py-5 flex-1 overflow-auto chat-history"
                    : "px-4 py-3 max-h-[360px] overflow-auto chat-history"
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
                      Try asking
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {DEFAULT_POPULAR_QUERIES.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => handleChipClick(term)}
                          className="chat-chip px-3 py-1.5 text-xs"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-3 w-3 text-primary"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
                          </svg>
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

                <ChatConversation
                  history={history}
                  loading={loading}
                  error={error}
                  visibleCounts={visibleCounts}
                  onLoadMore={loadMore}
                  onChipClick={handleChipClick}
                  onProductClick={closeChat}
                  onImageLoad={recalcPanelPosition}
                />
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
                  <div className="chat-input-shell">
                    <div className="chat-input-body flex items-center gap-2 px-4 py-2">
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
          {unreadCount > 0 && !open && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default ChatWidget;
