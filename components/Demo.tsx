"use client";

import { knowledge, passages, sentences } from "@/lib/knowledge";
import { behaviourChecks, type Question } from "@/lib/questions";
import type { Citation, SavedRun } from "@/lib/types";
import { AlertTriangle, BookOpen, Check, MessageCircle, RotateCcw, Search, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const REASONS = {
  not_in_docs: "Not covered by the help centre",
  needs_account_access: "Needs a booking checked or changed",
} as const;

type Turn = { questionId: string; pending: boolean };

export default function Demo({ questions, results }: { questions: Question[]; results: Record<string, SavedRun> }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [focus, setFocus] = useState<Citation | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<HTMLDivElement>(null);

  const runFor = (id: string) => results[id];
  const replyFor = (q: Question) => runFor(q.id)?.reply ?? q.reference;
  const byId = (id: string) => questions.find((q) => q.id === id)!;

  const ask = (id: string) => {
    const index = turns.length;
    setTurns((t) => [...t, { questionId: id, pending: true }]);
    setActive(index);
    setFocus(null);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => setTurns((t) => t.map((turn, i) => (i === index ? { ...turn, pending: false } : turn))), reduced ? 0 : 900);
  };

  const reset = () => {
    setTurns([]);
    setActive(null);
    setFocus(null);
  };

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turns]);

  useEffect(() => {
    if (!focus) return;
    sourcesRef.current?.querySelector(`[data-passage="${focus.source}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focus]);

  const activeTurn = active != null ? turns[active] : null;
  const activeQuestion = activeTurn && !activeTurn.pending ? byId(activeTurn.questionId) : null;
  const activeRun = activeQuestion ? runFor(activeQuestion.id) : undefined;
  const activeReply = activeQuestion ? replyFor(activeQuestion) : null;
  const activeCitations = activeReply?.segments.flatMap((s) => s.citations) ?? [];
  const retrievedIds = activeRun
    ? activeRun.retrieved.map((r) => r.id)
    : [...new Set(activeCitations.map((c) => c.source))];
  const asked = new Set(turns.map((t) => t.questionId));
  const anyRun = Object.keys(results).length > 0;

  // Number citations per reply, one number per distinct passage.
  const numbering = (id: string) => {
    const order: string[] = [];
    for (const s of replyFor(byId(id)).segments) for (const c of s.citations) if (!order.includes(c.source)) order.push(c.source);
    return (source: string) => order.indexOf(source) + 1;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      {/* Chat */}
      <div className="flex min-w-0 flex-col overflow-hidden rounded-3xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MessageCircle className="size-4" />
            </span>
            <div>
              <p className="font-semibold leading-tight">Kijani Trails help</p>
              <p className="text-xs text-muted-foreground">Answers from the help centre, with sources</p>
            </div>
          </div>
          <span
            className={cx(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px]",
              anyRun ? "border-primary/40 text-primary" : "border-border text-muted-foreground",
            )}>
            {anyRun
              ? `${Object.values(results)[0].model} · saved run ${new Date(Object.values(results)[0].answered_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
              : "Reference answers · model run pending"}
          </span>
        </div>

        <div className="flex min-h-[26rem] flex-1 flex-col gap-5 overflow-y-auto px-5 py-6 lg:max-h-[38rem]">
          {turns.length === 0 && (
            <div className="m-auto max-w-sm text-center">
              <p className="text-lg font-semibold tracking-tight">Ask the assistant something</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Pick a question below. Two of them aren&apos;t covered by the help centre, so you can see what it does when it
                doesn&apos;t know.
              </p>
            </div>
          )}

          {turns.map((turn, i) => {
            const q = byId(turn.questionId);
            const reply = replyFor(q);
            const run = runFor(q.id);
            const num = numbering(q.id);
            const checks = run ? behaviourChecks(q, run) : null;
            return (
              <div key={i} className="space-y-3">
                <p className="fade-up ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {q.question}
                </p>

                {turn.pending ? (
                  <p className="fade-up flex w-fit items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                    <Search className="size-3.5 animate-pulse" />
                    Searching the help centre…
                  </p>
                ) : (
                  <div
                    onClick={() => setActive(i)}
                    className={cx(
                      "fade-up max-w-[92%] cursor-pointer rounded-2xl rounded-bl-md border px-4 py-3 transition-colors",
                      active === i ? "border-primary/40 bg-background" : "border-transparent bg-muted",
                    )}>
                    <p className="text-[15px] leading-relaxed">
                      {reply.segments.map((s, j) => (
                        <span key={j}>
                          {s.text}
                          {[...new Set(s.citations.map((c) => c.source))].map((source) => {
                            const c = s.citations.find((x) => x.source === source)!;
                            const on = active === i && focus?.source === source;
                            return (
                              <button
                                key={source}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActive(i);
                                  setFocus(c);
                                }}
                                aria-label={`Source ${num(source)}`}
                                className={cx(
                                  "mx-0.5 inline-flex size-5 -translate-y-0.5 items-center justify-center rounded-full border align-middle font-mono text-[10px] transition-colors",
                                  on ? "border-primary bg-primary text-primary-foreground" : "border-primary/40 text-primary hover:bg-primary/10",
                                )}>
                                {num(source)}
                              </button>
                            );
                          })}
                        </span>
                      ))}
                    </p>

                    {reply.handoff && (
                      <div className="mt-3 rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm">
                        <p className="flex items-center gap-2 font-semibold">
                          <UserRound className="size-4 text-warn" />
                          Handed to a human
                          <span className="font-normal text-muted-foreground">· {REASONS[reply.handoff.reason]}</span>
                        </p>
                        <p className="mt-1.5 text-muted-foreground">
                          <span className="font-mono text-[11px] uppercase tracking-widest">Note for the team:</span>{" "}
                          {reply.handoff.summary}
                        </p>
                      </div>
                    )}

                    {checks && (
                      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-2.5 text-xs">
                        {checks.map((c) => (
                          <li key={c.label} className={cx("flex items-center gap-1", !c.ok && "text-warn")}>
                            {c.ok ? <Check className="size-3.5 text-primary" /> : <AlertTriangle className="size-3.5" />}
                            {c.label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={chatEnd} />
        </div>

        <div className="border-t p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Suggested questions</p>
            {turns.length > 0 && (
              <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <RotateCcw className="size-3.5" />
                Clear chat
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => ask(q.id)}
                disabled={turns.some((t) => t.pending)}
                title={q.question}
                className={cx(
                  "rounded-full border px-3 py-1.5 text-left text-sm transition-colors disabled:opacity-50",
                  asked.has(q.id) ? "text-muted-foreground" : "hover:border-primary/50 hover:bg-primary/10",
                )}>
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sources */}
      <div ref={sourcesRef} className="min-w-0 rounded-3xl border bg-card p-5 sm:p-6 lg:max-h-[49rem] lg:overflow-y-auto">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <BookOpen className="size-3.5" />
          {activeQuestion ? "Sources for this answer" : "Help centre"}
        </p>

        {activeQuestion ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              {activeRun
                ? `Search picked the ${retrievedIds.length} most relevant passages. Highlighted sentences are the ones the answer cites.`
                : "Highlighted sentences are the ones the answer cites."}
            </p>
            {retrievedIds.length === 0 && <p className="mt-4 text-sm">No passages matched this question.</p>}
            <ul className="mt-4 space-y-3">
              {retrievedIds.map((id) => {
                const p = passages.find((x) => x.id === id)!;
                const cites = activeCitations.filter((c) => c.source === id);
                const used = cites.length > 0;
                const isCited = (k: number) => cites.some((c) => k >= c.start && k < c.end);
                const n = numbering(activeQuestion.id)(id);
                return (
                  <li
                    key={id}
                    data-passage={id}
                    className={cx(
                      "rounded-2xl border p-4 transition-colors",
                      focus?.source === id ? "border-primary/60" : used ? "border-primary/25" : "opacity-60",
                    )}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        {p.docTitle} · <span className="font-medium text-foreground">{p.heading}</span>
                      </p>
                      {used ? (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[10px] text-primary-foreground">
                          {n}
                        </span>
                      ) : (
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Not used</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">
                      {sentences(p.text).map((s, k) => (
                        <span key={k} className={cx(isCited(k) && "rounded bg-primary/20 box-decoration-clone px-0.5")}>
                          {s}{" "}
                        </span>
                      ))}
                    </p>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Everything the assistant is allowed to answer from: {passages.length} short passages for a fictional tour
              operator in Nairobi. Ask a question to see which ones it uses.
            </p>
            <ul className="mt-4 space-y-2">
              {knowledge.map((doc) => (
                <li key={doc.id}>
                  <details className="group rounded-2xl border px-4 py-3">
                    <summary className="cursor-pointer list-none text-sm font-semibold">
                      {doc.title}
                      <span className="ml-2 font-normal text-muted-foreground">{doc.passages.length} passages</span>
                    </summary>
                    <div className="mt-3 space-y-3">
                      {doc.passages.map((p) => (
                        <div key={p.id}>
                          <p className="text-xs font-medium">{p.heading}</p>
                          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
