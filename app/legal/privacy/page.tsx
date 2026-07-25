import Link from "next/link";

export default function LegalPrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)]">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Privacy policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: July 2026. This policy describes how PharmLMS processes
          account, learning, and payment-related data.
        </p>
        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold">What we collect</h2>
          <p>
            Account details (name, email), authentication records, course
            enrollments and progress, assignment submissions, meeting requests,
            and payment references needed to fulfill purchases and tutor
            payouts.
          </p>
        </section>
        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold">How we use data</h2>
          <p>
            To operate the learning platform, authenticate users, deliver course
            content, process payments via Paystack, send transactional email, and
            improve product reliability and support.
          </p>
        </section>
        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold">Processors</h2>
          <p>
            Infrastructure and processors may include our hosting provider,
            Neon (database), Cloudflare R2 (files), Paystack (payments), and
            Resend (email). They process data only to provide those services.
          </p>
        </section>
        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold">Your choices</h2>
          <p>
            Contact support to request access, correction, or deletion of your
            account data where applicable law requires. Some records may be
            retained for legal, security, or accounting obligations.
          </p>
        </section>
        <Link
          href="/"
          className="inline-block text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
