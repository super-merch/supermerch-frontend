import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Skeleton } from "@mui/material";

/** Above site header (z-[100]) and global overlays (e.g. z-[9999]); must escape sticky PDP gallery stacking context. */
const FULLSCREEN_Z = 10100;

export default function ProductGallery({
    images,
    productName,
    selectedColorName,
    isLoading,
}) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    const containerRef = useRef(null);
    const thumbnailRef = useRef(null);

    // Zoom settings
    const ZOOM_LEVEL = 2.5;
    const LENS_SIZE = 150;

    // Minimum swipe distance for navigation
    const minSwipeDistance = 50;

    // Reset selected image when color changes
    useEffect(() => {
        setSelectedImage(0);
        setImageLoaded(false);
    }, [selectedColorName]);

    // Reset image loaded state when image changes
    useEffect(() => {
        setImageLoaded(false);
    }, [selectedImage]);

    useEffect(() => {
        if (!isFullscreen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [isFullscreen]);

    const handleMouseMove = useCallback((e) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        // Calculate mouse position relative to the container
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Clamp values to container bounds
        const clampedX = Math.max(0, Math.min(x, rect.width));
        const clampedY = Math.max(0, Math.min(y, rect.height));

        setMousePosition({
            x: clampedX,
            y: clampedY,
            percentX: (clampedX / rect.width) * 100,
            percentY: (clampedY / rect.height) * 100,
            containerWidth: rect.width,
            containerHeight: rect.height,
        });
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovering(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovering(false);
    }, []);

    // Touch handlers for swipe navigation
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && selectedImage < images.length - 1) {
            setSelectedImage((prev) => prev + 1);
        }
        if (isRightSwipe && selectedImage > 0) {
            setSelectedImage((prev) => prev - 1);
        }
    };

    // Navigate to next/prev image
    const goToNext = useCallback(() => {
        setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }, [images.length]);

    const goToPrev = useCallback(() => {
        setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }, [images.length]);

    // Calculate lens position (clamped to image bounds)
    const getLensStyle = () => {
        if (!mousePosition.containerWidth) return {};

        const halfLens = LENS_SIZE / 2;

        // Calculate lens position (centered on cursor)
        let lensX = mousePosition.x - halfLens;
        let lensY = mousePosition.y - halfLens;

        // Clamp to container bounds
        lensX = Math.max(
            0,
            Math.min(lensX, mousePosition.containerWidth - LENS_SIZE)
        );
        lensY = Math.max(
            0,
            Math.min(lensY, mousePosition.containerHeight - LENS_SIZE)
        );

        return {
            left: `${lensX}px`,
            top: `${lensY}px`,
            width: `${LENS_SIZE}px`,
            height: `${LENS_SIZE}px`,
        };
    };

    // Calculate the zoomed image position inside the lens
    const getZoomedImageStyle = () => {
        if (!mousePosition.containerWidth) return {};

        const scaledWidth = mousePosition.containerWidth * ZOOM_LEVEL;
        const scaledHeight = mousePosition.containerHeight * ZOOM_LEVEL;

        // Calculate where the background should be positioned
        // We want the point under the cursor to be in the center of the lens
        const bgX = -(mousePosition.x * ZOOM_LEVEL - LENS_SIZE / 2);
        const bgY = -(mousePosition.y * ZOOM_LEVEL - LENS_SIZE / 2);

        return {
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            left: `${bgX}px`,
            top: `${bgY}px`,
        };
    };

    // Calculate the side panel zoomed view position
    const getSidePanelStyle = () => {
        const panelSize = 400; // Side panel size

        // Calculate offset to center the zoomed area
        const offsetX =
            -(mousePosition.percentX / 100) * (panelSize * ZOOM_LEVEL) +
            panelSize / 2;
        const offsetY =
            -(mousePosition.percentY / 100) * (panelSize * ZOOM_LEVEL) +
            panelSize / 2;

        return {
            backgroundImage: `url(${images[selectedImage]})`,
            backgroundSize: `${ZOOM_LEVEL * 100}%`,
            backgroundPosition: `${mousePosition.percentX}% ${mousePosition.percentY}%`,
            backgroundRepeat: "no-repeat",
        };
    };

    if (isLoading) {
        return (
            <div className="flex flex-row gap-3 sm:gap-4 items-start">
                <div className="flex flex-col gap-2 sm:gap-3 w-[72px] sm:w-[85px] lg:w-[100px] shrink-0 max-h-[312px] sm:max-h-[380px] lg:max-h-[436px] overflow-y-hidden">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton
                            key={i}
                            variant="rectangular"
                            className="rounded-xl w-full aspect-square shrink-0"
                        />
                    ))}
                </div>
                <div className="flex-1 min-w-0">
                    <Skeleton variant="rectangular" className="rounded-xl w-full aspect-square" />
                </div>
            </div>
        );
    }

    const showZoom = isHovering && imageLoaded;

    // Cap height to ~4 thumbnails so extra images scroll (matches w + gap-2 / sm:gap-3).
    const thumbColumnClass =
        "flex flex-col gap-2 sm:gap-3 w-[72px] sm:w-[85px] lg:w-[100px] shrink-0 overflow-y-auto overflow-x-hidden pr-1 scrollbar-hide " +
        (images.length > 4
            ? "max-h-[312px] sm:max-h-[380px] lg:max-h-[436px]"
            : "");

    return (
        <>
            <div className="flex flex-row gap-3 sm:gap-4 items-start">
                {/* Thumbnails — left column, vertical scroll (Supermerch PDP style) */}
                <div ref={thumbnailRef} className={thumbColumnClass}>
                    {images.map((image, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedImage(index)}
                            className={`w-full aspect-square shrink-0 border-2 rounded-xl overflow-hidden transition-all duration-200 bg-[#FAFAFA] ${
                                selectedImage === index
                                    ? "border-[#009688] shadow-md ring-1 ring-[#009688]/20"
                                    : "border-[#E5E7EB] hover:border-[#9CA3AF]"
                            }`}
                            aria-label={`View image ${index + 1}`}
                        >
                            <img
                                src={image}
                                alt={`${productName} view ${index + 1}`}
                                className="w-full h-full object-contain p-1"
                            />
                        </button>
                    ))}
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                {selectedColorName && (
                    <div className="mb-1 flex items-center justify-between">
                        <span
                            className="text-[#6B7380] text-xs"
                            style={{ fontFamily: "Inter, sans-serif" }}
                        >
                            Showing:{" "}
                            <span className="font-medium text-[#1E2328]">
                                {selectedColorName}
                            </span>
                        </span>
                        <span
                            className="text-[#6B7380] text-xs"
                            style={{ fontFamily: "Inter, sans-serif" }}
                        >
                            {selectedImage + 1} / {images.length}
                        </span>
                    </div>
                )}

                {/* Main Image Container */}
                <div className="relative">
                    <div
                        ref={containerRef}
                        className="relative aspect-square bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl overflow-hidden cursor-crosshair group"
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {/* Main Product Image */}
                        <img
                            src={images[selectedImage]}
                            alt={productName}
                            className="w-full h-full object-contain select-none"
                            onClick={() => setIsFullscreen(true)}
                            onLoad={() => setImageLoaded(true)}
                            draggable={false}
                        />

                        {/* Magnifier Lens - Desktop only */}
                        {showZoom && (
                            <div
                                className="hidden sm:block absolute pointer-events-none border-2 border-[#009688] rounded-full overflow-hidden shadow-xl"
                                style={getLensStyle()}
                            >
                                <img
                                    src={images[selectedImage]}
                                    alt={productName}
                                    className="absolute max-w-none pointer-events-none"
                                    style={getZoomedImageStyle()}
                                    draggable={false}
                                />
                            </div>
                        )}

                        {/* Mobile Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToPrev();
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#009688] hover:text-white hover:border-[#009688] transition-all z-10"
                                >
                                    <i className="ri-arrow-left-s-line text-lg"></i>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToNext();
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#009688] hover:text-white hover:border-[#009688] transition-all z-10"
                                >
                                    <i className="ri-arrow-right-s-line text-lg"></i>
                                </button>
                            </>
                        )}

                        {/* Desktop Zoom Hint */}
                        <div
                            className={`hidden sm:flex absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm border border-[#E5E7EB] z-10 transition-opacity duration-200 ${
                                showZoom ? "opacity-0" : "opacity-100"
                            }`}
                        >
                            <div className="flex items-center space-x-1.5">
                                <i className="ri-search-line text-[#6B7280] text-sm"></i>
                                <span
                                    className="text-[10px] font-medium text-[#374151]"
                                    style={{ fontFamily: "Inter, sans-serif" }}
                                >
                                    Hover to zoom
                                </span>
                            </div>
                        </div>

                        {/* Mobile Tap Hint */}
                        <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 z-10">
                            <div className="flex items-center space-x-1.5">
                                <i className="ri-zoom-in-line text-white text-xs"></i>
                                <span
                                    className="text-[10px] font-medium text-white"
                                    style={{ fontFamily: "Inter, sans-serif" }}
                                >
                                    Tap to enlarge
                                </span>
                            </div>
                        </div>

                        {/* Mobile Image Dots Indicator */}
                        {images.length > 1 && (
                            <div className="sm:hidden absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(index);
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                            selectedImage === index
                                                ? "bg-[#009688] w-4"
                                                : "bg-white/60 hover:bg-white"
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Zoomed View Panel - Shows below image on hover (Desktop only) */}
                {showZoom && (
                    <div className="hidden sm:block mt-3 w-full h-[250px] bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shadow-sm">
                        <div
                            className="w-full h-full"
                            style={{
                                backgroundImage: `url(${images[selectedImage]})`,
                                backgroundSize: `${ZOOM_LEVEL * 100}%`,
                                backgroundPosition: `${mousePosition.percentX}% ${mousePosition.percentY}%`,
                                backgroundRepeat: "no-repeat",
                            }}
                        />
                    </div>
                )}
                </div>
            </div>

            {/* Fullscreen: portal to body so z-index is not trapped under lg:sticky lg:z-10 gallery wrapper */}
            {isFullscreen &&
                createPortal(
                    <div
                        className="fixed inset-0 flex flex-col bg-black"
                        style={{ zIndex: FULLSCREEN_Z }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Product image preview"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <div className="relative flex min-h-0 flex-1 flex-col">
                            {/* Header — pt safe area so close stays below notches; z above main image */}
                            <div
                                className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent p-4 pt-[max(1rem,env(safe-area-inset-top))]"
                            >
                                <span
                                    className="pointer-events-auto text-sm font-medium text-white/80"
                                    style={{ fontFamily: "Inter, sans-serif" }}
                                >
                                    {selectedImage + 1} / {images.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsFullscreen(false)}
                                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                                    aria-label="Close preview"
                                >
                                    <i className="ri-close-line text-xl"></i>
                                </button>
                            </div>

                            <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-28 pt-16 sm:pb-32">
                                <img
                                    src={images[selectedImage]}
                                    alt={productName}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>

                            {images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={goToPrev}
                                        className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 transform items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-4 sm:h-12 sm:w-12"
                                        aria-label="Previous image"
                                    >
                                        <i className="ri-arrow-left-s-line text-2xl"></i>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={goToNext}
                                        className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 transform items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-4 sm:h-12 sm:w-12"
                                        aria-label="Next image"
                                    >
                                        <i className="ri-arrow-right-s-line text-2xl"></i>
                                    </button>
                                </>
                            )}

                            {images.length > 1 && (
                                <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 to-transparent p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                                    <div className="pointer-events-auto flex max-h-24 justify-center gap-2 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide">
                                        {images.map((image, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setSelectedImage(index)}
                                                className={`h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-white/10 transition-all sm:h-16 sm:w-16 ${
                                                    selectedImage === index
                                                        ? "border-white opacity-100"
                                                        : "border-transparent opacity-50 hover:opacity-75"
                                                }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${productName || "Promotional product"} thumbnail view ${index + 1}`}
                                                    className="h-full w-full object-contain p-0.5"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
