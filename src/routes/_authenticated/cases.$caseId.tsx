import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Flag, Languages, Printer, Save, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageShell, formatDate } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/global-search";
import { newId, updateStore, useStore } from "@/lib/local-store";
import { type Briefing, getBriefing } from "@/lib/medbridge-data";

export const Route = createFileRoute("/_authenticated/cases/$caseId")({
  head: () => ({
    meta: [
      { title: "Briefing card — MedBridge" },
      { name: "description", content: "Cultural and communication briefing for a MedBridge case." },
      { property: "og:title", content: "Briefing card — MedBridge" },
      { property: "og:description", content: "Cultural and communication briefing for a MedBridge case." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CasePage,
});

const STEPS = ["Symptoms", "Context", "Notes", "Handover"] as const;

function CasePage() {
  const { caseId } = Route.useParams();
  const { cases, notes } = useStore();
  const record = cases.find((c) => c.id === caseId);
  const [activeSymptom, setActiveSymptom] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  if (!record) {
    return (
      <PageShell title="Case not found">
        <p className="text-muted-foreground">This case isn't saved in this browser. <Link to="/dashboard" className="text-primary underline">Back to Home</Link></p>
      </PageShell>
    );
  }

  const caseNotes = notes.filter((n) => n.caseId === caseId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const setSymptoms = (symptoms: string[]) =>
    updateStore((s) => ({ ...s, cases: s.cases.map((c) => (c.id === caseId ? { ...c, symptoms } : c)) }));
  const briefings = record.symptoms.map((s) => getBriefing(s, record.language));
  const current = briefings.find((b) => b.symptom === activeSymptom) ?? briefings[0] ?? null;

  const step = !record.symptoms.length ? 0 : !current ? 1 : caseNotes.length ? 3 : 2;

  const select = (sym: string) => {
    if (!record.symptoms.includes(sym)) setSymptoms([...record.symptoms, sym]);
    setActiveSymptom(sym);
    setTab(0);
    setTimeout(() => document.getElementById("briefing-card")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };
  const remove = (sym: string) => {
    setSymptoms(record.symptoms.filter((x) => x !== sym));
    if (activeSymptom === sym) setActiveSymptom(null);
  };

  function saveToNotes() {
    const text = briefings
      .map((b) => `${b.symptom}\nQuestions: ${b.questions.join(" / ")}`)
      .join("\n\n");
    updateStore((s) => ({ ...s, notes: [{ id: newId(), caseId, text: `Briefing card (${record!.language})\n\n${text}`, visibility: "private", createdAt: new Date().toISOString() }, ...s.notes] }));
    toast.success("Briefing saved to Notes");
  }

  return (
    <PageShell top={<GlobalSearch language={record.language} selected={record.symptoms} onSelectSymptom={select} />}>
      {/* Header card */}
      <header className="card relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-navy sm:text-3xl">{record.code}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm font-medium text-primary">
                <Languages aria-hidden="true" className="size-4" /> {record.language}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">Opened {formatDate(record.date)} · language is set per case</p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="secondary" disabled={!briefings.length} onClick={saveToNotes}><Save aria-hidden="true" /> Save to Notes</Button>
            <Button disabled={!briefings.length} onClick={() => window.print()}><Printer aria-hidden="true" /> Print handover</Button>
          </div>
        </div>

        {/* Stepper */}
        <ol className="relative mt-7 grid grid-cols-4 gap-2">
          <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-4 h-0.5 rounded-full bg-border" />
          <div aria-hidden="true" className="absolute left-[12%] top-4 h-0.5 rounded-full bg-gradient-to-r from-primary to-aqua transition-all" style={{ width: `${(Math.min(step, 3) / 3) * 76}%` }} />
          {STEPS.map((label, i) => (
            <li key={label} className="relative flex flex-col items-center gap-2 text-center">
              <span className={`flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold ${i < step ? "border-primary bg-primary text-primary-foreground" : i === step ? "border-primary bg-card text-primary" : "border-border bg-card text-muted-foreground"}`}>
                {i < step ? <Check aria-hidden="true" className="size-4" /> : i + 1}
              </span>
              <span className={`text-xs font-medium sm:text-sm ${i <= step ? "text-navy" : "text-muted-foreground"}`}>{label}</span>
            </li>
          ))}
        </ol>
      </header>

      <div role="note" className="mt-6 flex gap-3 rounded-[var(--radius)] border border-primary/30 bg-accent p-4 text-sm text-accent-foreground">
        <ShieldAlert aria-hidden="true" className="size-5 shrink-0" />
        <p><strong>Information only.</strong> This card offers communication and cultural context. It does not diagnose and is not medical advice. Content shown is example text.</p>
      </div>

      {/* Symptom chips */}
      <section className="mt-8 print:hidden" aria-label="Selected symptoms">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-navy">Symptoms</h2>
          <p className="text-sm text-muted-foreground">Use the search bar above to add more.</p>
        </div>
        {record.symptoms.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No symptoms yet — search above to add one or more to this case.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2.5">
            {record.symptoms.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={current?.symptom === s}
                onClick={() => { setActiveSymptom(s); setTab(0); }}
                className={`group inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-base font-medium transition-all ${current?.symptom === s ? "border-primary bg-primary text-primary-foreground shadow-card" : "border-border bg-card text-navy hover:border-primary/40 hover:shadow-card"}`}
              >
                {s}
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remove ${s}`}
                  onClick={(e) => { e.stopPropagation(); remove(s); }}
                  className={`rounded-full p-0.5 ${current?.symptom === s ? "hover:bg-white/20" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <X className="size-4" />
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Tabbed briefing card */}
      {current && (
        <section id="briefing-card" className="card mt-6 scroll-mt-32">
          <h2 className="text-xl font-semibold text-navy">{current.symptom}</h2>
          <div role="tablist" aria-label="Briefing sections" className="mt-4 flex flex-wrap gap-2 border-b border-border pb-3">
            {["How the patient may describe it", "Cultural context", "Family perspective", "Suggested questions"].map((label, i) => (
              <button
                key={label}
                role="tab"
                aria-selected={tab === i}
                onClick={() => setTab(i)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent hover:text-primary"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div role="tabpanel" className="pt-5">
            <BriefingList items={[current.patientDescription, current.culturalContext, current.familyPerspective, current.questions][tab]} />
          </div>
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Red flags */}
        <section className="rounded-[var(--radius)] border border-destructive/30 bg-destructive/5 p-6" aria-label="Red flags">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-destructive/15 text-destructive"><Flag aria-hidden="true" className="size-4" /></span>
            <h2 className="text-lg font-semibold text-navy">Red flags</h2>
          </div>
          {record.redFlags.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No red flags noted for this case.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {record.redFlags.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-navy">
                  <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-destructive" /> {f}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Red flags are communication reminders, never a diagnosis.</p>
        </section>

        {/* Timeline */}
        <section className="card" aria-label="Interaction timeline">
          <h2 className="text-lg font-semibold text-navy">Timeline</h2>
          {caseNotes.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No notes yet. Save this briefing to Notes to start the timeline.</p>
          ) : (
            <ol className="relative mt-4 space-y-5 border-l-2 border-border pl-5">
              {caseNotes.map((n) => (
                <li key={n.id} className="relative">
                  <span aria-hidden="true" className="absolute -left-[27px] top-1 size-3 rounded-full border-2 border-card bg-primary" />
                  <p className="text-xs font-medium text-muted-foreground">{formatDate(n.createdAt)} · {n.visibility === "shared" ? "Shared" : "Private"}</p>
                  <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-6 text-navy">{n.text}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">Printed summaries are created in your browser only. MedBridge does not store patient data.</p>
    </PageShell>
  );
}

function BriefingList({ items }: { items: Briefing["questions"] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground">
          <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-aqua" /> {i}
        </li>
      ))}
    </ul>
  );
}
