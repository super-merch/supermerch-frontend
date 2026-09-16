import { Link } from "react-router-dom";
import { toProductUrl } from "@/utils/utils";
import MarkdownMessage from "./MarkdownMessage";

// Shared between ChatWidget (floating bubble) and FeaturedChat (homepage
// section) — same bubbles, product cards, and chips either way. Product
// links use the same toProductUrl() convention as the rest of the site.

function buildProductUrl(item) {
  if (item?.url && item.url.includes("/product/")) return item.url;
  const name = item?.name || "";
  if (!name) return item?.url || "#";
  return toProductUrl(name, item?.id);
}

function SparkleIcon() {
  return (
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
  );
}

function ProductList({ items, onProductClick, onImageLoad }) {
  return (
    <div className="mt-3 grid gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          to={buildProductUrl(item)}
          state={{ productId: item.id }}
          onClick={onProductClick}
          className="chat-product-card flex items-center gap-3 p-2 rounded-lg"
        >
          <img
            src={item.image || "/noimage.png"}
            alt={item.name}
            className="w-12 h-12 object-contain bg-white rounded"
            onLoad={onImageLoad}
          />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
            <div className="text-xs text-gray-500">
              {item.price ? `$${item.price}` : "Contact for price"}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function ChatConversation({
  history,
  loading,
  error,
  visibleCounts,
  onLoadMore,
  onChipClick,
  onProductClick,
  onImageLoad = () => {},
}) {
  return (
    <>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      {history.map((entry) => {
        if (entry.role === "user") {
          return (
            <div key={entry.id} className="mt-3 flex justify-end chat-message">
              <div className="chat-bubble chat-bubble-user max-w-[85%]">{entry.text}</div>
            </div>
          );
        }

        const itemCount = entry.items?.length || 0;
        const currentCount = visibleCounts[entry.id] ?? entry.displayLimit ?? 10;
        const visibleItems = entry.items?.slice(0, Math.min(currentCount, itemCount)) || [];
        const canLoadMore = itemCount > 0 && currentCount < itemCount;
        const chips = entry.similarQueries?.length ? entry.similarQueries : entry.popularQueries;

        return (
          <div key={entry.id} className="mt-3 chat-message">
            <div className="flex items-start gap-2">
              <div className="ai-avatar ai-avatar-sm" aria-hidden="true">
                <div className="ai-avatar-inner" />
              </div>
              <div className="min-w-0 flex-1">
                {entry.status && !entry.text && (
                  <div className="inline-flex items-center gap-3 text-sm text-gray-600 bg-white/90 rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
                    <span>{entry.status}</span>
                    <span className="ai-wave" aria-hidden="true">
                      <span className="ai-wave-bar" />
                      <span className="ai-wave-bar" />
                      <span className="ai-wave-bar" />
                    </span>
                  </div>
                )}

                {entry.text && (
                  <div className="chat-bubble chat-bubble-assistant">
                    <MarkdownMessage text={entry.text} />
                  </div>
                )}

                {!!visibleItems.length && (
                  <ProductList items={visibleItems} onProductClick={onProductClick} onImageLoad={onImageLoad} />
                )}

                {canLoadMore && (
                  <button
                    type="button"
                    className="mt-3 text-sm font-semibold text-primary hover:underline"
                    onClick={() => onLoadMore(entry.id, itemCount)}
                  >
                    Load more
                  </button>
                )}

                {!!entry.extras?.length && (
                  <div className="mt-4">
                    <div className="text-xs uppercase tracking-wide text-gray-500">
                      Presentation extras
                    </div>
                    <ProductList
                      items={entry.extras.slice(0, 4)}
                      onProductClick={onProductClick}
                      onImageLoad={onImageLoad}
                    />
                  </div>
                )}

                {!!chips?.length && (
                  <div className="mt-3">
                    <div className="text-xs uppercase tracking-wide text-gray-500">
                      {entry.items?.length && entry.similarQueries?.length
                        ? "Similar searches"
                        : "Popular searches"}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {chips.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => onChipClick(term)}
                          className="chat-chip px-2.5 py-1 text-xs"
                        >
                          <SparkleIcon />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Once the assistant's reply entry exists, its growing text is the
          activity indicator — showing this too would be redundant. */}
      {loading && history[history.length - 1]?.role !== "assistant" && (
        <div className="mt-3 inline-flex items-center gap-3 text-sm text-gray-600 bg-white/90 rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
          <span>Assistant is typing</span>
          <span className="ai-wave" aria-hidden="true">
            <span className="ai-wave-bar" />
            <span className="ai-wave-bar" />
            <span className="ai-wave-bar" />
          </span>
        </div>
      )}
    </>
  );
}
