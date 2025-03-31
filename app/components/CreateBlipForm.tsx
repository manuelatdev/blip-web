// components/CreateBlipForm.tsx

"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  createBlip,
  BlipResponse,
  generatePresignedUrls, // Importamos directamente como Server Action
} from "../actions/blips";
import { toast } from "sonner";
import { FiImage } from "react-icons/fi";
import { ImagePreview } from "./blip/ImagePreview";
import { uploadFileWithPresignedUrl } from "@/utils/s3";

interface CreateBlipFormProps {
  onBlipCreated?: (blip: BlipResponse) => void;
}

export default function CreateBlipForm({ onBlipCreated }: CreateBlipFormProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isPending, startTransition] = useTransition();
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const { data: session } = useSession();
  const maxLength = 280;
  const maxImages = 4;
  const maxFileSize = 5 * 1024 * 1024; // 5 MB en bytes
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  const resetFileInput = () => {
    setFiles(null);
    setFileInputKey(Date.now());
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value.slice(0, maxLength);
    setContent(newContent);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = (
      content.slice(0, start) +
      pastedText +
      content.slice(end)
    ).slice(0, maxLength);
    setContent(newContent);
    e.preventDefault();

    requestAnimationFrame(() => {
      const newCursorPos = start + pastedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const imageFiles = Array.from(selectedFiles).filter((file) =>
        file.type.startsWith("image/")
      );

      const oversizedFiles = imageFiles.filter(
        (file) => file.size > maxFileSize
      );
      if (oversizedFiles.length > 0) {
        toast.error("Archivo demasiado grande", {
          description: `Los archivos no pueden superar los ${
            maxFileSize / (1024 * 1024)
          } MB. Archivos excedidos: ${oversizedFiles
            .map((file) => file.name)
            .join(", ")}`,
          duration: 3000,
        });
        event.target.value = "";
        return;
      }

      const existingFiles = files ? Array.from(files) : [];
      const combinedFiles = [...existingFiles, ...imageFiles];

      if (combinedFiles.length > maxImages) {
        toast.error("Máximo 4 imágenes permitidas", {
          description: "No puedes añadir más de 4 imágenes en total.",
          duration: 3000,
        });
        event.target.value = "";
      } else if (imageFiles.length > 0) {
        const dataTransfer = new DataTransfer();
        combinedFiles.forEach((file) => dataTransfer.items.add(file));
        setFiles(dataTransfer.files);
      } else {
        toast.warning("Solo se permiten imágenes", {
          description: "Selecciona archivos de tipo imagen (jpg, png, etc.).",
          duration: 3000,
        });
        event.target.value = "";
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (files) {
      const newFiles = Array.from(files).filter(
        (_, index) => index !== indexToRemove
      );
      const dataTransfer = new DataTransfer();
      newFiles.forEach((file) => dataTransfer.items.add(file));
      setFiles(dataTransfer.files.length > 0 ? dataTransfer.files : null);
      resetFileInput();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const contentToSend = content.trim();
        const hasContent = contentToSend.length > 0;
        const hasImages = files && files.length > 0;

        if (!hasContent && !hasImages) {
          toast.error("Contenido requerido", {
            description: "Añade texto o imágenes antes de enviar el Blip.",
            duration: 3000,
          });
          return;
        }

        let imageUrls: string[] = [];
        if (hasImages) {
          const fileNames = Array.from(files!).map((file) => file.name);
          const userId = session?.user?.id || "anon";

          // Usamos la Server Action directamente
          const presignedData = await generatePresignedUrls(fileNames, userId);

          await Promise.all(
            Array.from(files!).map(async (file, index) => {
              const { presignedUrl, publicUrl } = presignedData[index];
              await uploadFileWithPresignedUrl(presignedUrl, file);
              imageUrls.push(publicUrl);
            })
          );
        }

        const formData = new FormData();
        if (hasContent) formData.set("content", contentToSend);
        if (imageUrls.length > 0) {
          imageUrls.forEach((url, index) =>
            formData.append(`imageUrl${index}`, url)
          );
        }
        if (session?.accessToken)
          formData.set("accessToken", session.accessToken);

        const newBlip = await createBlip(formData, session?.accessToken);

        setContent("");
        resetFileInput();
        toast.success("Blip creado", {
          description: "Tu Blip se ha enviado correctamente.",
          duration: 3000,
        });

        if (onBlipCreated) {
          onBlipCreated(newBlip);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al crear el Blip";
        toast.error("Error", {
          description: errorMessage,
          duration: 3000,
        });
        resetFileInput();
      }
    });
  };

  const remainingChars = maxLength - content.length;
  const showCircle = content.length > 0;
  const circleProgress = (content.length / maxLength) * 100;
  const isNearLimit = remainingChars <= 20;
  const isFormValid = content.trim().length > 0 || (files && files.length > 0);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white py-4 px-4 border-b border-gray-200 rounded-sm"
    >
      {session?.accessToken && (
        <input type="hidden" name="accessToken" value={session.accessToken} />
      )}

      <textarea
        ref={textareaRef}
        name="content"
        value={content}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="¿Qué estás pensando?"
        maxLength={maxLength}
        className="w-full resize-none border-none focus:outline-none text-gray-900 text-[14px] sm:text-[15px] leading-5 placeholder-gray-500 overflow-hidden min-h-[40px] max-h-[120px]"
        disabled={isPending}
      />

      <ImagePreview files={files} onRemove={handleRemoveImage} />

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {showCircle && (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 20 20">
              <circle
                cx="10"
                cy="10"
                r="9"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              <circle
                cx="10"
                cy="10"
                r="9"
                fill="none"
                stroke={isNearLimit ? "#ef4444" : "#1d9bf0"}
                strokeWidth="2"
                strokeDasharray="56.5487"
                strokeDashoffset={56.5487 * (1 - circleProgress / 100)}
                transform="rotate(-90 10 10)"
              />
            </svg>
          )}
          {isNearLimit && (
            <span
              className={`text-[13px] ${
                remainingChars < 0 ? "text-red-500" : "text-gray-500"
              }`}
            >
              {remainingChars}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFileButtonClick}
            className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors focus:outline-none"
            aria-label="Añadir imágenes"
            title="Añadir imágenes"
            disabled={isPending}
          >
            <FiImage size={16} />
          </button>
          <input
            key={fileInputKey}
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
            multiple
            disabled={isPending}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1 rounded-full font-medium text-xs sm:text-sm disabled:opacity-50"
            disabled={isPending || !isFormValid}
          >
            {isPending ? "Creando..." : "Blip"}
          </button>
        </div>
      </div>
    </form>
  );
}
