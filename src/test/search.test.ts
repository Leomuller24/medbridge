import { describe, expect, it } from "vitest";

import { searchAll, suggestions } from "@/lib/search";

describe("search", () => {
  it("finds a symptom despite a small typo", () => {
    expect(searchAll("hedache", { posts: [] }).symptoms.map((h) => h.symptom.term)).toContain("Headache");
  });
  it("finds a symptom by synonym", () => {
    expect(searchAll("stomach ache", { posts: [] }).symptoms.map((h) => h.symptom.term)).toContain("Abdominal pain");
  });
  it("finds a symptom by its equivalent in the case language", () => {
    expect(searchAll("baş ağrısı", { language: "Turkish", posts: [] }).symptoms.map((h) => h.symptom.term)).toContain("Headache");
  });
  it("matches articles by summary", () => {
    expect(searchAll("co-therapists", { posts: [] }).articles.map((h) => h.article.id)).toContain("a8");
  });
  it("matches articles by tag", () => {
    expect(searchAll("Syria", { posts: [] }).articles.length).toBeGreaterThan(0);
  });
  it("offers suggestions when nothing matches", () => {
    expect(searchAll("zzqqxx", { posts: [] }).symptoms).toHaveLength(0);
    expect(suggestions("zzqqxx")).toHaveLength(4);
  });
});
