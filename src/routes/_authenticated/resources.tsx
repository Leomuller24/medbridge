import { createFileRoute } from "@tanstack/react-router";

import { ExternalLink } from "lucide-react";

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
    <PageShell eyebrow="External sources" title="Resources">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {ARTICLES.map((a) => (
          <article key={a.id} id={a.id} className={`${cardClass} flex flex-col scroll-mt-8 target:ring-2 target:ring-primary`}>
            <span className="mb-3 self-start rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">Summary of an external source</span>
            <h2 className="font-semibold text-card-foreground">{a.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{a.summary}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">{a.tags.map((t) => <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{t}</span>)}</div>
            <p className="mt-4 text-xs text-muted-foreground">Source: {a.source}</p>
            <a href={a.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full border border-primary px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground">Read the source <ExternalLink className="h-3.5 w-3.5" /></a>
          </article>
        ))}
      </div>
    </PageShell>
  ),
});
