import { createFileRoute } from "@tanstack/react-router";
import {
  Activity, ArrowLeft, Bed, Brain, CalendarClock, CloudRain, Frown, Gauge, HeartPulse, MapPin,
  Moon, Stethoscope, Thermometer, Wind, X, type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { PatientBack } from "@/components/patient-back";
import { useT, type PatientKey } from "@/lib/patient-i18n";
import { translate } from "@/lib/patient-translations";

export const Route = createFileRoute("/patient/explain")({
  head: () => ({
    meta: [
      { title: "Explain what is wrong — MedBridge" },
      { name: "description", content: "Tap what you feel, then show your phone to the doctor. Available in nine languages." },
      { property: "og:title", content: "Explain what is wrong — MedBridge" },
      { property: "og:description", content: "Tap what you feel, then show your phone to the doctor. Available in nine languages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExplainPage,
});

const SYMPTOMS: { key: PatientKey; icon: LucideIcon }[] = [
  { key: "sym.headache", icon: Brain },
  { key: "sym.stomach", icon: Frown },
  { key: "sym.cough", icon: Stethoscope },
  { key: "sym.fever", icon: Thermometer },
  { key: "sym.tired", icon: Bed },
  { key: "sym.sleep", icon: Moon },
  { key: "sym.sad", icon: CloudRain },
  { key: "sym.worried", icon: Activity },
  { key: "sym.chest", icon: HeartPulse },
  { key: "sym.breathing", icon: Wind },
  { key: "sym.back", icon: Activity },
  { key: "sym.skin", icon: MapPin },
];

const SINCE: PatientKey[] = ["since.today", "since.days", "since.week", "since.weeks", "since.months"];

const BODY: { id: string; key: PatientKey; x: number; y: number }[] = [
  { id: "head", key: "body.head", x: 50, y: 10 },
  { id: "chest", key: "body.chest", x: 50, y: 30 },
  { id: "belly", key: "body.belly", x: 50, y: 45 },
  { id: "larm", key: "body.arm", x: 24, y: 38 },
  { id: "rarm", key: "body.arm", x: 76, y: 38 },
  { id: "lleg", key: "body.leg", x: 40, y: 78 },
  { id: "rleg", key: "body.leg", x: 60, y: 78 },
];

type View = null | "symptom" | "since" | "strength" | "where" | "doctor";

/** Main text in the chosen language; the second line is French for the doctor (English when French is chosen). */
function usePair() {
  const { t, lang } = useT();
  const subLang = lang === "fr" ? "en" : "fr";
  return {
    main: t,
    sub: (k: PatientKey) => translate(k, subLang),
    subLang,
    translated: lang !== "en" && lang !== "fr",
  };
}

function Notice({ className = "" }: { className?: string }) {
  const { t } = useT();
  const { translated } = usePair();
  if (!translated) return null;
  return <p className={`text-xs leading-tight text-muted-foreground ${className}`}>{t("notCheckedInterp")}</p>;
}

function ExplainPage() {
  const { t } = useT();
  const { main, sub, subLang } = usePair();
  const [symptom, setSymptom] = useState<PatientKey | null>(null);
  const [view, setView] = useState<View>(null);
  const [since, setSince] = useState<PatientKey | null>(null);
  const [strength, setStrength] = useState<number | null>(null);
  const [where, setWhere] = useState<PatientKey | null>(null);
  const [whereId, setWhereId] = useState<string | null>(null);

  function open(k: PatientKey) {
    setSymptom(k); setSince(null); setStrength(null); setWhere(null); setWhereId(null); setView("symptom");
  }

  useEffect(() => {
    if (!view) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setView(view === "symptom" ? null : "symptom"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  return (
    <div className="pt-4">
      <PatientBack />
      <h1 className="mt-6 text-3xl font-semibold leading-snug text-foreground">{t("explain.heading")}</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SYMPTOMS.map((s) => (
          <button key={s.key} type="button" onClick={() => open(s.key)}
            className="card flex min-h-36 flex-col items-center justify-center gap-2 p-5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="icon-circle size-14"><s.icon className="size-7" aria-hidden="true" /></span>
            <span className="text-xl font-semibold leading-snug text-foreground">{main(s.key)}</span>
            <span lang={subLang} className="text-base text-muted-foreground">{sub(s.key)}</span>
            <Notice className="text-[11px]" />
          </button>
        ))}
      </div>

      {symptom && view && (
        <div role="dialog" aria-modal="true" aria-label={main(symptom)} className="fixed inset-0 z-50 overflow-y-auto bg-background pt-[calc(4.5rem+env(safe-area-inset-top))]">
          <div className="mx-auto flex min-h-full max-w-2xl flex-col px-5 py-6">
            <button type="button" onClick={() => setView(view === "symptom" ? null : "symptom")}
              className="inline-flex min-h-12 items-center gap-2 self-start rounded-full border border-border bg-card px-5 text-base font-semibold text-foreground">
              {view === "symptom" ? <X className="size-5" aria-hidden="true" /> : <ArrowLeft className="size-5 rtl:rotate-180" aria-hidden="true" />}
              {view === "symptom" ? t("close") : t("back")}
            </button>

            {view === "symptom" && (
              <div className="mt-8 flex flex-1 flex-col">
                <div className="card p-8 text-center">
                  <p className="text-5xl font-bold leading-snug text-foreground sm:text-6xl">{main(symptom)}</p>
                  <p lang={subLang} className="mt-4 text-2xl text-muted-foreground">{sub(symptom)}</p>
                  <Notice className="mt-3" />
                  <div className="mx-auto mt-6 h-10 w-3/4 border-b-2 border-dashed border-border" aria-label={t("secondLang")} />
                </div>
                <div className="mt-6 grid gap-3">
                  <FollowUp icon={CalendarClock} k="q.since" value={since ? `${main(since)} · ${sub(since)}` : null} onClick={() => setView("since")} />
                  <FollowUp icon={Gauge} k="q.strength" value={strength ? `${strength} / 5` : null} onClick={() => setView("strength")} />
                  <FollowUp icon={MapPin} k="q.where" value={where ? `${main(where)} · ${sub(where)}` : null} onClick={() => setView("where")} />
                </div>
                <button type="button" onClick={() => setView("doctor")} className="btn-primary mt-6 flex min-h-16 flex-col items-center justify-center py-3 text-xl font-semibold">
                  <span>{main("q.showDoctor")}</span>
                  <span lang={subLang} className="text-base font-normal">{sub("q.showDoctor")}</span>
                </button>
                <Notice className="mt-2 text-center" />
              </div>
            )}

            {view === "since" && (
              <Section k="q.since">
                <div className="grid gap-3">
                  {SINCE.map((k) => (
                    <BigChoice key={k} k={k} active={since === k} onClick={() => { setSince(k); setView("symptom"); }} />
                  ))}
                </div>
              </Section>
            )}

            {view === "strength" && (
              <Section k="q.strength">
                <div dir="ltr" className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => { setStrength(n); setView("symptom"); }}
                      className={`aspect-square rounded-2xl border-2 text-4xl font-bold text-foreground ${strength === n ? "border-primary bg-accent" : "border-border bg-card"}`}>
                      {n}
                    </button>
                  ))}
                </div>
                <div dir="ltr" className="mt-3 flex justify-between gap-4 text-base text-muted-foreground">
                  <span>1 = {main("scale.low")} · {sub("scale.low")}</span>
                  <span className="text-end">5 = {main("scale.high")} · {sub("scale.high")}</span>
                </div>
              </Section>
            )}

            {view === "where" && (
              <Section k="q.where" extra="where.sub">
                <div dir="ltr" className="relative mx-auto aspect-[1/1.6] w-full max-w-xs">
                  <svg viewBox="0 0 100 160" className="absolute inset-0 size-full text-muted" aria-hidden="true">
                    <g fill="currentColor">
                      <circle cx="50" cy="16" r="11" />
                      <rect x="34" y="30" width="32" height="50" rx="12" />
                      <rect x="18" y="32" width="11" height="45" rx="5" />
                      <rect x="71" y="32" width="11" height="45" rx="5" />
                      <rect x="36" y="80" width="12" height="70" rx="6" />
                      <rect x="52" y="80" width="12" height="70" rx="6" />
                    </g>
                  </svg>
                  {BODY.map((b) => (
                    <button key={b.id} type="button" onClick={() => { setWhere(b.key); setWhereId(b.id); setView("symptom"); }}
                      style={{ left: `${b.x}%`, top: `${b.y}%` }}
                      aria-label={`${main(b.key)} / ${sub(b.key)}`}
                      className={`absolute size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-primary ${whereId === b.id ? "bg-primary" : "bg-card"}`} />
                  ))}
                </div>
              </Section>
            )}

            {view === "doctor" && (
              <div className="card mt-8 space-y-6 p-8 text-center">
                <div>
                  <p className="text-5xl font-bold leading-snug text-foreground sm:text-6xl">{main(symptom)}</p>
                  <p lang={subLang} className="mt-3 text-3xl font-semibold text-muted-foreground">{sub(symptom)}</p>
                </div>
                {since && <Answer k={since} />}
                {strength && <p className="text-3xl font-semibold text-foreground">{strength} / 5<span className="block text-xl font-normal text-muted-foreground">{main("q.strength")} · {sub("q.strength")}</span></p>}
                {where && <Answer k={where} />}
                <Notice />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Answer({ k }: { k: PatientKey }) {
  const { main, sub, subLang } = usePair();
  return (
    <p className="text-3xl font-semibold text-foreground">
      {main(k)}<span lang={subLang} className="block text-xl font-normal text-muted-foreground">{sub(k)}</span>
    </p>
  );
}

function FollowUp({ icon: Icon, k, value, onClick }: { icon: LucideIcon; k: PatientKey; value: string | null; onClick: () => void }) {
  const { main, sub, subLang } = usePair();
  return (
    <button type="button" onClick={onClick} className="card flex min-h-16 items-center gap-4 p-4 text-start">
      <span className="icon-circle size-12 shrink-0"><Icon className="size-6" aria-hidden="true" /></span>
      <span className="flex-1">
        <span className="block text-xl font-semibold text-foreground">{main(k)}</span>
        <span lang={subLang} className="block text-base text-muted-foreground">{sub(k)}</span>
        {value && <span className="block text-base text-primary">{value}</span>}
        <Notice className="mt-1 text-[11px]" />
      </span>
    </button>
  );
}

function Section({ k, extra, children }: { k: PatientKey; extra?: PatientKey; children: React.ReactNode }) {
  const { main, sub, subLang } = usePair();
  return (
    <div className="mt-8">
      <h2 className="text-4xl font-bold leading-snug text-foreground">{main(k)}</h2>
      <p lang={subLang} className="mt-2 text-xl text-muted-foreground">{sub(k)}</p>
      {extra && <p className="mt-2 text-lg text-foreground">{main(extra)} <span lang={subLang} className="text-muted-foreground">· {sub(extra)}</span></p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function BigChoice({ k, active, onClick }: { k: PatientKey; active: boolean; onClick: () => void }) {
  const { main, sub, subLang } = usePair();
  return (
    <button type="button" onClick={onClick}
      className={`min-h-16 rounded-2xl border-2 px-5 py-3 text-start ${active ? "border-primary bg-accent" : "border-border bg-card"}`}>
      <span className="block text-2xl font-semibold text-foreground">{main(k)}</span>
      <span lang={subLang} className="block text-base text-muted-foreground">{sub(k)}</span>
    </button>
  );
}
