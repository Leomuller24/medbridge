import { useState, type ReactNode } from "react";
import { Clock } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useSaveProfile } from "@/hooks/use-profile";
import { useCanPost } from "@/lib/community";

/** Kept for compatibility; approved providers never see it. */
export function PendingNotice() {
  return null;
}

/**
 * Only approved providers see Community pages. The database also refuses
 * Community content to anyone else; this only decides what page to show.
 */
export function ProviderGate({ children }: { children: ReactNode }) {
  const { data: canPost, isLoading } = useCanPost();
  const { data: profile } = useProfile();
  if (isLoading) return <PageShell eyebrow="Community" title="Community"><p className="card text-sm text-muted-foreground">Loading…</p></PageShell>;
  if (canPost) return <>{children}</>;
  const incomplete = !!profile && (!profile.role?.trim() || !profile.institution?.trim());
  return (
    <PageShell eyebrow="Community" title="Account check">
      <div className="card flex max-w-2xl items-start gap-3 border-amber/40 bg-amber/10 text-navy">
        <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <p>Your account is being checked. You will be able to read and post once it is approved.</p>
      </div>
      {incomplete && <CompleteProfile profession={profile.role ?? ""} institution={profile.institution ?? ""} />}
    </PageShell>
  );
}

function CompleteProfile(props: { profession: string; institution: string }) {
  const save = useSaveProfile();
  const [profession, setProfession] = useState(props.profession);
  const [institution, setInstitution] = useState(props.institution);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!profession.trim() || !institution.trim()) return void toast.error("Please fill in both fields.");
    setBusy(true);
    try {
      await save({ role: profession.trim().slice(0, 60), institution: institution.trim().slice(0, 120) });
      toast.success("Thank you. Your account is now waiting for approval.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="card mt-6 max-w-2xl space-y-4">
      <p className="text-sm text-navy">Before an admin can check your account, please tell us your profession and institution.</p>
      <div className="space-y-2"><Label htmlFor="gate-prof">Profession</Label><Input id="gate-prof" value={profession} onChange={(e) => setProfession(e.target.value)} maxLength={60} required /></div>
      <div className="space-y-2"><Label htmlFor="gate-inst">Institution</Label><Input id="gate-inst" value={institution} onChange={(e) => setInstitution(e.target.value)} maxLength={120} required /></div>
      <Button type="submit" disabled={busy}>Save</Button>
    </form>
  );
}
