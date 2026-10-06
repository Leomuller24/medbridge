import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Languages, MessageCircleMore, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedBridge — Cultural context for better communication" },
      { name: "description", content: "Cultural and communication context for Swiss healthcare providers supporting migrant patients." },
      { property: "og:title", content: "MedBridge — Cultural context for better communication" },
      { property: "og:description", content: "Cultural and communication context for Swiss healthcare providers supporting migrant patients." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const benefits = [
    { icon: Languages, title: "Bridge language gaps", description: "Use clear translated phrases to support respectful conversations." },
    { icon: UsersRound, title: "Understand context", description: "Review cultural considerations that may shape communication and expectations." },
    { icon: MessageCircleMore, title: "Prepare conversations", description: "Approach each interaction with more awareness, clarity, and confidence." },
  ];

  return (
    <main>
      <section className="mx-auto grid min-h-[calc(78vh-4.5rem)] max-w-7xl items-center px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold text-primary">For Swiss healthcare providers</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.08] text-foreground sm:text-6xl lg:text-7xl">
            Communication that meets people where they are.
          </h1>
          <div className="mt-7 max-w-2xl space-y-2 text-lg leading-8 text-muted-foreground">
            <p>MedBridge gives Swiss healthcare providers cultural and communication context when caring for migrant patients.</p>
            <p>It supports clearer conversations with practical translations and contextual guidance, without diagnosing or offering medical advice.</p>
          </div>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link to="/login">Log in <ArrowRight aria-hidden="true" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/register">Register</Link></Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">How it helps</p>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">Context for more human care</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-xl border border-border bg-background p-7 shadow-sm">
                <span className="grid size-11 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon aria-hidden="true" className="size-5" /></span>
                <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
          <p className="mt-10 text-sm font-medium text-muted-foreground">MedBridge does not store patient data.</p>
        </div>
      </section>
    </main>
  );
}
