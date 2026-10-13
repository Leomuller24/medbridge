import { ExternalLink, Languages, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";

export function InterpreterCard() {
  return (
    <section className="card" aria-labelledby="interpreter-title">
      <div className="flex items-start gap-4">
        <span className="icon-circle shrink-0"><Languages aria-hidden="true" className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <h2 id="interpreter-title" className="text-lg font-semibold text-navy">Need an interpreter now?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Open daily 7:00 to 19:00</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button asChild><a href="tel:+41842442442"><Phone aria-hidden="true" /> Call 0842 442 442</a></Button>
            <a href="https://www.inter-pret.ch" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">inter-pret.ch <ExternalLink aria-hidden="true" className="size-3.5" /></a>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Check hours on the official website.</p>
        </div>
      </div>
    </section>
  );
}
