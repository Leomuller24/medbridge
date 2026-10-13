import { createFileRoute } from "@tanstack/react-router";

import { PageShell, cardClass } from "@/components/page-shell";
import { ARTICLES } from "@/lib/medbridge-data";

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
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {ARTICLES.map((a) => (
          <article key={a.id} id={a.id} className={`${cardClass} scroll-mt-8 target:ring-2 target:ring-primary`}>
            <h2 className="font-semibold text-card-foreground">{a.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{a.summary}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">{a.tags.map((t) => <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{t}</span>)}</div>
            <p className="mt-4 text-xs text-muted-foreground">{a.source}</p>
          </article>
        ))}
      </div>
    </PageShell>
  ),
});
