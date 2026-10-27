import { createFileRoute, notFound } from "@tanstack/react-router";

import { PatientBack } from "@/components/patient-back";
import { PATIENT_TOPICS, useT, type PatientTopic } from "@/lib/patient-i18n";

export const Route = createFileRoute("/patient/$topic")({
  beforeLoad: ({ params }) => {
    if (!PATIENT_TOPICS.includes(params.topic as PatientTopic)) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Patient help — MedBridge" },
      { name: "description", content: "Simple patient information from MedBridge. Coming soon." },
      { property: "og:title", content: "Patient help — MedBridge" },
      { property: "og:description", content: "Simple patient information from MedBridge. Coming soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TopicPage,
});

function TopicPage() {
  const { topic } = Route.useParams();
  const { t } = useT();
  return (
    <div className="pt-4">
      <PatientBack />
      <div className="card mt-6 p-8">
        <h1 className="text-3xl font-semibold text-foreground">{t(`topic.${topic as PatientTopic}`)}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{t("soon")}</p>
      </div>
    </div>
  );
}
