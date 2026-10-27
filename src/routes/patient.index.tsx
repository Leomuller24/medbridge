import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Hospital, MessageCircleHeart, ShieldCheck, type LucideIcon } from "lucide-react";

import { usePatientText, type PatientTopic } from "@/lib/patient-i18n";

export const Route = createFileRoute("/patient/")({
  head: () => ({
    meta: [
      { title: "Patient home — MedBridge" },
      { name: "description", content: "Simple help to prepare your appointment and understand healthcare in Switzerland." },
      { property: "og:title", content: "Patient home — MedBridge" },
      { property: "og:description", content: "Simple help to prepare your appointment and understand healthcare in Switzerland." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PatientHome,
});

const ITEMS: { topic: PatientTopic; icon: LucideIcon }[] = [
  { topic: "prepare", icon: CalendarCheck },
  { topic: "explain", icon: MessageCircleHeart },
  { topic: "healthcare", icon: Hospital },
  { topic: "rights", icon: ShieldCheck },
];

function PatientHome() {
  const t = usePatientText();
  return (
    <div className="pt-4">
      <h1 className="text-3xl font-semibold text-foreground">{t.hello}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{t.intro}</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {ITEMS.map(({ topic, icon: Icon }) => (
          <Link
            key={topic}
            to="/patient/$topic"
            params={{ topic }}
            className="card flex min-h-32 items-center gap-5 p-6 text-xl font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="icon-circle size-16 shrink-0"><Icon className="size-8" aria-hidden="true" /></span>
            {t.topics[topic]}
          </Link>
        ))}
      </div>
    </div>
  );
}
