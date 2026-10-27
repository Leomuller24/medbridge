import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Layers, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PatientBack } from "@/components/patient-back";
import { useT, type PatientKey } from "@/lib/patient-i18n";
import { translate } from "@/lib/patient-translations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/patient/prepare")({
  head: () => ({
    meta: [
      { title: "Prepare my appointment — MedBridge" },
      { name: "description", content: "A simple checklist to get ready for a medical appointment in Switzerland." },
      { property: "og:title", content: "Prepare my appointment — MedBridge" },
      { property: "og:description", content: "A simple checklist to get ready for a medical appointment in Switzerland." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Prepare,
});

// Ticks are kept only in this device's browser storage. Nothing is sent anywhere.
const KEY = "medbridge-patient-checklist";

const SECTIONS: { title: PatientKey; items: PatientKey[] }[] = [
  { title: "prepare.bring", items: ["prepare.papers", "prepare.meds", "prepare.card"] },
  { title: "prepare.who", items: ["prepare.companion"] },
  { title: "prepare.interpTitle", items: ["prepare.interp"] },
  ];

// Ticks are stored under the old ids so existing ticks are kept.
const ID = (k: PatientKey) => k.replace("prepare.", "");

const QUESTIONS: PatientKey[] = ["prepare.q1", "prepare.q2", "prepare.q3", "prepare.q4", "prepare.q5", "prepare.q6"];

function Prepare() {
  const { t, lang } = useT();
  const subLang = lang === "fr" ? "en" : "fr";
  const translated = lang !== "en" && lang !== "fr";
  const [viewer, setViewer] = useState<PatientKey[] | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try { setDone(JSON.parse(window.localStorage.getItem(KEY) ?? "{}")); } catch { /* ignore */ }
  }, []);
  function toggle(id: string) {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  return (
    <div className="pt-4">
      <PatientBack />
      <h1 className="mt-6 text-3xl font-semibold text-foreground">{t("topic.prepare")}</h1>
      <p className="mt-2 text-muted-foreground">{t("prepare.sub")}</p>
      <div className="mt-6 space-y-5">
        {SECTIONS.map((s) => (
          <section key={s.title} className="card p-6">
            <h2 className="text-xl font-semibold text-foreground">{t(s.title)}</h2>
            <ul className="mt-4 space-y-3">
              {s.items.map((k) => { const id = ID(k); return (
                <li key={id}>
                  <button type="button" role="checkbox" aria-checked={!!done[id]} onClick={() => toggle(id)}
                    className="flex min-h-14 w-full items-center gap-4 rounded-2xl bg-secondary px-4 text-start text-lg text-foreground">
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border-2 border-primary", done[id] && "bg-primary text-primary-foreground")}>
                      {done[id] && <Check className="size-5" aria-hidden="true" />}
                    </span>
                    {t(k)}
                  </button>
                </li>
              ); })}
            </ul>
            <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-3 text-sm italic text-muted-foreground">{t("placeholder")}</p>
          </section>
        ))}

        <section className="card p-6">
          <h2 className="text-xl font-semibold text-foreground">{t("prepare.questions")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("prepare.tickHint")}</p>
          <ul className="mt-4 space-y-3">
            {QUESTIONS.map((k) => { const id = ID(k); return (
              <li key={id} className="flex min-h-16 items-stretch gap-2 rounded-2xl bg-secondary ps-2 text-foreground">
                <button type="button" role="checkbox" aria-checked={!!done[id]} aria-label={t(k)} onClick={() => toggle(id)}
                  className="grid w-12 shrink-0 place-items-center">
                  <span className={cn("grid size-8 place-items-center rounded-full border-2 border-primary", done[id] && "bg-primary text-primary-foreground")}>
                    {done[id] && <Check className="size-5" aria-hidden="true" />}
                  </span>
                </button>
                <button type="button" onClick={() => setViewer([k])} className="flex-1 py-3 pe-4 text-start">
                  <span className="block text-lg font-semibold">{t(k)}</span>
                  <span lang={subLang} dir="ltr" className="block text-sm text-muted-foreground">{translate(k, subLang)}</span>
                  {translated && <span className="mt-1 block text-[11px] text-muted-foreground">{t("notChecked")}</span>}
                </button>
              </li>
            ); })}
          </ul>
          <button type="button" disabled={!QUESTIONS.some((k) => done[ID(k)])}
            onClick={() => setViewer(QUESTIONS.filter((k) => done[ID(k)]))}
            className="btn-primary mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 text-lg font-semibold disabled:opacity-50">
            <Layers className="size-5" aria-hidden="true" /> {t("prepare.showChosen")}
          </button>
          <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-3 text-sm italic text-muted-foreground">{t("placeholder")}</p>
        </section>
      </div>
      {viewer && <QuestionViewer keys={viewer} onClose={() => setViewer(null)} />}
    </div>
  );
}

function QuestionViewer({ keys, onClose }: { keys: PatientKey[]; onClose: () => void }) {
  const { t, lang } = useT();
  const subLang = lang === "fr" ? "en" : "fr";
  const translated = lang !== "en" && lang !== "fr";
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function go(i: number) {
    const el = track.current;
    if (!el) return;
    const slide = el.children[i] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }
  function onScroll() {
    const el = track.current;
    if (!el) return;
    setIndex(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex flex-col bg-background pt-[calc(4.5rem+env(safe-area-inset-top))]">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-4">
        <button type="button" onClick={onClose} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-card px-5 text-base font-semibold text-foreground">
          <X className="size-5" aria-hidden="true" /> {t("close")}
        </button>
        {keys.length > 1 && <span dir="ltr" className="text-base font-semibold text-muted-foreground">{index + 1} / {keys.length}</span>}
      </div>
      <div ref={track} onScroll={onScroll} className="flex flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]">
        {keys.map((k) => (
          <div key={k} className="flex w-full shrink-0 snap-start items-center justify-center px-5 pb-6">
            <div className="card w-full max-w-2xl p-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {t("q.showDoctor")}{lang !== "fr" && <span lang="fr" dir="ltr" className="block text-xs font-normal normal-case text-muted-foreground">{translate("q.showDoctor", "fr")}</span>}
              </p>
              <p className="mt-6 text-4xl font-bold leading-snug text-foreground sm:text-5xl">{t(k)}</p>
              <p lang={subLang} dir="ltr" className="mt-5 text-2xl text-muted-foreground">{translate(k, subLang)}</p>
              {translated && <p className="mt-4 text-xs text-muted-foreground">{t("notCheckedInterp")}</p>}
            </div>
          </div>
        ))}
      </div>
      {keys.length > 1 && (
        <div className="mx-auto flex w-full max-w-2xl justify-between gap-3 px-5 pb-6">
          <button type="button" disabled={index === 0} onClick={() => go(index - 1)} className="btn-secondary inline-flex min-h-14 flex-1 items-center justify-center gap-2 text-lg font-semibold disabled:opacity-40">
            <ArrowLeft className="size-5 rtl:rotate-180" aria-hidden="true" /> {t("previous")}
          </button>
          <button type="button" disabled={index === keys.length - 1} onClick={() => go(index + 1)} className="btn-primary inline-flex min-h-14 flex-1 items-center justify-center gap-2 text-lg font-semibold disabled:opacity-40">
            {t("next")} <ArrowRight className="size-5 rtl:rotate-180" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
