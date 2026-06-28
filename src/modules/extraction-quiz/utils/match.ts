import type { ExtractionQuestionData } from "../types";

// ---------------------------------------------------------------------------
// Explicit DP references
// ---------------------------------------------------------------------------
// Recognise things the user might type to jump to a specific decision point:
//   - "DP-05", "dp 5", "DP_12"
//   - "question 7", "question-3"
//   - "q5", "Q12"
//   - "#9"
// Returns the 1-based DP index, or null if the prompt doesn't look like a
// direct reference. We require an explicit prefix so a bare number inside a
// sentence ("I'm 25 years old") does NOT get treated as a DP request.
// ---------------------------------------------------------------------------

const EXPLICIT_DP_REGEX = /\b(?:dp|question|q|#)\s*[-_]?\s*(\d{1,3})\b/i;

export function parseExplicitDpIndex(prompt: string | undefined | null): number | null {
  if (!prompt) return null;
  const match = prompt.match(EXPLICIT_DP_REGEX);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

// ---------------------------------------------------------------------------
// Keyword matching
// ---------------------------------------------------------------------------
// Very small token-overlap scorer. We don't pull in a real NLP library — the
// authored pool is small (max a few dozen questions per chain) and this runs
// every send, so simple and fast wins.
//
// Score is roughly: (# unique prompt tokens that appear in the question text)
//                 / (# unique prompt tokens, clamped to >= 1)
// Range: 0..1. Ties are broken later by the caller (e.g. prefer earlier dp_id).
// ---------------------------------------------------------------------------

// English-leaning stop word list. Keeps the signal/noise ratio reasonable for
// short medical prompts; not exhaustive but practical.
const STOP_WORDS = new Set([
  "a", "an", "and", "any", "are", "as", "at", "be", "been", "but", "by", "can",
  "could", "did", "do", "does", "for", "from", "give", "has", "have", "he",
  "her", "him", "his", "how", "i", "if", "in", "into", "is", "it", "its",
  "just", "me", "more", "most", "my", "of", "on", "or", "our", "out", "please",
  "question", "questions", "quiz", "re", "show", "so", "some", "such", "tell",
  "test", "the", "their", "them", "there", "these", "they", "this", "those",
  "to", "us", "want", "was", "we", "were", "what", "when", "which", "while",
  "who", "why", "will", "with", "would", "you", "your",
]);

const MIN_TOKEN_LENGTH = 3;

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= MIN_TOKEN_LENGTH && !STOP_WORDS.has(t));
}

function questionText(q: ExtractionQuestionData): string {
  // Concatenate everything that could plausibly contain a topic signal.
  // We deliberately include the answer + part2 explanation so questions whose
  // stem only hints at the topic (e.g. "what is the next step?") can still
  // match on what they're really about.
  const inner = q.question;
  return [
    inner.question,
    inner.concept_target,
    inner.topic ?? "",
    inner.sub_topic ?? "",
    inner.choices.join(" "),
    inner.answer,
    q.part2_data?.explanation ?? "",
  ].join(" ");
}

export function scoreQuestion(
  promptTokens: string[],
  question: ExtractionQuestionData
): number {
  if (promptTokens.length === 0) return 0;
  const haystack = new Set(tokenize(questionText(question)));
  if (haystack.size === 0) return 0;

  const uniquePromptTokens = new Set(promptTokens);
  let hits = 0;
  for (const token of uniquePromptTokens) {
    if (haystack.has(token)) hits += 1;
  }
  return hits / uniquePromptTokens.size;
}

// ---------------------------------------------------------------------------
// Pick best
// ---------------------------------------------------------------------------
// Given a prompt, a pool of authored questions for the selected chain, and a
// set of dp_ids the user has already seen this session, return the best
// matching unseen question — or null if nothing in the pool overlaps with
// the prompt at all (caller should then fall back to the sequential walk).
//
// Tie-breaking: when two questions have the same score, prefer the lower
// DP index so behaviour stays predictable.
// ---------------------------------------------------------------------------

const MIN_MATCH_SCORE = 0.0001;

function dpIndexOf(q: ExtractionQuestionData): number {
  const m = q.question.dp_id.match(/-DP-(\d+)$/i);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

export function pickBestMatch(
  prompt: string,
  pool: ExtractionQuestionData[],
  excludeDpIds: ReadonlySet<string>
): ExtractionQuestionData | null {
  const promptTokens = tokenize(prompt);
  if (promptTokens.length === 0 || pool.length === 0) return null;

  let bestQ: ExtractionQuestionData | null = null;
  let bestScore = MIN_MATCH_SCORE;
  let bestDpIndex = Number.MAX_SAFE_INTEGER;

  for (const q of pool) {
    if (excludeDpIds.has(q.question.dp_id)) continue;
    const score = scoreQuestion(promptTokens, q);
    if (score < MIN_MATCH_SCORE) continue;
    const idx = dpIndexOf(q);
    if (score > bestScore || (score === bestScore && idx < bestDpIndex)) {
      bestQ = q;
      bestScore = score;
      bestDpIndex = idx;
    }
  }

  return bestQ;
}

// Lowest-indexed unseen question in the pool. Used when the user sends a
// prompt that has no keyword overlap with anything authored — we still want
// to surface SOMETHING, and the deterministic choice is "next in line".
export function pickNextUnseen(
  pool: ExtractionQuestionData[],
  excludeDpIds: ReadonlySet<string>
): ExtractionQuestionData | null {
  let best: ExtractionQuestionData | null = null;
  let bestIdx = Number.MAX_SAFE_INTEGER;
  for (const q of pool) {
    if (excludeDpIds.has(q.question.dp_id)) continue;
    const idx = dpIndexOf(q);
    if (idx < bestIdx) {
      best = q;
      bestIdx = idx;
    }
  }
  return best;
}
