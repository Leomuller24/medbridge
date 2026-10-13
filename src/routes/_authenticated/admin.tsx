import { createFileRoute, redirect } from "@tanstack/react-router";
import { Check, ShieldAlert, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { PageShell, formatDate } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { updateStore, useStore } from "@/lib/local-store";
import { applyDecision, reportedItems, type QueueItem } from "@/lib/reports";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/login" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Admin: reported items — MedBridge" },
      { name: "description", content: "Admin review of reported community posts and comments." },
      { property: "og:title", content: "Admin: reported items — MedBridge" },
      { property: "og:description", content: "Admin review of reported community posts and comments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { posts, warnings } = useStore();
  const items = reportedItems(posts);

  function decide(item: QueueItem, decision: "remove" | "restore") {
    updateStore((s) => ({
      ...s,
      posts: applyDecision(s.posts, item, decision),
      modLog: [{ id: item.id, kind: item.kind, text: item.text.slice(0, 200), author: item.author, decision, reason: decision === "remove" ? "Removed by an admin." : "Approved by an admin.", at: new Date().toISOString() }, ...s.modLog].slice(0, 100),
    }));
    toast.success(decision === "remove" ? "Removed" : "Approved");
  }

  function warn(item: QueueItem) {
    updateStore((s) => ({ ...s, warnings: [{ author: item.author, itemId: item.id, at: new Date().toISOString() }, ...s.warnings] }));
    toast.success(`Warning recorded for ${item.author}`);
  }

  return (
    <PageShell eyebrow="Admin" title="Reported items">
      <div className="space-y-4">
        {items.length === 0 && <p className="card text-sm text-muted-foreground">No reported posts or comments.</p>}
        {items.map((item) => {
          const counts = item.reports.reduce<Record<string, number>>((a, r) => ({ ...a, [r.reason]: (a[r.reason] ?? 0) + 1 }), {});
          const warned = warnings.filter((w) => w.author === item.author).length;
          return (
            <article key={item.id} className="card">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-destructive"><ShieldAlert className="size-4" /> {item.kind} · {item.reports.length} {item.reports.length === 1 ? "report" : "reports"}</p>
              <p className="mt-2 font-semibold text-navy">{item.text}</p>
              <p className="text-xs text-muted-foreground">by {item.author}{warned ? ` · warned ${warned}×` : ""} · last report {formatDate(item.reports.at(-1)?.at ?? "")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(counts).map(([reason, n]) => <span key={reason} className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">{reason} × {n}</span>)}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => decide(item, "restore")}><Check aria-hidden="true" /> Approve</Button>
                <Button variant="destructive" onClick={() => decide(item, "remove")}><Trash2 aria-hidden="true" /> Remove</Button>
                <Button variant="secondary" onClick={() => warn(item)}><TriangleAlert aria-hidden="true" /> Warn user</Button>
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}
