import React from "react";
import { useNavigate } from "react-router-dom";

const EmptyState = ({
  title = "No items found",
  description = "We couldn't find what you're looking for. Try adjusting your search or filters.",
  icon = "search",
  primaryAction,
  secondaryAction,
  suggestions = [],
  showContact = true,
  variant = "default", // default, minimal, detailed
}) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (icon) {
      case "search":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        );
      case "shopping":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        );
      case "heart":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        );
      case "folder":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        );
      default:
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        );
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "minimal":
        return {
          container: "min-h-[200px] py-8",
          iconSize: "w-16 h-16",
          iconContainer: "w-20 h-20",
          titleSize: "text-xl",
          spacing: "space-y-4",
        };
      case "detailed":
        return {
          container: "min-h-[500px] py-16",
          iconSize: "w-16 h-16",
          iconContainer: "w-28 h-28",
          titleSize: "text-3xl",
          spacing: "space-y-8",
        };
      default:
        return {
          container: "min-h-[400px] py-16",
          iconSize: "w-12 h-12",
          iconContainer: "w-24 h-24",
          titleSize: "text-2xl",
          spacing: "space-y-6",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`flex flex-col items-center justify-center ${styles.container} px-4`}
    >
      {/* Icon/Illustration */}
      <div className={`relative mb-6 ${styles.spacing}`}>
        <div
          className={`${styles.iconContainer} bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg`}
        >
          <svg
            className={`${styles.iconSize} text-gray-400`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {getIcon()}
          </svg>
        </div>

        {/* Decorative elements for detailed variant */}
        {variant === "detailed" && (
          <>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 rounded-full animate-pulse"></div>
            <div
              className="absolute -bottom-1 -left-1 w-4 h-4 bg-purple-100 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </>
        )}
      </div>

      {/* Main message */}
      <div className={`text-center max-w-md mb-6 ${styles.spacing}`}>
        <h3 className={`${styles.titleSize} font-bold text-gray-900 mb-3`}>
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>

      {/* Action buttons */}
      {(primaryAction || secondaryAction) && (
        <div
          className={`flex flex-col sm:flex-row gap-4 mb-6 ${styles.spacing}`}
        >
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}

      {/* Helpful suggestions */}
      {suggestions.length > 0 && variant !== "minimal" && (
        <div className="bg-gray-50 rounded-xl p-6 max-w-lg w-full">
          <h4 className="font-semibold text-gray-900 mb-4 text-center">
            Try these suggestions:
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contact support */}
      {showContact && variant === "detailed" && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Still can't find what you're looking for?
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
          >
            Contact our support team
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
