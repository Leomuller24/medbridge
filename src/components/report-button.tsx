import { Flag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAiReview } from "@/hooks/use-ai-review";
import { reportItem, useRefreshCommunity } from "@/lib/community";
import { REPORT_REASONS, type ReportReason } from "@/lib/reports";

type Props = { kind: "post" | "comment"; targetId: string; label: string; reported: boolean };

export function ReportButton({ kind, targetId, label, reported }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const review = useAiReview();
  const refresh = useRefreshCommunity();

  async function submit() {
    if (!reason) return;
    setBusy(true);
    try {
      await reportItem(kind, targetId, reason, reason === "Other" ? detail.trim().slice(0, 300) || undefined : undefined);
      setOpen(false);
      toast.success("Thanks for your report.");
      // The backend hides content at 3 reports; the AI moderator then reviews it.
      void review(kind, targetId);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send the report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-destructive" disabled={reported} aria-label={`Report ${label}`}>
          <Flag aria-hidden="true" className="size-3.5" /> {reported ? "Reported" : "Report"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this {label}</DialogTitle>
          <DialogDescription>Choose the reason that fits best. Content with 3 reports is hidden and reviewed by our AI moderator.</DialogDescription>
        </DialogHeader>
        <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportReason)} className="space-y-2">
          {REPORT_REASONS.map((r) => (
            <div key={r} className="flex items-center gap-3">
              <RadioGroupItem id={`${targetId}-${r}`} value={r} />
              <Label htmlFor={`${targetId}-${r}`}>{r}</Label>
            </div>
          ))}
        </RadioGroup>
        {reason === "Other" && <Textarea aria-label="Tell us more" maxLength={300} placeholder="Tell us more (optional). No patient details." value={detail} onChange={(e) => setDetail(e.target.value)} />}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!reason || busy}>Send report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
