import { compare } from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Apple from "next-auth/providers/apple";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { customPrismaAdapter } from "@/lib/auth/custom-prisma-adapter";
import { isAppleOAuthEnabled } from "@/lib/auth/apple-oauth-enabled";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const providers: NextAuthConfig["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }
      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
      });
      if (!user?.passwordHash) {
        return null;
      }
      const isValid = await compare(parsed.data.password, user.passwordHash);
      if (!isValid) {
        return null;
      }
      return {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
      };
    },
  }),
];

if (isGoogleOAuthEnabled()) {
  const clientId = process.env.AUTH_GOOGLE_ID?.trim();
  const clientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();
  if (clientId && clientSecret) {
    providers.push(
      Google({
        clientId,
        clientSecret,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }
}

if (isAppleOAuthEnabled()) {
  const clientId = process.env.AUTH_APPLE_ID?.trim();
  const clientSecret = process.env.AUTH_APPLE_SECRET?.trim();
  if (clientId && clientSecret) {
    providers.push(
      Apple({
        clientId,
        clientSecret,
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: customPrismaAdapter(),
  session: { strategy: "jwt" },
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/student/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const row = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true, mentorProfileStatus: true },
        });
        if (row) {
          token.sub = row.id;
          token.role = row.role;
          token.mentorProfileStatus = row.mentorProfileStatus;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role =
          (token.role as UserRole | undefined) ?? UserRole.STUDENT;
        (session.user as unknown as { mentorProfileStatus?: MentorProfileStatus }).mentorProfileStatus =
          token.mentorProfileStatus as MentorProfileStatus | undefined;
      }
      return session;
    },
  },
});
