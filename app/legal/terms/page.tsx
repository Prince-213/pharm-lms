import Link from "next/link";

export default function LegalTermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)]">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Terms of use
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: July 2026. By using PharmLMS you agree to these terms.
        </p>
        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold">Accounts</h2>
          <p>
            You must provide accurate registration information and keep your
            credentials secure. Accounts may be suspended for abuse, fraud, or
            policy violations.
          </p>
        </section>
        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold">Courses and payments</h2>
          <p>
            Paid enrollments are processed through Paystack. Access is granted
            after successful payment confirmation. Tutors are responsible for
            the accuracy of course content they publish.
          </p>
        </section>
        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold">Acceptable use</h2>
          <p>
            Do not upload malware, infringe intellectual property, harass other
            users, or attempt to bypass security or payment controls.
          </p>
        </section>
        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold">Limitation of liability</h2>
          <p>
            PharmLMS is provided as-is for educational purposes. To the extent
            permitted by law, we are not liable for indirect or consequential
            damages arising from platform use.
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
