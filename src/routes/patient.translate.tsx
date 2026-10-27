import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDownUp, Eraser, Languages, Phone, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { PatientBack } from "@/components/patient-back";
import { useT } from "@/lib/patient-i18n";
import { LANGUAGE_INFO } from "@/lib/patient-translations";
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
  const { t, lang, dir } = useT();
  const translate = useServerFn(translateText);
  // Text lives only in this page's memory; it disappears when the page is left.
  const [direction, setDirection] = useState<Direction>("toMe");
  const [text, setText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const target = direction === "toMe" ? lang : "fr";
  const targetDir = LANGUAGE_INFO[target].dir;

  function clear() { setText(""); setResult(null); setError(null); }
  function swap() { setDirection((d) => (d === "toMe" ? "toDoctor" : "toMe")); clear(); }

  async function run() {
    if (!text.trim() || busy) return;
    setBusy(true); setError(null); setResult(null);
    try {
      const r = await translate({ data: { text: text.slice(0, 2000), target } });
      if (r.ok) setResult(r.text);
      else setError(r.reason === "could_not" ? t("tr.couldNot") : t("tr.error"));
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
        <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> {t("tr.privacy")}
      </p>
      <p role="note" className="mt-3 flex items-start gap-3 rounded-2xl border-2 border-warning/60 bg-warning/15 p-4 text-base font-semibold text-foreground">
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
        <a href="tel:+41842442442" className="btn-primary inline-flex min-h-14 w-full items-center justify-center gap-2 text-lg font-semibold">
          <Phone className="size-5" aria-hidden="true" /> {t("tr.askInterp")} · <span dir="ltr">0842 442 442</span>
        </a>
        <p className="mt-3 text-center text-base text-muted-foreground">{t("hc.phone")} — {t("hc.hours")}</p>
      </section>
      <span className="sr-only" dir={dir} />
    </div>
  );
}
