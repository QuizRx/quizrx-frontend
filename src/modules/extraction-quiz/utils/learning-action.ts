import type {
  ExtractionQuestionData,
  LearningActionOption,
  LearningActionQuestionPayload,
} from "../types";

// Option labels rendered by the question card, in order.
export const OPTION_LABELS = ["A", "B", "C", "D", "E"] as const;

// Adapt a Stage 2 `question` payload into the shape the existing question card
// renders (`ExtractionQuestionData`). This keeps a single card for both the
// legacy extraction path and the new learning-action path.
//
// Notes:
//  - `answer` must be the exact TEXT of the correct option, because the card
//    grades by comparing the picked option text to `answer`.
//  - `dp_id` carries the opaque `question_id` so feedback/report keep working;
//    the frontend never parses it.
//  - `option_trap_ids` is unknown in this contract, so it's null-filled.
export function learningQuestionToExtractionData(
  payload: LearningActionQuestionPayload
): ExtractionQuestionData {
  const options: LearningActionOption[] = payload.options ?? [];
  const choices = options.map((o) => o.text);
  const correct = options.find((o) => o.label === payload.correct_label);

  return {
    question: {
      question: payload.stem,
      choices,
      answer: correct?.text ?? "",
      option_trap_ids: options.map(() => null),
      dp_id: payload.question_id,
      concept_target: "",
      topic: payload.topic_id ?? undefined,
      sub_topic: undefined,
    },
    part2_data: {
      explanation: payload.explanation,
      answer: correct?.text,
    },
    concept_target: "",
  };
}

// Build the `current_options` echo from an on-screen question's choices.
export function toCurrentOptions(choices: string[]): LearningActionOption[] {
  return choices.map((text, i) => ({
    label: OPTION_LABELS[i] ?? String(i + 1),
    text,
  }));
}
