import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { roleHomePath } from "@/lib/rbac";

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/mentor/login");
  if (session.user.role !== UserRole.MENTOR) redirect(roleHomePath(session.user.role));

  return <>{children}</>;
}

