// app/api/auth/[...nextauth]/route.ts
import NextAuth, { Account, DefaultSession, DefaultUser, NextAuthOptions, Profile, type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/app/lib/db";
import bcrypt from "bcrypt";

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
        const decryptedPassword = bcrypt.compareSync(credentials.password, user.password)
        if (!decryptedPassword) return null;

        return {
          id: user.id.toString(),
          name: user.username,
          email: user.email
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
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
    },
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        if (!profile?.email) return false;

        if (!profile.email.endsWith("@gmail.com")) {
          return false;
        }

        await prisma.user.upsert({
          where: { email: profile.email },
          update: {},
          create: {
            email: profile.email,
            username: profile.name ?? profile.email.split("@")[0],
            password: "", 
          }
        });
      }
      return true;
    }
  },
  pages:{
    signIn: '/login',
  }
};

export const handler = NextAuth(authOptions)

export { handler as GET, handler as POST };
