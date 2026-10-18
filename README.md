# Support Assistant

An AI support demo: customers ask questions, and the assistant answers from the company's own help centre, cites the exact sentences it used, and hands over to a human when the docs don't cover the question. It's a lab project for [matthewchukwu.dev](https://matthewchukwu.dev).

The business is fictional: Kijani Trails, a tour operator in Nairobi. Every price and policy is made up.

## How it stays free to host

The public site makes **no AI calls**. Visitors click suggested questions and see replies saved from a real run of the assistant (`data/results.json`). Two of the questions aren't covered by the help centre, so visitors can see it refuse to guess and hand over. Real help centres go through a call: the "Book a call" CTA.

So there is no API key on Vercel and no usage bill from visitors.

## How it works

1. **Retrieve.** `lib/retrieve.ts` ranks the help-centre passages against the question (BM25 keyword search) and keeps the top 5.
2. **Answer with citations.** `lib/answer.ts` sends those passages to Claude as `search_result` blocks with citations enabled. Each sentence is its own text block, so citations point at exact sentences, not whole pages.
3. **Hand over.** The model has one tool, `hand_off_to_human`. The system prompt tells it to call the tool when the docs don't answer the question or when a booking needs a person, and never to fill gaps from general knowledge.
4. **Check.** `behaviourChecks` in `lib/questions.ts` compares each saved reply with the intended behaviour: did it hand over when it should, and did it cite the right passage?

The request opts into server-side refusal fallbacks (`fallbacks: "default"`), so a safety-classifier decline is retried on a fallback model instead of failing the run.

## Project layout

| Path | What it is |
| --- | --- |
| `lib/knowledge.ts` | The fictional help centre: 7 docs, 21 short passages |
| `lib/retrieve.ts` | BM25 retrieval over the passages |
| `lib/answer.ts` | The answer call (Claude API, search results + citations, handoff tool). Used only by scripts |
| `lib/questions.ts` | Suggested questions, hand-written reference answers, and the behaviour checks |
| `scripts/answer-questions.ts` | Runs the real assistant on the questions and saves `data/results.json` |
| `components/Demo.tsx` | Interactive demo: chat, numbered citations, source panel with highlighted sentences |

## Scripts

```bash
yarn dev      # local dev server
yarn answer   # run the real assistant over the questions (needs ANTHROPIC_API_KEY in .env.local)
yarn build
```

### Generating the saved replies (do this once before launch)

Until you run this, the demo shows hand-written reference answers and is labelled "Reference answers · model run pending".

1. Copy `.env.example` to `.env.local` and add an Anthropic API key. Keep it local only.
2. Run `yarn answer`. It costs a few cents in total, and it prints each reply plus how many behaviour checks passed.
3. Read the replies. If one fails a check, adjust the prompt or the help-centre text and run it again.
4. Commit `data/results.json` and deploy.

The demo then shows the model name and run date, plus the behaviour checks under each reply.
