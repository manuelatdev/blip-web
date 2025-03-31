// components/BlipImages/types.ts

export interface BlipImagesProps {
  imageUrls: string[];
}

export interface ImageModalProps {
  imageUrls: string[];
  selectedImage: string;
  isVisible: boolean;
  isEntering: boolean;
  failedImages: Set<string>;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}
