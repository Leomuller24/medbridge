import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MedBridge" },
      { name: "description", content: "The MedBridge settings area." },
      { property: "og:title", content: "Settings — MedBridge" },
      { property: "og:description", content: "The MedBridge settings area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlaceholderPage title="Settings" />,
});