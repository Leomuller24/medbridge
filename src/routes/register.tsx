import { createFileRoute } from "@tanstack/react-router";

import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — MedBridge" },
      { name: "description", content: "Register for the MedBridge demonstration." },
      { property: "og:title", content: "Register — MedBridge" },
      { property: "og:description", content: "Register for the MedBridge demonstration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthForm mode="register" />,
});