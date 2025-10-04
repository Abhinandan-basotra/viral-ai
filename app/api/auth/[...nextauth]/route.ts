// app/api/auth/[...nextauth]/route.ts
import NextAuth, { DefaultSession, DefaultUser, NextAuthOptions, type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/app/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials: { username?: string; password?: string; email?: string } | undefined) {
        if (!credentials?.password || !credentials?.email) return null;
        const user = await prisma.user.findFirst({
          where: { email: credentials.email }
        });

        if (!user) return null;
        if (user.password !== credentials.password) return null;

        return {
          id: user.id.toString(),
          name: user.username,
          email: user.email
        };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: { id: string } | null }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    }

  },
};

export const handler = NextAuth(authOptions)

export { handler as GET, handler as POST };
