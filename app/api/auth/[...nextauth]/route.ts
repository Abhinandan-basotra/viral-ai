// app/api/auth/[...nextauth]/route.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { authOptions } from "./authOptions";


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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST };
