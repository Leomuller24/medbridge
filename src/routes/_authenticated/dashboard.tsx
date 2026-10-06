import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Languages, NotebookPen, Pin, Plus, UsersRound } from "lucide-react";
import { useEffect } from "react";

import { PageShell, cardClass, formatDate } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";
import { useStore } from "@/lib/local-store";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Home — MedBridge" },
      { name: "description", content: "Your MedBridge dashboard with recent cases and quick access to tools." },
      { property: "og:title", content: "Home — MedBridge" },
      { property: "og:description", content: "Your MedBridge dashboard with recent cases and quick access to tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const tiles = [
  { to: "/cases/new" as const, icon: Languages, title: "Symptom Translation", text: "Build a briefing card for a patient's symptoms." },
  { to: "/notes" as const, icon: NotebookPen, title: "Patient Notes", text: "Notes, timelines and red flags by case." },
  { to: "/community" as const, icon: UsersRound, title: "Community", text: "Learn from colleagues' experiences." },
  { to: "/resources" as const, icon: BookOpen, title: "Resources", text: "Guides for culturally aware communication." },
];

function Dashboard() {
  const { data: profile, isLoading } = useProfile();
  const { cases } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarded) navigate({ to: "/onboarding", replace: true });
  }, [isLoading, profile, navigate]);

  const name = profile?.display_name?.split(" ")[0];
  const recent = [...cases].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <PageShell
      eyebrow="Home"
      title={name ? `Good to see you, ${name}` : "Welcome to MedBridge"}
      actions={<Button asChild size="lg"><Link to="/cases/new"><Plus aria-hidden="true" /> New Case</Link></Button>}
    >
      <section className={`${cardClass} border-primary/30 bg-accent`}>
        <p className="flex items-center gap-2 text-sm font-semibold text-accent-foreground"><Pin aria-hidden="true" className="size-4" /> Start here</p>
        <ol className="mt-3 grid gap-2 text-sm text-accent-foreground sm:grid-cols-3">
          <li>1. Select New Case and set the patient's language.</li>
          <li>2. Pick symptoms to see a briefing card with context.</li>
          <li>3. Save the card to Notes or print a handover summary.</li>
        </ol>
      </section>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ to, icon: Icon, title, text }) => (
          <Link key={title} to={to} className={`${cardClass} transition-shadow hover:shadow-md`}>
            <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon aria-hidden="true" className="size-5" /></span>
            <h2 className="mt-4 font-semibold text-card-foreground">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
          </Link>
        ))}
      </div>

      <section className={`${cardClass} mt-8`}>
        <h2 className="text-lg font-semibold text-card-foreground">Recent cases</h2>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No cases yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {recent.map((c) => (
              <li key={c.id}>
                <Link to="/cases/$caseId" params={{ caseId: c.id }} className="flex items-center justify-between gap-4 py-3 hover:text-primary">
                  <span className="font-medium">{c.code}</span>
                  <span className="text-sm text-muted-foreground">{c.language}</span>
                  <span className="text-sm text-muted-foreground">{formatDate(c.date)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">Cases are kept only in this browser. MedBridge does not store patient data.</p>
      </section>
    </PageShell>
  );
}
