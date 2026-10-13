import { Printer, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateStore } from "@/lib/local-store";
import type { CaseRecord, NoteRecord } from "@/lib/medbridge-data";
import { findPii, piiWarning } from "@/lib/pii";

/** Plain-text handover summary; this exact text goes into the QR code. */
export function handoverText(record: CaseRecord, notes: NoteRecord[]): string {
  const shared = notes.filter((n) => n.patientAgreed);
  return [
    "MedBridge handover",
    `Case: ${record.code}`,
    `Preferred language: ${record.language}`,
    `Interpreter needed: ${record.interpreterNeeded ? "Yes" : "No"}`,
    `Communication preferences: ${record.commPrefs?.trim() || "None noted"}`,
    `Notes the patient agreed to share:${shared.length ? "" : " None"}`,
    ...shared.map((n) => `- ${n.text.replace(/\s+/g, " ").slice(0, 300)}`),
    "Information only, not medical advice.",
  ].join("\n");
}

export function HandoverCard({ record, notes }: { record: CaseRecord; notes: NoteRecord[] }) {
  const [prefs, setPrefs] = useState(record.commPrefs ?? "");
  const [qr, setQr] = useState<string | null>(null);
  const shared = notes.filter((n) => n.patientAgreed);

  const setCase = (patch: Partial<CaseRecord>) => updateStore((s) => ({ ...s, cases: s.cases.map((c) => (c.id === record.id ? { ...c, ...patch } : c)) }));
  const setAgreed = (id: string, v: boolean) => updateStore((s) => ({ ...s, notes: s.notes.map((n) => (n.id === id ? { ...n, patientAgreed: v } : n)) }));

  function savePrefs() {
    const t = prefs.trim().slice(0, 500);
    const hits = findPii(t);
    if (hits.length) return void toast.warning(piiWarning(hits));
    setCase({ commPrefs: t });
    toast.success("Preferences saved");
  }

  function blockedByPii() {
    const hits = findPii(handoverText(record, notes));
    if (hits.length) toast.warning(piiWarning(hits));
    return hits.length > 0;
  }

  function print() {
    if (blockedByPii()) return;
    document.body.classList.add("printing-handover");
    window.addEventListener("afterprint", () => document.body.classList.remove("printing-handover"), { once: true });
    window.print();
  }

  async function showQr() {
    if (blockedByPii()) return;
    setQr(await QRCode.toDataURL(handoverText(record, notes), { margin: 1, width: 320, errorCorrectionLevel: "M" }));
  }

  return (
    <section id="handover-card" className="card mt-6" aria-labelledby="handover-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="handover-title" className="text-lg font-semibold text-navy">Handover</h2>
          <p className="text-sm text-muted-foreground">No name and no birth date. Case code only.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={print}><Printer aria-hidden="true" /> Print</Button>
          <Button variant="outline" onClick={showQr}><QrCode aria-hidden="true" /> Show QR code</Button>
        </div>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div><dt className="text-xs text-muted-foreground">Case code</dt><dd className="font-semibold text-navy">{record.code}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Preferred language</dt><dd className="font-semibold text-navy">{record.language}</dd></div>
        <div>
          <dt className="text-xs text-muted-foreground">Interpreter needed</dt>
          <dd className="mt-1 flex items-center gap-2">
            <Switch id="interp" checked={!!record.interpreterNeeded} onCheckedChange={(v) => setCase({ interpreterNeeded: v })} className="print:hidden" />
            <Label htmlFor="interp" className="font-semibold text-navy">{record.interpreterNeeded ? "Yes" : "No"}</Label>
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <Label htmlFor="prefs" className="text-xs text-muted-foreground">Communication preferences</Label>
        <Textarea id="prefs" maxLength={500} className="mt-1 print:hidden" placeholder="e.g. prefers a female interpreter, short sentences, family member present" value={prefs} onChange={(e) => setPrefs(e.target.value)} onBlur={() => prefs !== (record.commPrefs ?? "") && savePrefs()} />
        <p className="hidden whitespace-pre-line text-sm text-navy print:block">{record.commPrefs || "None noted"}</p>
      </div>

      <div className="mt-5">
        <p className="text-xs text-muted-foreground">Notes the patient agreed to share</p>
        {notes.length === 0 ? <p className="mt-1 text-sm text-muted-foreground">No notes for this case yet.</p> : (
          <ul className="mt-2 space-y-2">
            {notes.map((n) => (
              <li key={n.id} className={`flex items-start gap-3 text-sm ${n.patientAgreed ? "" : "print:hidden"}`}>
                <Checkbox id={`agree-${n.id}`} checked={!!n.patientAgreed} onCheckedChange={(v) => setAgreed(n.id, v === true)} className="mt-0.5 print:hidden" aria-label="Patient agreed to share" />
                <label htmlFor={`agree-${n.id}`} className="line-clamp-3 whitespace-pre-line text-navy">{n.text}</label>
              </li>
            ))}
          </ul>
        )}
        {notes.length > 0 && <p className="mt-2 text-xs text-muted-foreground print:hidden">Tick only notes the patient agreed to share. {shared.length} selected.</p>}
      </div>
      <p className="mt-5 text-xs text-muted-foreground">Information only, not medical advice. MedBridge does not store patient data.</p>

      <Dialog open={!!qr} onOpenChange={(o) => !o && setQr(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Handover QR code — {record.code}</DialogTitle>
            <DialogDescription>The code holds the card text itself. It is made in your browser; nothing is stored or fetched from a server.</DialogDescription>
          </DialogHeader>
          {qr && <img src={qr} alt={`QR code containing the handover card for case ${record.code}`} className="mx-auto size-72" />}
        </DialogContent>
      </Dialog>
    </section>
  );
}
