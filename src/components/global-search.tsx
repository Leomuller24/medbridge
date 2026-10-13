import { Link } from "@tanstack/react-router";
import { BookOpen, Search, Stethoscope, UsersRound, X } from "lucide-react";
import { useMemo, useState } from "react";

import { useStore } from "@/lib/local-store";
import { searchAll, suggestions } from "@/lib/search";
import { cn } from "@/lib/utils";

const TABS = ["All", "Symptoms", "Articles", "Community"] as const;
type Tab = (typeof TABS)[number];

function Mark({ text, range }: { text: string; range: [number, number] }) {
  return (
    <>
      {text.slice(0, range[0])}
      <mark className="rounded bg-accent px-0.5 font-semibold text-accent-foreground">{text.slice(range[0], range[1])}</mark>
      {text.slice(range[1])}
    </>
  );
}

export function GlobalSearch({ language, selected = [], onSelectSymptom }: { language?: string; selected?: string[]; onSelectSymptom: (term: string) => void }) {
  const { posts } = useStore();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("All");
  const q = query.trim();
  const results = useMemo(() => (q.length >= 2 ? searchAll(q, { language, posts }) : null), [q, language, posts]);
  const none = results && !results.symptoms.length && !results.articles.length && !results.posts.length;
  const show = (t: Tab) => tab === "All" || tab === t;

  return (
    <div className="sticky top-0 z-30 -mx-2 bg-background/95 px-2 py-3 backdrop-blur print:hidden">
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search symptoms, articles and community posts"
          placeholder={language ? `Search symptoms (also in ${language}), articles, community…` : "Search symptoms, articles, community…"}
          className="h-16 w-full rounded-2xl border border-border bg-card pl-14 pr-12 text-lg shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-ring/20"
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        )}
      </div>
      <div role="tablist" aria-label="Filter results" className="mt-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded-full border px-4 py-1.5 text-sm font-medium transition-colors", tab === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>
            {t}
          </button>
        ))}
      </div>

      {results && (
        <div className="mt-3 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-md">
          {none ? (
            <div className="text-sm">
              <p className="text-muted-foreground">No results for “{q}”. Did you mean:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions(q).map((s) => (
                  <button key={s} type="button" onClick={() => setQuery(s)} className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground hover:bg-accent">{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {show("Symptoms") && results.symptoms.length > 0 && (
                <Group icon={Stethoscope} title="Symptoms">
                  {results.symptoms.map((h) => (
                    <li key={h.symptom.code}>
                      <button type="button" onClick={() => { onSelectSymptom(h.symptom.term); setQuery(""); }}
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted">
                        <span>
                          <span className="font-medium">{h.field === "term" ? <Mark text={h.text} range={h.range} /> : h.symptom.term}</span>
                          {h.field !== "term" && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              {h.field === "translation" ? `${language}: ` : h.field === "synonym" ? "also: " : "code "}
                              <Mark text={h.text} range={h.range} />
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">{selected.includes(h.symptom.term) ? "Added" : `${h.symptom.category} · ${h.symptom.code}`}</span>
                      </button>
                    </li>
                  ))}
                </Group>
              )}
              {show("Articles") && results.articles.length > 0 && (
                <Group icon={BookOpen} title="Articles and resources">
                  {results.articles.map((h) => (
                    <li key={h.article.id}>
                      <Link to="/resources" hash={h.article.id} className="block rounded-lg px-3 py-2 hover:bg-muted">
                        <span className="font-medium">{h.field === "title" ? <Mark text={h.text} range={h.range} /> : h.article.title}</span>
                        {h.field === "tag" && <span className="ml-2 text-sm text-muted-foreground">tag: <Mark text={h.text} range={h.range} /></span>}
                      </Link>
                    </li>
                  ))}
                </Group>
              )}
              {show("Community") && results.posts.length > 0 && (
                <Group icon={UsersRound} title="Community posts">
                  {results.posts.map((h) => (
                    <li key={h.post.id}>
                      <Link to="/community/$postId" params={{ postId: h.post.id }} className="block rounded-lg px-3 py-2 hover:bg-muted">
                        <span className="font-medium"><Mark text={h.text} range={h.range} /></span>
                        <span className="ml-2 text-sm text-muted-foreground">{h.post.category}</span>
                      </Link>
                    </li>
                  ))}
                </Group>
              )}
              {tab !== "All" && !(tab === "Symptoms" ? results.symptoms : tab === "Articles" ? results.articles : results.posts).length && (
                <p className="text-sm text-muted-foreground">No {tab.toLowerCase()} match “{q}”.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ icon: Icon, title, children }: { icon: typeof Search; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wide text-primary"><Icon aria-hidden="true" className="size-4" /> {title}</h3>
      <ul className="mt-1">{children}</ul>
    </section>
  );
}
