import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft, Bot, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageShell, formatDate } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { useAiReview } from "@/hooks/use-ai-review";
import { supabase } from "@/integrations/supabase/client";
import { type QueueItem, useModLog, useReportedItems } from "@/lib/moderation-data";

export const Route = createFileRoute("/_authenticated/moderation")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/login" });
    const { data: ok } = await supabase.rpc("is_community_moderator", { _user_id: u.user.id });
    if (!ok) throw redirect({ to: "/community" });
  },
  head: () => ({
    meta: [
      { title: "Moderation — MedBridge" },
      { name: "description", content: "Moderator review of reported community posts and answers." },
      { property: "og:title", content: "Moderation — MedBridge" },
      { property: "og:description", content: "Moderator review of reported community posts and answers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ModerationPage,
});

function ModerationPage() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useReportedItems();
  const modLog = useModLog().data ?? [];
  const review = useAiReview();
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(item: QueueItem, hide: boolean) {
    setBusy(item.id);
    const table = item.kind === "post" ? "community_posts" : "community_answers";
    const col = item.kind === "post" ? "post_id" : "answer_id";
    // Server rules: only moderators may change status or clear reports.
    if (!hide) await supabase.from("community_reports").delete().eq(col, item.id);
    const { error } = await supabase.from(table).update({ status: hide ? "hidden" : "visible" }).eq("id", item.id);
    if (error) toast.error(error.message);
    else {
      await supabase.from("community_mod_log").insert({ item_kind: item.kind, item_id: item.id, author_id: item.authorId, excerpt: item.text.slice(0, 200), decision: hide ? "remove" : "restore", reason: hide ? "Hidden by a moderator." : "Restored by a moderator.", decided_by: "moderator" });
      toast.success(hide ? "Hidden" : "Restored");
    }
    await qc.invalidateQueries({ queryKey: ["community"] });
    setBusy(null);
  }

  async function ai(item: QueueItem) {
    setBusy(item.id);
    await review(item.kind, item.id);
    setBusy(null);
  }

  return (
    <PageShell eyebrow="Community" title="Moderation">
      <Link to="/community" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" /> Back to feed</Link>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">Reported posts and answers. Items with 3 reports are hidden automatically and can be reviewed by the AI moderator. You can hide or restore any reported item.</p>

      <h2 className="mt-8 text-lg font-semibold text-navy">Reported items</h2>
      <div className="mt-3 space-y-4">
        {isLoading && <p className="card text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && items.length === 0 && <p className="card text-sm text-muted-foreground">Nothing reported.</p>}
        {items.map((item) => (
          <article key={item.id} className="card">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-destructive"><ShieldAlert className="size-4" /> {item.status === "hidden" ? "Hidden" : "Visible"} {item.kind} · {item.reports.length} {item.reports.length === 1 ? "report" : "reports"}</p>
            <p className="mt-2 font-semibold text-navy">{item.text}</p>
            <p className="text-xs text-muted-foreground">by {item.author} · reasons: {[...new Set(item.reports.map((r) => r.reason))].join(", ")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {item.status !== "hidden"
                ? <Button variant="destructive" disabled={busy === item.id} onClick={() => setStatus(item, true)}><EyeOff aria-hidden="true" /> Hide</Button>
                : <Button variant="outline" disabled={busy === item.id} onClick={() => ai(item)}><Bot aria-hidden="true" /> Ask AI to review</Button>}
              <Button variant="outline" disabled={busy === item.id} onClick={() => setStatus(item, false)}><Eye aria-hidden="true" /> Restore</Button>
            </div>
          </article>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-navy">Decisions</h2>
      <div className="mt-3 space-y-4">
        {modLog.length === 0 && <p className="card text-sm text-muted-foreground">No decisions yet.</p>}
        {modLog.map((e) => (
          <article key={e.id} className="card">
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className={`rounded-full px-3 py-1 font-semibold ${e.decision === "remove" ? "bg-destructive/10 text-destructive" : "bg-accent text-primary"}`}>{e.decision === "remove" ? (e.decided_by === "ai" ? "Removed" : "Hidden") : "Restored"}</span>
              {e.item_kind} · {e.decided_by === "ai" ? "AI" : e.decided_by} · {formatDate(e.created_at)}
            </p>
            <p className="mt-2 font-medium text-navy">{e.excerpt}</p>
            <p className="mt-1 text-sm text-muted-foreground">{e.reason}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
