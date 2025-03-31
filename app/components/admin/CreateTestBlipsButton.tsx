"use client";

import { useState } from "react";
import { createBlip } from "@/actions/blips"; // Acción desde @/actions/blips.ts
import { BlipResponse } from "@/types/blip"; // Tipo desde @/types/blip.ts
import { toast } from "sonner";
import { useBlipsStore } from "@/store/BlipStore";

export default function CreateTestBlipsButton() {
  const [isPending, setIsPending] = useState(false);
  const { addNewBlip } = useBlipsStore();

  const adminAccessToken = process.env.NEXT_PUBLIC_ADMIN_ACCESS_TOKEN;
  const userAccessToken = process.env.NEXT_PUBLIC_USER_ACCESS_TOKEN;
  const testImage = "https://i.imgur.com/qSwIEs5.jpeg";
  const invalidImage = "https://example.com/nonexistent-image.jpg";

  const handleCreateTestBlips = async () => {
    setIsPending(true);
    const errors: { testCase: any; error: string }[] = [];

    try {
      const testCases = [
        {
          content: "Blip anónimo solo texto",
          imageUrls: [],
          accessToken: undefined,
        },
        {
          content: "Blip usuario normal solo texto",
          imageUrls: [],
          accessToken: userAccessToken,
        },
        {
          content: "Blip admin solo texto",
          imageUrls: [],
          accessToken: adminAccessToken,
        },
        {
          content: "Blip anónimo con 1 imagen",
          imageUrls: [testImage],
          accessToken: undefined,
        },
        {
          content: "Blip usuario normal con 2 imágenes",
          imageUrls: [testImage, testImage],
          accessToken: userAccessToken,
        },
        {
          content: "Blip admin con 3 imágenes",
          imageUrls: [testImage, testImage, testImage],
          accessToken: adminAccessToken,
        },
        {
          content: "Blip admin con 4 imágenes",
          imageUrls: [testImage, testImage, testImage, testImage],
          accessToken: adminAccessToken,
        },
        { content: "", imageUrls: [testImage], accessToken: userAccessToken },
        { content: "", imageUrls: [], accessToken: undefined },
        {
          content: "A".repeat(281),
          imageUrls: [],
          accessToken: userAccessToken,
        },
        {
          content: "Blip con más de 4 imágenes",
          imageUrls: [testImage, testImage, testImage, testImage, testImage],
          accessToken: adminAccessToken,
        },
        {
          content: "Blip con token inválido",
          imageUrls: [],
          accessToken: "invalid-token-123",
        },
        {
          content: "Blip con imagen inválida",
          imageUrls: [invalidImage],
          accessToken: userAccessToken,
        },
        {
          content: "Blip con emojis 😊🚀 y caracteres especiales <>&",
          imageUrls: [],
          accessToken: adminAccessToken,
        },
        { content: "a", imageUrls: [], accessToken: userAccessToken },
      ];

      for (const testCase of testCases) {
        const formData = new FormData();
        if (testCase.content) formData.set("content", testCase.content);
        testCase.imageUrls.forEach((url, index) =>
          formData.set(`imageUrl${index}`, url)
        );
        if (testCase.accessToken)
          formData.set("accessToken", testCase.accessToken);

        try {
          const newBlip: BlipResponse = await createBlip(
            formData,
            testCase.accessToken
          );
          addNewBlip(newBlip);
          toast.success(`Blip creado: ${testCase.content || "Sin texto"}`, {
            description: `Token: ${testCase.accessToken || "Anónimo"}, Admin: ${
              newBlip.userInfo.isAdmin
            }`,
            duration: 2000,
          });
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Error desconocido";
          errors.push({ testCase, error: errorMessage });
          console.error(
            "Error al crear Blip de prueba:",
            {
              content: testCase.content,
              imageUrls: testCase.imageUrls,
              accessToken: testCase.accessToken || "Anónimo",
            },
            "Error:",
            errorMessage
          );
          toast.error("Error al crear un Blip de prueba", {
            description: errorMessage,
            duration: 2000,
          });
        }
      }

      if (errors.length > 0) {
        toast.error("Resumen de errores en la creación de Blips", {
          description: `${errors.length} caso(s) fallaron. Revisa la consola para más detalles.`,
          duration: 5000,
        });
      } else {
        toast.success("Creación de Blips completada", {
          description: "Todos los Blips de prueba se crearon con éxito.",
          duration: 3000,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      console.error("Error general al crear Blips de prueba:", errorMessage);
      toast.error("Error general al crear Blips de prueba", {
        description: errorMessage,
        duration: 3000,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleCreateTestBlips}
      disabled={isPending || !adminAccessToken || !userAccessToken}
      className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full hover:bg-green-200 disabled:opacity-50"
    >
      {isPending ? "Creando Blips..." : "Crear Blips de Prueba"}
    </button>
  );
}
