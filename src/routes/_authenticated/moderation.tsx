import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { updateStore, useStore } from "@/lib/local-store";
import { moderationQueue, removeReply, setReplyHidden, type QueueItem } from "@/lib/reports";

export const Route = createFileRoute("/_authenticated/moderation")({
  head: () => ({
    meta: [
      { title: "Moderation queue — MedBridge" },
      { name: "description", content: "Review community posts and comments hidden after reports." },
      { property: "og:title", content: "Moderation queue — MedBridge" },
      { property: "og:description", content: "Review community posts and comments hidden after reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ModerationPage,
});

function ModerationPage() {
  const { posts } = useStore();
  const queue = moderationQueue(posts);

  function restore(item: QueueItem) {
    updateStore((s) => ({
      ...s,
      posts: s.posts.map((p) => (p.id !== item.postId ? p : item.kind === "post" ? { ...p, hidden: false, reports: [] } : { ...p, replies: setReplyHidden(p.replies, item.id, false) })),
    }));
    toast.success("Restored");
  }

  function remove(item: QueueItem) {
    updateStore((s) => ({
      ...s,
      posts: item.kind === "post" ? s.posts.filter((p) => p.id !== item.id) : s.posts.map((p) => (p.id === item.postId ? { ...p, replies: removeReply(p.replies, item.id) } : p)),
    }));
    toast.success("Removed");
  }

  return (
    <PageShell eyebrow="Community" title="Moderation queue">
      <Link to="/community" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" /> Back to feed</Link>
      <div className="mt-6 space-y-4">
        {queue.length === 0 && <p className="card text-muted-foreground">Nothing to review. Posts and comments appear here once they receive 3 reports.</p>}
        {queue.map((item) => {
          const counts = item.reports.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.reason]: (acc[r.reason] ?? 0) + 1 }), {});
          return (
            <article key={item.id} className="card">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-destructive"><ShieldAlert className="size-4" /> Hidden {item.kind} · {item.reports.length} reports</p>
              <p className="mt-2 font-semibold text-navy">{item.text}</p>
              <p className="text-xs text-muted-foreground">by {item.author}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(counts).map(([reason, n]) => <span key={reason} className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">{reason} × {n}</span>)}
              </div>
              <div className="mt-4 flex gap-3">
                <Button variant="outline" onClick={() => restore(item)}>Restore</Button>
                <Button variant="destructive" onClick={() => remove(item)}>Remove</Button>
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}
