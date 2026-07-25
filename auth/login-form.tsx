"use client";

import { AtSign, Eye, EyeOff, Lock, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AppleIcon } from "@/components/icons/apple-icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/generated/prisma/enums";
import {
  completeSignupWithOtpAction,
  initiateSignupAction,
} from "@/lib/auth/signup-otp";
import { portalAuthCopy } from "@/lib/auth/portal-auth-copy";
import {
  messageForAuthJsError,
  messageForOauthOnlyLogin,
} from "@/lib/auth/existing-account-message";
import { userRoleLabel } from "@/lib/user-role-label";

type LoginFormProps = {
  actorType: "tutor" | "mentor" | "student" | "admin";
  mode: "login" | "signup";
  callbackUrl: string;
  googleEnabled?: boolean;
  appleEnabled?: boolean;
  adminCredentialHints?: { email: string; password: string };
  /** Set when OAuth sign-in was rejected because the account role does not match this portal. */
  portalAuthError?: "wrong_portal" | "account_disabled" | null;
  /** Auth.js `?error=` query value (OAuthCallback, OAuthAccountNotLinked, etc.). */
  authJsError?: string | null;
};

const PORTAL_AUTH_BASE = {
  student: "/student",
  tutor: "/tutor",
  mentor: "/mentor",
} as const;

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  otpCode?: string;
};

type NonAdminPortalActor = keyof typeof PORTAL_AUTH_BASE;

function setOAuthIntentCookie(intent: "tutor" | "mentor" | "student") {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not supported everywhere; value is non-sensitive.
  document.cookie = `oauth_intent=${intent}; path=/; max-age=300; SameSite=Lax`;
}

