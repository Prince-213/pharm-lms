export default function MentorProtectedLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10 animate-pulse">
      <div className="h-9 w-48 rounded-md bg-[var(--surface-muted)]" />
      <div className="h-24 rounded-xl bg-[var(--surface-muted)]" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-32 rounded-xl bg-[var(--surface-muted)]" />
        <div className="h-32 rounded-xl bg-[var(--surface-muted)]" />
      </div>
    </div>
  );
}
