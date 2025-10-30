import { useEffect, useRef } from "react";
import { IoArrowBackOutline, IoClose } from "react-icons/io5";
import { IoMdArrowForward } from "react-icons/io";

const ImageGalleryModal = ({
  isOpen,
  onClose,
  activeImage,
  setActiveImage,
  images = [],
  productName = "Product",
}) => {
  const modalRef = useRef(null);

  // Auto-focus modal when it opens for keyboard navigation
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      navigateToPrevious();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      navigateToNext();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // Navigate to previous image
  const navigateToPrevious = () => {
    const currentIndex = images.indexOf(activeImage) || 0;
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setActiveImage(images[prevIndex]);
  };

  // Navigate to next image
  const navigateToNext = () => {
    const currentIndex = images.indexOf(activeImage) || 0;
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setActiveImage(images[nextIndex]);
  };

  // Get current image index for display
  const getCurrentIndex = () => {
    return (images.indexOf(activeImage) || 0) + 1;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col justify-center items-center z-50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ outline: "none" }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-200 backdrop-blur-md"
        aria-label="Close"
      >
        <IoClose className="text-3xl" />
      </button>

      {/* Main Image Container */}
      <div
        className="relative w-full max-w-6xl flex-1 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateToPrevious();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-200 backdrop-blur-md"
          aria-label="Previous image"
        >
          <IoArrowBackOutline className="text-2xl" />
        </button>

        {/* Center Image */}
        <div className="w-full h-[60vh] md:h-[70vh] flex items-center justify-center px-20">
          <img
            src={activeImage}
            alt={productName}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>

        {/* Right Arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateToNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-200 backdrop-blur-md"
          aria-label="Next image"
        >
          <IoMdArrowForward className="text-2xl" />
        </button>
      </div>

      {/* Thumbnail Strip at Bottom */}
      <div
        className="w-full max-w-6xl mt-6 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center gap-3 overflow-x-auto pb-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(image)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                activeImage === image
                  ? "border-white ring-2 ring-white/50"
                  : "border-white/30 hover:border-white/60"
              }`}
            >
              <img
                src={image}
                alt={`${productName} - ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Image Counter */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
        {getCurrentIndex()} / {images.length}
      </div>
    </div>
  );
};

export default ImageGalleryModal;
