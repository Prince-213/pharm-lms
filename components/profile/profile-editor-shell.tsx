import Link from "next/link";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 rounded-md border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary-soft)]";

const textareaFieldClass =
  "min-h-[120px] rounded-md border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary-soft)]";

export function ProfileReadOnlySwitchRow({
  label,
  description,
  on,
}: {
  label: string;
  description?: string;
  on: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">
            {description}
          </p>
        ) : null}
      </div>
      <div
        className={cn(
          "flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors",
          on
            ? "justify-end bg-[var(--primary)]"
            : "justify-start bg-[var(--muted-soft)]/80",
        )}
        role="presentation"
        aria-hidden
      >
        <span className="block h-6 w-6 rounded-full bg-[var(--primary-foreground)] shadow-sm" />
      </div>
    </div>
  );
}

export function ProfileEditorRoot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-2xl space-y-8 pb-12 text-[var(--foreground)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ProfileEditorHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="space-y-2">
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function ProfileSegment({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-[var(--border)] shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      <CardHeader className="border-b border-[var(--border)] bg-[var(--surface-muted)]/35 space-y-1 py-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-xs leading-relaxed">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5 p-6">{children}</CardContent>
    </Card>
  );
}

export function ProfileTextField({
  id,
  name,
  label,
  hint,
  defaultValue,
  readOnly,
  required,
  type = "text",
  placeholder,
  inputMode,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string | number | null;
  readOnly?: boolean;
  required?: boolean;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? undefined}
        readOnly={readOnly}
        required={required}
        placeholder={placeholder}
        inputMode={inputMode}
        className={cn(fieldClass, readOnly && "bg-[var(--surface-muted)]")}
      />
      {hint ? (
        <p className="text-xs leading-relaxed text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function ProfileTextareaField({
  id,
  name,
  label,
  hint,
  defaultValue,
  required,
  rows = 5,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string | null;
  required?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <Textarea
        id={id}
        name={name}
        defaultValue={defaultValue ?? undefined}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className={textareaFieldClass}
      />
      {hint ? (
        <p className="text-xs leading-relaxed text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function ProfileFormFooter({
  cancelHref,
  cancelLabel = "Cancel",
  saveLabel = "Save profile",
  pending,
}: {
  cancelHref: string;
  cancelLabel?: string;
  saveLabel?: string;
  pending?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse items-stretch justify-end gap-2 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center">
      <Link
        href={cancelHref}
        className="inline-flex h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-muted)] sm:min-w-[100px]"
      >
        {cancelLabel}
      </Link>
      <Button
        type="submit"
        variant="default"
        disabled={pending}
        className="sm:min-w-[140px]"
      >
        {saveLabel}
      </Button>
    </div>
  );
}
