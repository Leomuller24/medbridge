import { Link } from "@tanstack/react-router";
import { Menu, ShieldPlus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Home", to: "/" as const, exact: true },
  { label: "Notes", to: "/notes" as const, exact: false },
  { label: "Community", to: "/community" as const, exact: false },
  { label: "Settings", to: "/settings" as const, exact: false },
];

export function MedBridgeHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto grid h-18 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:px-8 lg:px-10">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setIsOpen(false)}>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <ShieldPlus aria-hidden="true" className="size-5" />
          </span>
          <span className="truncate text-xl font-semibold text-foreground">MedBridge</span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-muted hover:text-foreground" }}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <AccountButton />
        </nav>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </Button>
      </div>

      <nav
        aria-label="Mobile navigation"
        className={cn("border-t border-border px-5 py-3 md:hidden", !isOpen && "hidden")}
      >
        <div className="mx-auto grid max-w-7xl gap-1">
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="rounded-lg px-4 py-3 text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}