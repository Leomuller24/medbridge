import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (error) throw error;
      return data ? { ...data, email: u.user.email ?? "" } : null;
    },
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return async (values: {
    display_name?: string;
    role?: string;
    interests?: string[];
    languages?: string[];
    onboarded?: boolean;
    notify_email?: boolean;
    notify_community?: boolean;
  }) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Not signed in");
    const { error } = await supabase.from("profiles").upsert({ id: u.user.id, ...values, updated_at: new Date().toISOString() });
    if (error) throw error;
    await qc.invalidateQueries({ queryKey: ["profile"] });
  };
}
