interface HeroBadgeProps {
  value: string;
  label: string;
  sublabel?: string;
  color?: "primary" | "accent" | "green" | "violet";
}

const COLOR_MAP = {
  primary: {
    bg: "bg-primary/8",
    border: "border-primary/20",
    value: "text-primary",
    badge: "bg-primary/15 text-primary",
  },
  accent: {
    bg: "bg-accent/8",
    border: "border-accent/20",
    value: "text-accent",
    badge: "bg-accent/15 text-accent",
  },
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    value: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    value: "text-violet-700",
    badge: "bg-violet-100 text-violet-700",
  },
};

export function HeroBadge({
  value,
  label,
  sublabel,
  color = "primary",
}: HeroBadgeProps) {
  const c = COLOR_MAP[color];
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-2xl border ${c.bg} ${c.border} px-5 py-4`}
    >
      <div className="w-full text-center text-xs uppercase tracking-wide text-muted-foreground leading-snug">
        {label}
      </div>
      <div
        className={`w-full text-center mt-1 text-3xl font-bold tabular-nums ${c.value} shrink-0 leading-none`}
      >
        {value}
      </div>
      {sublabel && (
        <div className="w-full text-center mt-1 text-xs text-muted-foreground leading-snug">
          {sublabel}
        </div>
      )}
    </div>
  );
}
