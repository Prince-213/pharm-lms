export default async function MentorCoursePromotionsPage() {
  return (
    <section className="mx-auto max-w-[900px] border border-[#d1d7dc] bg-white">
      <div className="border-b border-[#d1d7dc] px-6 py-4">
        <h1 className="text-2xl font-bold text-[#1c1d1f]">Promotions</h1>
      </div>
      <div className="space-y-4 px-6 py-5">
        <p className="text-sm text-[#6a6f73]">
          Create announcements and promotional coupons for your course.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded border border-[#d1d7dc] bg-[#f6f7f9] p-4">
            <h3 className="font-semibold">Announcement draft</h3>
            <p className="mt-2 text-sm text-[#6a6f73]">Tell students about updates.</p>
          </div>
          <div className="rounded border border-[#d1d7dc] bg-[#f6f7f9] p-4">
            <h3 className="font-semibold">Coupon campaign</h3>
            <p className="mt-2 text-sm text-[#6a6f73]">Set discount and validity period.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
