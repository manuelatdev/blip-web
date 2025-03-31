"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";
import { FiImage } from "react-icons/fi";
import { BlipImagesProps } from "./types";

export function BlipImages({ imageUrls }: BlipImagesProps) {
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  const renderImage = (
    url: string,
    alt: string,
    className: string,
    sizes: string,
    isModal: boolean = false
  ) => {
    if (failedImages.has(url)) {
      return (
        <div
          className={`${className} flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400`}
          onClick={
            isModal ? (e) => e.stopPropagation() : () => setSelectedImage(url)
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
          onClick={() => setSelectedImage(url)}
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
            "100vw"
          )}
        </div>
      )}

      {imageUrls.length === 2 && (
        <div className="grid grid-cols-2 gap-1">
          {renderImage(
            imageUrls[0],
            "Imagen 1",
            `w-full h-64 ${baseImageClass}`,
            "50vw"
          )}
          {renderImage(
            imageUrls[1],
            "Imagen 2",
            `w-full h-64 ${baseImageClass}`,
            "50vw"
          )}
        </div>
      )}

      {imageUrls.length === 3 && (
        <div className="grid grid-cols-2 gap-1">
          {renderImage(
            imageUrls[0],
            "Imagen 1",
            `w-full h-64 ${baseImageClass}`,
            "50vw"
          )}
          <div className="grid grid-rows-2 gap-1">
            {renderImage(
              imageUrls[1],
              "Imagen 2",
              `w-full h-32 ${baseImageClass}`,
              "50vw"
            )}
            {renderImage(
              imageUrls[2],
              "Imagen 3",
              `w-full h-32 ${baseImageClass}`,
              "50vw"
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
                "50vw"
              )}
            </div>
          ))}
        </div>
      )}

      <ImageModal
        imageUrls={imageUrls}
        selectedImage={selectedImage!}
        isVisible={isVisible}
        isEntering={isEntering}
        failedImages={failedImages}
        onClose={() => setSelectedImage(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}

export default BlipImages;
