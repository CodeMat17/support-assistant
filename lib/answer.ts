import Anthropic from "@anthropic-ai/sdk";
import { BUSINESS, getPassage, sentences } from "./knowledge";
import { retrieve } from "./retrieve";
import type { Citation, Handoff, SavedRun, Segment } from "./types";

export const MODEL = "claude-opus-5-5";

const SYSTEM = `You are the customer support assistant for ${BUSINESS}, a safari and tour operator based in Nairobi, Kenya.

Each customer question comes with the most relevant passages from the ${BUSINESS} help centre. Answer only from those passages.

Rules:
- Base every factual statement on the passages and cite them. Do not add facts from general knowledge, even when you are fairly sure they are right.
- If the passages don't answer the question, or only answer part of it, say plainly what you can't confirm, then call hand_off_to_human. Don't guess.
- If the customer needs someone to look at or change a specific booking, explain any relevant policy from the passages, then call hand_off_to_human.
- Keep replies short: one to three sentences in plain, friendly language, with no headings or lists. If you add up prices, show the sum briefly.
- Don't mention passages, search results or documents. If you need to refer to them, say "our help centre".`;

const handoffTool: Anthropic.Beta.BetaTool = {
  name: "hand_off_to_human",
  description:
    "Pass the conversation to a member of the support team. Use it when the help centre does not cover the question, or when the customer needs a specific booking checked or changed. Write your reply to the customer as normal text before calling it.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      reason: {
        type: "string",
        enum: ["not_in_docs", "needs_account_access"],
        description: "not_in_docs: the help centre doesn't answer it. needs_account_access: a person must look at or change a booking.",
      },
      summary: {
        type: "string",
        description: "One or two sentences for the support agent: what the customer wants and anything already explained to them.",
      },
    },
    required: ["reason", "summary"],
    additionalProperties: false,
  },
};

/** Answers one question from the help centre. Scripts only — needs ANTHROPIC_API_KEY. */
export async function answerQuestion(question: string): Promise<SavedRun> {
  const retrieved = retrieve(question);
  const results: Anthropic.Beta.BetaSearchResultBlockParam[] = retrieved.map(({ id }) => {
    const p = getPassage(id)!;
    return {
      type: "search_result",
      source: p.id,
      title: `${p.docTitle}: ${p.heading}`,
      content: sentences(p.text).map((text) => ({ type: "text", text })),
      citations: { enabled: true },
    };
  });

  const client = new Anthropic();
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    output_config: { effort: "medium" },
    tools: [handoffTool],
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: [{ role: "user", content: [...results, { type: "text", text: question }] }],
  });

  if (response.stop_reason === "refusal") throw new Error("The model declined to answer this question.");
  if (response.stop_reason === "max_tokens") throw new Error("The reply was cut off (max_tokens).");

  const segments: Segment[] = [];
  let handoff: Handoff | null = null;
  for (const block of response.content) {
    if (block.type === "text") {
      const citations: Citation[] = (block.citations ?? []).flatMap((c) =>
        c.type === "search_result_location"
          ? [{ source: c.source, start: c.start_block_index, end: c.end_block_index, cited_text: c.cited_text }]
          : [],
      );
      segments.push({ text: block.text, citations });
    } else if (block.type === "tool_use" && block.name === handoffTool.name) {
      handoff = block.input as Handoff;
    }
  }

  return { reply: { segments, handoff }, retrieved, model: response.model, answered_at: new Date().toISOString() };
}
