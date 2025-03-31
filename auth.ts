// auth.ts

import NextAuth, { Session } from "next-auth";
import Google from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { uploadImageToBucket } from "./utils/s3";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.id_token = account.id_token;
        token.provider = account.provider;

        // Obtener la URL de la imagen de perfil desde el perfil de Google
        let profilePictureUrl: string | undefined | null = profile?.picture;

        // Si hay una imagen de perfil y un userId (sub), subirla al bucket
        if (profilePictureUrl && profile?.sub) {
          try {
            profilePictureUrl = await uploadImageToBucket(
              profilePictureUrl,
              profile.sub
            );
            console.log(
              "Imagen de perfil subida al bucket:",
              profilePictureUrl
            );
          } catch (error) {
            console.error(
              "Error al subir la imagen de perfil al bucket:",
              error instanceof Error ? error.message : "Error desconocido"
            );
            profilePictureUrl = null;
          }
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_USERS_API_URL}/auth/google`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idToken: account.id_token,
              externalId: token.sub,
              profilePictureUrl, // Enviamos la nueva URL (o null si falló)
            }),
          }
        );

        if (response.ok) {
          const { user, token: jwt } = await response.json();
          token.userId = user.userId;
          token.email = user.email;
          token.displayName = user.displayName;
          token.profilePictureUrl = user.profilePictureUrl;
          token.accessToken = jwt;
          const decodedToken = JSON.parse(atob(jwt.split(".")[1]));
          token.role = decodedToken.role;
          console.log("JWT Callback - Token actualizado:", token);
        } else {
          console.error(
            "JWT Callback - Error en la respuesta:",
            response.status,
            await response.text()
          );
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.userId as string,
        email: token.email as string,
        name: token.displayName as string,
        image: token.profilePictureUrl as string,
        emailVerified: new Date(),
      };
      session.accessToken = token.accessToken as string;
      session.role = token.role;
      console.log("Session Callback - Sesión actualizada:", session);
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log("Evento: Usuario inició sesión", user);
    },
    async signOut() {
      console.log("Evento: Usuario cerró sesión");
    },
  },
  pages: {
    signIn: "/",
  },
});
