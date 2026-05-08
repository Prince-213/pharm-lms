import { Award } from "lucide-react";
import Image from "next/image";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { BadgeRulesReference } from "@/components/admin/badge-rules-reference";
import { NewBadgeDialog } from "@/components/admin/new-badge-dialog";
import { requireAdminSession } from "@/lib/admin-auth";
import { describeRuleConfig } from "@/lib/badges/rule-definitions";
import { db } from "@/lib/db";

export default async function AdminBadgesPage() {
  await requireAdminSession();

  const badges = await db.badge.findMany({
    orderBy: { createdAt: "desc" },
    take: 48,
    include: {
      _count: { select: { awarded: true } },
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Badges & achievements"
        description="Define credentials and automated awards. Awards run automatically on enrollment, lesson progress, and quiz events."
      >
        <NewBadgeDialog />
      </AdminPageHeader>
      <BadgeRulesReference />
      {badges.length === 0 ? (
        <AdminPanel title="Catalog" description="No badges in the database yet">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] py-14 text-center">
            <Award
              className="h-10 w-10 text-[var(--muted)]"
              strokeWidth={1.25}
            />
            <p className="mt-4 max-w-md text-sm text-[var(--muted)]">
              Create a badge above. Each badge stores its rule type and
              threshold; the engine awards it automatically when a student
              crosses the threshold.
            </p>
          </div>
        </AdminPanel>
      ) : (
        <AdminPanel
          title="Catalog"
          description={`${badges.length} badge(s) defined`}
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((b) => (
              <li
                key={b.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex items-start gap-3">
                  {b.iconUrl ? (
                    <Image
                      src={b.iconUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div className="rounded-lg bg-[var(--primary-soft)] p-2 text-[var(--primary)]">
                      <Award className="h-5 w-5" strokeWidth={2} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--foreground)]">
                      {b.name}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                      {b.description}
                    </p>
                    <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                      {describeRuleConfig(b.ruleType, b.ruleConfig)} ·{" "}
                      {b._count.awarded} awarded
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </AdminPanel>
      )}
    </>
  );
}
