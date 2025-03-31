// utils/s3.ts

import { v4 as uuidv4 } from "uuid";
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuración del cliente S3 (solo para uso en el servidor)
const bucketName = "blips";

const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true,
});

/**
 * Asegura que el bucket exista, creándolo si no existe.
 * Solo para uso en el servidor.
 */
async function ensureBucketExists() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch (err) {
    if (err instanceof Error && err.name === "NotFound") {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket ${bucketName} creado con éxito`);
    } else {
      throw err;
    }
  }
}

/**
 * Descarga una imagen desde una URL remota y la sube al bucket de MinIO/S3.
 * Solo para uso en el servidor.
 * @param imageUrl - URL de la imagen remota.
 * @param userId - ID del usuario, usado como prefijo en la clave del bucket.
 * @returns La URL pública de la imagen en el bucket.
 */
export async function uploadImageToBucket(
  imageUrl: string,
  userId: string
): Promise<string> {
  await ensureBucketExists();

  // Descargar la imagen desde la URL
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(
      `Error al descargar la imagen: ${response.status} ${response.statusText}`
    );
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const extension = contentType.split("/")[1] || "jpg";

  // Generar un nombre único para la imagen
  const uniqueName = `${uuidv4()}.${extension}`;
  const key = `${userId}/${uniqueName}`;

  // Subir la imagen al bucket
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Generar la URL pública
  const publicUrl = `${
    process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000"
  }/${bucketName}/${key}`;

  return publicUrl;
}

/**
 * Genera URLs pre-firmadas para subir imágenes al bucket.
 * Solo para uso en el servidor.
 * @param fileNames - Lista de nombres de archivo.
 * @param userId - ID del usuario, usado como prefijo en la clave del bucket.
 * @returns Lista de objetos con la URL pre-firmada, la clave y la URL pública.
 */
export async function generatePresignedUrls(
  fileNames: string[],
  userId: string
): Promise<{ presignedUrl: string; key: string; publicUrl: string }[]> {
  await ensureBucketExists();

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
  const results: { presignedUrl: string; key: string; publicUrl: string }[] =
    [];

  for (const fileName of fileNames) {
    const extension = (fileName.split(".").pop() || "jpg").toLowerCase();
    if (!allowedExtensions.includes(`.${extension}`)) {
      throw new Error(
        `Tipo de archivo no permitido: ${fileName}. Solo se permiten imágenes (${allowedExtensions.join(
          ", "
        )})`
      );
    }

    const uniqueName = `${uuidv4()}.${extension}`;
    const key = `${userId}/${uniqueName}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutos de expiración
    });
    const publicUrl = `${
      process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000"
    }/${bucketName}/${key}`;
    results.push({ presignedUrl, key, publicUrl });
  }
  return results;
}

/**
 * Sube un archivo al bucket usando una URL pre-firmada.
 * Para uso en el cliente.
 * @param presignedUrl - URL pre-firmada para la subida.
 * @param file - Archivo a subir.
 */
export async function uploadFileWithPresignedUrl(
  presignedUrl: string,
  file: File
): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error al subir el archivo: ${response.status} ${response.statusText}`
    );
  }
}

/**
 * Elimina un objeto del bucket.
 * Solo para uso en el servidor.
 * @param bucketName - Nombre del bucket.
 * @param key - Clave del objeto a eliminar.
 */
export async function deleteObjectFromBucket(
  bucketName: string,
  key: string
): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  await s3Client.send(command);
}

/**
 * Lista los objetos en el bucket.
 * Solo para uso en el servidor.
 * @param bucketName - Nombre del bucket.
 * @returns Lista de objetos en el bucket.
 */
export async function listObjectsInBucket(
  bucketName: string
): Promise<{ Key?: string }[]> {
  const command = new ListObjectsV2Command({ Bucket: bucketName });
  const { Contents } = await s3Client.send(command);
  return Contents || [];
}

/**
 * Elimina múltiples objetos del bucket.
 * Solo para uso en el servidor.
 * @param bucketName - Nombre del bucket.
 * @param keys - Lista de claves de los objetos a eliminar.
 */
export async function deleteObjectsFromBucket(
  bucketName: string,
  keys: string[]
): Promise<void> {
  const objectsToDelete = keys.map((key) => ({ Key: key }));
  const command = new DeleteObjectsCommand({
    Bucket: bucketName,
    Delete: { Objects: objectsToDelete },
  });
  await s3Client.send(command);
}
