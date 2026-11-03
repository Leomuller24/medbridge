import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDownUp, Eraser, Languages, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

import { PatientBack } from "@/components/patient-back";
import { useT } from "@/lib/patient-i18n";
import { LANGUAGE_INFO, translate as patientTranslate, type PatientLang } from "@/lib/patient-translations";
import { translateText } from "@/lib/translate.functions";


export const Route = createFileRoute("/patient/translate")({
  head: () => ({
    meta: [
      { title: "Translate for me — MedBridge" },
      { name: "description", content: "Translate between your language and French to talk with the doctor. Nothing is saved." },
      { property: "og:title", content: "Translate for me — MedBridge" },
      { property: "og:description", content: "Translate between your language and French to talk with the doctor. Nothing is saved." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TranslatePage,
});

type Direction = "toMe" | "toDoctor";

function TranslatePage() {
  const { t, lang } = useT();
  const translate = useServerFn(translateText);
  // Text lives only in this page's memory; it disappears when the page is left.
  const [direction, setDirection] = useState<Direction>("toMe");
  const [text, setText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [staffCard, setStaffCard] = useState(false);
  const subLang = lang === "fr" ? "en" : "fr";
  const translated = lang !== "en" && lang !== "fr";

  const target = direction === "toMe" ? lang : "fr";
  const targetDir = LANGUAGE_INFO[target].dir;

  function clear() { setText(""); setResult(null); setError(null); }
  function swap() { setDirection((d) => (d === "toMe" ? "toDoctor" : "toMe")); clear(); }

  function deviceId() {
    let id = localStorage.getItem("medbridge-device");
    if (!id) { id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join(""); localStorage.setItem("medbridge-device", id); }
    return id;
  }

  async function run() {
    if (!text.trim() || busy) return;
    setBusy(true); setError(null); setResult(null);
    try {
      const r = await translate({ data: { text: text.slice(0, 2000), target, device: deviceId() } });
      if (r.ok) setResult(r.text);
      else setError(r.reason === "could_not" ? t("tr.couldNot") : r.reason === "daily_limit" ? t("tr.unavailable") : r.reason === "device_limit" ? t("tr.deviceLimit") : t("tr.error"));
    } catch {
      setError(t("tr.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pt-4">
      <PatientBack />
      <h1 className="mt-6 text-3xl font-semibold text-foreground">{t("topic.translate")}</h1>

      <p className="mt-4 flex items-start gap-3 rounded-2xl bg-accent p-4 text-base font-medium text-accent-foreground">
        <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> {t("tr.notice")}
      </p>
      <p role="note" className="mt-3 flex items-start gap-3 rounded-2xl border-2 border-destructive/40 bg-secondary p-4 text-base font-semibold text-foreground">
        <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> {t("tr.warning")}
      </p>

      <section className="card mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">{direction === "toMe" ? t("tr.heard") : t("tr.say")}</h2>
          <button type="button" onClick={swap} className="btn-secondary inline-flex min-h-11 items-center gap-2 px-4 text-sm font-semibold">
            <ArrowDownUp className="size-4" aria-hidden="true" /> {t("tr.swap")}
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {direction === "toMe" ? `→ ${LANGUAGE_INFO[lang].name}` : `${LANGUAGE_INFO[lang].name} → Français`}
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          rows={5}
          dir="auto"
          autoComplete="off"
          spellCheck={false}
          placeholder={direction === "toMe" ? t("tr.heardHint") : t("tr.sayHint")}
          aria-label={direction === "toMe" ? t("tr.heard") : t("tr.say")}
          className="mt-4 w-full rounded-2xl border border-border bg-background p-4 text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
          <button type="button" onClick={run} disabled={busy || !text.trim()} className="btn-primary inline-flex min-h-14 items-center justify-center gap-2 text-lg font-semibold disabled:opacity-50">
            <Languages className="size-5" aria-hidden="true" /> {busy ? t("tr.translating") : t("tr.translate")}
          </button>
          <button type="button" onClick={clear} className="btn-secondary inline-flex min-h-14 items-center gap-2 px-5 text-lg font-semibold">
            <Eraser className="size-5" aria-hidden="true" /> {t("tr.clear")}
          </button>
        </div>
      </section>

      {(result || error) && (
        <section aria-live="polite" className="card mt-5 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("tr.result")}</p>
          {result ? (
            <p lang={target} dir={targetDir}
              className={direction === "toDoctor" ? "mt-4 whitespace-pre-wrap text-4xl font-bold leading-snug text-foreground sm:text-5xl" : "mt-4 whitespace-pre-wrap text-2xl font-semibold leading-relaxed text-foreground sm:text-3xl"}>
              {result}
            </p>
          ) : (
            <p className="mt-4 text-xl font-semibold text-destructive">{error}</p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">{t("tr.warning")}</p>
        </section>
      )}

      <section className="card mt-5 p-6">
        <h2 className="text-xl font-semibold text-foreground">{t("tr.askInterp")}</h2>
        <p className="mt-2 text-lg leading-relaxed text-foreground">{t("interp.text")}</p>
        <p lang={subLang} dir="ltr" className="mt-2 text-base text-muted-foreground">{patientTranslate("interp.text", subLang)}</p>
        <button type="button" onClick={() => setStaffCard(true)} className="btn-primary mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 text-lg font-semibold">
          <Languages className="size-5" aria-hidden="true" /> {t("interp.showStaff")}
        </button>
        {translated && <p className="mt-3 text-xs text-muted-foreground">{t("notChecked")}</p>}
        <div dir="ltr" className="mt-4 space-y-1 text-xs leading-relaxed text-muted-foreground">
          <p>{INTERP_STAFF_NOTE_FR}</p>
          <p>{INTERP_STAFF_NOTE_EN}</p>
        </div>
      </section>
      {staffCard && <InterpCard onClose={() => setStaffCard(false)} />}
    </div>
  );
}

// Small note addressed to the staff; kept in French and English so any team can read it.
const INTERP_STAFF_NOTE_FR = "Le personnel soignant vaudois peut réserver des interprètes communautaires via Appartenances (Intermedia : 021 341 12 47, intermedia@appartenances.ch) ou le service national d'interprétariat téléphonique pour les urgences (0842-442-442.ch, payant). Voir les sites pour les conditions actuelles.";
const INTERP_STAFF_NOTE_EN = "Healthcare staff in Vaud can book community interpreters through Appartenances (Intermedia: 021 341 12 47, intermedia@appartenances.ch) or the national telephone interpreting service for emergencies (0842-442-442.ch, paid). See the websites for current conditions.";

// Patient language written in French, for the staff view.
const LANG_NAME_FR: Record<PatientLang, string> = {
  fr: "français", en: "anglais", ar: "arabe", ti: "tigrinya", fa: "dari", ps: "pachto", so: "somali", tr: "turc", uk: "ukrainien",
};

function InterpCard({ onClose }: { onClose: () => void }) {
  const { t, lang } = useT();
  const translated = lang !== "en" && lang !== "fr";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex flex-col bg-background pt-[calc(4.5rem+env(safe-area-inset-top))]">
      <div className="mx-auto flex w-full max-w-2xl px-5 py-4">
        <button type="button" onClick={onClose} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-card px-5 text-base font-semibold text-foreground">
          <X className="size-5" aria-hidden="true" /> {t("close")}
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-5 pb-6">
        <div dir="ltr" className="card w-full max-w-2xl p-8 text-center">
          <p lang="fr" className="text-3xl font-bold leading-snug text-foreground sm:text-4xl">{patientTranslate("interp.request", "fr")}</p>
          <p lang="fr" className="mt-6 text-2xl font-semibold text-primary">Langue : {LANG_NAME_FR[lang]}</p>
          {lang !== "fr" && (
            <p lang={lang} dir={LANGUAGE_INFO[lang].dir} className="mt-6 text-xl leading-relaxed text-muted-foreground">{t("interp.request")}</p>
          )}
          {translated && <p className="mt-3 text-xs text-muted-foreground">{t("notChecked")}</p>}
          <p lang="fr" className="mt-8 text-xs leading-relaxed text-muted-foreground">{INTERP_STAFF_NOTE_FR}</p>
        </div>
      </div>
    </div>
  );
}
