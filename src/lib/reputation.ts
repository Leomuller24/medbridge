import type { Post, Reply } from "./medbridge-data";

// Points, levels and streaks are calculated by the backend (community_my_stats / community_authors).
// These helpers only shape data for display.

export const FIRST_ANSWER_BONUS = 2;

export const countReplies = (r: Reply[]): number => r.filter((x) => x.status !== "hidden").reduce((n, x) => n + 1 + countReplies(x.replies), 0);
export const isUnanswered = (p: Post) => countReplies(p.replies) === 0;
