import type { Retrieved } from "./retrieve";

/** A cited span: sentences [start, end) of one help-centre passage. */
export type Citation = {
  source: string;
  start: number;
  end: number;
  cited_text: string;
};

export type Segment = { text: string; citations: Citation[] };

export type Handoff = {
  reason: "not_in_docs" | "needs_account_access";
  summary: string;
};

export type Reply = {
  segments: Segment[];
  /** Set when the assistant passed the conversation to a person. */
  handoff: Handoff | null;
};

export type SavedRun = {
  reply: Reply;
  retrieved: Retrieved[];
  model: string;
  answered_at: string;
};
