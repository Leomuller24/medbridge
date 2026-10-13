import type { Post, Reply } from "./medbridge-data";

export const REPORT_REASONS = ["Misinformation", "Personal information", "Spam or advertising", "Disrespectful", "Other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
export const HIDE_THRESHOLD = 3;

export type Report = { reason: ReportReason; at: string; detail?: string | undefined };
export type Reportable = { reports?: Report[] | undefined; hidden?: boolean | undefined };

/** Adds a report; the item is hidden once it reaches the threshold. */
export function addReport<T extends Reportable>(item: T, report: Report): T {
  const reports = [...(item.reports ?? []), report];
  return { ...item, reports, hidden: item.hidden || reports.length >= HIDE_THRESHOLD };
}

export const isVisible = (item: Reportable) => !item.hidden;

export function reportReply(list: Reply[], id: string, report: Report): Reply[] {
  return list.map((r) => (r.id === id ? addReport(r, report) : { ...r, replies: reportReply(r.replies ?? [], id, report) }));
}

export function setReplyHidden(list: Reply[], id: string, hidden: boolean): Reply[] {
  return list.map((r) => (r.id === id ? { ...r, hidden, reports: hidden ? r.reports : [] } : { ...r, replies: setReplyHidden(r.replies ?? [], id, hidden) }));
}

export function removeReply(list: Reply[], id: string): Reply[] {
  return list.filter((r) => r.id !== id).map((r) => ({ ...r, replies: removeReply(r.replies ?? [], id) }));
}

export type QueueItem = { kind: "post" | "comment"; postId: string; id: string; text: string; author: string; reports: Report[] };

export function moderationQueue(posts: Post[]): QueueItem[] {
  const out: QueueItem[] = [];
  const walk = (postId: string, list: Reply[]) => list.forEach((r) => {
    if (r.hidden) out.push({ kind: "comment", postId, id: r.id, text: r.text, author: r.author, reports: r.reports ?? [] });
    walk(postId, r.replies ?? []);
  });
  for (const p of posts) {
    if (p.hidden) out.push({ kind: "post", postId: p.id, id: p.id, text: p.title, author: p.author, reports: p.reports ?? [] });
    walk(p.id, p.replies);
  }
  return out;
}
