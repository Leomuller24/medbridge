import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ThumbsUp } from "lucide-react";
import { useState } from "react";

import { PageShell, cardClass, formatDate } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { newId, updateStore, useStore } from "@/lib/local-store";
import { checkPosting } from "@/lib/posting-rules";
import { addReport, reportReply } from "@/lib/reports";
import { ReportButton } from "@/components/report-button";
import type { Reply } from "@/lib/medbridge-data";

export const Route = createFileRoute("/_authenticated/community/$postId")({
  head: () => ({
    meta: [
      { title: "Community thread — MedBridge" },
      { name: "description", content: "A MedBridge community discussion." },
      { property: "og:title", content: "Community thread — MedBridge" },
      { property: "og:description", content: "A MedBridge community discussion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Thread,
});

function addReply(list: Reply[], parentId: string | null, reply: Reply): Reply[] {
  if (!parentId) return [...list, reply];
  return list.map((r) => (r.id === parentId ? { ...r, replies: [...(r.replies ?? []), reply] } : { ...r, replies: addReply(r.replies ?? [], parentId, reply) }));
}

function Thread() {
  const { postId } = Route.useParams();
  const { posts, helpful, activity } = useStore();
  const post = posts.find((p) => p.id === postId);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const back = <Link to="/community" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" /> Back to feed</Link>;
  if (!post || post.hidden) return <PageShell title="Post not found">{back}</PageShell>;
  const marked = helpful.includes(post.id);

  function toggleHelpful() {
    updateStore((s) => ({
      ...s,
      helpful: marked ? s.helpful.filter((h) => h !== postId) : [...s.helpful, postId],
      posts: s.posts.map((p) => (p.id === postId ? { ...p, helpful: p.helpful + (marked ? -1 : 1) } : p)),
    }));
  }

  async function submit() {
    const t = text.trim().slice(0, 2000);
    if (!t) return;
    const { data } = await supabase.auth.getUser();
    const blocked = checkPosting(data.user, "comment", t, activity);
    if (blocked) return void toast.error(blocked);
    const reply: Reply = { id: newId(), author: "You", text: t, createdAt: new Date().toISOString() };
    updateStore((s) => ({ ...s, activity: [...s.activity, { type: "comment", at: reply.createdAt }], posts: s.posts.map((p) => (p.id === postId ? { ...p, replies: addReply(p.replies, replyTo, reply) } : p)) }));
    setText("");
    setReplyTo(null);
  }

  const renderReplies = (list: Reply[], depth = 0) => (
    <ul className={depth ? "mt-3 space-y-3 border-l border-border pl-5" : "space-y-4"}>
      {list.filter((r) => !r.hidden).map((r) => (
        <li key={r.id}>
          <p className="text-xs text-muted-foreground">{r.author} · {formatDate(r.createdAt)}</p>
          <p className="mt-1 text-sm text-foreground">{r.text}</p>
          <div className="flex items-center gap-3"><Button variant="link" className="h-auto p-0 text-xs" onClick={() => setReplyTo(r.id)}>Reply</Button><ReportButton targetId={r.id} label="comment" onReport={(rep) => updateStore((s) => ({ ...s, posts: s.posts.map((p) => (p.id === postId ? { ...p, replies: reportReply(p.replies, r.id, rep) } : p)) }))} /></div>
          {r.replies?.length ? renderReplies(r.replies, depth + 1) : null}
        </li>
      ))}
    </ul>
  );

  return (
    <PageShell eyebrow={post.category} title={post.title}>
      {back}
      <article className={`${cardClass} mt-6`}>
        <p className="text-xs text-muted-foreground">{post.author} · {formatDate(post.createdAt)}</p>
        <p className="mt-3 whitespace-pre-wrap leading-7 text-foreground">{post.body}</p>
        <Button variant={marked ? "default" : "outline"} className="mt-5" aria-pressed={marked} onClick={toggleHelpful}>
          <ThumbsUp aria-hidden="true" /> Helpful · {post.helpful}
        </Button>
        <span className="ml-3"><ReportButton targetId={post.id} label="post" onReport={(rep) => updateStore((s) => ({ ...s, posts: s.posts.map((p) => (p.id === postId ? addReport(p, rep) : p)) }))} /></span>
      </article>

      <section className={`${cardClass} mt-6`}>
        <h2 className="mb-4 font-semibold text-card-foreground">Comments</h2>
        {post.replies.length ? renderReplies(post.replies) : <p className="text-sm text-muted-foreground">No comments yet.</p>}
        <div className="mt-6 border-t border-border pt-5">
          {replyTo && <p className="mb-2 text-xs text-muted-foreground">Replying to a comment · <button type="button" className="text-primary" onClick={() => setReplyTo(null)}>cancel</button></p>}
          <Textarea aria-label="Your reply" maxLength={2000} placeholder="Write a reply. No patient details." value={text} onChange={(e) => setText(e.target.value)} />
          <Button className="mt-3" onClick={submit} disabled={!text.trim()}>Post reply</Button>
        </div>
      </section>
    </PageShell>
  );
}
