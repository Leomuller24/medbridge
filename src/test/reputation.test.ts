import { describe, expect, it } from "vitest";
import type { Post } from "@/lib/medbridge-data";
import { checkVote, level, pointsByAuthor, weeklyStreak } from "@/lib/reputation";

const post = (o: Partial<Post>): Post => ({ id: "p", category: "c", title: "t", body: "b", author: "Ana", createdAt: "", helpful: 0, language: "x", replies: [], ...o });
const now = new Date("2026-10-21T12:00:00Z").getTime();
const old = "2026-01-01T00:00:00Z";
const DAY = 864e5;
const at = (d: number) => new Date(now - d * DAY).toISOString();

describe("reputation", () => {
  it("1 point per helpful vote", () => expect(pointsByAuthor([post({ helpful: 3 })])["Ana"]).toBe(3));
  it("reported content earns nothing", () => expect(pointsByAuthor([post({ helpful: 3, reports: [{ reason: "Other", at: "" }] })])["Ana"]).toBeUndefined());
  it("first helpful answer gets +2", () => expect(pointsByAuthor([post({ bonusReplyId: "r", replies: [{ id: "r", author: "Bo", text: "", createdAt: "", helpful: 1 }] })])["Bo"]).toBe(3));
  it("cannot vote on own content", () => expect(checkVote("You", old, [], now)).toMatch(/own/));
  it("ignores votes from accounts under 7 days", () => expect(checkVote("Ana", at(6), [], now)).toMatch(/7 days/));
  it("limits 10 votes per day", () => {
    expect(checkVote("Ana", old, Array(9).fill({ type: "vote", at: at(0.1) }), now)).toBeNull();
    expect(checkVote("Ana", old, Array(10).fill({ type: "vote", at: at(0.1) }), now)).toMatch(/10/);
  });
  it("levels", () => { expect(level(9)).toBe("Newcomer"); expect(level(10)).toBe("Helper"); expect(level(50)).toBe("Trusted"); });
  it("streak counts consecutive weeks", () => expect(weeklyStreak([{ type: "post", at: at(0) }, { type: "vote", at: at(7) }, { type: "comment", at: at(14) }], now)).toBe(3));
  it("one skipped week is forgiven", () => expect(weeklyStreak([{ type: "post", at: at(0) }, { type: "post", at: at(14) }], now)).toBe(2));
  it("two skips in a month reset", () => expect(weeklyStreak([{ type: "post", at: at(0) }, { type: "post", at: at(14) }, { type: "post", at: at(28) }], now)).toBe(2));
  it("two missed weeks in a row reset", () => expect(weeklyStreak([{ type: "post", at: at(0) }, { type: "post", at: at(21) }], now)).toBe(1));
});
