"use client";

import { useState } from "react";
import { createBlip, BlipResponse } from "@/app/actions/blips"; // Ajusta la ruta según tu estructura
import { toast } from "sonner";
import { useBlipsStore } from "@/store/BlipStore"; // Ajusta la ruta

export default function CreateTestBlipsButton() {
  const [isPending, setIsPending] = useState(false);
  const { addNewBlip } = useBlipsStore(); // Usamos addNewBlip para añadir Blips al almacén

  const adminAccessToken = process.env.NEXT_PUBLIC_ADMIN_ACCESS_TOKEN;
  const userAccessToken = process.env.NEXT_PUBLIC_USER_ACCESS_TOKEN;
  const testImage = "https://i.imgur.com/qSwIEs5.jpeg";
  const invalidImage = "https://example.com/nonexistent-image.jpg"; // URL inválida para pruebas

  const handleCreateTestBlips = async () => {
    setIsPending(true);
    const errors: { testCase: any; error: string }[] = []; // Array para almacenar los errores

    try {
      const testCases = [
        // Blip anónimo, solo texto
        {
          content: "Blip anónimo solo texto",
          imageUrls: [],
          accessToken: undefined,
        },
        // Blip con usuario normal, solo texto
        {
          content: "Blip usuario normal solo texto",
          imageUrls: [],
          accessToken: userAccessToken,
        },
        // Blip con admin, solo texto
        {
          content: "Blip admin solo texto",
          imageUrls: [],
          accessToken: adminAccessToken,
        },
        // Blip anónimo con 1 imagen
        {
          content: "Blip anónimo con 1 imagen",
          imageUrls: [testImage],
          accessToken: undefined,
        },
        // Blip usuario normal con 2 imágenes
        {
          content: "Blip usuario normal con 2 imágenes",
          imageUrls: [testImage, testImage],
          accessToken: userAccessToken,
        },
        // Blip admin con 3 imágenes
        {
          content: "Blip admin con 3 imágenes",
          imageUrls: [testImage, testImage, testImage],
          accessToken: adminAccessToken,
        },
        // Blip admin con 4 imágenes
        {
          content: "Blip admin con 4 imágenes",
          imageUrls: [testImage, testImage, testImage, testImage],
          accessToken: adminAccessToken,
        },
        // Blip usuario normal solo imágenes (sin texto)
        {
          content: "",
          imageUrls: [testImage],
          accessToken: userAccessToken,
        },
        // Blip anónimo sin nada (debería fallar)
        {
          content: "",
          imageUrls: [],
          accessToken: undefined,
        },
        // NUEVO: Blip con contenido que excede el límite de caracteres (debería fallar)
        {
          content: "A".repeat(281), // 281 caracteres, excede el límite de 280
          imageUrls: [],
          accessToken: userAccessToken,
        },
        // NUEVO: Blip con más de 4 imágenes (debería fallar)
        {
          content: "Blip con más de 4 imágenes",
          imageUrls: [testImage, testImage, testImage, testImage, testImage], // 5 imágenes
          accessToken: adminAccessToken,
        },
        // NUEVO: Blip con accessToken inválido (debería fallar)
        {
          content: "Blip con token inválido",
          imageUrls: [],
          accessToken: "invalid-token-123", // Token falso
        },
        // NUEVO: Blip con URL de imagen inválida
        {
          content: "Blip con imagen inválida",
          imageUrls: [invalidImage],
          accessToken: userAccessToken,
        },
        // NUEVO: Blip con caracteres especiales y emojis
        {
          content: "Blip con emojis 😊🚀 y caracteres especiales <>&",
          imageUrls: [],
          accessToken: adminAccessToken,
        },
        // NUEVO: Blip con texto muy corto (1 carácter)
        {
          content: "a",
          imageUrls: [],
          accessToken: userAccessToken,
        },
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
          addNewBlip(newBlip); // Añadimos el Blip al almacén
          toast.success(`Blip creado: ${testCase.content || "Sin texto"}`, {
            description: `Token: ${testCase.accessToken || "Anónimo"}`,
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
