import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Deletes the caller's own community content, votes, reports and account. Acts only on the signed-in user. */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const uid = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("community_votes").delete().eq("voter_id", uid);
    await supabaseAdmin.from("community_reports").delete().eq("reporter_id", uid);
    await supabaseAdmin.from("community_answers").delete().eq("author_id", uid);
    await supabaseAdmin.from("community_posts").delete().eq("author_id", uid);
    await supabaseAdmin.from("community_warnings").delete().eq("user_id", uid);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (error) throw new Error("Could not delete the account. Please try again.");
    return { ok: true };
  });
