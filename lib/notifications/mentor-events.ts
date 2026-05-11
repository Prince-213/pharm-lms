import { db } from "@/lib/db";
import { sendEmail } from "@/lib/notifications/email-service";
import { UserRole } from "@/generated/prisma/enums";

function appBaseUrl() {
  return (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
}

export async function notifyAdminsMentorProfileSubmitted(mentorId: string) {
  const [mentor, admins] = await Promise.all([
    db.user.findUnique({
      where: { id: mentorId },
      select: { id: true, email: true, fullName: true },
    }),
    db.user.findMany({
      where: { role: UserRole.ADMIN, isActive: true },
      select: { id: true, email: true, fullName: true },
      take: 25,
    }),
  ]);

  if (!mentor || admins.length === 0) return;

  const href = "/admin/mentors";
  const base = appBaseUrl();
  const link = base ? `${base}${href}` : href;

  await db.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      kind: "MENTOR_PROFILE_SUBMITTED",
      title: "New mentor profile submitted",
      body: `${mentor.fullName} submitted a mentor profile for activation.`,
      href,
    })),
  });

  // Email admins (best-effort)
  await Promise.allSettled(
    admins.map((a) =>
      sendEmail({
        to: a.email,
        subject: `Mentor profile submitted: ${mentor.fullName}`,
        html: `<p>Hi ${a.fullName.split(/\s+/)[0] || a.fullName},</p>
<p><strong>${mentor.fullName}</strong> submitted a mentor profile and is awaiting activation.</p>
<p><a href="${link}">Open Mentors CRM</a></p>`,
      }),
    ),
  );
}

export async function notifyMentorAccountActivated(mentorId: string, isActive: boolean) {
  const mentor = await db.user.findUnique({
    where: { id: mentorId },
    select: { id: true, email: true, fullName: true },
  });
  if (!mentor) return;

  const href = "/mentor/dashboard";
  const base = appBaseUrl();
  const link = base ? `${base}${href}` : href;

  await db.notification.create({
    data: {
      userId: mentor.id,
      kind: isActive ? "MENTOR_ACTIVATED" : "MENTOR_DEACTIVATED",
      title: isActive ? "Your mentor account is now active" : "Your mentor account was deactivated",
      body: isActive
        ? "Students can now view your profile and book meetings."
        : "Students can’t book you until an admin re-activates your account.",
      href,
    },
  });

  void sendEmail({
    to: mentor.email,
    subject: isActive ? "Your mentor account is now active" : "Your mentor account was deactivated",
    html: `<p>Hi ${mentor.fullName.split(/\s+/)[0] || mentor.fullName},</p>
<p>${
      isActive
        ? "Your mentor account has been activated. Students can now view your profile and book meetings."
        : "Your mentor account was deactivated. Students cannot book you until you’re re-activated."
    }</p>
<p><a href="${link}">Open your mentor dashboard</a></p>`,
  });
}

