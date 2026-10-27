import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Hospital, Languages, Phone, Pill, Stethoscope } from "lucide-react";

import { PLACEHOLDER, usePatientLang, usePatientText } from "@/lib/patient-i18n";

export const Route = createFileRoute("/patient/healthcare")({
  head: () => ({
    meta: [
      { title: "How healthcare works here — MedBridge" },
      { name: "description", content: "Four simple steps: family doctor, pharmacy, emergency department and interpreter service." },
      { property: "og:title", content: "How healthcare works here — MedBridge" },
      { property: "og:description", content: "Four simple steps: family doctor, pharmacy, emergency department and interpreter service." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Healthcare,
});

const STEPS = {
  en: [
    { icon: Stethoscope, title: "Family doctor", text: "Your family doctor is usually the first person to see." },
    { icon: Pill, title: "Pharmacy", text: "A pharmacist can help with small health questions." },
    { icon: Hospital, title: "Emergency department", text: "Go to the hospital emergency department only for serious problems." },
    { icon: Languages, title: "Interpreter service", text: "An interpreter can help you and the doctor understand each other." },
  ],
  fr: [
    { icon: Stethoscope, title: "Médecin de famille", text: "Ton médecin de famille est souvent la première personne à voir." },
    { icon: Pill, title: "Pharmacie", text: "Un pharmacien peut aider pour les petites questions de santé." },
    { icon: Hospital, title: "Urgences", text: "Va aux urgences de l'hôpital seulement pour les problèmes graves." },
    { icon: Languages, title: "Service d'interprétariat", text: "Un interprète vous aide, toi et le médecin, à vous comprendre." },
  ],
} as const;

function Healthcare() {
  const lang = usePatientLang();
  const t = usePatientText();
  const fr = lang === "fr";
  return (
    <div className="pt-4">
      <Link to="/patient" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-5 font-semibold text-foreground">
        <ArrowLeft className="size-5" aria-hidden="true" /> {t.back}
      </Link>
      <h1 className="mt-6 text-3xl font-semibold text-foreground">{t.topics.healthcare}</h1>
      <ol className="mt-6 space-y-5">
        {STEPS[lang].map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="card flex gap-5 p-6">
            <span className="icon-circle size-14 shrink-0"><Icon className="size-7" aria-hidden="true" /></span>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{i + 1}. {title}</h2>
              <p className="mt-1 text-lg text-foreground">{text}</p>
              <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-2 text-sm italic text-muted-foreground">{PLACEHOLDER[lang]}</p>
            </div>
          </li>
        ))}
      </ol>
      <section className="card mt-6 space-y-4 p-6">
        <h2 className="text-xl font-semibold text-foreground">{fr ? "Liens utiles" : "Useful links"}</h2>
        <a href="https://www.migesplus.ch" target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-2 text-lg font-semibold text-primary hover:underline">
          migesplus.ch <ExternalLink className="size-4" aria-hidden="true" />
        </a>
        <div>
          <p className="text-lg text-foreground">{fr ? "Interprétariat national par téléphone" : "National telephone interpreting service"}</p>
          <a href="tel:+41842442442" className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-lg font-semibold text-primary-foreground">
            <Phone className="size-5" aria-hidden="true" /> 0842 442 442
          </a>
          <p className="mt-2 text-muted-foreground">{fr ? "Tous les jours, 7:00 à 19:00." : "Daily, 7:00 to 19:00."}</p>
          <p className="text-sm text-muted-foreground">
            {fr ? "Vérifie les horaires sur le site officiel : " : "Check the hours on the official website: "}
            <a href="https://www.inter-pret.ch" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">inter-pret.ch</a>
          </p>
        </div>
      </section>
    </div>
  );
}
