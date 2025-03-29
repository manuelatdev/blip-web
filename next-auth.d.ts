import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    id_token?: string; // Añadimos id_token como propiedad opcional
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id_token?: string; // Añadimos id_token al tipo JWT también
  }
}
