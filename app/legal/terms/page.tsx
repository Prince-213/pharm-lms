import Link from "next/link";

export default function LegalTermsPage() {
  return (
    <div className="auth-saas min-h-screen bg-[var(--auth-bg)] px-6 py-16 text-[var(--auth-text)]">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Terms of use
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--auth-muted)]">
          This is placeholder content. Replace it with your organization&apos;s
          terms of service before production use.
        </p>
        <Link
          href="/student/login"
          className="mt-8 inline-block text-sm text-[var(--auth-link)] hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
