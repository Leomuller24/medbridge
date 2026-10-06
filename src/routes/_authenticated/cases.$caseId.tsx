import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Printer, Save, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageShell, cardClass, formatDate } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { newId, updateStore, useStore } from "@/lib/local-store";
import { SYMPTOMS, getBriefing } from "@/lib/medbridge-data";

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

function CasePage() {
  const { caseId } = Route.useParams();
  const { cases } = useStore();
  const record = cases.find((c) => c.id === caseId);
  const [open, setOpen] = useState(false);

  if (!record) {
    return (
      <PageShell title="Case not found">
        <p className="text-muted-foreground">This case isn't saved in this browser. <Link to="/dashboard" className="text-primary underline">Back to Home</Link></p>
      </PageShell>
    );
  }

  const setSymptoms = (symptoms: string[]) =>
    updateStore((s) => ({ ...s, cases: s.cases.map((c) => (c.id === caseId ? { ...c, symptoms } : c)) }));
  const toggle = (sym: string) => setSymptoms(record.symptoms.includes(sym) ? record.symptoms.filter((x) => x !== sym) : [...record.symptoms, sym]);
  const briefings = record.symptoms.map((s) => getBriefing(s, record.language));

  function saveToNotes() {
    const text = briefings
      .map((b) => `${b.symptom}\nQuestions: ${b.questions.join(" / ")}`)
      .join("\n\n");
    updateStore((s) => ({ ...s, notes: [{ id: newId(), caseId, text: `Briefing card (${record!.language})\n\n${text}`, visibility: "private", createdAt: new Date().toISOString() }, ...s.notes] }));
    toast.success("Briefing saved to Notes");
  }

  return (
    <PageShell
      eyebrow={`${record.code} · ${record.language} · ${formatDate(record.date)}`}
      title="Briefing card"
      actions={
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" disabled={!briefings.length} onClick={saveToNotes}><Save aria-hidden="true" /> Save to Notes</Button>
          <Button disabled={!briefings.length} onClick={() => window.print()}><Printer aria-hidden="true" /> Print handover</Button>
        </div>
      }
    >
      <div role="note" className="flex gap-3 rounded-xl border border-primary/30 bg-accent p-4 text-sm text-accent-foreground">
        <ShieldAlert aria-hidden="true" className="size-5 shrink-0" />
        <p><strong>Information only.</strong> This card offers communication and cultural context. It does not diagnose and is not medical advice. Content shown is example text.</p>
      </div>

      <div className="mt-6 print:hidden">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between sm:w-96">
              {record.symptoms.length ? `${record.symptoms.length} symptom(s) selected` : "Search and choose symptoms"}
              <ChevronsUpDown aria-hidden="true" className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search symptoms…" />
              <CommandList>
                <CommandEmpty>No symptom found.</CommandEmpty>
                {SYMPTOM_CATEGORIES.map((cat) => (
                  <CommandGroup key={cat} heading={cat}>
                    {SNOMED_SYMPTOMS.filter((s) => s.category === cat).map((s) => (
                      <CommandItem key={s.code} value={`${s.term} ${s.code}`} onSelect={() => toggle(s.term)}>
                        <Check aria-hidden="true" className={record.symptoms.includes(s.term) ? "opacity-100" : "opacity-0"} />
                        <span className="flex-1">{s.term}</span>
                        <span className="text-xs text-muted-foreground">{s.code}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="mt-3 flex flex-wrap gap-2">
          {record.symptoms.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
              {s}
              <button type="button" aria-label={`Remove ${s}`} onClick={() => toggle(s)}><X className="size-3.5" /></button>
            </span>
          ))}
        </div>
      </div>

      {briefings.length === 0 ? (
        <p className="mt-10 text-muted-foreground">Choose one or more symptoms to see the briefing.</p>
      ) : (
        <div className="mt-8 space-y-6">
          {briefings.map((b) => (
            <article key={b.symptom} className={cardClass}>
              <h2 className="text-xl font-semibold text-card-foreground">{b.symptom}</h2>
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                <Section title="How the patient may describe it" items={b.patientDescription} />
                <Section title="Cultural and communication context" items={b.culturalContext} />
                <Section title="Family Perspective" items={b.familyPerspective} />
                <Section title="Questions worth asking" items={b.questions} />
              </div>
            </article>
          ))}
          <p className="text-xs text-muted-foreground">Printed summaries are created in your browser only. MedBridge does not store patient data.</p>
        </div>
      )}
    </PageShell>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-muted-foreground">
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}
