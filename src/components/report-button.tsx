import { Flag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAiReview } from "@/hooks/use-ai-review";
import { getStore, updateStore, useStore } from "@/lib/local-store";
import { findQueueItem, REPORT_REASONS, type Report, type ReportReason } from "@/lib/reports";

type Props = { targetId: string; label: string; onReport: (report: Report) => void };

export function ReportButton({ targetId, label, onReport }: Props) {
  const { reported } = useStore();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [detail, setDetail] = useState("");
  const review = useAiReview();
  const done = reported.includes(targetId);

  function submit() {
    if (!reason) return;
    onReport({ reason, at: new Date().toISOString(), detail: reason === "Other" ? detail.trim().slice(0, 300) || undefined : undefined });
    updateStore((s) => ({ ...s, reported: [...s.reported, targetId] }));
    setOpen(false);
    if (findQueueItem(getStore().posts, targetId)) {
      toast.success("Thanks. This is now hidden and our AI moderator is reviewing it.");
      void review(targetId);
    } else toast.success("Thanks for your report.");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-destructive" disabled={done} aria-label={`Report ${label}`}>
          <Flag aria-hidden="true" className="size-3.5" /> {done ? "Reported" : "Report"}
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
          <Button onClick={submit} disabled={!reason}>Send report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
