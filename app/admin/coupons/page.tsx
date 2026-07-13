import { AdminCouponsTable } from "@/components/admin/admin-coupons-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { NewCouponDialog } from "@/components/admin/new-coupon-dialog";
import { CourseStatus } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { Ticket } from "@/lib/icons/server";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requireAdminSession();

  const [coupons, eligibleCourses] = await Promise.all([
    db.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { redemptions: true } },
        targets: {
          include: { course: { select: { id: true, title: true } } },
        },
      },
      take: 200,
    }),
    db.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED,
        priceMinorUnits: { gt: 0 },
      },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        priceMinorUnits: true,
        priceCurrency: true,
        mentor: { select: { fullName: true } },
      },
      take: 500,
    }),
  ]);

  const courseOptions = eligibleCourses.map((c) => ({
    id: c.id,
    title: c.title,
    priceMinorUnits: c.priceMinorUnits,
    priceCurrency: c.priceCurrency,
    mentorName: c.mentor.fullName,
  }));

  const rows = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    percentOff: c.percentOff,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    maxRedemptions: c.maxRedemptions,
    maxRedemptionsPerStudent: c.maxRedemptionsPerStudent,
    isActive: c.isActive,
    redemptionCount: c._count.redemptions,
    createdAt: c.createdAt.toISOString(),
    courses: c.targets.map((t) => ({
      id: t.course.id,
      title: t.course.title,
    })),
  }));

  const activeCount = rows.filter((r) => r.isActive).length;
  const totalRedemptions = rows.reduce((n, r) => n + r.redemptionCount, 0);

  return (
    <>
      <AdminPageHeader
        title="Coupon codes"
        description="Issue percentage-off discount codes that learners can apply during checkout. Coupons target one or more published, paid courses."
      >
        <NewCouponDialog courses={courseOptions} />
      </AdminPageHeader>

      {rows.length === 0 ? (
        <AdminPanel
          title="No coupons yet"
          description="Create your first coupon to give learners a discount."
        >
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] py-14 text-center">
            <Ticket
              className="h-10 w-10 text-muted-foreground"
              strokeWidth={1.25}
            />
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Coupon codes apply a percentage discount to one or more courses
              during checkout. Use the New coupon button above to create one.
            </p>
          </div>
        </AdminPanel>
      ) : (
        <AdminPanel
          title="All coupons"
          description={`${rows.length} coupon(s) · ${activeCount} active · ${totalRedemptions} redemption(s)`}
        >
          <AdminCouponsTable coupons={rows} />
        </AdminPanel>
      )}
    </>
  );
}
