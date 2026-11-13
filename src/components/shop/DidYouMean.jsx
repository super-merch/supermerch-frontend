import PropTypes from "prop-types";
import { Link } from "react-router-dom";

/**
 * Shown on the search page when the backend corrected a typo
 * ("botle" -> "bottle"). The results already use the corrected word, so this
 * tells the customer why, and lets them re-run the search with that spelling.
 */
const DidYouMean = ({ suggestion, searched, className = "" }) => {
  if (!suggestion || !searched) return null;
  if (suggestion.trim().toLowerCase() === searched.trim().toLowerCase()) return null;

  return (
    <p className={`text-sm text-gray-600 ${className}`} role="status">
      Did you mean{" "}
      <Link
        to={`/search?search=${encodeURIComponent(suggestion)}`}
        className="font-semibold text-brand underline underline-offset-2"
      >
        {suggestion}
      </Link>
      ? Showing results for &ldquo;{suggestion}&rdquo;.
    </p>
  );
};

DidYouMean.propTypes = {
  suggestion: PropTypes.string,
  searched: PropTypes.string,
  className: PropTypes.string,
};

export default DidYouMean;
