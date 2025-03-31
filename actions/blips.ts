// actions/blips.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  deleteObjectFromBucket,
  deleteObjectsFromBucket,
  listObjectsInBucket,
  generatePresignedUrls,
} from "@/utils/s3";
import { BlipResponse, BlipsResult, DeleteBlipRequest } from "@/types/blip"; // Ajusta la ruta según tu estructura

const BLIPS_API_URL =
  process.env.NEXT_PUBLIC_BLIPS_API_URL || "http://localhost:8081";

const bucketName = "blips";

export async function createBlip(formData: FormData, accessToken?: string) {
  const contentValue = formData.get("content")?.toString() || "";
  const imageUrls: string[] = [];
  for (let i = 0; i < 4; i++) {
    const url = formData.get(`imageUrl${i}`);
    if (url) imageUrls.push(url.toString());
  }

  if (!contentValue.trim() && imageUrls.length === 0) {
    throw new Error("El contenido no puede ser nulo ni vacío");
  }

  const requestBody = {
    accessToken: accessToken || formData.get("accessToken")?.toString() || null,
    content: contentValue,
    imageUrl1: imageUrls[0] || null,
    imageUrl2: imageUrls[1] || null,
    imageUrl3: imageUrls[2] || null,
    imageUrl4: imageUrls[3] || null,
  };

  const response = await fetch(`${BLIPS_API_URL}/blips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Error al crear el Blip: ${response.status} - ${
        errorData.message || "Error desconocido"
      }`
    );
  }

  const result: BlipResponse = await response.json();
  revalidatePath("/");
  return result;
}

export async function getLatestBlips(): Promise<BlipsResult> {
  try {
    const res = await fetch(`${BLIPS_API_URL}/blips`, { cache: "no-store" });
    if (!res.ok) {
      return {
        blips: [],
        success: false,
        error: `Error ${res.status} al conectar con el servicio de blips`,
      };
    }
    const blips: BlipResponse[] = await res.json();
    return { blips, success: true };
  } catch (error) {
    return {
      blips: [],
      success: false,
      error: "El servicio de blips no está disponible",
    };
  }
}

export async function getBlipById(blipId: string): Promise<BlipResponse> {
  const res = await fetch(`${BLIPS_API_URL}/blips/${blipId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener el Blip");
  return res.json();
}

export async function deleteBlip(
  blipId: string,
  accessToken: string
): Promise<void> {
  const blip = await getBlipById(blipId);
  const imageUrls = [
    blip.content.imageUrl1,
    blip.content.imageUrl2,
    blip.content.imageUrl3,
    blip.content.imageUrl4,
  ].filter(
    (url): url is string => typeof url === "string" && url.trim() !== ""
  );

  if (imageUrls.length > 0) {
    await Promise.all(
      imageUrls.map(async (url) => {
        const key = url.split("/").slice(4).join("/");
        if (key) {
          try {
            await deleteObjectFromBucket(bucketName, key);
            console.log(`Imagen eliminada de MinIO: ${key}`);
          } catch (error) {
            console.error(
              `Error al eliminar la imagen ${key} de MinIO:`,
              error
            );
          }
        }
      })
    );
  }

  const request: DeleteBlipRequest = { accessToken };
  const res = await fetch(`${BLIPS_API_URL}/blips/${blipId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Error al eliminar el Blip: ${res.status} - ${errorData}`);
  }

  if (res.status === 204) revalidatePath("/");
}

export async function getBlipsBeforeTimestamp(
  limit: number = 10,
  cursor: string
): Promise<BlipsResult> {
  try {
    const res = await fetch(
      `${BLIPS_API_URL}/blips/before?limit=${limit}&cursor=${encodeURIComponent(
        cursor
      )}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.error("Failed to fetch blips:", res.status, await res.text());
      return {
        blips: [],
        success: false,
        error: `Error ${res.status} al conectar con el servicio de blips`,
      };
    }
    const blips: BlipResponse[] = await res.json();
    console.log("Fetched blips:", JSON.stringify(blips, null, 2));
    return { blips, success: true };
  } catch (error) {
    console.error("Error fetching blips:", error);
    return {
      blips: [],
      success: false,
      error: "El servicio de blips no está disponible",
    };
  }
}

export async function clearAllBlipsAndBucket() {
  const session = await auth();
  if (!session) {
    throw new Error("No hay sesión activa. Por favor, inicia sesión.");
  }

  const userRole = session.role || "USER";
  const isAdmin = userRole === "ADMIN";
  const isDevEnv = process.env.NODE_ENV === "development";

  if (!isAdmin || !isDevEnv) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }

  try {
    const response = await fetch(`${BLIPS_API_URL}/admin/blips/clear-all`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: session.accessToken }),
    });

    if (!response.ok) {
      throw new Error("Error al limpiar la base de datos de blips");
    }

    const objects = await listObjectsInBucket(bucketName);
    if (objects.length > 0) {
      await deleteObjectsFromBucket(
        bucketName,
        objects.map((obj) => obj.Key!)
      );
      console.log("Bucket limpiado exitosamente");
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error al limpiar todo:", error);
    throw new Error("No se pudo completar la limpieza.");
  }
}

export { generatePresignedUrls };
