import { useServerFn } from "@tanstack/react-start";
import { useCallback } from "react";
import { toast } from "sonner";

import { getStore, updateStore } from "@/lib/local-store";
import { aiModerate } from "@/lib/moderation.functions";
import { applyDecision, findQueueItem } from "@/lib/reports";

/** Sends a hidden item to the AI moderator and applies its decision. */
export function useAiReview() {
  const moderate = useServerFn(aiModerate);
  return useCallback(async (id: string) => {
    const item = findQueueItem(getStore().posts, id);
    if (!item) return;
    const post = getStore().posts.find((p) => p.id === item.postId);
    const text = item.kind === "post" && post ? `${post.title}\n\n${post.body}` : item.text;
    try {
      const res = await moderate({ data: { kind: item.kind, text: text.slice(0, 6000), reasons: item.reports.map((r) => r.reason) } });
      updateStore((s) => ({
        ...s,
        posts: applyDecision(s.posts, item, res.decision),
        modLog: [{ id: item.id, kind: item.kind, text: item.text.slice(0, 200), author: item.author, decision: res.decision, reason: res.reason, at: new Date().toISOString() }, ...s.modLog].slice(0, 100),
      }));
      if (res.decision === "remove") toast.info(`The AI moderator removed this ${item.kind}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI review failed. It stays hidden until reviewed.");
    }
  }, [moderate]);
}
