import { PrismaAdapter } from "@auth/prisma-adapter";
import { cookies } from "next/headers";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { Prisma } from "@/generated/prisma/client";
import { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const OAUTH_INTENT = "oauth_intent";

function isCustomAvatarUrl(url: string | null | undefined): boolean {
  const s = url?.trim();
  if (!s) return false;
  return s.startsWith("r2://") || s.startsWith("/profiles/");
}

type DbUser = {
  id: string;
  email: string;
  fullName: string;
  emailVerified: Date | null;
  avatarUrl: string | null;
};

function toAdapterUser(u: DbUser): AdapterUser {
  return {
    id: u.id,
    name: u.fullName,
    email: u.email,
    emailVerified: u.emailVerified,
    image: u.avatarUrl,
  };
}

const base = PrismaAdapter(prisma as Parameters<typeof PrismaAdapter>[0]);

/**
 * Prisma `User` uses `fullName` / `avatarUrl`; Auth.js uses `name` / `image`.
 * Maps fields and sets `role` for new OAuth users from the `oauth_intent` cookie.
 */
export function customPrismaAdapter(): Adapter {
  return {
    ...base,
    async createUser(data: AdapterUser) {
      const { name, image, email, emailVerified } = data;
      if (!email) {
        throw new Error("User email is required to create an account");
      }
      const cookieStore = await cookies();
      const intent = cookieStore.get(OAUTH_INTENT)?.value;
      const role =
        intent === "tutor"
          ? UserRole.TUTOR
          : intent === "mentor"
            ? UserRole.MENTOR
            : UserRole.STUDENT;
      const isActive = role === UserRole.MENTOR ? false : true;
      const localPart = email.includes("@")
        ? (email.split("@")[0] ?? "")
        : email;
      const fullName = name?.trim() || localPart || "User";
      const created = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          emailVerified,
          fullName,
          role,
          isActive,
          passwordHash: null,
          avatarUrl: image ?? null,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          emailVerified: true,
          avatarUrl: true,
        },
      });
      cookieStore.delete(OAUTH_INTENT);
      return toAdapterUser(created);
    },
    async getUser(id: string) {
      const u = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          fullName: true,
          emailVerified: true,
          avatarUrl: true,
        },
      });
      return u ? toAdapterUser(u) : null;
    },
    async getUserByEmail(email) {
      if (!email) {
        return null;
      }
      const u = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          fullName: true,
          emailVerified: true,
          avatarUrl: true,
        },
      });
      return u ? toAdapterUser(u) : null;
    },
    async getUserByAccount(provider_providerAccountId) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId },
        include: { user: true },
      });
      if (!account?.user) {
        return null;
      }
      const u = account.user;
      return toAdapterUser({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        emailVerified: u.emailVerified,
        avatarUrl: u.avatarUrl,
      });
    },
    async updateUser(partial) {
      const { id, name, image, email, emailVerified } = partial;
      if (!id) {
        throw new Error("User id is required to update an account");
      }
      const data: Prisma.UserUpdateInput = {};
      if (name !== undefined) {
        data.fullName = name?.trim() || "User";
      }
      if (image !== undefined) {
        const existing = await prisma.user.findUnique({
          where: { id },
          select: { avatarUrl: true },
        });
        if (!isCustomAvatarUrl(existing?.avatarUrl)) {
          data.avatarUrl = image;
        }
      }
      if (email !== undefined) {
        data.email = email.toLowerCase();
      }
      if (emailVerified !== undefined) {
        data.emailVerified = emailVerified;
      }
      const u = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          fullName: true,
          emailVerified: true,
          avatarUrl: true,
        },
      });
      return toAdapterUser(u);
    },
    async deleteUser(id) {
      const u = await prisma.user.delete({
        where: { id },
        select: {
          id: true,
          email: true,
          fullName: true,
          emailVerified: true,
          avatarUrl: true,
        },
      });
      return toAdapterUser(u);
    },
    async getSessionAndUser(sessionToken) {
      const row = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!row) {
        return null;
      }
      const { user, ...session } = row;
      return {
        user: toAdapterUser({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          emailVerified: user.emailVerified,
          avatarUrl: user.avatarUrl,
        }),
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
      };
    },
  };
}
