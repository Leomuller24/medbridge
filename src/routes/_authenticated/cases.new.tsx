import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";

import { PageShell, cardClass } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { newId, updateStore } from "@/lib/local-store";
import { LANGUAGES } from "@/lib/medbridge-data";

export const Route = createFileRoute("/_authenticated/cases/new")({
  head: () => ({
    meta: [
      { title: "New case — MedBridge" },
      { name: "description", content: "Start a new MedBridge case and set the patient's language." },
      { property: "og:title", content: "New case — MedBridge" },
      { property: "og:description", content: "Start a new MedBridge case and set the patient's language." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewCase,
});

function NewCase() {
  const navigate = useNavigate();
  const [code, setCode] = useState(`CASE-${Math.random().toString(36).slice(2, 5).toUpperCase()}`);
  const [language, setLanguage] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!language || !code.trim()) return;
    const id = newId();
    updateStore((s) => ({ ...s, cases: [{ id, code: code.trim().slice(0, 40), language, date: new Date().toISOString().slice(0, 10), symptoms: [], redFlags: [] }, ...s.cases] }));
    navigate({ to: "/cases/$caseId", params: { caseId: id } });
  }

  return (
    <PageShell eyebrow="Symptom Translation" title="New case">
      <form onSubmit={submit} className={`${cardClass} max-w-xl space-y-6 p-8`}>
        <div className="space-y-2">
          <Label htmlFor="code">Case code</Label>
          <Input id="code" value={code} maxLength={40} onChange={(e) => setCode(e.target.value)} />
          <p className="text-xs text-muted-foreground">Use a code, never the patient's real name.</p>
        </div>
        <div className="space-y-2">
          <Label>Patient's language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger><SelectValue placeholder="Choose a language" /></SelectTrigger>
            <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Language is set for each case, not for your account.</p>
        </div>
        <Button type="submit" size="lg" disabled={!language}>Open briefing</Button>
      </form>
    </PageShell>
  );
}
