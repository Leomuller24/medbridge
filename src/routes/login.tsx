import { createFileRoute } from "@tanstack/react-router";

import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — MedBridge" },
      { name: "description", content: "Log in to the MedBridge demonstration." },
      { property: "og:title", content: "Log in — MedBridge" },
      { property: "og:description", content: "Log in to the MedBridge demonstration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});