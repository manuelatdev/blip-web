"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { deleteBlip } from "../actions/blips";
import { X } from "lucide-react";
import { BlipImages } from "./BlipImages";

interface BlipProps {
  blipId: string;
  content: string;
  imageUrl1: string | null | undefined; // Permitir undefined
  imageUrl2: string | null | undefined;
  imageUrl3: string | null | undefined;
  imageUrl4: string | null | undefined;
  userId: string | null;
  displayName: string;
  profilePictureUrl: string;
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
  content,
  imageUrl1,
  imageUrl2,
  imageUrl3,
  imageUrl4,
  userId,
  displayName,
  profilePictureUrl,
  timestamp,
  accessToken,
}: BlipProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const { data: session, status } = useSession();

  const date = new Date(timestamp);
  const formattedDate = date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const displayNameFormatted = userId ? `${displayName}` : "Blipper";
  const avatarUrl = profilePictureUrl || "/default-avatar.jpg";
  const relativeTime = getRelativeTime(timestamp);

  // Verificar si el contenido excede las 3 líneas
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
  }, [content]);

  const isOwnBlip =
    session?.user?.id && userId && session.user.id === userId && accessToken;
  const isAdmin = session?.role === "ADMIN"; // Comparación estricta
  const canDelete = isOwnBlip || isAdmin;

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

  // Filtrar URLs no nulas, no undefined y no vacías
  const imageUrls = [imageUrl1, imageUrl2, imageUrl3, imageUrl4].filter(
    (url): url is string => typeof url === "string" && url.trim() !== ""
  );

  if (isDeleted) {
    return null;
  }

  return (
    <div
      className={`p-4 border-b border-gray-200 transition group relative rounded-xs ${
        isOwnBlip ? "bg-gray-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
          <AvatarImage src={avatarUrl} alt={`Avatar de ${displayName}`} />
          <AvatarFallback>{displayName[0]}</AvatarFallback>
        </Avatar>
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
              {content}
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
            {/* Mostrar el componente de imágenes solo si hay URLs válidas */}
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
