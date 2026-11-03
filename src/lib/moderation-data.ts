import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { ContentStatus } from "./medbridge-data";
import type { ReportReason } from "./reports";

export type QueueItem = { kind: "post" | "comment"; id: string; postId: string; text: string; authorId: string; author: string; status: ContentStatus; reports: { reason: ReportReason; at: string }[] };

/** Reported items. Only moderators/admins can read reports and hidden content (enforced by the backend). */
export function useReportedItems() {
  return useQuery({
    queryKey: ["community", "reported"],
    queryFn: async (): Promise<QueueItem[]> => {
      const { data: reps, error } = await supabase.from("community_reports").select("post_id, answer_id, reason, created_at").order("created_at");
      if (error) throw error;
      const postIds = [...new Set((reps ?? []).flatMap((r) => (r.post_id ? [r.post_id] : [])))];
      const ansIds = [...new Set((reps ?? []).flatMap((r) => (r.answer_id ? [r.answer_id] : [])))];
      const [posts, answers] = await Promise.all([
        postIds.length ? supabase.from("community_posts").select("id, title, author_id, status").in("id", postIds) : Promise.resolve({ data: [], error: null }),
        ansIds.length ? supabase.from("community_answers").select("id, post_id, body, author_id, status").in("id", ansIds) : Promise.resolve({ data: [], error: null }),
      ]);
      if (posts.error) throw posts.error;
      if (answers.error) throw answers.error;
      const authorIds = [...new Set([...(posts.data ?? []).map((p) => p.author_id), ...(answers.data ?? []).map((a) => a.author_id)])];
      const { data: authors } = authorIds.length ? await supabase.rpc("community_authors", { _ids: authorIds }) : { data: [] };
      const name = (id: string) => (authors ?? []).find((a) => a.user_id === id)?.display_name ?? "Colleague";
      const repsFor = (id: string) => (reps ?? []).filter((r) => (r.post_id ?? r.answer_id) === id).map((r) => ({ reason: r.reason as ReportReason, at: r.created_at }));
      return [
        ...(posts.data ?? []).map((p) => ({ kind: "post" as const, id: p.id, postId: p.id, text: p.title, authorId: p.author_id, author: name(p.author_id), status: p.status as ContentStatus, reports: repsFor(p.id) })),
        ...(answers.data ?? []).map((a) => ({ kind: "comment" as const, id: a.id, postId: a.post_id, text: a.body, authorId: a.author_id, author: name(a.author_id), status: a.status as ContentStatus, reports: repsFor(a.id) })),
      ];
    },
  });
}

export function useModLog() {
  return useQuery({
    queryKey: ["community", "mod-log"],
    queryFn: async () => {
      const { data, error } = await supabase.from("community_mod_log").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useIsModerator() {
  return useQuery({
    queryKey: ["is-moderator"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.rpc("is_community_moderator", { _user_id: u.user.id });
      return data === true;
    },
    staleTime: 60_000,
  });
}
