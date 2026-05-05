import PropTypes from "prop-types";

export default function WwButton({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  className = "",
  ...props
}) {
  const baseClasses =
    "whitespace-nowrap cursor-pointer transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#009688] focus:ring-offset-2 flex items-center justify-center";

  const variantClasses = {
    primary:
      "bg-[#009688] text-white hover:bg-[#00796B] hover:text-white active:scale-95",
    secondary:
      "border border-[#009688] text-[#009688] bg-transparent hover:bg-[#009688] hover:text-white active:scale-95",
    outline:
      "border border-[#E8ECF2] text-[#1E2328] hover:border-[#009688] hover:text-[#009688] active:scale-95",
  };

  const sizeClasses = {
    sm: "px-4 text-sm h-11 rounded-lg",
    md: "px-6 text-sm h-11 rounded-lg",
    lg: "px-8 text-base h-11 rounded-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      style={{ borderRadius: "8px", height: "44px" }}
      {...props}
    >
      {children}
    </button>
  );
}

WwButton.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary", "outline"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  children: PropTypes.node.isRequired,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
};
