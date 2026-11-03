import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ShieldCheck, UserCheck, X } from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "moderator";

/** Admin-only: approve or reject pending providers and assign admin/moderator. All checks run in the database. */
export function AdminAccounts() {
  const qc = useQueryClient();
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_accounts");
      if (error) throw error;
      return data ?? [];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-accounts"] });

  async function review(id: string, approve: boolean) {
    const { error } = await supabase.rpc("admin_review_provider", { _user_id: id, _approve: approve });
    if (error) return void toast.error(error.message);
    toast.success(approve ? "Approved as provider" : "Rejected");
    await refresh();
  }

  async function setRole(id: string, role: Role, grant: boolean) {
    const { error } = await supabase.rpc("admin_set_role", { _user_id: id, _role: role, _grant: grant });
    if (error) return void toast.error(error.message);
    toast.success(grant ? `Made ${role}` : `Removed ${role}`);
    await refresh();
  }

  const pending = accounts.filter((a) => a.roles.includes("pending_provider"));
  const others = accounts.filter((a) => !a.roles.includes("pending_provider"));

  const domain = (email: string) => (email.includes("@") ? email.split("@").pop() : "unknown");
  const who = (a: (typeof accounts)[number]) => (
    <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
      <dt className="text-muted-foreground">Name</dt><dd className="font-semibold text-navy">{a.display_name || "No name"}</dd>
      <dt className="text-muted-foreground">Profession</dt><dd className="text-navy">{a.profession || "Not given"}</dd>
      <dt className="text-muted-foreground">Institution</dt><dd className="text-navy">{a.institution || "Not given"}</dd>
      <dt className="text-muted-foreground">Email domain</dt><dd className="text-navy">@{domain(a.email)}</dd>
      <dt className="text-muted-foreground">Signed up</dt><dd className="text-navy">{formatDate(a.created_at)}</dd>
    </dl>
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-navy"><UserCheck aria-hidden="true" className="size-5 text-primary" /> Pending accounts</h2>
        <div className="mt-3 space-y-3">
          {isLoading && <p className="card text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && pending.length === 0 && <p className="card text-sm text-muted-foreground">No accounts waiting for approval.</p>}
          {pending.map((a) => (
            <article key={a.user_id} className="card">
              {who(a)}
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => review(a.user_id, true)}><Check aria-hidden="true" /> Approve as provider</Button>
                <Button variant="outline" onClick={() => review(a.user_id, false)}><X aria-hidden="true" /> Reject</Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-navy"><ShieldCheck aria-hidden="true" className="size-5 text-primary" /> Accounts and roles</h2>
        <div className="mt-3 space-y-3">
          {others.map((a) => (
            <article key={a.user_id} className="card">
              {who(a)}
              <p className="mt-2 flex flex-wrap gap-2">
                {(a.roles.length ? a.roles : ["no role (rejected)"]).map((r) => <span key={r} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">{r.replace("_", " ")}</span>)}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {(["moderator", "admin"] as const).map((r) => {
                  const has = a.roles.includes(r);
                  return <Button key={r} variant="outline" size="sm" onClick={() => setRole(a.user_id, r, !has)}>{has ? `Remove ${r}` : `Make ${r}`}</Button>;
                })}
                {!a.roles.includes("provider") && <Button variant="outline" size="sm" onClick={() => review(a.user_id, true)}>Approve as provider</Button>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
