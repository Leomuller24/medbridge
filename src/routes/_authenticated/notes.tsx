import { createFileRoute } from "@tanstack/react-router";
import { Flag, Lock, Share2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageShell, cardClass, formatDate } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { newId, updateStore, useStore } from "@/lib/local-store";
import { checkPosting } from "@/lib/posting-rules";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({
    meta: [
      { title: "Notes — MedBridge" },
      { name: "description", content: "Case notes, interaction history and red flags in MedBridge." },
      { property: "og:title", content: "Notes — MedBridge" },
      { property: "og:description", content: "Case notes, interaction history and red flags in MedBridge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { cases, notes, posts, activity } = useStore();
  const [caseId, setCaseId] = useState(cases[0]?.id ?? "");
  const [text, setText] = useState("");
  const [shared, setShared] = useState(false);
  const [flag, setFlag] = useState("");
  const [day, setDay] = useState<Date | undefined>();
  const current = cases.find((c) => c.id === caseId);
  const caseNotes = useMemo(() => notes.filter((n) => n.caseId === caseId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [notes, caseId]);
  const noteDays = caseNotes.map((n) => new Date(n.createdAt));
  const dayNotes = day ? caseNotes.filter((n) => new Date(n.createdAt).toDateString() === day.toDateString()) : [];

  function addNote() {
    const t = text.trim().slice(0, 5000);
    if (!t || !caseId) return;
    updateStore((s) => ({ ...s, notes: [{ id: newId(), caseId, text: t, visibility: shared ? "shared" : "private", createdAt: new Date().toISOString() }, ...s.notes] }));
    setText("");
    toast.success("Note added");
  }

  function addFlag() {
    const f = flag.trim().slice(0, 120);
    if (!f) return;
    updateStore((s) => ({ ...s, cases: s.cases.map((c) => (c.id === caseId ? { ...c, redFlags: [...c.redFlags, f] } : c)) }));
    setFlag("");
  }

  async function shareToCommunity(noteId: string) {
    const note = notes.find((n) => n.id === noteId);
    if (!note || note.visibility !== "shared" || !current) return;
    const { data } = await supabase.auth.getUser();
    const blocked = checkPosting(data.user, "post", note.text, activity);
    if (blocked) return void toast.error(blocked);
    updateStore((s) => ({
      ...s,
      activity: [...s.activity, { type: "post", at: new Date().toISOString() }],
      posts: [{ id: newId(), category: "Communication", title: (note.text.split("\n")[0] ?? "").slice(0, 80), body: note.text, author: "You", createdAt: new Date().toISOString(), helpful: 0, language: current.language, replies: [] }, ...s.posts],
    }));
    toast.success("Shared to Community");
  }

  return (
    <PageShell eyebrow="Patient Notes" title="Notes">
      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside>
          <h2 className="text-sm font-semibold text-foreground">Cases</h2>
          <ul className="mt-3 space-y-1">
            {cases.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => setCaseId(c.id)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${c.id === caseId ? "bg-accent font-semibold text-accent-foreground" : "hover:bg-muted"}`}>
                  {c.code} <span className="text-muted-foreground">· {c.language}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {current ? (
          <div className="space-y-6">
            <section className={cardClass}>
              <h2 className="flex items-center gap-2 font-semibold text-card-foreground"><Flag aria-hidden="true" className="size-4 text-destructive" /> Red flags</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {current.redFlags.length === 0 && <p className="text-sm text-muted-foreground">None recorded.</p>}
                {current.redFlags.map((f, i) => (
                  <span key={f + i} className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-sm text-destructive">
                    {f}
                    <button type="button" aria-label={`Remove ${f}`} onClick={() => updateStore((s) => ({ ...s, cases: s.cases.map((c) => (c.id === caseId ? { ...c, redFlags: c.redFlags.filter((_, j) => j !== i) } : c)) }))}><X className="size-3.5" /></button>
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input value={flag} maxLength={120} placeholder="Add a communication red flag" onChange={(e) => setFlag(e.target.value)} />
                <Button variant="outline" onClick={addFlag}>Add</Button>
              </div>
            </section>

            <section className={cardClass}>
              <h2 className="font-semibold text-card-foreground">New note</h2>
              <Textarea className="mt-3 min-h-32" maxLength={5000} value={text} placeholder="Write about communication, not identifying patient details." onChange={(e) => setText(e.target.value)} />
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch id="shared" checked={shared} onCheckedChange={setShared} />
                  <Label htmlFor="shared">{shared ? "Shared" : "Private"}</Label>
                </div>
                <Button onClick={addNote} disabled={!text.trim()}>Save note</Button>
              </div>
            </section>

            <section className={cardClass}>
              <Tabs defaultValue="timeline">
                <TabsList>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
                <TabsContent value="timeline">
                  <NoteList notes={caseNotes} onShare={shareToCommunity} />
                </TabsContent>
                <TabsContent value="calendar">
                  <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
                    <Calendar mode="single" selected={day} onSelect={setDay} modifiers={{ hasNote: noteDays }} modifiersClassNames={{ hasNote: "font-bold text-primary underline" }} />
                    {day ? <NoteList notes={dayNotes} onShare={shareToCommunity} /> : <p className="mt-4 text-sm text-muted-foreground">Choose a day to see notes. Underlined days have notes.</p>}
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          </div>
        ) : (
          <p className="text-muted-foreground">Create a case from Home to start taking notes.</p>
        )}
      </div>
      <p className="mt-10 text-xs text-muted-foreground">Notes stay in this browser. MedBridge does not store patient data.</p>
    </PageShell>
  );
}

function NoteList({ notes, onShare }: { notes: { id: string; text: string; visibility: string; createdAt: string }[]; onShare: (id: string) => void }) {
  if (!notes.length) return <p className="mt-4 text-sm text-muted-foreground">No notes yet.</p>;
  return (
    <ol className="mt-4 space-y-4 border-l border-border pl-5">
      {notes.map((n) => (
        <li key={n.id} className="relative">
          <span className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-primary" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {formatDate(n.createdAt)} · {n.visibility === "shared" ? <><Share2 className="size-3" /> Shared</> : <><Lock className="size-3" /> Private</>}
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{n.text}</p>
          {n.visibility === "shared" && (
            <Button variant="link" className="h-auto p-0 text-xs" onClick={() => onShare(n.id)}>Share to Community</Button>
          )}
        </li>
      ))}
    </ol>
  );
}
