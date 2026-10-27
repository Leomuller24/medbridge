import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    const { data: profile } = await supabase.from("profiles").select("account_role").eq("id", data.user.id).maybeSingle();
    if (profile?.account_role === "patient") throw redirect({ to: "/patient" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/onboarding") return <Outlet />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
