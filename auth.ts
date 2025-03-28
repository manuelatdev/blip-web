// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile", // Asegúrate de pedir los scopes necesarios
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Si hay un account (primera vez que se autentica), añadimos el id_token
      if (account) {
        console.log("Account data:", account);
        console.log("Token data:", token);
        token.id_token = account.id_token; // Guardamos el ID token en el token JWT de NextAuth
      }
      return token;
    },
    async session({ session, token }) {
      // Exponemos el id_token en la sesión para que el cliente lo use
      session.id_token = token.id_token as string;
      return session;
    },
    
  },
  events: {
    async signIn({ user, account }) {
      console.log(`Usuario ${user.email} inició sesión con ${account.provider}`);
    },
    async signOut({ token }) {
      console.log('Usuario cerró sesión');
    }
  }
});