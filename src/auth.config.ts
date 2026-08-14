import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { extractUserFromJwt } from "@/lib/auth";

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        token: { label: "Token", type: "string" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.token) {
          return null;
        }
        try {
          const user = extractUserFromJwt(credentials.token as string);
          return {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol,
            especialistaId: user.especialistaId,
            accessToken: credentials.token as string,
            exp: user.exp,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.userId = user.id;
        token.nombre = user.nombre;
        token.rol = user.rol;
        token.especialistaId = user.especialistaId;
        token.customExp = user.exp;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.customExp = token.customExp as number;
        session.user.id = token.userId as string;
        session.user.nombre = token.nombre as string;
        session.user.rol = token.rol as string;
        session.user.especialistaId = token.especialistaId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/panel/acceso",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers } = NextAuth(authConfig);
