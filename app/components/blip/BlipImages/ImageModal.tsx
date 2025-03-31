// components/BlipImages/ImageModal.tsx

"use client";

import { FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";
import { ImageModalProps } from "./types";

const ImageModal: React.FC<ImageModalProps> = ({
  imageUrls,
  selectedImage,
  isVisible,
  isEntering,
  failedImages,
  onClose,
  onPrev,
  onNext,
}) => {
  if (!isVisible || !selectedImage) return null;

  const renderImage = (url: string, alt: string, className: string) => {
    if (failedImages.has(url)) {
      return (
        <div
          className={`${className} flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400`}
          onClick={(e) => e.stopPropagation()}
        >
          <FiImage size={96} />
        </div>
      );
    }

    return (
      <img
        src={url}
        alt={alt}
        className={className}
        loading="lazy"
        onClick={(e) => e.stopPropagation()}
      />
    );
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-200 ease-in-out ${
        isEntering ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      {imageUrls.length > 1 && imageUrls.indexOf(selectedImage) > 0 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          <FiChevronLeft size={24} />
        </button>
      )}

      {renderImage(
        selectedImage,
        "Imagen ampliada",
        `max-h-[90vh] max-w-[90vw] object-contain rounded-lg transition-transform duration-200 ease-in-out ${
          isEntering ? "scale-100" : "scale-95"
        }`
      )}

      {imageUrls.length > 1 &&
        imageUrls.indexOf(selectedImage) < imageUrls.length - 1 && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <FiChevronRight size={24} />
          </button>
        )}
    </div>
  );
};

export default ImageModal;
