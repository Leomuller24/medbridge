import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bot, ShieldAlert } from "lucide-react";
import { useState } from "react";

import { PageShell, formatDate } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { useAiReview } from "@/hooks/use-ai-review";
import { useStore } from "@/lib/local-store";
import { moderationQueue } from "@/lib/reports";

export const Route = createFileRoute("/_authenticated/moderation")({
  head: () => ({
    meta: [
      { title: "AI moderation — MedBridge" },
      { name: "description", content: "How the MedBridge AI moderator handled reported posts and comments." },
      { property: "og:title", content: "AI moderation — MedBridge" },
      { property: "og:description", content: "How the MedBridge AI moderator handled reported posts and comments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ModerationPage,
});

function ModerationPage() {
  const { posts, modLog } = useStore();
  const queue = moderationQueue(posts);
  const review = useAiReview();
  const [busy, setBusy] = useState<string | null>(null);

  async function retry(id: string) {
    setBusy(id);
    await review(id);
    setBusy(null);
  }

  return (
    <PageShell eyebrow="Community" title="AI moderation">
      <Link to="/community" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" /> Back to feed</Link>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">Posts and comments with 3 reports are hidden and reviewed by an AI moderator, which removes them or restores them with a short reason.</p>

      <h2 className="mt-8 text-lg font-semibold text-navy">Waiting for review</h2>
      <div className="mt-3 space-y-4">
        {queue.length === 0 && <p className="card text-sm text-muted-foreground">Nothing waiting.</p>}
        {queue.map((item) => (
          <article key={item.id} className="card">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-destructive"><ShieldAlert className="size-4" /> Hidden {item.kind} · {item.reports.length} reports</p>
            <p className="mt-2 font-semibold text-navy">{item.text}</p>
            <Button className="mt-4" variant="outline" disabled={busy === item.id} onClick={() => retry(item.id)}>
              <Bot aria-hidden="true" /> {busy === item.id ? "Reviewing…" : "Ask AI to review"}
            </Button>
          </article>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-navy">AI decisions</h2>
      <div className="mt-3 space-y-4">
        {modLog.length === 0 && <p className="card text-sm text-muted-foreground">No decisions yet.</p>}
        {modLog.map((e) => (
          <article key={`${e.id}-${e.at}`} className="card">
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className={`rounded-full px-3 py-1 font-semibold ${e.decision === "remove" ? "bg-destructive/10 text-destructive" : "bg-accent text-primary"}`}>{e.decision === "remove" ? "Removed" : "Restored"}</span>
              {e.kind} by {e.author} · {formatDate(e.at)}
            </p>
            <p className="mt-2 font-medium text-navy">{e.text}</p>
            <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground"><Bot aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" /> {e.reason}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
