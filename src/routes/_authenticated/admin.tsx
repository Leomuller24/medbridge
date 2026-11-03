import { createFileRoute, redirect } from "@tanstack/react-router";
import { Check, ShieldAlert, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { AdminAccounts } from "@/components/admin-accounts";
import { PageShell, formatDate } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { type QueueItem, useReportedItems } from "@/lib/moderation-data";

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
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useReportedItems();
  const { data: warnings = [] } = useQuery({
    queryKey: ["community", "warnings"],
    queryFn: async () => (await supabase.from("community_warnings").select("user_id")).data ?? [],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["community"] });

  async function decide(item: QueueItem, decision: "remove" | "restore") {
    const table = item.kind === "post" ? "community_posts" : "community_answers";
    const col = item.kind === "post" ? "post_id" : "answer_id";
    const res = decision === "remove"
      ? await supabase.from(table).delete().eq("id", item.id)
      : await supabase.from("community_reports").delete().eq(col, item.id).then(() => supabase.from(table).update({ status: "visible" }).eq("id", item.id));
    if (res.error) return void toast.error(res.error.message);
    await supabase.from("community_mod_log").insert({ item_kind: item.kind, item_id: item.id, author_id: item.authorId, excerpt: item.text.slice(0, 200), decision, reason: decision === "remove" ? "Removed by an admin." : "Approved by an admin.", decided_by: "admin" });
    toast.success(decision === "remove" ? "Removed" : "Approved");
    await refresh();
  }

  async function warn(item: QueueItem) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("community_warnings").insert({ user_id: item.authorId, item_id: item.id, created_by: u.user.id });
    if (error) return void toast.error(error.message);
    toast.success(`Warning recorded for ${item.author}`);
    await refresh();
  }

  return (
    <PageShell eyebrow="Admin" title="Accounts and reports">
      <AdminAccounts />
      <h2 className="mt-10 mb-3 text-lg font-semibold text-navy">Reported items</h2>
      <div className="space-y-4">
        {isLoading && <p className="card text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && items.length === 0 && <p className="card text-sm text-muted-foreground">No reported posts or comments.</p>}
        {items.map((item) => {
          const counts = item.reports.reduce<Record<string, number>>((a, r) => ({ ...a, [r.reason]: (a[r.reason] ?? 0) + 1 }), {});
          const warned = warnings.filter((w) => w.user_id === item.authorId).length;
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
