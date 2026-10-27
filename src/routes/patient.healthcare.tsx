import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Hospital, Languages, Phone, Pill, Stethoscope, type LucideIcon } from "lucide-react";

import { PatientBack } from "@/components/patient-back";
import { useT, type PatientKey } from "@/lib/patient-i18n";

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

const STEPS: { icon: LucideIcon; title: PatientKey; text: PatientKey }[] = [
  { icon: Stethoscope, title: "hc.doctor", text: "hc.doctorText" },
  { icon: Pill, title: "hc.pharmacy", text: "hc.pharmacyText" },
  { icon: Hospital, title: "hc.er", text: "hc.erText" },
  { icon: Languages, title: "hc.interp", text: "hc.interpText" },
];

function Healthcare() {
  const { t } = useT();
  return (
    <div className="pt-4">
      <PatientBack />
      <h1 className="mt-6 text-3xl font-semibold text-foreground">{t("topic.healthcare")}</h1>
      <ol className="mt-6 space-y-5">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="card flex gap-5 p-6">
            <span className="icon-circle size-14 shrink-0"><Icon className="size-7" aria-hidden="true" /></span>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{i + 1}. {t(title)}</h2>
              <p className="mt-1 text-lg text-foreground">{t(text)}</p>
              <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-2 text-sm italic text-muted-foreground">{t("placeholder")}</p>
            </div>
          </li>
        ))}
      </ol>
      <section className="card mt-6 space-y-4 p-6">
        <h2 className="text-xl font-semibold text-foreground">{t("hc.links")}</h2>
        <a href="https://www.migesplus.ch" target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-2 text-lg font-semibold text-primary hover:underline">
          migesplus.ch <ExternalLink className="size-4" aria-hidden="true" />
        </a>
        <div>
          <p className="text-lg text-foreground">{t("hc.phone")}</p>
          <a href="tel:+41842442442" dir="ltr" className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-lg font-semibold text-primary-foreground">
            <Phone className="size-5" aria-hidden="true" /> 0842 442 442
          </a>
          <p className="mt-2 text-muted-foreground">{t("hc.hours")}</p>
          <p className="text-sm text-muted-foreground">
            {t("hc.check")}{" "}
            <a href="https://www.inter-pret.ch" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">inter-pret.ch</a>
          </p>
        </div>
      </section>
    </div>
  );
}
