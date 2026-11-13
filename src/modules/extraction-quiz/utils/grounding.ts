export const GROUNDING_NOTE = "Grounded in QuizRx Calcium & Bone content";

const FOOTER = /\n*[ \t]*[_*]*Grounded in QuizRx Calcium (?:&|and) Bone content[_*.]*\s*$/i;

// Tutor replies end with the beta grounding line. It is shown as a quiet
// footnote under the answer rather than as part of the answer text.
export function splitGroundingNote(text: string): {
  body: string;
  grounded: boolean;
} {
  const match = FOOTER.exec(text);
  if (!match) return { body: text, grounded: false };
  return { body: text.slice(0, match.index).trimEnd(), grounded: true };
}
