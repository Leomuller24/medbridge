import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useState } from "react";

import { PLACEHOLDER, usePatientLang, usePatientText } from "@/lib/patient-i18n";
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

const SECTIONS = {
  en: [
    { title: "What to bring", items: [["papers", "Papers I was given"], ["meds", "A list of medicines I take"], ["card", "My insurance card"]] },
    { title: "Who can come with me", items: [["companion", "I can bring someone I trust."]] },
    { title: "I can ask for an interpreter", items: [["interp", "I can ask for an interpreter. It is my right to understand."]] },
    { title: "Questions I can ask", items: [["q1", "What is happening to me?"], ["q2", "What do I need to do next?"], ["q3", "Can you say it more simply?"]] },
  ],
  fr: [
    { title: "Ce que j'apporte", items: [["papers", "Les papiers qu'on m'a donnés"], ["meds", "La liste de mes médicaments"], ["card", "Ma carte d'assurance"]] },
    { title: "Qui peut venir avec moi", items: [["companion", "Je peux venir avec une personne de confiance."]] },
    { title: "Je peux demander un interprète", items: [["interp", "Je peux demander un interprète. J'ai le droit de comprendre."]] },
    { title: "Questions que je peux poser", items: [["q1", "Qu'est-ce qui m'arrive ?"], ["q2", "Que dois-je faire ensuite ?"], ["q3", "Pouvez-vous l'expliquer plus simplement ?"]] },
  ],
} as const;

function Prepare() {
  const lang = usePatientLang();
  const t = usePatientText();
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
      <Link to="/patient" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-5 font-semibold text-foreground">
        <ArrowLeft className="size-5" aria-hidden="true" /> {t.back}
      </Link>
      <h1 className="mt-6 text-3xl font-semibold text-foreground">{t.topics.prepare}</h1>
      <p className="mt-2 text-muted-foreground">{lang === "fr" ? "Coche quand c'est prêt. Rien n'est envoyé." : "Tick when it's ready. Nothing is sent anywhere."}</p>
      <div className="mt-6 space-y-5">
        {SECTIONS[lang].map((s) => (
          <section key={s.title} className="card p-6">
            <h2 className="text-xl font-semibold text-foreground">{s.title}</h2>
            <ul className="mt-4 space-y-3">
              {s.items.map(([id, label]) => (
                <li key={id}>
                  <button type="button" role="checkbox" aria-checked={!!done[id]} onClick={() => toggle(id)}
                    className="flex min-h-14 w-full items-center gap-4 rounded-2xl bg-secondary px-4 text-left text-lg text-foreground">
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border-2 border-primary", done[id] && "bg-primary text-primary-foreground")}>
                      {done[id] && <Check className="size-5" aria-hidden="true" />}
                    </span>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-3 text-sm italic text-muted-foreground">{PLACEHOLDER[lang]}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
