import Demo from "@/components/Demo";
import results from "@/data/results.json";
import { questions } from "@/lib/questions";
import type { SavedRun } from "@/lib/types";
import { ArrowUpRight, BookOpen, MessageCircle, Quote, Search, ShieldCheck, UserRound } from "lucide-react";

const PORTFOLIO = "https://matthewchukwu.dev";

const steps = [
  { icon: MessageCircle, title: "Customer asks", body: "On your website, in a chat widget, or wherever your customers already message you." },
  { icon: Search, title: "Search your docs", body: "The question is matched against your FAQs, policies and price lists, and only the most relevant passages are passed on." },
  { icon: Quote, title: "Answer with sources", body: "Claude answers from those passages only, and every claim links to the exact sentence it came from." },
  { icon: UserRound, title: "Hand over when unsure", body: "If your docs don't cover it, or a booking needs changing, it says so and passes the chat to your team with a summary." },
];

const promises = [
  { title: "No made-up answers", body: "It isn't allowed to fill gaps from general knowledge. If it can't point to a source, it hands over instead." },
  { title: "Easy to check", body: "Every answer shows its sources, so you and your customers can see exactly where it came from." },
  { title: "Update docs, not code", body: "Change a price or a policy in your help centre and the next answer uses it. No retraining." },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
      <span className="h-px w-8 bg-border" />
      {children}
    </p>
  );
}

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="size-4" />
            </span>
            Support Assistant
          </a>
          <a
            href={`${PORTFOLIO}/#contact`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-foreground/15 px-4 text-sm font-medium transition-colors hover:bg-foreground/5">
            Book a call
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </header>

      <main id="top" className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <Eyebrow>AI automation · lab project</Eyebrow>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-extrabold leading-[1.04] tracking-[-0.04em] sm:text-6xl">
            Answers from your own docs.{" "}
            <span className="text-muted-foreground">&ldquo;I don&apos;t know&rdquo; when they don&apos;t say.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            A support assistant that answers customers from your FAQs and policies, shows the sentence each answer came
            from, and hands over to a person instead of guessing. Try it on a fictional tour operator below.
          </p>
        </section>

        <section id="demo" className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <Demo questions={questions} results={results as Record<string, SavedRun>} />
          <p className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            {Object.keys(results).length > 0
              ? "Saved output from a real AI run"
              : "Demo mode: no AI call is made in your browser. Showing reference answers until the saved model run is added."}
          </p>
        </section>

        <section className="border-y bg-muted/40 py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-5 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Built to be trusted with your customers.
            </h2>
            <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="bg-background p-7">
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-primary" />
                    <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="mt-5 text-lg font-semibold tracking-tight">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </li>
              ))}
            </ol>
            <ul className="mt-12 grid gap-8 sm:grid-cols-3">
              {promises.map(({ title, body }) => (
                <li key={title}>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto w-full max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Want this on your own help centre?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground sm:text-lg">
              Send me your FAQs and a few questions your customers really ask. I&apos;ll run them through the assistant and
              show you how it answers, and where it hands over.
            </p>
            <a
              href={`${PORTFOLIO}/#contact`}
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-opacity hover:opacity-90">
              Book a call
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>
            Built by{" "}
            <a href={PORTFOLIO} className="font-medium text-foreground underline-offset-4 hover:underline">
              Matthew Chukwu
            </a>
          </p>
          <p className="font-mono text-xs">Next.js · Claude API · Citations</p>
        </div>
      </footer>
    </>
  );
}
