import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, Pin, Search, ThumbsUp } from "lucide-react";
import { useState } from "react";

import { PageShell, cardClass, formatDate } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/local-store";
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

function CommunityPage() {
  const { posts, cases } = useStore();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list = posts.filter((p) => (cat === "All" || p.category === cat) && (!query || `${p.title} ${p.body}`.toLowerCase().includes(query)));

  return (
    <PageShell eyebrow="Community" title="Learn from colleagues">
      <section className={`${cardClass} border-primary/30 bg-accent`}>
        <p className="flex items-center gap-2 text-sm font-semibold text-accent-foreground"><Pin aria-hidden="true" className="size-4" /> Start here</p>
        <p className="mt-2 text-sm text-accent-foreground">Share what helped you communicate. Never include names or identifying patient details. To post, mark a note as Shared in Notes and select Share to Community.</p>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Tabs value={cat} onValueChange={setCat}>
          <TabsList>{COMMUNITY_CATEGORIES.map((c) => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}</TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search posts" placeholder="Search posts" className="pl-10" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {list.length === 0 && <p className="text-muted-foreground">No posts found.</p>}
        {list.map((p) => {
          const related = cases.filter((c) => c.language === p.language);
          return (
            <article key={p.id} className={cardClass}>
              <p className="text-xs text-muted-foreground">{p.category} · {p.author} · {formatDate(p.createdAt)}</p>
              <Link to="/community/$postId" params={{ postId: p.id }} className="mt-1 block text-lg font-semibold text-card-foreground hover:text-primary">{p.title}</Link>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.body}</p>
              <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><ThumbsUp className="size-4" /> {p.helpful} helpful</span>
                <span className="flex items-center gap-1"><MessageSquare className="size-4" /> {countReplies(p.replies)} replies</span>
                {related.length > 0 && (
                  <span>Related cases: {related.map((c) => (
                    <Link key={c.id} to="/cases/$caseId" params={{ caseId: c.id }} className="ml-1 font-medium text-primary hover:underline">{c.code}</Link>
                  ))}</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}
