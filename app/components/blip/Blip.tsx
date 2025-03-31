"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { deleteBlip } from "@/actions/blips";
import { X } from "lucide-react";
import { BlipImages } from "./BlipImages/BlipImages";
import { BlipUserInfo, BlipContent } from "@/types/blip";

interface BlipProps {
  blipId: string;
  userInfo: BlipUserInfo;
  content: BlipContent;
  timestamp: string;
  accessToken: string;
}

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "hace unos segundos";
  if (diffHours < 1) return `hace ${diffMinutes} min`;
  if (diffDays < 1) return `hace ${diffHours} h`;
  if (diffDays < 30) return `hace ${diffDays} d`;

  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Blip({
  blipId,
  userInfo,
  content,
  timestamp,
  accessToken,
}: BlipProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const { data: session } = useSession();

  const date = new Date(timestamp);
  const formattedDate = date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const displayNameFormatted = userInfo.userId
    ? `${userInfo.displayName}`
    : "Blipper";
  const avatarUrl = userInfo.profilePictureUrl || "/default-avatar.jpg";
  const relativeTime = getRelativeTime(timestamp);

  const imageUrls = [
    content.imageUrl1,
    content.imageUrl2,
    content.imageUrl3,
    content.imageUrl4,
  ].filter(
    (url): url is string => typeof url === "string" && url.trim() !== ""
  );

  useEffect(() => {
    const checkTruncation = () => {
      if (contentRef.current) {
        const lineHeight = parseFloat(
          getComputedStyle(contentRef.current).lineHeight
        );
        const maxHeight = lineHeight * 3;
        setIsTruncated(contentRef.current.scrollHeight > maxHeight);
      }
    };
    checkTruncation();
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [content.value, isLoaded]);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setIsLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageUrls.length;

    const handleImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setIsLoaded(true);
      }
    };

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = handleImageLoad;
      img.onerror = handleImageLoad;
    });
  }, [imageUrls]);

  const isOwnBlip =
    session?.user?.id &&
    userInfo.userId &&
    session.user.id === userInfo.userId &&
    accessToken;
  const isViewerAdmin = session?.role === "ADMIN";
  const canDelete = isOwnBlip || isViewerAdmin;

  const handleDelete = async () => {
    try {
      await deleteBlip(blipId, accessToken);
      setIsDeleted(true);
      toast.success("Blip eliminado", {
        description: "El blip ha sido eliminado con éxito.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error al eliminar el blip:", error);
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar el blip. Intenta de nuevo.",
        duration: 5000,
      });
    }
  };

  if (isDeleted) {
    return null;
  }

  // Skeleton loading mientras no está cargado
  if (!isLoaded) {
    return (
      <div className="p-4 border-b border-gray-200 rounded-xs animate-pulse">
        <div className="flex gap-3">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12">
            <div className="h-full w-full bg-gray-300 rounded-full" />
            {userInfo.isAdmin && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs bg-gray-300 h-5 w-12 rounded-full" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 bg-gray-300 rounded" />
                <div className="h-3 w-16 bg-gray-300 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-300 rounded" />
              <div className="h-4 w-3/4 bg-gray-300 rounded" />
              {imageUrls.length > 0 && (
                <div className="h-40 w-full bg-gray-300 rounded-lg" />
              )}
            </div>
            <div className="h-3 w-32 bg-gray-300 rounded mt-2" />
          </div>
        </div>
      </div>
    );
  }

  // Contenido completo una vez cargado
  return (
    <div
      className={`p-4 border-b border-gray-200 transition group relative rounded-xs ${
        isOwnBlip ? "bg-gray-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex gap-3">
        <div className="relative h-10 w-10 sm:h-12 sm:w-12">
          <Avatar className={`h-full w-full `}>
            <AvatarImage
              src={avatarUrl}
              alt={`Avatar de ${userInfo.displayName}`}
            />
            <AvatarFallback>{userInfo.displayName[0]}</AvatarFallback>
          </Avatar>
          {userInfo.isAdmin && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full z-10">
              Admin
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 max-w-[calc(100%-2rem)]">
              <span className="font-semibold text-gray-900 text-[15px] sm:text-[16px] truncate">
                {displayNameFormatted}
              </span>
              <span className="text-gray-500 text-[13px] sm:text-[14px]">
                · {relativeTime}
              </span>
            </div>
            {canDelete && (
              <button
                onClick={handleDelete}
                className="absolute top-3 right-3 w-5 h-5 rounded-sm p-1 text-gray-500 bg-gray-200 opacity-0 group-hover:opacity-100 hover:text-gray-700 hover:bg-gray-300 transition-opacity duration-200 ease-in-out focus:outline-none"
                aria-label="Eliminar blip"
              >
                <X className="w-full h-full" />
              </button>
            )}
          </div>
          <div>
            <p
              ref={contentRef}
              className={`text-gray-900 text-[15px] leading-5 whitespace-pre-wrap break-words ${
                !isExpanded ? "line-clamp-3" : ""
              }`}
            >
              {content.value}
            </p>
            {isTruncated && !isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-blue-500 text-[13px] sm:text-[14px] mt-1 hover:underline focus:outline-none"
              >
                Mostrar más
              </button>
            )}
            {isExpanded && isTruncated && (
              <button
                onClick={() => setIsExpanded(false)}
                className="text-blue-500 text-[13px] sm:text-[14px] mt-1 hover:underline focus:outline-none"
              >
                Mostrar menos
              </button>
            )}
            {imageUrls.length > 0 && <BlipImages imageUrls={imageUrls} />}
          </div>
          <span
            className="text-gray-400 text-[13px] mt-2 block"
            title={formattedDate}
          >
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
