import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({
    meta: [
      { title: "Community — MedBridge" },
      { name: "description", content: "The MedBridge community area." },
      { property: "og:title", content: "Community — MedBridge" },
      { property: "og:description", content: "The MedBridge community area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlaceholderPage title="Community" />,
});