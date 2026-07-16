import { type ReactNode } from "react";

interface ContextNoteProps {
  icon?: string;
  title?: string;
  children: ReactNode;
  variant?: "info" | "warning" | "highlight";
  className?: string;
}

const VARIANT_STYLES = {
  info: "bg-primary/5 border-primary/20 text-foreground",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  highlight: "bg-accent/8 border-accent/25 text-foreground",
};

const ICON_DEFAULT = {
  info: "ℹ️",
  warning: "⚠️",
  highlight: "💡",
};

export function ContextNote({
  icon,
  title,
  children,
  variant = "info",
  className = "",
}: ContextNoteProps) {
  const resolvedIcon = icon ?? ICON_DEFAULT[variant];
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 text-sm leading-relaxed ${VARIANT_STYLES[variant]} ${className}`}
    >
      <div className="flex gap-3">
        <span className="shrink-0 text-base leading-6">{resolvedIcon}</span>
        <div>
          {title && (
            <span className="font-semibold mr-1.5">{title}</span>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
