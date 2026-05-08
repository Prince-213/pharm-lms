"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { UserRole } from "@/generated/prisma/enums";
import { signupAction } from "@/lib/auth/signup-action";

type LoginFormProps = {
  actorType: "tutor" | "mentor" | "student" | "admin";
  mode: "login" | "signup";
  callbackUrl: string;
  /** When true and not admin, show Google sign-in (requires AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET on the server). */
  googleEnabled?: boolean;
  /**
   * Admin login only: pre-fill email/password (e.g. from SEED_ADMIN_*).
   * Only pass from the server when explicitly allowed (dev or SHOW_ADMIN_LOGIN_HINT).
   */
  adminCredentialHints?: { email: string; password: string };
};

function setOAuthIntentCookie(intent: "tutor" | "mentor" | "student") {
  // Short-lived hint for server-side OAuth user creation (custom Prisma adapter).
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not supported everywhere; value is non-sensitive.
  document.cookie = `oauth_intent=${intent}; path=/; max-age=300; SameSite=Lax`;
}

export function LoginForm({
  actorType,
  mode,
  callbackUrl,
  googleEnabled = false,
  adminCredentialHints,
}: LoginFormProps) {
  const isSignup = mode === "signup";
  const adminHints =
    actorType === "admin" && !isSignup ? adminCredentialHints : undefined;
  const [email, setEmail] = useState(adminHints?.email ?? "");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState(adminHints?.password ?? "");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  useEffect(() => {
    if (adminHints) {
      setEmail(adminHints.email);
      setPassword(adminHints.password);
    }
  }, [adminHints]);

  const showGoogle =
    googleEnabled &&
    (actorType === "student" || actorType === "tutor" || actorType === "mentor");

  function onGoogleSignIn() {
    if (!showGoogle) {
      return;
    }
    setError("");
    setGooglePending(true);
    setOAuthIntentCookie(actorType);
    void signIn("google", { callbackUrl });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError("");

    if (isSignup) {
      if (actorType === "admin") {
        setError("Admin accounts are created at install time, not by sign-up.");
        setIsPending(false);
        return;
      }
      const result = await signupAction({
        fullName,
        email,
        password,
        role:
          actorType === "tutor"
            ? UserRole.TUTOR
            : actorType === "mentor"
              ? UserRole.MENTOR
              : UserRole.STUDENT,
      });
      if (!result.ok) {
        setError(result.error);
        setIsPending(false);
        return;
      }
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (signInResult?.error) {
        setError("Account created, but sign-in failed. Try logging in.");
        setIsPending(false);
        return;
      }
      window.location.href = callbackUrl;
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Invalid credentials.");
      setIsPending(false);
      return;
    }

    window.location.href = callbackUrl;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <h1 className="text-center text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
        {isSignup
          ? `Sign up as ${actorType}`
          : `Log in as ${actorType} to continue`}
      </h1>
      {isSignup ? (
        <input
          className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
          placeholder="Full name"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      ) : null}
      <input
        className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
        placeholder={adminHints?.email ?? "Email"}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
        placeholder={adminHints?.password ?? "Password"}
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {adminHints ? (
        <div className="rounded-[var(--radius-md)] border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-semibold">Demo admin credentials</p>
          <p>
            Email: <span className="font-mono">{adminHints.email}</span>
          </p>
          <p>
            Password: <span className="font-mono">{adminHints.password}</span>
          </p>
        </div>
      ) : null}
      {isSignup ? (
        <label className="flex items-start gap-2 text-xs text-[var(--muted)]">
          <input type="checkbox" className="mt-0.5" defaultChecked />
          Send me special offers, personalized recommendations, and learning
          tips.
        </label>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)] disabled:opacity-60"
      >
        {isPending ? "Please wait..." : "Continue"}
      </button>
      {showGoogle ? (
        <>
          <div className="flex items-center gap-2 py-2">
            <span className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs text-[var(--muted)]">
              {isSignup ? "Or sign up with" : "Or continue with"}
            </span>
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={isPending || googlePending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[#1f1f1f] shadow-sm transition hover:bg-[#f8f9fa] disabled:opacity-60"
          >
            <GoogleGlyph />
            {googlePending ? "Redirecting…" : "Continue with Google"}
          </button>
        </>
      ) : null}
      {actorType !== "admin" ? (
        <div className="mt-5 space-y-3 rounded-[var(--radius-lg)] bg-[var(--surface-muted)]/80 p-4 text-center text-sm">
          <p>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              className="font-semibold text-[var(--primary)]"
              href={`/${actorType}/${isSignup ? "login" : "signup"}`}
            >
              {isSignup ? "Log in" : "Sign up"}
            </Link>
          </p>
          {!isSignup ? (
            <p>
              <a
                className="font-semibold text-[var(--primary)]"
                href="/contact-admin"
              >
                Log in with your organization
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

function GoogleGlyph() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Google"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
