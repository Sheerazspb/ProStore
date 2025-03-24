import NextAuth from "next-auth";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {prisma} from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email:{type:"email"},
        password:{type:"password"}
      },
      authorize: async (credentials) => {
        if (!credentials) return null;
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string
          },
        });
       if (user && user.password) {
        const isMatch = compareSync(credentials.password as string, user.password);
        if (isMatch) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
       }
      // if user doesn't exist or password doesn't match
      return null;
      }
    })
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session ({session, user,trigger,token}:any) {
      // set user id from token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;
      // if user profile name updated
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    },
    // assign user field to token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({token,user,trigger}:any) {
      if (user) {
        token.role = user.role;
      }
    // if user has no name then use the email
    if (!token.name) {
      token.name = token.email.split("@")[0];
    }
    // Update database to reflect the token
    if (trigger === "update") {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name:token.name,
        },
      });
    }
    return token;
    }
  },
} satisfies NextAuthConfig;

export const { handlers, auth,signIn,signOut } = NextAuth(config);