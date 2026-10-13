import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Flag,
  Languages,
  NotebookPen,
  Plus,
  ThumbsUp,
  TriangleAlert,
  UsersRound,
} from "lucide-react";
import { useEffect } from "react";

import { GlobalSearch } from "@/components/global-search";
import { PageShell, cardClass, formatDate } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";
import { useStore } from "@/lib/local-store";
import { ARTICLES } from "@/lib/medbridge-data";

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

const LANG_CHIP: Record<string, string> = {
  Arabic: "bg-accent text-primary",
  Tigrinya: "bg-secondary text-primary",
  Albanian: "bg-accent text-primary",
  Turkish: "bg-secondary text-primary",
  Ukrainian: "bg-accent text-primary",
};

function Dashboard() {
  const { data: profile, isLoading } = useProfile();
  const { cases, notes, posts: allPosts } = useStore();
  const posts = allPosts.filter((p) => !p.hidden);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarded) navigate({ to: "/onboarding", replace: true });
  }, [isLoading, profile, navigate]);

  const name = profile?.display_name?.split(" ")[0];
  const recent = [...cases].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const flagCount = cases.reduce((n, c) => n + c.redFlags.length, 0);
  const languages = new Set(cases.map((c) => c.language)).size;
  const topPosts = [...posts].sort((a, b) => b.helpful - a.helpful).slice(0, 3);
  const featured = ARTICLES.slice(0, 3);

  const stats = [
    { icon: NotebookPen, label: "Active cases", value: cases.length, hint: "Kept in this browser" },
    { icon: Languages, label: "Patient languages", value: languages, hint: "Across your cases" },
    { icon: TriangleAlert, label: "Red flags", value: flagCount, hint: "To keep in mind" },
    { icon: UsersRound, label: "Community posts", value: posts.length, hint: "From colleagues" },
  ];

  return (
    <PageShell
      top={<GlobalSearch onSelectSymptom={(symptom) => navigate({ to: "/cases/new", search: { symptom } })} />}
    >
      {/* Greeting banner */}
      <section className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#0B2545] via-[#13315C] to-[#1D7FA8] p-8 text-white shadow-layered sm:p-10">
        <div className="dots pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-[#3CC8C0]/25 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-[#3CC8C0]">Home</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {name ? `Good to see you, ${name}` : "Welcome to MedBridge"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Pick up a recent case, build a briefing card, or see what colleagues are discussing. MedBridge is
              informational only and is not medical advice.
            </p>
          </div>
          <Button asChild size="lg" className="shadow-lg">
            <Link to="/cases/new"><Plus aria-hidden="true" /> New Case</Link>
          </Button>
        </div>
      </section>

      {/* Stat cards */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, hint }) => (
          <div key={label} className={cardClass}>
            <span className="grid size-10 place-items-center rounded-full bg-accent text-primary"><Icon aria-hidden="true" className="size-5" /></span>
            <p className="mt-4 text-3xl font-bold text-card-foreground">{value}</p>
            <p className="mt-1 text-sm font-medium text-card-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ to, icon: Icon, title, text }) => (
          <Link key={title} to={to} className={`${cardClass} group`}>
            <span className="grid size-10 place-items-center rounded-full bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Icon aria-hidden="true" className="size-5" /></span>
            <h2 className="mt-4 font-semibold text-card-foreground">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
          </Link>
        ))}
      </div>

      {/* Recent cases + red flags */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <section className={`${cardClass} lg:col-span-2`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">Recent cases</h2>
            <Link to="/cases/new" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              New case <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No cases yet. Start one with New Case.</p>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {recent.map((c) => (
                <li key={c.id}>
                  <Link to="/cases/$caseId" params={{ caseId: c.id }} className="flex flex-wrap items-center gap-3 py-3.5 hover:text-primary">
                    <span
                      aria-hidden="true"
                      className={`size-2.5 shrink-0 rounded-full ${c.redFlags.length > 0 ? "bg-destructive" : "bg-[#3CC8C0]"}`}
                      title={c.redFlags.length > 0 ? "Has red flags" : "No red flags"}
                    />
                    <span className="font-medium">{c.code}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${LANG_CHIP[c.language] ?? "bg-secondary text-primary"}`}>{c.language}</span>
                    <span className="text-sm text-muted-foreground">{c.symptoms.length} symptom{c.symptoms.length === 1 ? "" : "s"}</span>
                    <span className="ml-auto text-sm text-muted-foreground">{formatDate(c.date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Cases are kept only in this browser. MedBridge does not store patient data.</p>
        </section>

        <section className={`${cardClass} border-destructive/30 bg-destructive/5`}>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
            <span className="grid size-8 place-items-center rounded-full bg-destructive/15 text-destructive"><Flag aria-hidden="true" className="size-4" /></span>
            Red flags
          </h2>
          {flagCount === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No red flags recorded across your cases.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {cases.filter((c) => c.redFlags.length > 0).slice(0, 4).map((c) => (
                <li key={c.id}>
                  <Link to="/cases/$caseId" params={{ caseId: c.id }} className="block rounded-xl border border-destructive/20 bg-card p-3 transition-shadow hover:shadow-md">
                    <p className="text-sm font-medium text-card-foreground">{c.code} · {c.language}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{c.redFlags[0]}{c.redFlags.length > 1 ? ` (+${c.redFlags.length - 1} more)` : ""}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Reminders to discuss with the care team — never a diagnosis.</p>
        </section>
      </div>

      {/* Community highlights + featured resources */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">Community highlights</h2>
            <Link to="/community" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <ul className="mt-2 divide-y divide-border">
            {topPosts.map((p) => (
              <li key={p.id}>
                <Link to="/community/$postId" params={{ postId: p.id }} className="block py-3.5 hover:text-primary">
                  <p className="font-medium leading-6">{p.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-primary">{p.category}</span>
                    <span className="inline-flex items-center gap-1"><ThumbsUp aria-hidden="true" className="size-3.5" /> {p.helpful} helpful</span>
                    <span>{p.replies.length} replies</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">Featured resources</h2>
            <Link to="/resources" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              All resources <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {featured.map((a) => (
              <Link key={a.id} to="/resources" hash={a.id} className="flex items-start gap-3 rounded-xl border border-border bg-secondary/50 p-4 transition-shadow hover:shadow-md">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-primary"><BookOpen aria-hidden="true" className="size-4" /></span>
                <span>
                  <span className="block text-sm font-medium text-card-foreground">{a.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{a.summary}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
