import { getPassage, sentences } from "./knowledge";
import type { Citation, Reply, SavedRun } from "./types";

// The suggested questions on the demo. `reference` is a hand-written answer shown
// until the real model run is saved (yarn answer). `expect` is the behaviour we
// want, so the saved run can be checked against it.

export type Question = {
  id: string;
  question: string;
  /** Short label for the question chip. */
  label: string;
  expect: { handoff: boolean; sources: string[] };
  reference: Reply;
};

/** Cites sentences [start, end) of a passage, in the same shape the API returns. */
function cite(source: string, start: number, end = start + 1): Citation {
  return { source, start, end, cited_text: sentences(getPassage(source)!.text).slice(start, end).join(" ") };
}

export const questions: Question[] = [
  {
    id: "deposit",
    label: "Deposit",
    question: "How much do I need to pay to confirm a booking?",
    expect: { handoff: false, sources: ["booking-deposit"] },
    reference: {
      segments: [
        { text: "A 30% deposit confirms your booking.", citations: [cite("booking-deposit", 0)] },
        {
          text: " The rest is due 45 days before departure, or in full straight away if you're booking within 45 days of travel.",
          citations: [cite("booking-deposit", 1, 3)],
        },
      ],
      handoff: null,
    },
  },
  {
    id: "cancel",
    label: "Cancelling",
    question: "If I cancel 40 days before my trip, do I get any money back?",
    expect: { handoff: false, sources: ["cancel-by-guest"] },
    reference: {
      segments: [
        { text: "Yes. Cancelling 30 to 59 days before departure gets you a refund of 50% of the total tour price.", citations: [cite("cancel-by-guest", 1)] },
      ],
      handoff: null,
    },
  },
  {
    id: "family",
    label: "Family price",
    question: "What would the Maasai Mara safari cost for two adults and our 7-year-old?",
    expect: { handoff: false, sources: ["tours-price-list", "tours-children"] },
    reference: {
      segments: [
        { text: "The Maasai Mara Classic is USD 1,250 per adult", citations: [cite("tours-price-list", 0)] },
        { text: ", and children aged 3 to 11 pay 60% of the adult price", citations: [cite("tours-children", 0)] },
        { text: ", so that's 2 × 1,250 + 750 = USD 3,250 in total.", citations: [] },
      ],
      handoff: null,
    },
  },
  {
    id: "balloon",
    label: "Balloon ride",
    question: "Is the hot air balloon included in the Maasai Mara safari?",
    expect: { handoff: false, sources: ["included-optional"] },
    reference: {
      segments: [
        { text: "No, it's an optional extra at USD 480 per person, including a bush breakfast.", citations: [cite("included-optional", 0)] },
        { text: " You can add it when you book or with your guide on the day, subject to availability.", citations: [cite("included-optional", 2)] },
      ],
      handoff: null,
    },
  },
  {
    id: "mpesa",
    label: "M-Pesa",
    question: "Can I pay with M-Pesa?",
    expect: { handoff: false, sources: ["booking-methods"] },
    reference: {
      segments: [
        {
          text: "Yes. If you're paying in Kenyan shillings, you can pay by M-Pesa to the Paybill number shown on your invoice.",
          citations: [cite("booking-methods", 1)],
        },
      ],
      handoff: null,
    },
  },
  {
    id: "change",
    label: "Change my booking",
    question: "Can you move my booking KT-2291 to March?",
    expect: { handoff: true, sources: ["cancel-date-change"] },
    reference: {
      segments: [
        {
          text: "You can move your tour once for free if you ask at least 45 days before departure; after that it's USD 100 and depends on availability.",
          citations: [cite("cancel-date-change", 0, 2)],
        },
        { text: " I've passed your request to our reservations team so they can check March dates for KT-2291.", citations: [] },
      ],
      handoff: {
        reason: "needs_account_access",
        summary: "Customer wants to move booking KT-2291 to March. Date-change policy already explained.",
      },
    },
  },
  {
    id: "pets",
    label: "Bringing a dog",
    question: "Can I bring my dog on safari?",
    expect: { handoff: true, sources: [] },
    reference: {
      segments: [
        {
          text: "I can't find anything in our help centre about pets, so I don't want to guess. I've passed your question to our team, who'll get back to you.",
          citations: [],
        },
      ],
      handoff: { reason: "not_in_docs", summary: "Customer asks whether they can bring their dog on safari. Not covered in the help centre." },
    },
  },
  {
    id: "weather",
    label: "Off-topic: weather",
    question: "What will the weather be like in the Maasai Mara next week?",
    expect: { handoff: true, sources: [] },
    reference: {
      segments: [
        {
          text: "I don't have weather forecasts, so I can't tell you what next week will be like. I've asked our team to get back to you; your guide can also advise closer to the day.",
          citations: [],
        },
      ],
      handoff: { reason: "not_in_docs", summary: "Customer asks for next week's weather in the Maasai Mara. No forecast information available." },
    },
  },
];

/** Did the saved run behave as intended? Same idea as the extractor's accuracy-vs-source check. */
export function behaviourChecks(q: Question, run: SavedRun) {
  const cited = new Set(run.reply.segments.flatMap((s) => s.citations.map((c) => c.source)));
  const checks = [
    {
      label: q.expect.handoff ? "Handed over to a human" : "Answered without handing over",
      ok: Boolean(run.reply.handoff) === q.expect.handoff,
    },
  ];
  if (q.expect.sources.length > 0) {
    checks.push({ label: "Cited the right help-centre passage", ok: q.expect.sources.every((s) => cited.has(s)) });
  }
  if (!q.expect.handoff) {
    checks.push({ label: "Answer cites the help centre", ok: cited.size > 0 });
  }
  return checks;
}
