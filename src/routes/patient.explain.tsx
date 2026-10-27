import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, ArrowLeft, Bed, Brain, CalendarClock, CloudRain, Frown, Gauge, HeartPulse, MapPin,
  Moon, Stethoscope, Thermometer, Wind, X, type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { usePatientLang, usePatientText } from "@/lib/patient-i18n";
import { EXTRA_LANGUAGES, TRANSLATION_NOTICE, type ExplainKey, type ExtraLang } from "@/lib/symptom-translations";

function useExtra() {
  const l = usePatientLang();
  if (l === "en" || l === "fr") return null;
  const x = EXTRA_LANGUAGES[l as ExtraLang];
  return { code: l, dir: x.dir, t: (k: ExplainKey) => x.text[k] };
}

function Notice() {
  return <p dir="ltr" lang="en" className="mt-3 text-xs text-muted-foreground">{TRANSLATION_NOTICE}</p>;
}

export const Route = createFileRoute("/patient/explain")({
  head: () => ({
    meta: [
      { title: "Explain what is wrong — MedBridge" },
      { name: "description", content: "Tap what you feel, then show your phone to the doctor. English and French." },
      { property: "og:title", content: "Explain what is wrong — MedBridge" },
      { property: "og:description", content: "Tap what you feel, then show your phone to the doctor. English and French." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExplainPage,
});

type Symptom = { id: ExplainKey; en: string; fr: string; icon: LucideIcon };

const SYMPTOMS: Symptom[] = [
  { id: "headache", en: "Headache", fr: "Mal de tête", icon: Brain },
  { id: "stomach", en: "Stomach pain", fr: "Mal au ventre", icon: Frown },
  { id: "cough", en: "Cough", fr: "Toux", icon: Stethoscope },
  { id: "fever", en: "Fever", fr: "Fièvre", icon: Thermometer },
  { id: "tired", en: "Tired", fr: "Fatigué(e)", icon: Bed },
  { id: "sleep", en: "Cannot sleep", fr: "Difficultés à dormir", icon: Moon },
  { id: "sad", en: "Feeling very sad", fr: "Très triste", icon: CloudRain },
  { id: "worried", en: "Feeling very worried", fr: "Très inquiet(ète)", icon: Activity },
  { id: "chest", en: "Pain in the chest", fr: "Douleur dans la poitrine", icon: HeartPulse },
  { id: "breathing", en: "Difficulty breathing", fr: "Difficulté à respirer", icon: Wind },
  { id: "back", en: "Pain in the back", fr: "Mal au dos", icon: Activity },
  { id: "skin", en: "Skin problem", fr: "Problème de peau", icon: MapPin },
];

const SINCE = [
  { en: "Today", fr: "Aujourd'hui" },
  { en: "A few days", fr: "Quelques jours" },
  { en: "About a week", fr: "Environ une semaine" },
  { en: "Several weeks", fr: "Plusieurs semaines" },
  { en: "Months or more", fr: "Des mois ou plus" },
];

const BODY = [
  { id: "head", en: "Head", fr: "Tête", x: 50, y: 10 },
  { id: "chest", en: "Chest", fr: "Poitrine", x: 50, y: 30 },
  { id: "belly", en: "Belly", fr: "Ventre", x: 50, y: 45 },
  { id: "larm", en: "Arm", fr: "Bras", x: 24, y: 38 },
  { id: "rarm", en: "Arm", fr: "Bras", x: 76, y: 38 },
  { id: "lleg", en: "Leg", fr: "Jambe", x: 40, y: 78 },
  { id: "rleg", en: "Leg", fr: "Jambe", x: 60, y: 78 },
];

type View = null | "symptom" | "since" | "strength" | "where" | "doctor";

function ExplainPage() {
  const t = usePatientText();
  const x = useExtra();
  const [symptom, setSymptom] = useState<Symptom | null>(null);
  const [view, setView] = useState<View>(null);
  const [since, setSince] = useState<number | null>(null);
  const [strength, setStrength] = useState<number | null>(null);
  const [where, setWhere] = useState<string | null>(null);

  function open(s: Symptom) {
    setSymptom(s); setSince(null); setStrength(null); setWhere(null); setView("symptom");
  }

  useEffect(() => {
    if (!view) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setView(view === "symptom" ? null : "symptom"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  const place = BODY.find((b) => b.id === where);

  return (
    <div className="pt-4">
      <Link to="/patient" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-base font-semibold text-foreground">
        <ArrowLeft className="size-5" aria-hidden="true" /> {t.back}
      </Link>
      <h1 className="mt-6 text-3xl font-semibold text-foreground">Tap what you feel. Then show your phone to the doctor.</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SYMPTOMS.map((s) => (
          <button key={s.id} type="button" onClick={() => open(s)}
            className="card flex min-h-36 flex-col items-center justify-center gap-3 p-5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="icon-circle size-14"><s.icon className="size-7" aria-hidden="true" /></span>
            {x ? (
              <>
                <span lang={x.code} dir={x.dir} className="text-xl font-semibold leading-snug text-foreground">{x.t(s.id)}</span>
                <span className="text-base text-muted-foreground" lang="fr">{s.fr}</span>
                <span dir="ltr" lang="en" className="text-[11px] leading-tight text-muted-foreground">{TRANSLATION_NOTICE}</span>
              </>
            ) : (
              <>
                <span className="text-lg font-semibold text-foreground">{s.en}</span>
                <span className="text-base text-muted-foreground" lang="fr">{s.fr}</span>
              </>
            )}
          </button>
        ))}
      </div>

      {symptom && view && (
        <div role="dialog" aria-modal="true" aria-label={symptom.en} className="fixed inset-0 z-50 overflow-y-auto bg-background">
          <div className="mx-auto flex min-h-full max-w-2xl flex-col px-5 py-6">
            <button type="button" onClick={() => setView(view === "symptom" ? null : "symptom")}
              className="inline-flex min-h-12 items-center gap-2 self-start rounded-full border border-border bg-card px-5 text-base font-semibold text-foreground">
              {view === "symptom" ? <X className="size-5" aria-hidden="true" /> : <ArrowLeft className="size-5" aria-hidden="true" />}
              {view === "symptom" ? "Close / Fermer" : "Back / Retour"}
            </button>

            {view === "symptom" && (
              <div className="mt-8 flex flex-1 flex-col">
                <div className="card p-8 text-center">
                  {x ? (
                    <>
                      <p lang={x.code} dir={x.dir} className="text-5xl font-bold leading-snug text-foreground sm:text-6xl">{x.t(symptom.id)}</p>
                      <p lang="fr" className="mt-4 text-2xl text-muted-foreground">{symptom.fr}</p>
                      <Notice />
                    </>
                  ) : (
                    <>
                      <p lang="fr" className="text-5xl font-bold leading-tight text-foreground sm:text-6xl">{symptom.fr}</p>
                      <p className="mt-4 text-2xl text-muted-foreground">{symptom.en}</p>
                    </>
                  )}
                  <div className="mx-auto mt-6 h-10 w-3/4 border-b-2 border-dashed border-border" aria-label="Space for a second language" />
                </div>
                <div className="mt-6 grid gap-3">
                  <FollowUp icon={CalendarClock} label="Since when? / Depuis quand ?" k="since" value={since !== null ? `${SINCE[since]!.fr} · ${SINCE[since]!.en}` : null} onClick={() => setView("since")} />
                  <FollowUp icon={Gauge} label="How strong? / À quel point ?" k="strength" value={strength ? `${strength} / 5` : null} onClick={() => setView("strength")} />
                  <FollowUp icon={MapPin} label="Where? / Où ?" k="where" value={place ? `${place.fr} · ${place.en}` : null} onClick={() => setView("where")} />
                </div>
                <button type="button" onClick={() => setView("doctor")} aria-label="Show this to the doctor / Montrer au médecin" className="btn-primary mt-6 flex min-h-16 flex-col items-center justify-center py-3 text-xl font-semibold">
                  {x ? (
                    <>
                      <span lang={x.code} dir={x.dir}>{x.t("showDoctor")}</span>
                      <span lang="fr" className="text-base font-normal">Montrer au médecin</span>
                    </>
                  ) : "Show this to the doctor / Montrer au médecin"}
                </button>
                {x && <p dir="ltr" className="mt-2 text-center text-xs text-muted-foreground">{TRANSLATION_NOTICE}</p>}
              </div>
            )}

            {view === "since" && (
              <Section title="Depuis quand ?" sub="Since when?">
                <div className="grid gap-3">
                  {SINCE.map((o, i) => (
                    <BigChoice key={o.en} active={since === i} onClick={() => { setSince(i); setView("symptom"); }} fr={o.fr} en={o.en} />
                  ))}
                </div>
              </Section>
            )}

            {view === "strength" && (
              <Section title="À quel point ?" sub="How strong? 1 = a little, 5 = very strong">
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => { setStrength(n); setView("symptom"); }}
                      className={`aspect-square rounded-2xl border-2 text-4xl font-bold ${strength === n ? "border-primary bg-accent text-foreground" : "border-border bg-card text-foreground"}`}>
                      {n}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-base text-muted-foreground"><span>Un peu · A little</span><span>Très fort · Very strong</span></div>
              </Section>
            )}

            {view === "where" && (
              <Section title="Où ?" sub="Where? Tap the place on the body.">
                <div className="relative mx-auto aspect-[1/1.6] w-full max-w-xs">
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
                    <button key={b.id} type="button" onClick={() => { setWhere(b.id); setView("symptom"); }}
                      style={{ left: `${b.x}%`, top: `${b.y}%` }}
                      aria-label={`${b.fr} / ${b.en}`}
                      className={`absolute size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 ${where === b.id ? "border-primary bg-primary" : "border-primary bg-card"}`} />
                  ))}
                </div>
              </Section>
            )}

            {view === "doctor" && (
              <div className="mt-8 card space-y-6 p-8 text-center">
                {x && <p lang={x.code} dir={x.dir} className="text-5xl font-bold leading-snug text-foreground sm:text-6xl">{x.t(symptom.id)}</p>}
                <p lang="fr" className={x ? "text-3xl font-semibold text-foreground" : "text-5xl font-bold leading-tight text-foreground sm:text-6xl"}>{symptom.fr}</p>
                <p className="text-2xl text-muted-foreground">{symptom.en}</p>
                {x && <Notice />}
                {since !== null && <p className="text-3xl font-semibold text-foreground">{SINCE[since]!.fr}<span className="block text-xl font-normal text-muted-foreground">{SINCE[since]!.en}</span></p>}
                {strength && <p className="text-3xl font-semibold text-foreground">{strength} / 5<span className="block text-xl font-normal text-muted-foreground">À quel point · How strong</span></p>}
                {place && <p className="text-3xl font-semibold text-foreground">{place.fr}<span className="block text-xl font-normal text-muted-foreground">{place.en}</span></p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FollowUp({ icon: Icon, label, k, value, onClick }: { icon: LucideIcon; label: string; k: ExplainKey; value: string | null; onClick: () => void }) {
  const x = useExtra();
  return (
    <button type="button" onClick={onClick} aria-label={label} className="card flex min-h-16 items-center gap-4 p-4 text-left">
      <span className="icon-circle size-12 shrink-0"><Icon className="size-6" aria-hidden="true" /></span>
      <span className="flex-1">
        {x ? (
          <>
            <span lang={x.code} dir={x.dir} className="block text-xl font-semibold text-foreground">{x.t(k)}</span>
            <span lang="fr" className="block text-base text-muted-foreground">{label.split(" / ")[1]}</span>
            <span dir="ltr" className="block text-[11px] text-muted-foreground">{TRANSLATION_NOTICE}</span>
          </>
        ) : (
          <span className="block text-lg font-semibold text-foreground">{label}</span>
        )}
        {value && <span className="block text-base text-primary">{value}</span>}
      </span>
    </button>
  );
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 lang="fr" className="text-4xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-xl text-muted-foreground">{sub}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function BigChoice({ fr, en, active, onClick }: { fr: string; en: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`min-h-16 rounded-2xl border-2 px-5 py-3 text-left ${active ? "border-primary bg-accent" : "border-border bg-card"}`}>
      <span lang="fr" className="block text-2xl font-semibold text-foreground">{fr}</span>
      <span className="block text-base text-muted-foreground">{en}</span>
    </button>
  );
}
