import { cn } from "@/lib/utils";

export function BridgeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 17h18M5.5 17v-3a6.5 6.5 0 0 1 13 0v3M9 17v-2.5M12 17v-3.5M15 17v-2.5" />
    </svg>
  );
}

export function Logo({ inverted, className }: { inverted?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-layered">
        <BridgeIcon className="size-5" />
      </span>
      <span className={cn("font-display text-xl font-bold tracking-tight", inverted ? "text-primary-foreground" : "text-foreground")}>MedBridge</span>
    </span>
  );
}
