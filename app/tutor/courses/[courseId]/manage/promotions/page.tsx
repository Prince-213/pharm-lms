export default async function MentorCoursePromotionsPage() {
  return (
    <section className="mx-auto max-w-[900px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Promotions</h1>
      </div>
      <div className="space-y-4 px-6 py-5">
        <p className="text-sm text-[var(--muted)]">
          Create announcements and promotional coupons for your course.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <h3 className="font-semibold">Announcement draft</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Tell students about updates.
            </p>
          </div>
          <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <h3 className="font-semibold">Coupon campaign</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Set discount and validity period.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
