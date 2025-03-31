"use client";

import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface BlipImagesProps {
  imageUrls: string[];
}

export function BlipImages({ imageUrls }: BlipImagesProps) {
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    if (imageUrls.length !== 4) return;

    const loadImages = async () => {
      const imgs = await Promise.all(
        imageUrls.map((url) => {
          return new Promise<{ width: number; height: number }>((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () =>
              resolve({ width: img.width, height: img.height });
          });
        })
      );

      const aspectRatios = imgs.map((img) => img.width / img.height);
      const avgAspectRatio =
        aspectRatios.reduce((a, b) => a + b, 0) / aspectRatios.length;
      const imageWidth = 256;
      const calculatedHeight = imageWidth / avgAspectRatio;
      setContainerHeight(calculatedHeight * 2);
    };

    loadImages();
  }, [imageUrls]);

  useEffect(() => {
    if (selectedImage) {
      setIsVisible(true);
      setTimeout(() => setIsEntering(true), 10);
    } else {
      setIsEntering(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedImage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage || imageUrls.length <= 1) return;

      const currentIndex = imageUrls.indexOf(selectedImage);
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setSelectedImage(imageUrls[currentIndex - 1]);
      } else if (
        e.key === "ArrowRight" &&
        currentIndex < imageUrls.length - 1
      ) {
        setSelectedImage(imageUrls[currentIndex + 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, imageUrls]);

  if (imageUrls.length === 0) return null;

  const baseImageClass =
    "object-cover border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer transition-transform hover:scale-[1.02]";

  const handlePrev = () => {
    const currentIndex = imageUrls.indexOf(selectedImage!);
    if (currentIndex > 0) {
      setSelectedImage(imageUrls[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const currentIndex = imageUrls.indexOf(selectedImage!);
    if (currentIndex < imageUrls.length - 1) {
      setSelectedImage(imageUrls[currentIndex + 1]);
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 p-1">
      {imageUrls.length === 1 && (
        <img
          src={imageUrls[0]}
          alt="Imagen 1"
          className={`w-full h-auto max-h-[512px] ${baseImageClass}`}
          onClick={() => setSelectedImage(imageUrls[0])}
        />
      )}

      {imageUrls.length === 2 && (
        <div className="grid grid-cols-2 gap-1">
          <img
            src={imageUrls[0]}
            alt="Imagen 1"
            className={`w-full h-64 ${baseImageClass}`}
            onClick={() => setSelectedImage(imageUrls[0])}
          />
          <img
            src={imageUrls[1]}
            alt="Imagen 2"
            className={`w-full h-64 ${baseImageClass}`}
            onClick={() => setSelectedImage(imageUrls[1])}
          />
        </div>
      )}

      {imageUrls.length === 3 && (
        <div className="grid grid-cols-2 gap-1">
          <img
            src={imageUrls[0]}
            alt="Imagen 1"
            className={`w-full h-64 ${baseImageClass}`}
            onClick={() => setSelectedImage(imageUrls[0])}
          />
          <div className="grid grid-rows-2 gap-1">
            <img
              src={imageUrls[1]}
              alt="Imagen 2"
              className={`w-full h-32 ${baseImageClass}`}
              onClick={() => setSelectedImage(imageUrls[1])}
            />
            <img
              src={imageUrls[2]}
              alt="Imagen 3"
              className={`w-full h-32 ${baseImageClass}`}
              onClick={() => setSelectedImage(imageUrls[2])}
            />
          </div>
        </div>
      )}

      {imageUrls.length === 4 && (
        <div className="grid grid-cols-2 gap-1">
          {imageUrls.map((url, index) => (
            <div key={index} className="aspect-square w-full relative">
              <img
                src={url}
                alt={`Imagen ${index + 1}`}
                className={`absolute inset-0 w-full h-full ${baseImageClass}`}
                onClick={() => setSelectedImage(url)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal para la imagen ampliada */}
      {isVisible && selectedImage && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-200 ease-in-out ${
            isEntering ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSelectedImage(null)}
        >
          {imageUrls.length > 1 && imageUrls.indexOf(selectedImage) > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            >
              <FiChevronLeft size={24} />
            </button>
          )}

          <img
            src={selectedImage}
            alt="Imagen ampliada"
            className={`max-h-[90vh] max-w-[90vw] object-contain rounded-lg transition-transform duration-200 ease-in-out ${
              isEntering ? "scale-100" : "scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
          />

          {imageUrls.length > 1 &&
            imageUrls.indexOf(selectedImage) < imageUrls.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              >
                <FiChevronRight size={24} />
              </button>
            )}
        </div>
      )}
    </div>
  );
}
