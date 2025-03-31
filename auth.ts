// auth.ts
import NextAuth, { Session } from "next-auth";
import Google from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

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
    strategy: "jwt", // Aseguramos que usamos JWT para la sesión
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.id_token = account.id_token;
        token.provider = account.provider;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_USERS_API_URL}/auth/google`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idToken: account.id_token,
              externalId: token.sub,
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
            response.status
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
    signIn: "/", // Redirige a la página principal para iniciar sesión
  },
});
