import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { PatientBack } from "@/components/patient-back";
import { useT, type PatientKey } from "@/lib/patient-i18n";

export const Route = createFileRoute("/patient/rights")({
  head: () => ({
    meta: [
      { title: "My rights and my privacy — MedBridge" },
      { name: "description", content: "Links to official Swiss sources about patient rights and privacy." },
      { property: "og:title", content: "My rights and my privacy — MedBridge" },
      { property: "og:description", content: "Links to official Swiss sources about patient rights and privacy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Rights,
});

// Only placeholders and official links — no legal statements are written here.
const LINKS: { href: string; label: PatientKey | string }[] = [
  { href: "https://www.bag.admin.ch", label: "rights.foph" },
  { href: "https://www.edoeb.admin.ch", label: "rights.fdpic" },
  { href: "https://www.migesplus.ch", label: "migesplus.ch" },
];

function Rights() {
  const { t } = useT();
  return (
    <div className="pt-4">
      <PatientBack />
      <h1 className="mt-6 text-3xl font-semibold text-foreground">{t("topic.rights")}</h1>
      {[t("rights.rights"), t("rights.privacy")].map((title) => (
        <section key={title} className="card mt-5 p-6">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm italic text-muted-foreground">{t("placeholder")}</p>
        </section>
      ))}
      <section className="card mt-5 p-6">
        <h2 className="text-xl font-semibold text-foreground">{t("rights.sources")}</h2>
        <ul className="mt-3 space-y-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-2 text-lg font-semibold text-primary hover:underline">
                {l.label.startsWith("rights.") ? t(l.label as PatientKey) : l.label} <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
