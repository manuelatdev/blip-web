// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authConfig } from "@/app/auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);

export { handlers as GET, handlers as POST };