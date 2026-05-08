type AdminPageHeaderProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function AdminPageHeader({ title, description, children }: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      </div>
      {children ? <div className="flex shrink-0 flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
