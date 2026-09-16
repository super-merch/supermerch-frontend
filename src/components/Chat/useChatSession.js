import { useRef, useState } from "react";

// Shared by ChatWidget (floating bubble) and FeaturedChat (homepage section)
// so both talk to /api/chat identically — session id, history, and the
// send/loading/error state machine live here once instead of twice.

const BOT_API_URL = import.meta.env.VITE_BOT_API_URL || "";
const SESSION_STORAGE_KEY = "supermerch.chatSessionId";

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useChatSession() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleCounts, setVisibleCounts] = useState({});
  const sessionIdRef = useRef("");
  const abortControllerRef = useRef(null);
  // A plain ref rather than the `loading` state: React state only takes
  // effect after a re-render, so two calls arriving close together (a form's
  // native Enter-to-submit racing an explicit button click, or a fast
  // double-click) can both read `loading` as still false and both go
  // through — observed directly: two independent, fully valid replies to
  // the same question, rendered back to back. A ref is set the instant this
  // function runs, closing that gap completely.
  const isSendingRef = useRef(false);
  // The backend buffers a whole round's content and delivers it as one
  // chunk (see agent.js — real token streaming was traded away for
  // reliability), so every bubble for a multi-paragraph reply used to land
  // in `history` within the same synchronous loop/render — all delivered
  // "at once" from the visitor's point of view, however many there were.
  // This staggers each bubble's reveal by REVEAL_STEP_MS so a multi-bubble
  // reply reads like someone sending a few messages in a row, not a wall of
  // text appearing in one frame. Persists across the whole sendQuery call
  // (reset at its start) so several onDelta calls in one turn still queue
  // up in order rather than resetting the stagger each time.
  const nextRevealDelayRef = useRef(0);
  const REVEAL_STEP_MS = 650;

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

  const sendQuery = async (nextQuery) => {
    const trimmed = nextQuery.trim();
    if (!trimmed || isSendingRef.current) return;
    isSendingRef.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError("");
    nextRevealDelayRef.current = 0;
    setHistory((prev) => [...prev, { id: makeId(), role: "user", text: trimmed }]);

    // One reply is split across several bubbles at paragraph breaks, so it
    // reads like a person sending a few short messages instead of one wall
    // of text — the model still generates one continuous stream of tokens,
    // this is purely a client-side presentation choice. `currentId` is the
    // bubble collecting text right now; whenever it accumulates a "\n\n" the
    // text before that break is frozen into its own bubble and a new one
    // starts for what comes after.
    let currentId = null;
    let currentText = "";

    // Only ever touches `currentId` — never `currentText`. The paragraph-split
    // loop below sets `currentText` to the remainder BEFORE calling this to
    // start the next bubble; this used to reset currentText to "" right
    // after, silently discarding that remainder. The visible symptom: the
    // second bubble came out empty from this path, so the "done" handler's
    // fallback to the server's full original message kicked in instead —
    // which naturally repeats the opening sentence, since it's still part of
    // that complete text. (The very first call, before anything has
    // accumulated, relies on `currentText` already being "" from its
    // declaration above.)
    const startNewSegment = () => {
      currentId = makeId();
      // Snapshotted into a local const rather than reading `currentId`
      // directly inside the updater: this function runs up to ~8 times in a
      // tight synchronous loop (once per paragraph break) before React gets
      // around to invoking the queued updater functions. An updater that
      // closes over the outer `currentId` reads whatever it has BECOME by
      // then — its final value, the same for every call — so every "new
      // segment" push ended up with an identical id. Confirmed directly via
      // React's own "two children with the same key" warning, and it's why
      // a later update keyed on that id (the "done" handler attaching
      // items/text) matched every one of those entries at once instead of
      // just the last one.
      const newId = currentId;
      const delay = nextRevealDelayRef.current;
      setTimeout(() => {
        setHistory((prev) => [...prev, { id: newId, role: "assistant", text: "" }]);
      }, delay);
    };

    const appendToCurrentSegment = (text) => {
      if (!currentId) startNewSegment();
      currentText += text;

      let breakIndex;
      while ((breakIndex = currentText.indexOf("\n\n")) !== -1) {
        const finishedId = currentId;
        const finishedText = currentText.slice(0, breakIndex).trim();
        currentText = currentText.slice(breakIndex + 2);
        const delay = nextRevealDelayRef.current;

        if (finishedText) {
          setTimeout(() => {
            setHistory((prev) =>
              prev.map((entry) => (entry.id === finishedId ? { ...entry, text: finishedText } : entry))
            );
          }, delay);
          // Only a genuine bubble's worth of text pushes the next reveal
          // out — a stray empty break shouldn't add a pause nothing was
          // shown for.
          nextRevealDelayRef.current += REVEAL_STEP_MS;
        } else {
          // A stray break before any real text landed in this bubble — drop
          // the empty one rather than leaving a blank gap in the chat.
          setTimeout(() => {
            setHistory((prev) => prev.filter((entry) => entry.id !== finishedId));
          }, delay);
        }
        startNewSegment();
      }

      const liveId = currentId;
      const liveText = currentText;
      const delay = nextRevealDelayRef.current;
      setTimeout(() => {
        setHistory((prev) => prev.map((entry) => (entry.id === liveId ? { ...entry, text: liveText } : entry)));
      }, delay);
    };

    try {
      // The backend runs as stateless serverless functions, so recent turns
      // travel with each request instead of living in server-side memory.
      //
      // One logical reply is now split across several bubbles (see
      // appendToCurrentSegment above), each its own `history` entry — so
      // slicing the last 8 ENTRIES no longer means the last 8 TURNS. With a
      // reply split into 4-5 bubbles, "last 8" can be barely more than one
      // real exchange, silently dropping everything earlier — confirmed
      // directly: ask about candles (a multi-bubble reply), ask a follow-up,
      // and the candle details had already fallen out of the window, so the
      // model answered from nothing and returned unrelated products.
      // Collapse consecutive same-role bubbles back into one turn first, so
      // trimming operates on actual turns again.
      const mergedTurns = [];
      for (const { role, text } of history) {
        const last = mergedTurns[mergedTurns.length - 1];
        if (last && last.role === role) {
          last.text = `${last.text}\n\n${text}`;
        } else {
          mergedTurns.push({ role, text });
        }
      }
      const recentHistory = mergedTurns.slice(-8);

      const res = await fetch(`${BOT_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": getSessionId(),
        },
        body: JSON.stringify({ query: trimmed, history: recentHistory }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Chat request failed");

      // A validation error (bad request) returns plain JSON instead of a
      // stream — the widget should never send one, but handle it rather
      // than hang waiting for SSE events that will never arrive.
      if (!res.body || res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        throw new Error(data?.error || "Chat request failed");
      }

      // The backend streams the final answer as it's generated (see
      // api/chat.js) — each `data: {...}\n\n` frame is either a "delta"
      // (append to the growing reply) or the terminal "done" (full payload:
      // items, extras, popular/similar queries). Frames can split across
      // chunk boundaries, so buffer until a full "\n\n"-terminated frame
      // is available before parsing it.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sepIndex;
        while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);
          const line = rawEvent.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const payload = JSON.parse(line.slice(5).trim());

          if (payload.type === "status") {
            if (!currentId) startNewSegment();
            const statusId = currentId;
            setHistory((prev) =>
              prev.map((entry) => (entry.id === statusId ? { ...entry, status: payload.text } : entry))
            );
          } else if (payload.type === "delta") {
            if (currentId) {
              const clearId = currentId;
              setHistory((prev) => prev.map((entry) => (entry.id === clearId ? { ...entry, status: null } : entry)));
            }
            appendToCurrentSegment(payload.text);
          } else if (payload.type === "done") {
            if (!currentId) startNewSegment();
            const finalId = currentId;
            const finalText = currentText.trim() || undefined;
            const displayLimit = Number(payload.display_limit) || 10;
            // Same delay as this bubble's own creation/live-text updates
            // above (not a further increment — it's finishing that same
            // bubble, not starting a new one), so the product cards land
            // right as its text does rather than popping in ahead of it.
            const delay = nextRevealDelayRef.current;
            setTimeout(() => {
              setHistory((prev) =>
                prev.map((entry) =>
                  entry.id === finalId
                    ? {
                        ...entry,
                        status: null,
                        text: finalText ?? payload.message ?? entry.text,
                        items: payload.items || [],
                        extras: payload.extras || [],
                        popularQueries: payload.popular_queries || [],
                        similarQueries: payload.similar_queries || [],
                        displayLimit,
                      }
                    : entry
                )
              );
              setVisibleCounts((prev) => ({ ...prev, [finalId]: displayLimit }));
            }, delay);
          }
        }
      }

      return currentId;
    } catch (err) {
      if (err.name === "AbortError") return;
      setError("Could not reach the merch assistant. Please try again.");
    } finally {
      // The network stream itself closes as soon as the server sends its
      // last byte — well before the staggered bubble reveals scheduled
      // above finish playing out. Clearing loading/isSending right here
      // let a visitor send a new message while the previous reply was still
      // visibly trickling in. Wait for the same delay the last bubble used.
      setTimeout(() => {
        setLoading(false);
        isSendingRef.current = false;
      }, nextRevealDelayRef.current);
    }
  };

  const loadMore = (entryId, itemCount) => {
    setVisibleCounts((prev) => {
      const current = prev[entryId] ?? 10;
      return { ...prev, [entryId]: Math.min(itemCount, current + 10) };
    });
  };

  return { history, loading, error, visibleCounts, sendQuery, loadMore };
}
