import type { ReactNode } from "react";

export function ChartCard({
  title,
  description,
  children,
  height = 340,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  height?: number;
}) {
  return (
    <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <header className="mb-4">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </header>
      <div style={{ height }}>{children}</div>
    </section>
  );
}
