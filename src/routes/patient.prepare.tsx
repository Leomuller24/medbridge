import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { PatientBack } from "@/components/patient-back";
import { useT, type PatientKey } from "@/lib/patient-i18n";
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
  { title: "prepare.questions", items: ["prepare.q1", "prepare.q2", "prepare.q3"] },
];

// Ticks are stored under the old ids so existing ticks are kept.
const ID = (k: PatientKey) => k.replace("prepare.", "");

function Prepare() {
  const { t } = useT();
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
      </div>
    </div>
  );
}
