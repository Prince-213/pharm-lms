import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import type { NextAuthConfig } from "next-auth";
import NextAuth, { CredentialsSignin } from "next-auth";
import Apple from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { type MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { ensureMentorCanSignIn } from "@/lib/auth/mentor-login-access";
import { isAppleOAuthEnabled } from "@/lib/auth/apple-oauth-enabled";
import { customPrismaAdapter } from "@/lib/auth/custom-prisma-adapter";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";
import { getAuthSecret } from "@/lib/auth/secret";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session-policy";
import { prisma } from "@/lib/prisma";

/**
 * Logs an auth-time DB failure without tearing down `/api/auth/session`.
 * When Neon is asleep / unreachable we'd rather keep existing sessions
 * alive on cached JWT claims than 500 every authenticated request.
 */
function warnAuthDbFailure(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[auth] ${scope} failed; preserving existing token:`, message);
}

class WrongPortalCredentials extends CredentialsSignin {
  code = "WRONG_PORTAL";
}

class AccountDisabledCredentials extends CredentialsSignin {
  code = "ACCOUNT_DISABLED";
}

class OauthOnlyAccountCredentials extends CredentialsSignin {
  code = "OAUTH_ONLY_ACCOUNT";
}

function loginPathForAccountDisabled(
  intent: string | undefined,
  role: UserRole,
): string {
  if (intent === "mentor" || role === UserRole.MENTOR) {
    return "/mentor/login?authError=account_disabled";
  }
  if (intent === "tutor" || role === UserRole.TUTOR) {
    return "/tutor/login?authError=account_disabled";
  }
  return "/student/login?authError=account_disabled";
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  portalRole: z.enum(["STUDENT", "TUTOR", "MENTOR", "ADMIN"]).optional(),
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
        include: {
          accounts: { select: { provider: true } },
        },
      });
      if (!user) {
        return null;
      }
      if (!user.passwordHash) {
        const oauthProviders = user.accounts
          .map((a) => a.provider)
          .filter((p) => p === "google" || p === "apple");
        if (oauthProviders.length > 0) {
          throw new OauthOnlyAccountCredentials();
        }
        return null;
      }
      const loginAccess = await ensureMentorCanSignIn({
        id: user.id,
        role: user.role,
        isActive: user.isActive,
        mentorProfileStatus: user.mentorProfileStatus,
      });
      if (!loginAccess.isActive) {
        throw new AccountDisabledCredentials();
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
      let row: {
        role: UserRole;
        isActive: boolean;
        mentorProfileStatus: MentorProfileStatus;
        id: string;
      } | null = null;
      try {
        row = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            role: true,
            isActive: true,
            mentorProfileStatus: true,
          },
        });
      } catch (error) {
        warnAuthDbFailure("signIn lookup", error);
        // Permit through; the JWT step will reconcile on the next request
        // when the database is reachable again.
        return true;
      }
      if (!row) {
        return true;
      }
      const loginAccess = await ensureMentorCanSignIn(row);
      if (!loginAccess.isActive) {
        cookieStore.delete("oauth_intent");
        return loginPathForAccountDisabled(intent, row.role);
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
        try {
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
          } else if (row && row.role === UserRole.MENTOR) {
            const loginAccess = await ensureMentorCanSignIn(row);
            if (loginAccess.isActive) {
              token.sub = row.id;
              token.role = row.role;
              token.mentorProfileStatus = row.mentorProfileStatus;
            } else {
              token.sub = undefined;
              (token as { role?: UserRole }).role = undefined;
              (token as { mentorProfileStatus?: MentorProfileStatus }).mentorProfileStatus =
                undefined;
            }
          } else {
            token.sub = undefined;
            (token as { role?: UserRole }).role = undefined;
            (token as { mentorProfileStatus?: MentorProfileStatus }).mentorProfileStatus =
              undefined;
          }
        } catch (error) {
          warnAuthDbFailure("jwt fresh-login lookup", error);
          // Credentials provider already verified the user; trust the
          // object it just returned so the user isn't locked out by a
          // transient DB outage at sign-in time.
          token.sub = user.id;
          const userWithRole = user as { role?: UserRole };
          if (userWithRole.role) token.role = userWithRole.role;
        }
      } else if (token.sub) {
        try {
          const row = await prisma.user.findUnique({
            where: { id: token.sub as string },
            select: {
              id: true,
              role: true,
              mentorProfileStatus: true,
              isActive: true,
            },
          });
          if (row?.isActive) {
            token.role = row.role;
            token.mentorProfileStatus = row.mentorProfileStatus;
          } else if (row && row.role === UserRole.MENTOR) {
            const loginAccess = await ensureMentorCanSignIn(row);
            if (loginAccess.isActive) {
              token.role = row.role;
              token.mentorProfileStatus = row.mentorProfileStatus;
            } else {
              token.sub = undefined;
              (token as { role?: UserRole }).role = undefined;
              (token as { mentorProfileStatus?: MentorProfileStatus }).mentorProfileStatus =
                undefined;
            }
          } else {
            token.sub = undefined;
            (token as { role?: UserRole }).role = undefined;
            (token as { mentorProfileStatus?: MentorProfileStatus }).mentorProfileStatus =
              undefined;
          }
        } catch (error) {
          warnAuthDbFailure("jwt session-refresh lookup", error);
          // Keep the existing role/mentorProfileStatus claims on the token
          // so the session stays valid while the DB recovers. The next
          // refresh after recovery will re-sync.
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
