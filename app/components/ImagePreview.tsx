"use client";

import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

interface ImagePreviewProps {
  files: FileList | null;
  onRemove?: (index: number) => void;
}

export function ImagePreview({ files, onRemove }: ImagePreviewProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!files) {
      setPreviews([]);
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

  return (
    <div className="mt-2 mb-2">
      <div className="grid grid-cols-2 gap-2 md:flex md:flex-row md:gap-2 md:overflow-x-auto">
        {previews.map((preview, index) => (
          <div key={index} className="relative flex-shrink-0 group">
            <img
              src={preview}
              alt={`Vista previa de imagen ${index + 1}`}
              className="w-32 h-32 object-cover rounded-md border border-gray-300 shadow-sm"
            />
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
