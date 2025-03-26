'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function createBlip(formData: FormData) {
  const request = {
    userId: formData.get('userId') as string,
    content: formData.get('content') as string,
  };

  const res = await fetch(`${API_URL}/blips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorData = await res.text(); // Obtenemos el cuerpo del error
    throw new Error(`Error al crear el Blip: ${res.status} - ${errorData}`);
  }

  const blip = await res.json();
  revalidatePath('/');
  return blip;
}

export async function getLatestBlips() {
  const res = await fetch(`${API_URL}/blips`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Error al obtener los Blips');
  }
  return res.json();
}

export async function getBlipById(blipId: string) {
  const res = await fetch(`${API_URL}/blips/${blipId}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Error al obtener el Blip');
  }
  return res.json();
}