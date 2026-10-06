import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Chip, cardClass } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { useSaveProfile } from "@/hooks/use-profile";
import { INTERESTS, LANGUAGES, ROLES } from "@/lib/medbridge-data";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — MedBridge" },
      { name: "description", content: "Set up your MedBridge role, interests and working languages." },
      { property: "og:title", content: "Get started — MedBridge" },
      { property: "og:description", content: "Set up your MedBridge role, interests and working languages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function Onboarding() {
  const navigate = useNavigate();
  const save = useSaveProfile();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function finish() {
    setBusy(true);
    try {
      await save({ role, interests, languages, onboarded: true });
      navigate({ to: "/dashboard", replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <p className="text-sm font-semibold text-primary">Step {step} of 2</p>
      <div className={`${cardClass} mt-4 p-8 sm:p-10`}>
        {step === 1 ? (
          <>
            <h1 className="text-3xl font-semibold text-card-foreground">What is your role?</h1>
            <p className="mt-2 text-sm text-muted-foreground">This helps us show the most relevant context.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                  className={`rounded-xl border p-5 text-left font-medium transition-colors ${role === r ? "border-primary bg-accent text-accent-foreground" : "border-border hover:bg-muted"}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <Button size="lg" disabled={!role} onClick={() => setStep(2)}>Continue</Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold text-card-foreground">Your interests and languages</h1>
            <p className="mt-2 text-sm text-muted-foreground">Pick as many as you like. You can change these later in Settings.</p>
            <h2 className="mt-8 text-sm font-semibold text-foreground">Interests</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {INTERESTS.map((i) => <Chip key={i} selected={interests.includes(i)} onClick={() => setInterests(toggle(interests, i))}>{i}</Chip>)}
            </div>
            <h2 className="mt-8 text-sm font-semibold text-foreground">Languages you most often work with</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {LANGUAGES.map((l) => <Chip key={l} selected={languages.includes(l)} onClick={() => setLanguages(toggle(languages, l))}>{l}</Chip>)}
            </div>
            <div className="mt-10 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button size="lg" disabled={busy} onClick={finish}>{busy ? "Saving…" : "Go to my dashboard"}</Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
