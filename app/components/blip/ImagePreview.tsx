// components/BlipImages/ImagePreview.tsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FiX, FiImage } from "react-icons/fi";

interface ImagePreviewProps {
  files: FileList | null;
  onRemove?: (index: number) => void;
}

export function ImagePreview({ files, onRemove }: ImagePreviewProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!files) {
      setPreviews([]);
      setFailedImages(new Set());
      return;
    }

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  if (previews.length === 0) return null;

  const renderImage = (url: string, alt: string, className: string) => {
    if (failedImages.has(url)) {
      return (
        <div
          className={`${className} flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400`}
        >
          <FiImage size={48} />
        </div>
      );
    }

    return (
      <div className={className} style={{ position: "relative" }}>
        <Image
          src={url}
          alt={alt}
          fill
          className="object-cover rounded-md"
          onError={() => setFailedImages((prev) => new Set(prev).add(url))}
        />
      </div>
    );
  };

  return (
    <div className="mt-2 mb-2">
      <div className="grid grid-cols-2 gap-2 md:flex md:flex-row md:gap-2 md:overflow-x-auto">
        {previews.map((preview, index) => (
          <div key={index} className="relative flex-shrink-0 group">
            {renderImage(
              preview,
              `Vista previa de imagen ${index + 1}`,
              "w-32 h-32 border border-gray-300 shadow-sm"
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 w-5 h-5 bg-gray-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-700 transition-opacity"
                aria-label={`Eliminar imagen ${index + 1}`}
              >
                <FiX size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
