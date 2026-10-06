import { createFileRoute } from "@tanstack/react-router";

import { PageShell, cardClass } from "@/components/page-shell";

export const Route = createFileRoute("/_authenticated/resources")({
  head: () => ({
    meta: [
      { title: "Resources — MedBridge" },
      { name: "description", content: "Guides for culturally aware communication with migrant patients." },
      { property: "og:title", content: "Resources — MedBridge" },
      { property: "og:description", content: "Guides for culturally aware communication with migrant patients." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PageShell eyebrow="Example content" title="Resources">
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ["Working with interpreters", "Speak to the patient, use short sentences, and allow time for interpretation."],
          ["Involving families respectfully", "Acknowledge relatives while making space for the patient's own voice."],
          ["Checking understanding", "Ask the patient to explain the plan back in their own words."],
        ].map(([t, d]) => (
          <article key={t} className={cardClass}>
            <h2 className="font-semibold text-card-foreground">{t}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p>
          </article>
        ))}
      </div>
    </PageShell>
  ),
});
