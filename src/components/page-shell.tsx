import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageShell({ eyebrow, title, actions, children, className, top }: { eyebrow?: string; title?: string; actions?: ReactNode; children: ReactNode; className?: string; top?: ReactNode }) {
  return (
    <main className={cn("mx-auto min-h-[calc(100vh-4.5rem)] max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-16", className)}>
      {top && <div className="mb-8">{top}</div>}
      {(title || actions) && (
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
            {title && <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>}
          </div>
          {actions}
        </div>
      )}
      <div>{children}</div>
    </main>
  );
}

export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

export const cardClass = "rounded-xl border border-border bg-card p-6 shadow-sm";

export const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
