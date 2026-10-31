import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { isStudentProfileComplete } from "@/lib/jobs/profile-complete";
import { roleHomePath } from "@/lib/rbac";
import { disableJobAlertsAction } from "../actions";

export default async function UnsubscribeJobAlertsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/student/login?callbackUrl=/student/jobs/unsubscribe");
  }
  if (session.user.role !== UserRole.STUDENT) {
    redirect(roleHomePath(session.user.role));
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      fullName: true,
      country: true,
      city: true,
      jobPreference: { select: { jobAlertsEnabled: true } },
    },
  });
  if (!user) redirect("/student/login");
  if (!isStudentProfileComplete(user)) {
    redirect("/student/jobs");
  }

  const enabled = user.jobPreference?.jobAlertsEnabled ?? true;

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Weekly job alerts
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {enabled
          ? "Stop the five-role digest. You can still browse the jobs board."
          : "You are already unsubscribed from weekly job emails."}
      </p>
      {enabled ? (
        <form action={disableJobAlertsAction} className="mt-8">
          <Button type="submit" variant="outline">
            Unsubscribe
          </Button>
        </form>
      ) : (
        <Button asChild className="mt-8" variant="outline">
          <Link href="/student/jobs">Back to jobs</Link>
        </Button>
      )}
    </div>
  );
}
