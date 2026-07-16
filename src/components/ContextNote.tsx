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

const ICON_ACCENT = {
  info: "text-primary",
  warning: "text-amber-600",
  highlight: "text-accent",
};

/* SVG icons — no emojis */
function IconInfo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  );
}

function IconWarning({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

function IconHighlight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.05 3.05a.75.75 0 011.06 1.06L4.879 5.343a.75.75 0 01-1.06-1.06L5.05 3.05zm9.9 0a.75.75 0 010 1.06l-1.232 1.232a.75.75 0 01-1.06-1.06L13.95 3.05a.75.75 0 011 0zM10 6a4 4 0 100 8 4 4 0 000-8zM1 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 011 10zm15 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 0116 10zm-8.121 4.879l-1.232 1.232a.75.75 0 01-1.06-1.06l1.232-1.233a.75.75 0 011.06 1.06zm5.535 1.232a.75.75 0 01-1.06-1.06l1.232-1.233a.75.75 0 011.06 1.06l-1.232 1.233zM10 17a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 17z" />
    </svg>
  );
}

const ICON_COMPONENTS = {
  info: IconInfo,
  warning: IconWarning,
  highlight: IconHighlight,
};

export function ContextNote({
  title,
  children,
  variant = "info",
  className = "",
}: ContextNoteProps) {
  const IconComp = ICON_COMPONENTS[variant];
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 text-sm leading-relaxed ${VARIANT_STYLES[variant]} ${className}`}
    >
      <div className="flex gap-3">
        <span className={`shrink-0 mt-0.5 ${ICON_ACCENT[variant]}`}>
          <IconComp className="w-4 h-4" />
        </span>
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
