import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { ContentStatus, Post, Reply } from "./medbridge-data";
import type { ReportReason } from "./reports";

// Community posts, answers, votes and reports live in the backend.
// All rules (who may read/write, vote limits, points, streaks) are enforced there.

export const COMMUNITY_KEY = ["community"] as const;

export type CommunityData = { posts: Post[]; points: Record<string, number>; me: string | null };

async function loadCommunity(): Promise<CommunityData> {
  const { data: u } = await supabase.auth.getUser();
  const me = u.user?.id ?? null;
  const [posts, answers, votes, reports] = await Promise.all([
    supabase.from("community_posts").select("*").order("created_at", { ascending: false }),
    supabase.from("community_answers").select("*").order("created_at", { ascending: true }),
    supabase.from("community_votes").select("voter_id, post_id, answer_id, counts"),
    supabase.from("community_reports").select("post_id, answer_id").eq("reporter_id", me ?? ""),
  ]);
  const err = posts.error ?? answers.error ?? votes.error ?? reports.error;
  if (err) throw err;

  const ids = [...new Set([...(posts.data ?? []).map((p) => p.author_id), ...(answers.data ?? []).map((a) => a.author_id)])];
  const authors = ids.length ? await supabase.rpc("community_authors", { _ids: ids }) : { data: [], error: null };
  if (authors.error) throw authors.error;
  const byId = new Map((authors.data ?? []).map((a) => [a.user_id, a]));
  const points: Record<string, number> = Object.fromEntries((authors.data ?? []).map((a) => [a.user_id, a.points]));

  const count = new Map<string, number>();
  const counted = new Set<string>();
  const mine = new Set<string>();
  for (const v of votes.data ?? []) {
    const id = (v.post_id ?? v.answer_id) as string;
    count.set(id, (count.get(id) ?? 0) + 1);
    if (v.counts) counted.add(id);
    if (v.voter_id === me) mine.add(id);
  }
  const reported = new Set((reports.data ?? []).map((r) => (r.post_id ?? r.answer_id) as string));
  const name = (id: string) => byId.get(id)?.display_name ?? "Colleague";

  const replies = new Map<string, Reply>();
  for (const a of answers.data ?? []) {
    replies.set(a.id, { id: a.id, authorId: a.author_id, author: name(a.author_id), text: a.body, createdAt: a.created_at, status: a.status as ContentStatus, helpful: count.get(a.id) ?? 0, votedByMe: mine.has(a.id), reportedByMe: reported.has(a.id), replies: [] });
  }
  const top = new Map<string, Reply[]>();
  for (const a of answers.data ?? []) {
    const r = replies.get(a.id)!;
    const parent = a.parent_id ? replies.get(a.parent_id) : undefined;
    if (parent) parent.replies.push(r);
    else top.set(a.post_id, [...(top.get(a.post_id) ?? []), r]);
  }

  return {
    me,
    points,
    posts: (posts.data ?? []).map((p) => {
      const list = top.get(p.id) ?? [];
      return {
        id: p.id, authorId: p.author_id, author: name(p.author_id), authorRole: byId.get(p.author_id)?.job_role ?? "",
        category: p.category, title: p.title, body: p.body, createdAt: p.created_at, language: p.language,
        source: p.source ?? undefined, status: p.status as ContentStatus,
        helpful: count.get(p.id) ?? 0, votedByMe: mine.has(p.id), reportedByMe: reported.has(p.id),
        replies: list, bonusReplyId: list.find((r) => counted.has(r.id))?.id,
      };
    }),
  };
}

export function useCommunity() {
  return useQuery({ queryKey: COMMUNITY_KEY, queryFn: loadCommunity, staleTime: 15_000 });
}

export function useRefreshCommunity() {
  const qc = useQueryClient();
  return useCallback(() => qc.invalidateQueries({ queryKey: ["community"] }), [qc]);
}

/** Server-computed points, level and weekly streak for the signed-in user. */
export function useMyStats() {
  return useQuery({
    queryKey: ["community", "my-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("community_my_stats");
      if (error) throw error;
      return data?.[0] ?? { points: 0, level: "Newcomer", streak: 0 };
    },
  });
}

const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message); };

async function myId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Please sign in.");
  return data.user.id;
}

export async function createPost(p: { category: string; title: string; body: string; language: string; source?: string | undefined }) {
  const author_id = await myId();
  const { error } = await supabase.from("community_posts").insert({ author_id, ...p, source: p.source ?? null });
  fail(error);
}

export async function createAnswer(postId: string, parentId: string | null, body: string) {
  const author_id = await myId();
  const { error } = await supabase.from("community_answers").insert({ author_id, post_id: postId, parent_id: parentId, body });
  fail(error);
}

export async function setHelpful(kind: "post" | "comment", id: string, on: boolean) {
  const voter_id = await myId();
  const col = kind === "post" ? "post_id" : "answer_id";
  if (on) fail((await supabase.from("community_votes").insert(kind === "post" ? { voter_id, post_id: id, answer_id: null } : { voter_id, post_id: null, answer_id: id })).error);
  else fail((await supabase.from("community_votes").delete().eq("voter_id", voter_id).eq(col, id)).error);
}

export async function reportItem(kind: "post" | "comment", id: string, reason: ReportReason, detail?: string | undefined) {
  const reporter_id = await myId();
  const target = kind === "post" ? { post_id: id } : { answer_id: id };
  const { error } = await supabase.from("community_reports").insert({ reporter_id, ...target, reason, detail: detail ?? null });
  fail(error);
}

export function findItem(posts: Post[], id: string): { kind: "post" | "comment"; post: Post; item: Post | Reply } | undefined {
  const walk = (list: Reply[]): Reply | undefined => {
    for (const r of list) { if (r.id === id) return r; const f = walk(r.replies); if (f) return f; }
    return undefined;
  };
  for (const p of posts) {
    if (p.id === id) return { kind: "post", post: p, item: p };
    const r = walk(p.replies);
    if (r) return { kind: "comment", post: p, item: r };
  }
  return undefined;
}

/** Whether the signed-in account is an approved provider (checked by the backend from the roles table). */
export function useCanPost() {
  return useQuery({
    queryKey: ["community", "can-post"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.rpc("is_provider", { _user_id: u.user.id });
      return data === true;
    },
    staleTime: 60_000,
  });
}
