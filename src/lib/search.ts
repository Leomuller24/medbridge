import { ARTICLES, type Article, type Post, SNOMED_SYMPTOMS, SYMPTOM_SYNONYMS, SYMPTOM_TRANSLATIONS, type Symptom } from "./medbridge-data";

export const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export function editDistance(a: string, b: string): number {
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]!;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]!;
      dp[j] = Math.min(dp[j]! + 1, dp[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length]!;
}

const allowed = (len: number) => (len <= 3 ? 0 : len <= 6 ? 1 : 2);

/** Returns the [start, end] range of the match in `text`, or null. Tolerates small typos. */
export function findMatch(query: string, text: string): [number, number] | null {
  const q = norm(query);
  if (!q) return null;
  const t = norm(text);
  const idx = t.indexOf(q);
  if (idx >= 0) return [idx, idx + q.length];
  // Fuzzy: compare the query to each word-window of the same word count.
  const words = [...t.matchAll(/\S+/g)];
  const n = q.split(/\s+/).length;
  for (let i = 0; i + n <= words.length; i++) {
    const start = words[i]!.index!;
    const last = words[i + n - 1]!;
    const end = last.index! + last[0].length;
    const win = t.slice(start, end);
    // compare also against word prefix of query length (typing in progress)
    const prefix = win.slice(0, q.length);
    if (editDistance(q, win) <= allowed(q.length) || (q.length >= 4 && editDistance(q, prefix) <= allowed(q.length))) return [start, end];
  }
  return null;
}

export type SymptomHit = { symptom: Symptom; field: "term" | "synonym" | "translation" | "code"; text: string; range: [number, number] };
export type ArticleHit = { article: Article; field: "title" | "tag"; text: string; range: [number, number] };
export type PostHit = { post: Post; text: string; range: [number, number] };

export function searchAll(query: string, opts: { language?: string | undefined; posts: Post[] }) {
  const symptoms: SymptomHit[] = [];
  const translations = opts.language ? SYMPTOM_TRANSLATIONS[opts.language] ?? {} : {};
  for (const s of SNOMED_SYMPTOMS) {
    const candidates: [SymptomHit["field"], string][] = [
      ["term", s.term],
      ["code", s.code],
      ...(SYMPTOM_SYNONYMS[s.term] ?? []).map((x) => ["synonym", x] as [SymptomHit["field"], string]),
      ...(translations[s.term] ? [["translation", translations[s.term]] as [SymptomHit["field"], string]] : []),
    ];
    for (const [field, text] of candidates) {
      if (field === "code" && !/^\d+$/.test(query.trim())) continue;
      const range = findMatch(query, text);
      if (range) { symptoms.push({ symptom: s, field, text, range }); break; }
    }
  }
  const articles: ArticleHit[] = [];
  for (const a of ARTICLES) {
    const r = findMatch(query, a.title);
    if (r) { articles.push({ article: a, field: "title", text: a.title, range: r }); continue; }
    for (const tag of a.tags) {
      const tr = findMatch(query, tag);
      if (tr) { articles.push({ article: a, field: "tag", text: tag, range: tr }); break; }
    }
  }
  const posts: PostHit[] = [];
  for (const p of opts.posts) {
    if (p.hidden) continue;
    const r = findMatch(query, p.title);
    if (r) posts.push({ post: p, text: p.title, range: r });
  }
  return { symptoms, articles, posts };
}

/** Closest symptom names and article tags, for when nothing matches. */
export function suggestions(query: string, limit = 4): string[] {
  const q = norm(query);
  const pool = [...SNOMED_SYMPTOMS.map((s) => s.term), ...new Set(ARTICLES.flatMap((a) => a.tags))];
  return pool
    .map((t) => ({ t, d: Math.min(editDistance(q, norm(t)), ...norm(t).split(" ").map((w) => editDistance(q, w) + 1)) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => x.t);
}
