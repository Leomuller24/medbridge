import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BookOpen, FolderOpen, Globe, Home, LogOut, NotebookPen, Search, Settings, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/local-store";
import { searchAll } from "@/lib/search";
import { cn } from "@/lib/utils";

type NavItem = { label: string; to: "/dashboard" | "/cases/new" | "/notes" | "/community" | "/resources" | "/settings" | "/admin"; match: string; icon: LucideIcon; adminOnly?: boolean };

const NAV: NavItem[] = [
  { label: "Home", to: "/dashboard", match: "/dashboard", icon: Home },
  { label: "Cases", to: "/cases/new", match: "/cases", icon: FolderOpen },
  { label: "Notes", to: "/notes", match: "/notes", icon: NotebookPen },
  { label: "Community", to: "/community", match: "/community", icon: UsersRound },
  { label: "Resources", to: "/resources", match: "/resources", icon: BookOpen },
  { label: "Settings", to: "/settings", match: "/settings", icon: Settings },
  { label: "Admin", to: "/admin", match: "/admin", icon: ShieldCheck, adminOnly: true },
];

const LANGS = ["EN", "FR", "DE", "IT"] as const;

function useActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (item: NavItem) => pathname === item.match || pathname.startsWith(item.match + "/");
}

export function AppShell({ children }: { children: ReactNode }) {
  const isActive = useActive();
  const { data: isAdmin = false } = useIsAdmin();
  const nav = useMemo(() => NAV.filter((item) => !item.adminOnly || isAdmin), [isAdmin]);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-navy px-4 py-6 md:flex">
        <Link to="/dashboard" className="px-2"><Logo inverted /></Link>
        <nav aria-label="Primary navigation" className="mt-10 flex flex-col gap-1">
          {nav.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground shadow-layered" : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                )}
              >
                <item.icon aria-hidden="true" className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-auto px-2 text-xs leading-relaxed text-primary-foreground/60">MedBridge does not store patient data.</p>
      </aside>

      <div className="md:pl-64">
        <TopBar />
        <div className="pb-20 md:pb-0">{children}</div>
      </div>

      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-border bg-card/95 backdrop-blur md:hidden">
        {NAV.map((item) => {
          const active = isActive(item);
          return (
            <Link key={item.label} to={item.to} aria-current={active ? "page" : undefined}
              className={cn("flex flex-col items-center gap-1 py-2 text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
              <span className={cn("grid size-8 place-items-center rounded-full", active && "bg-accent")}>
                <item.icon aria-hidden="true" className="size-5" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function TopBar() {
  const [lang, setLang] = useState<(typeof LANGS)[number]>("EN");
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur sm:px-6">
      <Link to="/dashboard" className="md:hidden" aria-label="MedBridge home"><Logo className="[&>span:last-child]:hidden sm:[&>span:last-child]:inline" /></Link>
      <TopSearch />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium hover:bg-muted" aria-label="Interface language">
          <Globe aria-hidden="true" className="size-4 text-primary" /> {lang}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {LANGS.map((l) => (
            <DropdownMenuItem key={l} onClick={() => { if (l === "EN") setLang(l); else toast("Only English is available for now."); }}>
              {l}{l === lang && " ✓"}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <AvatarMenu />
    </header>
  );
}

function TopSearch() {
  const { posts } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const q = query.trim();
  const results = useMemo(() => (q.length >= 2 ? searchAll(q, { posts }) : null), [q, posts]);
  const close = () => setQuery("");
  const empty = results && !results.symptoms.length && !results.articles.length && !results.posts.length;

  return (
    <div className="relative min-w-0 flex-1 md:max-w-xl">
      <Search aria-hidden="true" className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && close()}
        placeholder="Search symptoms, articles, community…"
        aria-label="Search MedBridge"
        className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-ring/20"
      />
      {results && (
        <div className="absolute inset-x-0 top-12 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-md">
          {empty && <p className="px-3 py-2 text-sm text-muted-foreground">No results for “{q}”.</p>}
          {results.symptoms.slice(0, 5).map((h) => (
            <button key={h.symptom.code} type="button" onClick={() => { close(); navigate({ to: "/cases/new", search: { symptom: h.symptom.term } }); }}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
              <span className="font-medium">{h.symptom.term}</span>
              <span className="text-xs text-muted-foreground">Symptom · {h.symptom.code}</span>
            </button>
          ))}
          {results.articles.slice(0, 3).map((h) => (
            <Link key={h.article.id} to="/resources" hash={h.article.id} onClick={close} className="flex justify-between gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted">
              <span className="font-medium">{h.article.title}</span>
              <span className="text-xs text-muted-foreground">Article</span>
            </Link>
          ))}
          {results.posts.slice(0, 3).map((h) => (
            <Link key={h.post.id} to="/community/$postId" params={{ postId: h.post.id }} onClick={close} className="flex justify-between gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted">
              <span className="font-medium">{h.text}</span>
              <span className="text-xs text-muted-foreground">Community</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AvatarMenu() {
  const { session } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const email = session?.user.email ?? "";
  const name = (session?.user.user_metadata?.["full_name"] as string | undefined) ?? email;
  const initials = (name || "?").slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Account menu" className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}><Settings className="size-4" /> Settings</DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await queryClient.cancelQueries();
            queryClient.clear();
            await supabase.auth.signOut();
            navigate({ to: "/login", replace: true });
          }}
        >
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
