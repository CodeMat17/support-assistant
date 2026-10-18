import { passages } from "./knowledge";

// Keyword retrieval (BM25) over the help-centre passages. A help centre this small
// would fit in one prompt, but retrieval is what lets the same pipeline scale to
// thousands of pages, and it keeps each answer's context short and inspectable.
// For a large or paraphrase-heavy knowledge base, swap this for embeddings.

const STOPWORDS = new Set(
  "a an and are as at be by can do does for from have how i if in is it me my of on or our so that the this to we what when where which who will with you your".split(
    " ",
  ),
);

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((t) => t && !STOPWORDS.has(t))
    .map((t) => (t.length > 3 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t));
}

const docs = passages.map((p) => tokenize(`${p.docTitle} ${p.heading} ${p.text}`));
const avgLen = docs.reduce((a, d) => a + d.length, 0) / docs.length;
const df = new Map<string, number>();
for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1);

export type Retrieved = { id: string; score: number };

/** Top-k passages for a question, best first. Passages with no overlap are dropped. */
export function retrieve(question: string, k = 5): Retrieved[] {
  const k1 = 1.2;
  const b = 0.75;
  const terms = [...new Set(tokenize(question))];
  return passages
    .map((p, i) => {
      const d = docs[i];
      let score = 0;
      for (const t of terms) {
        const tf = d.filter((x) => x === t).length;
        if (!tf) continue;
        const n = df.get(t) ?? 0;
        const idf = Math.log(1 + (passages.length - n + 0.5) / (n + 0.5));
        score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * d.length) / avgLen)));
      }
      return { id: p.id, score: Math.round(score * 100) / 100 };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
