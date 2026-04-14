import ProductCard from "./ProductCard";

const RecommendationsStrip = ({
  title = "Recommended Products",
  products = [],
  loading = false,
  className = "",
  maxItems = 4,
}) => {
  if (loading) {
    return (
      <div className={`mt-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: maxItems }).map((_, idx) => (
            <div
              key={idx}
              className="h-[320px] rounded-lg border border-gray-200 bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div className={`mt-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.slice(0, maxItems).map((product) => (
          <ProductCard
            key={product?.meta?.id || product?._id}
            product={product}
            favSet={new Set()}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationsStrip;
