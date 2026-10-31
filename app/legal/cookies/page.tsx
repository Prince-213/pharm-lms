import Link from "next/link";

export default function LegalCookiesPage() {
  return (
    <div className="bg-[var(--background)] px-6 py-16 text-[var(--foreground)]">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Cookie policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: October 2026. This page explains how PharmEdge uses
          cookies.
        </p>
        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold">Essential cookies</h2>
          <p>
            Session cookies keep you signed in, remember your portal, and
            protect forms. These are required for the product to work and do not
            wait for a banner choice.
          </p>
        </section>
        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold">Optional cookies</h2>
          <p>
            If you choose Accept all, we may use additional first-party cookies
            to understand reliability (for example error reporting). We do not
            sell this data.
          </p>
        </section>
        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold">Your choice</h2>
          <p>
            Use Essential only or Accept all on the banner. You can change your
            browser cookies at any time. Related policies:{" "}
            <Link
              href="/legal/privacy"
              className="font-semibold text-primary hover:underline"
            >
              Privacy
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/terms"
              className="font-semibold text-primary hover:underline"
            >
              Terms
            </Link>
            .
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
