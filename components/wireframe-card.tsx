type WireframeCardProps = {
  title: string;
  children?: React.ReactNode;
};

export function WireframeCard({ title, children }: WireframeCardProps) {
  return (
    <section className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-2 text-sm text-muted-foreground">
        {children ?? "Wireframe placeholder content."}
      </div>
    </section>
  );
}
