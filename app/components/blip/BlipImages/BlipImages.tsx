"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";
import { FiImage } from "react-icons/fi";
import { BlipImagesProps } from "./types";

export function BlipImages({ imageUrls }: BlipImagesProps) {
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (imageUrls.length !== 4) return;

    const loadImages = async () => {
      const imgs = await Promise.all(
        imageUrls.map((url) => {
          return new Promise<{ width: number; height: number }>((resolve) => {
            const img = document.createElement("img") as HTMLImageElement;
            img.src = url;
            img.onload = () =>
              resolve({ width: img.width, height: img.height });
            img.onerror = () => {
              setFailedImages((prev) => new Set(prev).add(url));
              resolve({ width: 200, height: 200 });
            };
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
    if (selectedIndex !== null) {
      setIsVisible(true);
      setTimeout(() => setIsEntering(true), 10);
    } else {
      setIsEntering(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null || imageUrls.length <= 1) return;

      console.log("Key pressed:", e.key, "Current index:", selectedIndex);

      if (e.key === "ArrowLeft" && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      } else if (
        e.key === "ArrowRight" &&
        selectedIndex < imageUrls.length - 1
      ) {
        setSelectedIndex(selectedIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, imageUrls]);

  if (imageUrls.length === 0) return null;

  const baseImageClass =
    "object-cover border border-gray-200 dark:border-gray-700 rounded-md cursor-pointer transition-transform hover:scale-[1.02]";

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      console.log("Prev clicked, new index:", selectedIndex - 1);
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < imageUrls.length - 1) {
      console.log("Next clicked, new index:", selectedIndex + 1);
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const renderImage = (
    url: string,
    alt: string,
    className: string,
    sizes: string,
    index: number,
    isModal: boolean = false
  ) => {
    if (failedImages.has(url)) {
      return (
        <div
          className={`${className} flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400`}
          onClick={
            isModal ? (e) => e.stopPropagation() : () => setSelectedIndex(index)
          }
        >
          <FiImage size={isModal ? 96 : 48} />
        </div>
      );
    }

    if (isModal) {
      return (
        <img
          src={url}
          alt={alt}
          className={className}
          loading="lazy"
          onError={() => setFailedImages((prev) => new Set(prev).add(url))}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    return (
      <div className={className} style={{ position: "relative" }}>
        <Image
          src={url}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover rounded-md"
          onError={() => setFailedImages((prev) => new Set(prev).add(url))}
          onClick={() => {
            console.log("Image clicked, index:", index);
            setSelectedIndex(index);
          }}
        />
      </div>
    );
  };

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 p-1">
      {imageUrls.length === 1 && (
        <div
          className={`w-full max-h-[512px] ${baseImageClass}`}
          style={{ position: "relative", aspectRatio: "16 / 9" }}
        >
          {renderImage(
            imageUrls[0],
            "Imagen 1",
            "absolute inset-0 w-full h-full",
            "100vw",
            0
          )}
        </div>
      )}

      {imageUrls.length === 2 && (
        <div className="grid grid-cols-2 gap-1">
          {renderImage(
            imageUrls[0],
            "Imagen 1",
            `w-full h-64 ${baseImageClass}`,
            "50vw",
            0
          )}
          {renderImage(
            imageUrls[1],
            "Imagen 2",
            `w-full h-64 ${baseImageClass}`,
            "50vw",
            1
          )}
        </div>
      )}

      {imageUrls.length === 3 && (
        <div className="grid grid-cols-2 gap-1">
          {renderImage(
            imageUrls[0],
            "Imagen 1",
            `w-full h-64 ${baseImageClass}`,
            "50vw",
            0
          )}
          <div className="grid grid-rows-2 gap-1">
            {renderImage(
              imageUrls[1],
              "Imagen 2",
              `w-full h-32 ${baseImageClass}`,
              "50vw",
              1
            )}
            {renderImage(
              imageUrls[2],
              "Imagen 3",
              `w-full h-32 ${baseImageClass}`,
              "50vw",
              2
            )}
          </div>
        </div>
      )}

      {imageUrls.length === 4 && (
        <div className="grid grid-cols-2 gap-1">
          {imageUrls.map((url, index) => (
            <div key={index} className="aspect-square w-full relative">
              {renderImage(
                url,
                `Imagen ${index + 1}`,
                `absolute inset-0 w-full h-full ${baseImageClass}`,
                "50vw",
                index
              )}
            </div>
          ))}
        </div>
      )}

      <ImageModal
        imageUrls={imageUrls}
        selectedIndex={selectedIndex} // Pasamos el índice directamente
        isVisible={isVisible}
        isEntering={isEntering}
        failedImages={failedImages}
        onClose={() => setSelectedIndex(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}

export default BlipImages;
