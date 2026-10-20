import type { Post, Reply } from "./medbridge-data";
import type { Activity } from "./posting-rules";

export const ME = "You";
export const MIN_VOTER_AGE_DAYS = 7;
export const DAILY_VOTE_LIMIT = 10;
export const FIRST_ANSWER_BONUS = 2;
const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;

type Votable = { author: string; helpful?: number | undefined; reports?: unknown[] | undefined; hidden?: boolean | undefined };

/** Reported or hidden content earns nothing. */
const earns = (x: Votable) => !x.hidden && !(x.reports?.length);

/** Points per author: 1 per helpful vote, plus a bonus for the first answer of a post that got a helpful vote. */
export function pointsByAuthor(posts: Post[]): Record<string, number> {
  const pts: Record<string, number> = {};
  const add = (a: string, n: number) => { if (n) pts[a] = (pts[a] ?? 0) + n; };
  const walk = (list: Reply[], bonusId?: string) => list.forEach((r) => {
    if (earns(r)) add(r.author, (r.helpful ?? 0) + (r.id === bonusId ? FIRST_ANSWER_BONUS : 0));
    walk(r.replies ?? [], bonusId);
  });
  for (const p of posts) {
    if (earns(p)) add(p.author, p.helpful);
    walk(p.replies, p.bonusReplyId);
  }
  return pts;
}

export function level(points: number): "Newcomer" | "Helper" | "Trusted" {
  if (points >= 50) return "Trusted";
  if (points >= 10) return "Helper";
  return "Newcomer";
}

/** Returns an error message when the vote is not allowed, or null. */
export function checkVote(author: string, accountCreatedAt: string | undefined, activity: Activity[], now = Date.now()): string | null {
  if (author === ME) return "You can't mark your own content as helpful.";
  if (!accountCreatedAt || now - new Date(accountCreatedAt).getTime() < MIN_VOTER_AGE_DAYS * DAY) return `Helpful votes count once your account is ${MIN_VOTER_AGE_DAYS} days old.`;
  const today = activity.filter((a) => a.type === "vote" && now - new Date(a.at).getTime() < DAY).length;
  if (today >= DAILY_VOTE_LIMIT) return `You can give up to ${DAILY_VOTE_LIMIT} helpful votes per day.`;
  return null;
}

const weekIndex = (t: number) => Math.floor((t - 4 * DAY) / WEEK); // weeks start on Monday

/** Consecutive active weeks; one skipped week is forgiven per 4 weeks. The current week may still be in progress. */
export function weeklyStreak(activity: Activity[], now = Date.now()): number {
  const active = new Set(activity.map((a) => weekIndex(new Date(a.at).getTime())));
  const current = weekIndex(now);
  let streak = 0;
  let lastSkip: number | null = null;
  for (let w = current; w > current - 520; w--) {
    if (active.has(w)) { streak++; continue; }
    if (w === current) continue;
    const canForgive = streak > 0 && active.has(w - 1) && (lastSkip === null || lastSkip - w >= 4);
    if (!canForgive) break;
    lastSkip = w;
  }
  return streak;
}

export const countReplies = (r: Reply[]): number => r.reduce((n, x) => n + 1 + countReplies(x.replies ?? []), 0);
export const isUnanswered = (p: Post) => countReplies(p.replies.filter((r) => !r.hidden)) === 0;
