import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import type { NextAuthConfig } from "next-auth";
import NextAuth, { CredentialsSignin } from "next-auth";
import Apple from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { type MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { isAppleOAuthEnabled } from "@/lib/auth/apple-oauth-enabled";
import { customPrismaAdapter } from "@/lib/auth/custom-prisma-adapter";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";
import { getAuthSecret } from "@/lib/auth/secret";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session-policy";
import { prisma } from "@/lib/prisma";

class WrongPortalCredentials extends CredentialsSignin {
  code = "WRONG_PORTAL";
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  portalRole: z.enum(["STUDENT", "TUTOR", "MENTOR"]).optional(),
});

const providers: NextAuthConfig["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      portalRole: { label: "Portal role", type: "text" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }
      const email = parsed.data.email.toLowerCase();
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user?.passwordHash || !user.isActive) {
        return null;
      }
      const isValid = await compare(parsed.data.password, user.passwordHash);
      if (!isValid) {
        return null;
      }
      const expected = parsed.data.portalRole;
      if (expected && user.role !== expected) {
        throw new WrongPortalCredentials();
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
  secret: getAuthSecret(),
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    /** Min seconds between session/JWT refreshes when the client hits `/api/auth/session`. */
    updateAge: 24 * 60 * 60,
  },
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/student/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      const provider = account?.provider;
      if (provider !== "google" && provider !== "apple") {
        return true;
      }
      const cookieStore = await cookies();
      const intent = cookieStore.get("oauth_intent")?.value;
      const expectedRole =
        intent === "mentor"
          ? UserRole.MENTOR
          : intent === "tutor"
            ? UserRole.TUTOR
            : intent === "student"
              ? UserRole.STUDENT
              : null;
      if (!expectedRole) {
        return true;
      }

      const rawEmail =
        typeof user?.email === "string"
          ? user.email
          : profile && typeof profile.email === "string"
            ? profile.email
            : null;
      if (!rawEmail) {
        return true;
      }
      const email = rawEmail.toLowerCase();
      const row = await prisma.user.findUnique({
        where: { email },
        select: { role: true, isActive: true },
      });
      if (!row) {
        return true;
      }
      if (!row.isActive) {
        return "/student/login?authError=account_disabled";
      }
      if (row.role !== expectedRole) {
        cookieStore.delete("oauth_intent");
        const loginPath =
          expectedRole === UserRole.MENTOR
            ? "/mentor/login"
            : expectedRole === UserRole.TUTOR
              ? "/tutor/login"
              : "/student/login";
        return `${loginPath}?authError=wrong_portal`;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        const row = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            role: true,
            mentorProfileStatus: true,
            isActive: true,
          },
        });
        if (row?.isActive) {
          token.sub = row.id;
          token.role = row.role;
          token.mentorProfileStatus = row.mentorProfileStatus;
        } else {
          token.sub = undefined;
        }
      } else if (token.sub) {
        const row = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: { role: true, mentorProfileStatus: true, isActive: true },
        });
        if (row?.isActive) {
          token.role = row.role;
          token.mentorProfileStatus = row.mentorProfileStatus;
        } else {
          token.sub = undefined;
        }
      }
      if (token.sub) {
        token.exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
      }
      return token;
    },
    session({ session, token }) {
      if (!token.sub) {
        return { expires: "1970-01-01T00:00:00.000Z" };
      }
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role =
          (token.role as UserRole | undefined) ?? UserRole.STUDENT;
        (
          session.user as unknown as {
            mentorProfileStatus?: MentorProfileStatus;
          }
        ).mentorProfileStatus = token.mentorProfileStatus as
          | MentorProfileStatus
          | undefined;
      }
      return session;
    },
  },
});
