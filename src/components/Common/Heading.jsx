import PropTypes from "prop-types";

const Heading = ({
  // Text content
  title,
  subtitle,
  description,

  // Styling props
  titleClassName = "",
  subtitleClassName = "",
  descriptionClassName = "",
  containerClassName = "",

  // Layout props
  align = "center", // "left", "center", "right"
  spacing = "normal", // "tight", "normal", "loose"

  // Size variants
  size = "default", // "small", "default", "large", "xl"

  // Optional elements
  showUnderline = false,
  underlineClassName = "",

  // Custom content (for complex layouts)
  children,

  // Additional props
  ...props
}) => {
  // Size-based class mappings
  const sizeClasses = {
    small: {
      title: "text-lg md:text-xl lg:text-2xl",
      subtitle: "text-sm md:text-base",
      description: "text-sm md:text-base",
      container: "py-4 md:py-6",
    },
    default: {
      title: "text-xl md:text-2xl lg:text-3xl",
      subtitle: "text-base md:text-lg",
      description: "text-base md:text-lg !mt-1",
      container: "pb-2 md:pb-4",
    },
    large: {
      title: "text-2xl md:text-3xl lg:text-4xl",
      subtitle: "text-lg md:text-xl",
      description: "text-lg md:text-xl",
      container: "py-8 md:py-10",
    },
    xl: {
      title: "text-3xl md:text-4xl lg:text-5xl",
      subtitle: "text-xl md:text-2xl",
      description: "text-xl md:text-2xl",
      container: "py-10 md:py-12",
    },
  };

  // Alignment classes
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  // Spacing classes
  const spacingClasses = {
    tight: "space-y-2",
    normal: "space-y-3 md:space-y-4",
    loose: "space-y-4 md:space-y-6",
  };

  // Get current size configuration
  const currentSize = sizeClasses[size] || sizeClasses.default;

  // Build class names
  const containerClasses = `
    ${currentSize.container}
    ${alignClasses[align]}
    ${spacingClasses[spacing]}
    ${containerClassName}
  `.trim();

  const titleClasses = `
    font-semibold text-brand
    ${currentSize.title}
    ${titleClassName}
  `.trim();

  const subtitleClasses = `
    font-semibold text-smallHeader uppercase tracking-wide
    ${currentSize.subtitle}
    ${subtitleClassName}
  `.trim();

  const descriptionClasses = `
    text-gray-600 font-normal
    ${currentSize.description}
    ${descriptionClassName}
  `.trim();

  const underlineClasses = `
    w-16 h-1 bg-primary mx-auto mt-4
    ${underlineClassName}
  `.trim();

  return (
    <div className={containerClasses} {...props}>
      {title && <h3 className={titleClasses}>{title}</h3>}
      {subtitle && <h3 className={subtitleClasses}>{subtitle}</h3>}

      {/* {showUnderline && <div className={underlineClasses}></div>} */}

      {description && <p className={descriptionClasses}>{description}</p>}

      {children && <div className="mt-2">{children}</div>}
    </div>
  );
};



export default Heading;
