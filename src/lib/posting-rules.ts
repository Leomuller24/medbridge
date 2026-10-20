import type { User } from "@supabase/supabase-js";

export const NEW_ACCOUNT_DAYS = 7;
export const DAILY_POST_LIMIT = 3;
export const DAILY_COMMENT_LIMIT = 10;
const DAY = 24 * 60 * 60 * 1000;

export type Activity = { type: "post" | "comment" | "vote"; at: string };

type UserLike = Pick<User, "created_at" | "app_metadata"> & { email_confirmed_at?: string | null | undefined };

export function isVerified(user: UserLike | null | undefined): boolean {
  if (!user) return false;
  const providers = (user.app_metadata?.["providers"] as string[] | undefined) ?? [user.app_metadata?.["provider"] as string];
  return providers.includes("google") || Boolean(user.email_confirmed_at);
}

export function isNewAccount(user: UserLike, now = Date.now()): boolean {
  return now - new Date(user.created_at).getTime() < NEW_ACCOUNT_DAYS * DAY;
}

export function containsLink(text: string): boolean {
  return /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|ch|org|net|io|de|fr|info|ly|me|co)\b)/i.test(text);
}

/** Returns an error message when the action is not allowed, or null when it is. */
export function checkPosting(
  user: UserLike | null | undefined,
  type: "post" | "comment",
  text: string,
  activity: Activity[],
  now = Date.now(),
): string | null {
  if (!user || !isVerified(user)) return "Please verify your account (confirm your email or sign in with Google) before posting or commenting.";
  if (!isNewAccount(user, now)) return null;
  const today = activity.filter((a) => a.type === type && now - new Date(a.at).getTime() < DAY).length;
  if (type === "post" && today >= DAILY_POST_LIMIT) return `New accounts can share up to ${DAILY_POST_LIMIT} posts per day. Please try again tomorrow.`;
  if (type === "comment" && today >= DAILY_COMMENT_LIMIT) return `New accounts can write up to ${DAILY_COMMENT_LIMIT} comments per day. Please try again tomorrow.`;
  if (type === "post" && containsLink(text)) return `Links in posts are allowed after your first ${NEW_ACCOUNT_DAYS} days.`;
  return null;
}
