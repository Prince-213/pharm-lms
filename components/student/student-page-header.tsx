type StudentPageHeaderProps = {
  title: string;
  description: string;
};

export function StudentPageHeader({ title, description }: StudentPageHeaderProps) {
  return (
    <div className="mb-8 border-b border-[var(--border)] pb-6">
      <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{description}</p>
    </div>
  );
}
