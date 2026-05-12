"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/generated/prisma/enums";
import {
  completeSignupWithOtpAction,
  sendSignupOtpAction,
} from "@/lib/auth/signup-otp";
import { userRoleLabel } from "@/lib/user-role-label";

type LoginFormProps = {
  actorType: "tutor" | "mentor" | "student" | "admin";
  mode: "login" | "signup";
  callbackUrl: string;
  googleEnabled?: boolean;
  appleEnabled?: boolean;
  adminCredentialHints?: { email: string; password: string };
  /** Set when OAuth sign-in was rejected because the account role does not match this portal. */
  portalAuthError?: "wrong_portal" | null;
};

const PORTAL_AUTH_BASE = {
  student: "/student",
  tutor: "/tutor",
  mentor: "/mentor",
} as const;

type NonAdminPortalActor = keyof typeof PORTAL_AUTH_BASE;

function setOAuthIntentCookie(intent: "tutor" | "mentor" | "student") {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not supported everywhere; value is non-sensitive.
  document.cookie = `oauth_intent=${intent}; path=/; max-age=300; SameSite=Lax`;
}

function roleFromActor(
  actorType: LoginFormProps["actorType"],
): UserRole | null {
  if (actorType === "tutor") return UserRole.TUTOR;
  if (actorType === "mentor") return UserRole.MENTOR;
  if (actorType === "student") return UserRole.STUDENT;
  return null;
}

