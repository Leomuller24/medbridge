import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cardClass } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount } from "@/lib/account.functions";

export function MyDataCard() {
  const del = useServerFn(deleteMyAccount);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function exportData() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const [posts, answers, votes] = await Promise.all([
      supabase.from("community_posts").select("id, category, title, body, language, source, status, created_at").eq("author_id", u.user.id),
      supabase.from("community_answers").select("id, post_id, parent_id, body, status, created_at").eq("author_id", u.user.id),
      supabase.from("community_votes").select("post_id, answer_id, created_at").eq("voter_id", u.user.id),
    ]);
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), posts: posts.data ?? [], answers: answers.data ?? [], helpful_votes: votes.data ?? [] }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "medbridge-my-community-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function deleteAll() {
    if (!confirm("Delete your account and all your community posts, answers and votes? This cannot be undone.")) return;
    setBusy(true);
    try {
      await del();
      await qc.cancelQueries();
      qc.clear();
      await supabase.auth.signOut();
      toast.success("Your account and content were deleted.");
      navigate({ to: "/", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the account.");
      setBusy(false);
    }
  }

  return (
    <section className={cardClass}>
      <h2 className="text-lg font-semibold text-card-foreground">Your data</h2>
      <p className="mt-1 text-sm text-muted-foreground">Download everything you posted, answered or voted on in the Community, or delete your account with all of it.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="outline" onClick={exportData}><Download aria-hidden="true" /> Export my posts</Button>
        <Button variant="destructive" disabled={busy} onClick={deleteAll}><Trash2 aria-hidden="true" /> Delete my account and content</Button>
      </div>
    </section>
  );
}
