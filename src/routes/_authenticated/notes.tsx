import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({
    meta: [
      { title: "Notes — MedBridge" },
      { name: "description", content: "The MedBridge notes area." },
      { property: "og:title", content: "Notes — MedBridge" },
      { property: "og:description", content: "The MedBridge notes area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlaceholderPage title="Notes" />,
});