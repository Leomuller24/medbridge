import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { getStore, updateStore } from "./local-store";
import type { Reply } from "./medbridge-data";
import { checkVote } from "./reputation";

function bump(list: Reply[], id: string, d: number): Reply[] {
  return list.map((r) => (r.id === id ? { ...r, helpful: Math.max(0, (r.helpful ?? 0) + d) } : { ...r, replies: bump(r.replies ?? [], id, d) }));
}

/** Toggle a helpful vote on a post (replyId omitted) or on a comment/answer. */
export async function toggleHelpful(postId: string, author: string, replyId?: string) {
  const targetId = replyId ?? postId;
  const s = getStore();
  const marked = s.helpful.includes(targetId);
  if (!marked) {
    const { data } = await supabase.auth.getUser();
    const blocked = checkVote(author, data.user?.created_at, s.activity);
    if (blocked) return void toast.error(blocked);
  }
  const d = marked ? -1 : 1;
  updateStore((st) => ({
    ...st,
    helpful: marked ? st.helpful.filter((h) => h !== targetId) : [...st.helpful, targetId],
    activity: marked ? st.activity : [...st.activity, { type: "vote", at: new Date().toISOString() }],
    posts: st.posts.map((p) => {
      if (p.id !== postId) return p;
      if (!replyId) return { ...p, helpful: Math.max(0, p.helpful + d) };
      const isAnswer = p.replies.some((r) => r.id === replyId);
      const bonusReplyId = !marked && isAnswer && !p.bonusReplyId ? replyId : p.bonusReplyId;
      return { ...p, bonusReplyId, replies: bump(p.replies, replyId, d) };
    }),
  }));
}
