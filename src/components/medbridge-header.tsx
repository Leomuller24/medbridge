import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const baseNavigation: { label: string; to: "/" | "/dashboard" | "/notes" | "/community" | "/settings"; exact: boolean }[] = [
  { label: "Home", to: "/" as const, exact: true },
  { label: "Notes", to: "/notes" as const, exact: false },
  { label: "Community", to: "/community" as const, exact: false },
  { label: "Settings", to: "/settings" as const, exact: false },
];

export function MedBridgeHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { session } = useSession();
  const navigation = baseNavigation.map((n) => (n.label === "Home" && session ? { ...n, to: "/dashboard" as const } : n));

  return (
    <header className="border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto grid h-18 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:px-8 lg:px-10">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setIsOpen(false)}>
<Logo />
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
          <AccountButton onDone={() => setIsOpen(false)} />
        </div>
      </nav>
    </header>
  );
}
function AccountButton({ onDone }: { onDone?: () => void }) {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  if (!ready) return null;
  if (!session) {
    return (
      <Link to="/login" onClick={onDone} className="ml-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Log in
      </Link>
    );
  }
  return (
    <Button
      type="button"
      variant="outline"
      className="ml-2"
      onClick={async () => {
        onDone?.();
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
        navigate({ to: "/login", replace: true });
      }}
    >
      Sign out
    </Button>
  );
}
