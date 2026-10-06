import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Chip, PageShell, cardClass } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useProfile, useSaveProfile } from "@/hooks/use-profile";
import { updateStore } from "@/lib/local-store";
import { LANGUAGES, ROLES } from "@/lib/medbridge-data";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MedBridge" },
      { name: "description", content: "Manage your MedBridge profile, languages, privacy and notifications." },
      { property: "og:title", content: "Settings — MedBridge" },
      { property: "og:description", content: "Manage your MedBridge profile, languages, privacy and notifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: p } = useProfile();
  const save = useSaveProfile();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyCommunity, setNotifyCommunity] = useState(true);

  useEffect(() => {
    if (!p) return;
    setName(p.display_name);
    setRole(p.role);
    setLanguages(p.languages);
    setNotifyEmail(p.notify_email);
    setNotifyCommunity(p.notify_community);
  }, [p]);

  async function persist(values: Parameters<typeof save>[0]) {
    try {
      await save(values);
      toast.success("Saved");
    } catch {
      toast.error("Could not save. Please try again.");
    }
  }

  return (
    <PageShell eyebrow="Account" title="Settings">
      <div className="grid max-w-3xl gap-6">
        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-card-foreground">Profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="s-name">Name</Label><Input id="s-name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={p?.email ?? ""} disabled /></div>
          </div>
          <p className="mt-4 text-sm font-medium">Role</p>
          <div className="mt-2 flex flex-wrap gap-2">{ROLES.map((r) => <Chip key={r} selected={role === r} onClick={() => setRole(r)}>{r}</Chip>)}</div>
          <Button className="mt-5" onClick={() => persist({ display_name: name.trim().slice(0, 100), role })}>Save profile</Button>
        </section>

        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-card-foreground">Languages</h2>
          <p className="mt-1 text-sm text-muted-foreground">Languages you most often work with. Each case still has its own language.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {LANGUAGES.map((l) => <Chip key={l} selected={languages.includes(l)} onClick={() => setLanguages(languages.includes(l) ? languages.filter((x) => x !== l) : [...languages, l])}>{l}</Chip>)}
          </div>
          <Button className="mt-5" onClick={() => persist({ languages })}>Save languages</Button>
        </section>

        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-card-foreground">Privacy</h2>
          <p className="mt-2 text-sm font-medium text-foreground">MedBridge does not store patient data.</p>
          <p className="mt-1 text-sm text-muted-foreground">Cases and notes are kept only in this browser. Your account stores just your name, role, email and preferences.</p>
          <Button variant="outline" className="mt-5" onClick={() => { if (confirm("Remove all cases and notes from this browser?")) { updateStore((s) => ({ ...s, cases: [], notes: [] })); toast.success("Cleared from this browser"); } }}>
            Clear cases and notes from this browser
          </Button>
        </section>

        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-card-foreground">Notifications</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between"><Label htmlFor="n-email">Email updates</Label><Switch id="n-email" checked={notifyEmail} onCheckedChange={(v) => { setNotifyEmail(v); persist({ notify_email: v }); }} /></div>
            <div className="flex items-center justify-between"><Label htmlFor="n-comm">Community replies</Label><Switch id="n-comm" checked={notifyCommunity} onCheckedChange={(v) => { setNotifyCommunity(v); persist({ notify_community: v }); }} /></div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