function roleFromActor(
  actorType: LoginFormProps["actorType"],
): UserRole | null {
  if (actorType === "admin") return UserRole.ADMIN;
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
  authJsError = null,
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
  const [signupStep, setSignupStep] = useState<"details" | "verify">("details");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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
    portalAuthError === "wrong_portal"
      ? isAdmin
        ? "This account does not have admin access."
        : portalActorTitle
          ? `This account is not registered as a ${portalActorTitle.toLowerCase()}.`
          : null
      : portalAuthError === "account_disabled"
        ? actorType === "mentor"
          ? "This mentor account has been deactivated by an admin. Contact support if you need help."
          : "This account is not active. Contact support if you need help."
        : null;

  const authJsBanner = messageForAuthJsError(authJsError ?? undefined);
  const authBanner = wrongPortalBanner ?? authJsBanner;

  useEffect(() => {
    if (portalAuthError === "account_disabled" && wrongPortalBanner) {
      toast.error(wrongPortalBanner);
    } else if (portalAuthError === "wrong_portal" && wrongPortalBanner) {
      toast.error(wrongPortalBanner);
    } else if (authJsBanner) {
      toast.error(authJsBanner);
    }
  }, [portalAuthError, wrongPortalBanner, authJsBanner]);

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateSignupDetails(): boolean {
    const errors: FieldErrors = {};
    if (fullName.trim().length < 2) {
      errors.fullName = "Enter your full name (at least 2 characters).";
    }
    if (!email.includes("@")) {
      errors.email = "Enter a valid email address.";
    }
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function onContinueSignup(): Promise<void> {
    if (!portalRole || isAdmin) return;
    setError("");
    if (!validateSignupDetails()) return;

    const toastId = toast.loading("Sending verification code…");
    setOtpSending(true);
    try {
      const result = await initiateSignupAction({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role: portalRole,
      });
      if (!result.ok) {
        if (result.fieldErrors) {
          setFieldErrors((prev) => ({ ...prev, ...result.fieldErrors }));
        }
        if ("cooldownSeconds" in result && result.cooldownSeconds) {
          setOtpCooldown(result.cooldownSeconds);
        }
        setError(result.error);
        toast.error(result.error, { id: toastId });
        return;
      }
      setSignupStep("verify");
      setOtpCooldown(60);
      setOtpCode("");
      setFieldErrors({});
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
      console.error("[login-form] initiateSignupAction failed", e);
      const catchMessage =
        "Could not send code. Check the terminal running the dev server, or try again.";
      setError(catchMessage);
      toast.error(catchMessage, { id: toastId });
    } finally {
      setOtpSending(false);
    }
  }

  async function onResendCode(): Promise<void> {
    await onContinueSignup();
  }

  function startOAuth(provider: "google" | "apple"): void {
    if (!portalRole || isAdmin) return;
    setError("");
    setOauthPending(provider);
    setOAuthIntentCookie(actorType as "student" | "tutor" | "mentor");
    void signIn(provider, { callbackUrl });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError("");

    if (isSignup && !isAdmin) {
      if (signupStep === "details") {
        setIsPending(false);
        await onContinueSignup();
        return;
      }

      const code = otpCode.replace(/\s/g, "");
      if (!/^\d{6}$/.test(code)) {
        setFieldErrors({ otpCode: "Enter the 6-digit code from your email." });
        setError("Enter the 6-digit verification code.");
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
        code,
        role: portalRole,
      });
      if (!result.ok) {
        setError(result.error);
        setFieldErrors({ otpCode: result.error });
        setIsPending(false);
        return;
      }
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
        portalRole,
      });
      if (signInResult?.error) {
        if (signInResult.code === "WRONG_PORTAL" && portalActorTitle) {
          setError(
            `This account is not registered as a ${portalActorTitle.toLowerCase()}.`,
          );
        } else if (signInResult.code === "ACCOUNT_DISABLED") {
          setError(
            actorType === "mentor"
              ? "This mentor account has been deactivated by an admin. Contact support if you need help."
              : "This account is not active. Contact support if you need help.",
          );
        } else if (signInResult.code === "OAUTH_ONLY_ACCOUNT") {
          setError(messageForOauthOnlyLogin(["google", "apple"]));
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
      if (result.code === "WRONG_PORTAL") {
        const msg = isAdmin
          ? "This account does not have admin access."
          : portalActorTitle
            ? `This account is not registered as a ${portalActorTitle.toLowerCase()}.`
            : "Invalid credentials.";
        setError(msg);
        toast.error(msg);
      } else if (result.code === "ACCOUNT_DISABLED") {
        const msg =
          actorType === "mentor"
            ? "This mentor account has been deactivated by an admin. Contact support if you need help."
            : "This account is not active. Contact support if you need help.";
        setError(msg);
        toast.error(msg);
      } else if (result.code === "OAUTH_ONLY_ACCOUNT") {
        const providers: string[] = [];
        if (showGoogle) providers.push("google");
        if (showApple) providers.push("apple");
        const msg = messageForOauthOnlyLogin(
          providers.length > 0 ? providers : ["google"],
        );
        setError(msg);
        toast.error(msg);
      } else {
        setError("Invalid credentials.");
        toast.error("Invalid credentials.");
      }
      setIsPending(false);
      return;
    }

    window.location.href = callbackUrl;
  }

  const portalCopy = portalAuthCopy[actorType];
  const portalName = portalCopy.badge.replace(" portal", "");
  const formTitle = isAdmin
    ? "Admin sign in"
    : isSignup
      ? signupStep === "verify"
        ? "Verify your email"
        : `Create your ${portalName.toLowerCase()} account`
      : `${portalName} sign in`;
  const formSubtitle = isSignup
    ? signupStep === "verify"
      ? email
        ? `${portalCopy.verifySubtitle} We sent a code to ${email}.`
        : portalCopy.verifySubtitle
      : portalCopy.signupSubtitle
    : portalCopy.loginSubtitle;

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-[var(--auth-text)]">
      {authBanner ? (
        <p
          role="alert"
          className="rounded-xl border border-[var(--auth-error)]/40 bg-[var(--auth-error)]/10 px-3 py-2 text-center text-sm text-[var(--auth-error)]"
        >
          {authBanner}
        </p>
      ) : null}

      <div className="flex flex-col space-y-2">
        <p className="inline-flex w-fit items-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
          {portalCopy.badge}
        </p>
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-wide text-[var(--ink-deep)]">
            {formTitle}
          </h1>
          <p className="text-base text-muted-foreground">{formSubtitle}</p>
        </div>
      </div>

      {!isAdmin ? (
        <p className="text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "No account yet?"}{" "}
          <Link
            href={`${PORTAL_AUTH_BASE[actorType as NonAdminPortalActor]}/${isSignup ? "login" : "signup"}`}
            className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
          >
            {isSignup ? "Sign in" : "Sign up"}
          </Link>
        </p>
      ) : null}

      {isSignup && !isAdmin ? (
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span
            className={
              signupStep === "details"
                ? "text-[var(--accent)]"
                : "text-muted-foreground"
            }
          >
            1. Account details
          </span>
          <span aria-hidden>→</span>
          <span
            className={
              signupStep === "verify"
                ? "text-[var(--accent)]"
                : "text-muted-foreground"
            }
          >
            2. Verify email
          </span>
        </div>
      ) : null}

      {showOAuthRow && (!isSignup || signupStep === "details") ? (
        <div className="space-y-2">
          {showGoogle ? (
            <Button
              type="button"
              variant="outline"
              disabled={isPending || oauthPending !== null}
              onClick={() => startOAuth("google")}
              className="h-12 w-full justify-center gap-2 bg-[var(--surface)] font-medium"
            >
              <GoogleIcon className="size-4" />
              Continue with Google
            </Button>
          ) : null}
          {showApple ? (
            <Button
              type="button"
              variant="outline"
              disabled={isPending || oauthPending !== null}
              onClick={() => startOAuth("apple")}
              className="h-12 w-full justify-center gap-2 bg-[var(--surface)] font-medium"
            >
              <AppleIcon className="size-4" />
              Continue with Apple
            </Button>
          ) : null}
        </div>
      ) : null}

      {showOAuthRow && (!isSignup || signupStep === "details") ? (
        <AuthDivider>OR</AuthDivider>
      ) : null}

      {!isAdmin && isSignup && signupStep === "details" ? (
        <p className="text-start text-xs text-[var(--auth-muted)]">
          Enter your details below. We&apos;ll email you a verification code to
          complete sign-up.
        </p>
      ) : null}

      {(!isSignup || signupStep === "details") && (
        <div className="space-y-2">
          {isSignup && !isAdmin ? (
            <div>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <UserIcon className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="login-full-name"
                  placeholder="Your full name"
                  type="text"
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}
                />
              </InputGroup>
              {fieldErrors.fullName ? (
                <p className="mt-1 text-xs text-[var(--auth-error)]">
                  {fieldErrors.fullName}
                </p>
              ) : null}
            </div>
          ) : null}

          <div>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <AtSign className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="login-email"
                placeholder={adminHints?.email ?? "your.email@example.com"}
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
              />
            </InputGroup>
            {fieldErrors.email ? (
              <p className="mt-1 text-xs text-[var(--auth-error)]">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Lock className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="login-password"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                aria-invalid={Boolean(fieldErrors.password)}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
              />
              <InputGroupAddon align="inline-end">
                <Button
                  type="button"
                  variant="ghost"
                  tabIndex={-1}
                  className="h-8 w-8 p-0"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </InputGroupAddon>
            </InputGroup>
            {fieldErrors.password ? (
              <p className="mt-1 text-xs text-[var(--auth-error)]">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          {isSignup && !isAdmin ? (
            <div>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Lock className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="login-confirm-password"
                  placeholder="Confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError("confirmPassword");
                  }}
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    tabIndex={-1}
                    className="h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              {fieldErrors.confirmPassword ? (
                <p className="mt-1 text-xs text-[var(--auth-error)]">
                  {fieldErrors.confirmPassword}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {isSignup && !isAdmin && signupStep === "verify" ? (
        <>
          <div>
            <Input
              id="login-otp"
              className={`text-center font-mono text-lg tracking-[0.35em] ${fieldErrors.otpCode ? "border-[var(--auth-error)]" : ""}`}
              placeholder="000000"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              aria-invalid={Boolean(fieldErrors.otpCode)}
              value={otpCode}
              onChange={(e) => {
                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                clearFieldError("otpCode");
              }}
            />
            {fieldErrors.otpCode ? (
              <p className="mt-1 text-xs text-[var(--auth-error)]">
                {fieldErrors.otpCode}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-sm"
              onClick={() => {
                setSignupStep("details");
                setOtpCode("");
                setError("");
                setFieldErrors({});
              }}
            >
              ← Back
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={otpSending || otpCooldown > 0}
              onClick={() => void onResendCode()}
              className="text-sm"
            >
              {otpCooldown > 0
                ? `Resend in ${otpCooldown}s`
                : otpSending
                  ? "Sending…"
                  : "Resend code"}
            </Button>
          </div>
        </>
      ) : null}

      {isSignup && !isAdmin && otpDevHint && signupStep === "verify" ? (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-center text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-[var(--foreground)]">
            Development mode:
          </span>{" "}
          No Resend API key — the 6-digit code was printed in the{" "}
          <strong className="text-[var(--foreground)]">server terminal</strong>.
        </p>
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

      {error ? (
        <p className="text-center text-sm text-[var(--auth-error)]">{error}</p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending || otpSending}
        className="h-12 w-full bg-[var(--accent)] font-semibold text-white hover:bg-[var(--accent-deep)]"
      >
        {isPending || oauthPending !== null || otpSending
          ? "Please wait…"
          : isSignup && !isAdmin
            ? signupStep === "verify"
              ? "Create account"
              : "Continue with email"
            : "Log in"}
      </Button>

      {!isAdmin && !isSignup ? (
        <div className="flex justify-end">
          <Link
            href="/contact-admin"
            className="text-sm font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link
          href="/legal/terms"
          className="underline underline-offset-4 hover:text-[var(--accent)]"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/legal/privacy"
          className="underline underline-offset-4 hover:text-[var(--accent)]"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
