import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extiende la interfaz Session
declare module "next-auth" {
  interface Session {
    accessToken?: string; // El JWT propio generado por users
    role?: string; // El rol del usuario (ADMIN o USER)
    user: {
      id: string; // userId del microservicio
      email: string;
      name: string; // displayName
      image: string; // profilePictureUrl
      emailVerified?: Date; // Si estás usando verificación de email
    };
  }
}

// Extiende la interfaz JWT
declare module "next-auth/jwt" {
  interface JWT {
    id_token?: string; // El id_token de Google (opcional, solo durante la autenticación inicial)
    accessToken?: string; // El JWT propio de users
    userId?: string; // userId del microservicio
    email?: string;
    displayName?: string;
    profilePictureUrl?: string;
    role?: string; // El rol del usuario (ADMIN o USER)
    provider?: string; // Opcional, si sigues usándolo
  }
}
