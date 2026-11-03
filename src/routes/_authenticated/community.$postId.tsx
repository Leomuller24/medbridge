import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ThumbsUp } from "lucide-react";
import { useState } from "react";

import { PageShell, cardClass, formatDate } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { ReportButton } from "@/components/report-button";
import { PendingNotice, ProviderGate } from "@/components/pending-notice";
import { createAnswer, setHelpful, useCanPost, useCommunity, useRefreshCommunity } from "@/lib/community";
import type { Reply } from "@/lib/medbridge-data";
import { findPii, piiWarning } from "@/lib/pii";

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
  component: () => <ProviderGate><Thread /></ProviderGate>,
});

function Thread() {
  const { postId } = Route.useParams();
  const { data, isLoading } = useCommunity();
  const refresh = useRefreshCommunity();
  const canPost = useCanPost().data === true;
  const post = data?.posts.find((p) => p.id === postId);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const back = <Link to="/community" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" /> Back to feed</Link>;
  if (isLoading) return <PageShell title="Loading…">{back}</PageShell>;
  if (!post || post.status === "hidden") return <PageShell title="Post not found">{back}</PageShell>;

  const points = data?.points ?? {};
  const by = (name: string, id: string) => <>{name} · <span className="font-medium text-primary">{points[id] ?? 0} pts</span></>;

  async function vote(kind: "post" | "comment", id: string, on: boolean) {
    try {
      await setHelpful(kind, id, on);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your vote.");
    }
  }

  async function submit() {
    const t = text.trim().slice(0, 2000);
    if (!t) return;
    const hits = findPii(t);
    if (hits.length) return void toast.warning(piiWarning(hits));
    setBusy(true);
    try {
      await createAnswer(postId, replyTo, t);
      setText("");
      setReplyTo(null);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not post your reply.");
    } finally {
      setBusy(false);
    }
  }

  const renderReplies = (list: Reply[], depth = 0) => (
    <ul className={depth ? "mt-3 space-y-3 border-l border-border pl-5" : "space-y-4"}>
      {list.filter((r) => r.status !== "hidden").map((r) => (
        <li key={r.id}>
          <p className="text-xs text-muted-foreground">{by(r.author, r.authorId)} · {formatDate(r.createdAt)}{r.id === post.bonusReplyId && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 font-medium text-primary">First helpful answer +2</span>}</p>
          <p className="mt-1 text-sm text-foreground">{r.text}</p>
          <div className="flex items-center gap-3"><button type="button" aria-pressed={r.votedByMe} disabled={!canPost} onClick={() => vote("comment", r.id, !r.votedByMe)} className={`inline-flex items-center gap-1 text-xs font-medium ${r.votedByMe ? "text-primary" : "text-muted-foreground hover:text-primary"}`}><ThumbsUp aria-hidden="true" className="size-3.5" /> Helpful · {r.helpful ?? 0}</button><Button variant="link" className="h-auto p-0 text-xs" onClick={() => setReplyTo(r.id)}>Reply</Button><ReportButton kind="comment" targetId={r.id} label="comment" reported={r.reportedByMe} /></div>
          {r.replies.length ? renderReplies(r.replies, depth + 1) : null}
        </li>
      ))}
    </ul>
  );

  return (
    <PageShell eyebrow={post.category} title={post.title}>
      {back}
      <div className="mt-6"><PendingNotice /></div>
      <article className={`${cardClass} mt-6`}>
        <p className="text-xs text-muted-foreground">{by(post.author, post.authorId)} · {formatDate(post.createdAt)}</p>
        <p className="mt-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">Shared experience, not medical advice</p>
        <p className="mt-3 whitespace-pre-wrap leading-7 text-foreground">{post.body}</p>
        {post.source && <p className="mt-3 text-sm text-muted-foreground">Source: <a href={post.source} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-primary hover:underline">{post.source}</a></p>}
        <Button variant={post.votedByMe ? "default" : "outline"} className="mt-5" aria-pressed={post.votedByMe} disabled={!canPost} onClick={() => vote("post", post.id, !post.votedByMe)}>
          <ThumbsUp aria-hidden="true" /> Helpful · {post.helpful}
        </Button>
        <span className="ml-3"><ReportButton kind="post" targetId={post.id} label="post" reported={post.reportedByMe} /></span>
      </article>

      <section className={`${cardClass} mt-6`}>
        <h2 className="mb-4 font-semibold text-card-foreground">Comments</h2>
        {post.replies.length ? renderReplies(post.replies) : <p className="text-sm text-muted-foreground">No comments yet.</p>}
        <div className="mt-6 border-t border-border pt-5">
          {replyTo && <p className="mb-2 text-xs text-muted-foreground">Replying to a comment · <button type="button" className="text-primary" onClick={() => setReplyTo(null)}>cancel</button></p>}
          <Textarea aria-label="Your reply" maxLength={2000} placeholder="Write a reply. No patient details." value={text} onChange={(e) => setText(e.target.value)} />
          <Button className="mt-3" onClick={submit} disabled={!text.trim() || busy || !canPost}>Post reply</Button>
        </div>
      </section>
    </PageShell>
  );
}
