import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HeartHandshake, Stethoscope } from "lucide-react";

import { Logo } from "@/components/logo";
import { setStoredRole, type AppRole } from "@/lib/role";

export const Route = createFileRoute("/choose-role")({
  head: () => ({
    meta: [
      { title: "Choose your role — MedBridge" },
      { name: "description", content: "Tell MedBridge whether you are a healthcare provider or a patient." },
      { property: "og:title", content: "Choose your role — MedBridge" },
      { property: "og:description", content: "Tell MedBridge whether you are a healthcare provider or a patient." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChooseRole,
});

function ChooseRole() {
  const navigate = useNavigate();
  function pick(role: AppRole) {
    setStoredRole(role);
    navigate({ to: role === "provider" ? "/" : "/patient", replace: true });
  }
  const options = [
    { role: "provider" as const, title: "I am a healthcare provider", text: "Cultural and communication context for your work.", icon: Stethoscope },
    { role: "patient" as const, title: "I am a patient", text: "Simple help for your visit. No sign-up needed.", icon: HeartHandshake },
  ];
  return (
    <main className="bg-soft grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-3xl text-center">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-8 text-3xl font-semibold text-foreground sm:text-4xl">Welcome to MedBridge</h1>
        <p className="mt-3 text-muted-foreground">Who are you?</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {options.map(({ role, title, text, icon: Icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => pick(role)}
              className="card flex flex-col items-center gap-4 p-10 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="icon-circle size-16"><Icon className="size-8" aria-hidden="true" /></span>
              <span className="text-xl font-semibold text-foreground">{title}</span>
              <span className="text-sm text-muted-foreground">{text}</span>
            </button>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">MedBridge does not store patient data.</p>
      </div>
    </main>
  );
}
