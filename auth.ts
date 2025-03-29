import NextAuth, { Session } from "next-auth";
import Google from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { AdapterSession } from "next-auth/adapters";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: any | null }) {
      console.log("-------------------------- JWT Callback");
      if (account) {
        console.log("-------------------------- JWT Callback - Account");
        console.log("Account data:", account);
        console.log("Token data:", token);
        token.id_token = account.id_token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log("-------------------------- Session Callback");
      session.id_token = token.id_token as string;
      return session;
    },
  },
  events: {
    async signIn({ user, account }: { user: any; account: any | null }) {
      if (account) {
        console.log(
          `Usuario ${user.email} inició sesión con ${account.provider}`
        );
      } else {
        console.log(
          `Usuario ${user.email} inició sesión, pero no hay datos de cuenta`
        );
      }
    },
    async signOut(message: {
      session?: void | AdapterSession | null | undefined;
      token?: JWT | null;
    }) {
      console.log("Usuario cerró sesión");
    },
  },
});
