import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { PLACEHOLDER, usePatientLang, usePatientText } from "@/lib/patient-i18n";

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
const LINKS = [
  { href: "https://www.bag.admin.ch", label: "Federal Office of Public Health (FOPH)" },
  { href: "https://www.edoeb.admin.ch", label: "Federal Data Protection and Information Commissioner (FDPIC)" },
  { href: "https://www.migesplus.ch", label: "migesplus.ch" },
];

function Rights() {
  const lang = usePatientLang();
  const t = usePatientText();
  const fr = lang === "fr";
  return (
    <div className="pt-4">
      <Link to="/patient" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-5 font-semibold text-foreground">
        <ArrowLeft className="size-5" aria-hidden="true" /> {t.back}
      </Link>
      <h1 className="mt-6 text-3xl font-semibold text-foreground">{t.topics.rights}</h1>
      {[fr ? "Mes droits" : "My rights", fr ? "Ma vie privée" : "My privacy"].map((title) => (
        <section key={title} className="card mt-5 p-6">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm italic text-muted-foreground">{PLACEHOLDER[lang]}</p>
        </section>
      ))}
      <section className="card mt-5 p-6">
        <h2 className="text-xl font-semibold text-foreground">{fr ? "Sources officielles" : "Official sources"}</h2>
        <ul className="mt-3 space-y-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-2 text-lg font-semibold text-primary hover:underline">
                {l.label} <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