export function LoginForm({
  actorType,
  mode,
  callbackUrl,
  googleEnabled = false,
  appleEnabled = false,
  adminCredentialHints,
  portalAuthError = null,
}: LoginFormProps) {
  const isSignup = mode === "signup";
  const isAdmin = actorType === "admin";
  const adminHints = isAdmin && !isSignup ? adminCredentialHints : undefined;
  const [email, setEmail] = useState(adminHints?.email ?? "");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState(adminHints?.password ?? "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [oauthPending, setOauthPending] = useState<"google" | "apple" | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const [otpDevHint, setOtpDevHint] = useState(false);

  useEffect(() => {
    if (adminHints) {
      setEmail(adminHints.email);
      setPassword(adminHints.password);
    }
  }, [adminHints]);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setInterval(() => {
      setOtpCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [otpCooldown]);

  const showGoogle =
    googleEnabled &&
    !isAdmin &&
    (actorType === "student" ||
      actorType === "tutor" ||
      actorType === "mentor");
  const showApple =
    appleEnabled &&
    !isAdmin &&
    (actorType === "student" ||
      actorType === "tutor" ||
      actorType === "mentor");
  const showOAuthRow = showGoogle || showApple;
  const portalRole = roleFromActor(actorType);
  const portalActorTitle =
    !isAdmin && portalRole ? userRoleLabel(portalRole) : null;
  const wrongPortalBanner =
    portalAuthError === "wrong_portal" && portalActorTitle
      ? `This account is not registered as a ${portalActorTitle.toLowerCase()}.`
      : null;

  function startOAuth(provider: "google" | "apple"): void {
    if (!portalRole) return;
    setError("");
    setOauthPending(provider);
    setOAuthIntentCookie(actorType as "student" | "tutor" | "mentor");
    void signIn(provider, { callbackUrl });
  }

  async function onSendCode(): Promise<void> {
    setError("");
    setOtpDevHint(false);
    const toastId = toast.loading("Sending verification code…");
    setOtpSending(true);
    try {
      const result = await sendSignupOtpAction(email);
      if (!result.ok) {
        if ("cooldownSeconds" in result && result.cooldownSeconds) {
          setOtpCooldown(result.cooldownSeconds);
        }
        setError(result.error);
        toast.error(result.error, { id: toastId });
        return;
      }
      setOtpCooldown(60);
      if (result.devEmailMocked) {
        setOtpDevHint(true);
        toast.success(
          "Code sent. In development, check the server terminal for the 6-digit code.",
          { id: toastId },
        );
      } else {
        toast.success("Verification code sent. Check your email.", {
          id: toastId,
        });
      }
    } catch (e) {
      console.error("[login-form] sendSignupOtpAction failed", e);
      const catchMessage =
        "Could not send code. Check the terminal running the dev server, or try again.";
      setError(catchMessage);
      toast.error(catchMessage, { id: toastId });
    } finally {
      setOtpSending(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError("");

    if (isSignup && !isAdmin) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsPending(false);
        return;
      }
      if (!portalRole) {
        setIsPending(false);
        return;
      }
      const result = await completeSignupWithOtpAction({
        fullName,
        email,
        password,
        code: otpCode.replace(/\s/g, ""),
        role: portalRole,
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
        ...(portalRole ? { portalRole } : {}),
      });
      if (signInResult?.error) {
        if (signInResult.code === "WRONG_PORTAL" && portalActorTitle) {
          setError(
            `This account is not registered as a ${portalActorTitle.toLowerCase()}.`,
          );
        } else {
          setError("Account created, but sign-in failed. Try logging in.");
        }
        setIsPending(false);
        return;
      }
      window.location.href = callbackUrl;
      return;
    }

    if (isSignup && isAdmin) {
      setError("Admin accounts are created at install time, not by sign-up.");
      setIsPending(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
      ...(portalRole ? { portalRole } : {}),
    });

    if (result?.error) {
      if (result.code === "WRONG_PORTAL" && portalActorTitle) {
        setError(
          `This account is not registered as a ${portalActorTitle.toLowerCase()}.`,
        );
      } else {
        setError("Invalid credentials.");
      }
      setIsPending(false);
      return;
    }

    window.location.href = callbackUrl;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-[var(--auth-text)]">
      {wrongPortalBanner ? (
        <p
          role="alert"
          className="rounded-xl border border-[var(--auth-error)]/40 bg-[var(--auth-error)]/10 px-3 py-2 text-center text-sm text-[var(--auth-error)]"
        >
          {wrongPortalBanner}
        </p>
      ) : null}

      <h1 className="text-center font-display text-2xl font-bold tracking-tight text-[var(--auth-text)] sm:text-[1.75rem]">
        {isAdmin
          ? "Admin sign in"
          : isSignup
            ? `Create ${portalActorTitle} account`
            : `Sign in as ${portalActorTitle}`}
      </h1>

      {!isAdmin && isSignup ? (
        <p className="text-center text-xs leading-relaxed text-[var(--auth-muted)]">
          Use email verification, then choose a password. Or continue with
          Google{showApple ? " or Apple" : ""} below.
        </p>
      ) : !isAdmin ? (
        <p className="text-center text-xs leading-relaxed text-[var(--auth-muted)]">
          By signing in, you agree to our{" "}
          <Link
            href="/legal/terms"
            className="text-[var(--auth-link)] hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy"
            className="text-[var(--auth-link)] hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      ) : null}

      {isSignup && !isAdmin ? (
        <>
          <Label htmlFor="login-full-name" className="sr-only">
            Full name
          </Label>
          <Input
            id="login-full-name"
            placeholder="Full name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </>
      ) : null}

      <Label htmlFor="login-email" className="sr-only">
        Email address
      </Label>
      <Input
        id="login-email"
        placeholder={adminHints?.email ?? "Email address"}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {isSignup && !isAdmin ? (
        <div className="flex gap-2">
          <Label htmlFor="login-otp" className="sr-only">
            Verification code
          </Label>
          <Input
            id="login-otp"
            className="flex-1 font-mono tracking-widest"
            placeholder="Verification code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            value={otpCode}
            onChange={(e) =>
              setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
          <Button
            type="button"
            variant="outline"
            disabled={otpSending || otpCooldown > 0 || !email.includes("@")}
            onClick={() => void onSendCode()}
            className="shrink-0 px-4"
          >
            {otpCooldown > 0
              ? `${otpCooldown}s`
              : otpSending
                ? "…"
                : "Send code"}
          </Button>
        </div>
      ) : null}

      {isSignup && !isAdmin && otpDevHint ? (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-center text-[11px] leading-relaxed text-[var(--muted-soft)]">
          <span className="font-medium text-[var(--foreground)]">
            Development mode:
          </span>{" "}
          No Resend API key — the 6-digit code was printed in the{" "}
          <strong className="text-[var(--foreground)]">server terminal</strong>{" "}
          (grep <code className="text-[var(--primary)]">[signup-otp]</code> or{" "}
          <code className="text-[var(--primary)]">[email-service]</code>).
        </p>
      ) : null}

      <div className="relative">
        <Label htmlFor="login-password" className="sr-only">
          Password
        </Label>
        <Input
          id="login-password"
          className="pr-11"
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          autoComplete={isSignup ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="button"
          variant="ghost"
          tabIndex={-1}
          className="absolute right-2 top-1/2 h-auto w-auto -translate-y-1/2 rounded-lg p-1.5"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isSignup && !isAdmin ? (
        <div className="relative">
          <Label htmlFor="login-confirm-password" className="sr-only">
            Confirm password
          </Label>
          <Input
            id="login-confirm-password"
            className="pr-11"
            placeholder="Confirm password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            tabIndex={-1}
            className="absolute right-2 top-1/2 h-auto w-auto -translate-y-1/2 rounded-lg p-1.5"
            onClick={() => setShowConfirmPassword((v) => !v)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : null}

      {adminHints ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--primary-soft)]/35 p-3 text-xs text-[var(--primary-soft-text)]">
          <p className="font-semibold text-[var(--foreground)]">
            Demo admin credentials
          </p>
          <p>
            Email: <span className="font-mono">{adminHints.email}</span>
          </p>
          <p>
            Password: <span className="font-mono">{adminHints.password}</span>
          </p>
        </div>
      ) : null}

      {isSignup && !isAdmin ? (
        <p className="text-center text-[11px] leading-relaxed text-[var(--auth-muted)]">
          By signing up, you consent to our{" "}
          <Link
            href="/legal/terms"
            className="text-[var(--auth-link)] hover:underline"
          >
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy"
            className="text-[var(--auth-link)] hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      ) : null}

      {error ? (
        <p className="text-center text-sm text-[var(--auth-error)]">{error}</p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending
          ? "Please wait…"
          : isSignup && !isAdmin
            ? "Sign up"
            : "Log in"}
      </Button>

      {!isAdmin && !isSignup ? (
        <div className="flex items-center justify-between text-sm">
          <Link
            href="/contact-admin"
            className="text-[var(--auth-link)] hover:underline"
          >
            Forgot password?
          </Link>
          <Link
            href={`${PORTAL_AUTH_BASE[actorType as NonAdminPortalActor]}/signup`}
            className="text-[var(--auth-link)] hover:underline"
          >
            Sign up
          </Link>
        </div>
      ) : null}

      {showOAuthRow ? (
        <>
          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-[var(--auth-border)]" />
            <span className="text-[11px] uppercase tracking-wider text-[var(--auth-muted)]">
              {isSignup ? "Or sign up with" : "Or continue with"}
            </span>
            <span className="h-px flex-1 bg-[var(--auth-border)]" />
          </div>
          <div className="flex justify-center gap-4">
            {showGoogle ? (
              <Button
                type="button"
                variant="oauthGoogle"
                title="Google"
                disabled={isPending || oauthPending !== null}
                onClick={() => startOAuth("google")}
                className="flex items-center justify-center"
              >
                <GoogleGlyph />
              </Button>
            ) : null}
            {showApple ? (
              <Button
                type="button"
                variant="oauthApple"
                title="Apple"
                disabled={isPending || oauthPending !== null}
                onClick={() => startOAuth("apple")}
                className="flex items-center justify-center"
              >
                <AppleGlyph />
              </Button>
            ) : null}
          </div>
        </>
      ) : null}

      {!isAdmin ? (
        <p className="pt-2 text-center text-sm text-[var(--auth-muted)]">
          {isSignup ? "Already have an account? " : "Need an account? "}
          <Link
            href={`${PORTAL_AUTH_BASE[actorType as NonAdminPortalActor]}/${isSignup ? "login" : "signup"}`}
            className="font-semibold text-[var(--auth-link)] hover:underline"
          >
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </p>
      ) : null}

      {!isAdmin && !isSignup ? (
        <p className="text-center text-sm">
          <Link
            href="/contact-admin"
            className="text-[var(--auth-link)] hover:underline"
          >
            Log in with your organization
          </Link>
        </p>
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

function AppleGlyph() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-white"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Apple"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
