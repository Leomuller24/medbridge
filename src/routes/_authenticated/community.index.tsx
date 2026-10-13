import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, Pin, Search, ShieldCheck, ThumbsUp, Users } from "lucide-react";
import { useState } from "react";

import { PageShell, formatDate } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { ReportButton } from "@/components/report-button";
import { updateStore, useStore } from "@/lib/local-store";
import { addReport } from "@/lib/reports";
import { COMMUNITY_CATEGORIES } from "@/lib/medbridge-data";

export const Route = createFileRoute("/_authenticated/community/")({
  head: () => ({
    meta: [
      { title: "Community — MedBridge" },
      { name: "description", content: "Share communication experiences with other MedBridge providers." },
      { property: "og:title", content: "Community — MedBridge" },
      { property: "og:description", content: "Share communication experiences with other MedBridge providers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunityPage,
});

const countReplies = (r: { replies?: unknown[] }[]): number => r.reduce((n, x) => n + 1 + countReplies((x.replies as never) ?? []), 0);

const ROLES = ["Doctor", "Nurse", "Interpreter", "Midwife"] as const;
const roleFor = (author: string) => ROLES[author.length % ROLES.length];
const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const GUIDELINES = [
  "Never include names or identifying patient details.",
  "Share what helped you communicate — experiences, not diagnoses.",
  "Be respectful of cultures, languages and colleagues.",
  "To post, mark a note as Shared in Notes and choose Share to Community.",
];

function CommunityPage() {
  const { posts, cases } = useStore();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list = posts.filter((p) => !p.hidden && (cat === "All" || p.category === cat) && (!query || `${p.title} ${p.body}`.toLowerCase().includes(query)));

  return (
    <PageShell eyebrow="Community" title="Learn from colleagues">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {/* Pinned start here */}
          <section className="card relative overflow-hidden border-primary/30 bg-accent">
            <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-aqua/20 blur-3xl" />
            <p className="relative flex items-center gap-2 text-sm font-semibold text-primary"><Pin aria-hidden="true" className="size-4" /> Start here</p>
            <p className="relative mt-2 text-sm leading-6 text-navy">Share what helped you communicate. Never include names or identifying patient details. To post, mark a note as Shared in Notes and select Share to Community.</p>
          </section>

          {/* Tabs + search */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div role="tablist" aria-label="Categories" className="flex flex-wrap gap-2">
              {COMMUNITY_CATEGORIES.map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={cat === c}
                  onClick={() => setCat(c)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${cat === c ? "bg-primary text-primary-foreground shadow-card" : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-72">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input aria-label="Search posts" placeholder="Search posts" className="rounded-full pl-10" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>

          {/* Post cards */}
          <div className="mt-6 space-y-4">
            {list.length === 0 && <p className="text-muted-foreground">No posts found.</p>}
            {list.map((p) => {
              const related = cases.filter((c) => c.language === p.language);
              const role = roleFor(p.author);
              return (
                <article key={p.id} className="card">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-aqua text-sm font-bold text-white">{initials(p.author)}</span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-navy">
                        {p.author}
                        <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-primary">{role}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
                    </div>
                  </div>

                  <Link to="/community/$postId" params={{ postId: p.id }} className="mt-3 block text-lg font-semibold text-navy hover:text-primary">{p.title}</Link>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">{p.body}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{p.category}</span>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{p.language}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-border pt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><ThumbsUp aria-hidden="true" className="size-4 text-primary" /> {p.helpful} helpful</span>
                    <span className="flex items-center gap-1.5"><MessageSquare aria-hidden="true" className="size-4 text-primary" /> {countReplies(p.replies)} replies</span>
                    {related.length > 0 && (
                      <span>Related cases: {related.map((c) => (
                        <Link key={c.id} to="/cases/$caseId" params={{ caseId: c.id }} className="ml-1 font-medium text-primary hover:underline">{c.code}</Link>
                      ))}</span>
                    )}
                    <span className="ml-auto"><ReportButton targetId={p.id} label="post" onReport={(r) => updateStore((s) => ({ ...s, posts: s.posts.map((x) => (x.id === p.id ? addReport(x, r) : x)) }))} /></span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="card">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy"><ShieldCheck aria-hidden="true" className="size-4 text-primary" /> Community guidelines</p>
            <ul className="mt-3 space-y-2.5">
              {GUIDELINES.map((g) => (
                <li key={g} className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-aqua" /> {g}
                </li>
              ))}
            </ul>
          </section>
          <section className="card bg-secondary/60">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy"><Users aria-hidden="true" className="size-4 text-primary" /> Privacy reminder</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Posts stay in your own browser in this version. MedBridge does not store patient data.</p>
            <Link to="/moderation" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">AI moderation</Link>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
