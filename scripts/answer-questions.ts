// Runs the real assistant once over the suggested questions and saves the replies
// to data/results.json. The public site only ever reads that file — visitors
// never trigger an API call. Run: yarn answer  (needs ANTHROPIC_API_KEY)
import { writeFileSync } from "node:fs";
import { answerQuestion } from "../lib/answer";
import { behaviourChecks, questions } from "../lib/questions";
import type { SavedRun } from "../lib/types";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Set ANTHROPIC_API_KEY first (e.g. in .env.local, then: yarn answer).");
    process.exit(1);
  }

  const results: Record<string, SavedRun> = {};
  for (const q of questions) {
    process.stdout.write(`${q.id}... `);
    const run = await answerQuestion(q.question);
    results[q.id] = run;

    const checks = behaviourChecks(q, run);
    console.log(`${checks.filter((c) => c.ok).length}/${checks.length} checks pass`);
    console.log(`  ${run.reply.segments.map((s) => s.text).join("").trim()}`);
    if (run.reply.handoff) console.log(`  -> handoff (${run.reply.handoff.reason}): ${run.reply.handoff.summary}`);
    for (const c of checks.filter((c) => !c.ok)) console.log(`  failed: ${c.label}`);
  }

  writeFileSync("data/results.json", JSON.stringify(results, null, 2) + "\n");
  console.log("Saved data/results.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
