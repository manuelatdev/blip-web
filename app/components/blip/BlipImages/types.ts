// components/BlipImages/types.ts

export interface BlipImagesProps {
  imageUrls: string[];
}

export interface ImageModalProps {
  imageUrls: string[];
  selectedIndex: number | null; // Cambiamos de selectedImage a selectedIndex
  isVisible: boolean;
  isEntering: boolean;
  failedImages: Set<string>;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}
