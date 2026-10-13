import { describe, expect, it } from "vitest";

import type { Post } from "@/lib/medbridge-data";
import { addReport, moderationQueue, reportReply } from "@/lib/reports";

const r = { reason: "Spam or advertising" as const, at: "2026-10-13T10:00:00Z" };
const post: Post = { id: "p1", category: "x", title: "T", body: "B", author: "A", createdAt: "", helpful: 0, language: "Arabic", replies: [{ id: "c1", author: "B", text: "hi", createdAt: "" }] };

describe("reports", () => {
  it("keeps a post visible with 2 reports", () => {
    expect(addReport(addReport(post, r), r).hidden).toBe(false);
  });
  it("hides a post at 3 reports and queues it", () => {
    const hidden = addReport(addReport(addReport(post, r), r), r);
    expect(hidden.hidden).toBe(true);
    expect(moderationQueue([hidden]).map((q) => q.id)).toEqual(["p1"]);
  });
  it("hides a comment at 3 reports and queues it", () => {
    const replies = reportReply(reportReply(reportReply(post.replies, "c1", r), "c1", r), "c1", r);
    expect(moderationQueue([{ ...post, replies }]).map((q) => q.id)).toEqual(["c1"]);
  });
});
