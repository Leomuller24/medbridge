import { describe, expect, it } from "vitest";

import { checkPosting, type Activity } from "@/lib/posting-rules";

const now = new Date("2026-10-13T12:00:00Z").getTime();
const fresh = { created_at: "2026-10-12T12:00:00Z", email_confirmed_at: "2026-10-12T12:05:00Z", app_metadata: { provider: "email" } };
const old = { ...fresh, created_at: "2026-09-01T12:00:00Z" };
const acts = (type: Activity["type"], n: number): Activity[] => Array.from({ length: n }, () => ({ type, at: "2026-10-13T10:00:00Z" }));

describe("posting rules", () => {
  it("blocks unverified email accounts", () => {
    expect(checkPosting({ ...fresh, email_confirmed_at: undefined }, "comment", "hi", [], now)).not.toBeNull();
  });
  it("allows unconfirmed-email Google accounts", () => {
    expect(checkPosting({ ...fresh, email_confirmed_at: undefined, app_metadata: { provider: "google" } }, "comment", "hi", [], now)).toBeNull();
  });
  it("limits new accounts to 3 posts per day", () => {
    expect(checkPosting(fresh, "post", "hi", acts("post", 2), now)).toBeNull();
    expect(checkPosting(fresh, "post", "hi", acts("post", 3), now)).not.toBeNull();
  });
  it("limits new accounts to 10 comments per day", () => {
    expect(checkPosting(fresh, "comment", "hi", acts("comment", 9), now)).toBeNull();
    expect(checkPosting(fresh, "comment", "hi", acts("comment", 10), now)).not.toBeNull();
  });
  it("blocks links in posts for the first 7 days only", () => {
    expect(checkPosting(fresh, "post", "see https://x.ch", [], now)).not.toBeNull();
    expect(checkPosting(old, "post", "see https://x.ch", [], now)).toBeNull();
  });
  it("does not limit accounts older than 7 days", () => {
    expect(checkPosting(old, "post", "hi", acts("post", 5), now)).toBeNull();
  });
});
