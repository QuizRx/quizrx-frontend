/**
 * Smoke — Ramy Oct-12 §5 / §6 FE logic (no browser).
 * Run: node _local_dev/smoke_s5_s6_fe.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Mirrors chat-history.tsx attemptStatus (keep in sync). */
function attemptStatus(attempt) {
  const isShortAnswer =
    attempt.question.question.format === "short_answer" ||
    !!attempt.review ||
    attempt.freeText.trim().length > 0;
  if (isShortAnswer) {
    const evaluation = attempt.review?.evaluation;
    if (evaluation === "correct") return { label: "Correct", tone: "good" };
    if (evaluation === "partial")
      return { label: "Partially correct", tone: "partial" };
    if (evaluation === "incorrect") return { label: "Incorrect", tone: "bad" };
    return attempt.freeText.trim()
      ? { label: "Answered", tone: "neutral" }
      : { label: "Unanswered", tone: "neutral" };
  }
  if (attempt.selectedIndex === null)
    return { label: "Unanswered", tone: "neutral" };
  return attempt.isCorrect
    ? { label: "Correct", tone: "good" }
    : { label: "Incorrect", tone: "bad" };
}

const rows = [];
const check = (id, ok, detail) => {
  rows.push({ id, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${id}\n       ${detail}`);
};

console.log("=== FE §5/§6 logic smoke ===\n");

check(
  "s5.missing_format_shows_correct",
  attemptStatus({
    freeText: "parathyroidectomy",
    selectedIndex: null,
    isCorrect: null,
    review: { evaluation: "correct" },
    question: { question: {} },
  }).label === "Correct",
  "Correct",
);

check(
  "s5.missing_format_shows_partial",
  attemptStatus({
    freeText: "some answer",
    selectedIndex: null,
    isCorrect: null,
    review: { evaluation: "partial" },
    question: { question: {} },
  }).label === "Partially correct",
  "Partially correct",
);

check(
  "s5.missing_format_shows_incorrect",
  attemptStatus({
    freeText: "wrong",
    selectedIndex: null,
    isCorrect: null,
    review: { evaluation: "incorrect" },
    question: { question: {} },
  }).label === "Incorrect",
  "Incorrect",
);

check(
  "s5.short_answer_format_correct",
  attemptStatus({
    freeText: "x",
    selectedIndex: null,
    isCorrect: null,
    review: { evaluation: "correct" },
    question: { question: { format: "short_answer" } },
  }).label === "Correct",
  "Correct",
);

check(
  "s5.free_text_without_review_answered",
  attemptStatus({
    freeText: "typed but not graded yet",
    selectedIndex: null,
    isCorrect: null,
    question: { question: {} },
  }).label === "Answered",
  "Answered",
);

const authSrc = fs.readFileSync(
  path.join(__dirname, "../src/core/providers/auth.tsx"),
  "utf8",
);
check(
  "s6.logout_clears_current",
  authSrc.includes('removeItem("extraction-quiz-current")'),
  "extraction-quiz-current",
);
check(
  "s6.logout_clears_archive",
  authSrc.includes('removeItem("extraction-quiz-archive")'),
  "extraction-quiz-archive",
);

const adminSrc = fs.readFileSync(
  path.join(__dirname, "../src/modules/admin/hooks/use-is-admin.ts"),
  "utf8",
);
check(
  "s6.fe_allowlist_test_gmail",
  /ADMIN_EMAILS[^=]*=\s*\[[^\]]*["']test@gmail\.com["']/.test(adminSrc),
  "test@gmail.com present",
);

// Source attemptStatus in chat-history matches the §5 isShortAnswer guard
const histSrc = fs.readFileSync(
  path.join(__dirname, "../src/modules/chat/layouts/sidebar/chat-history.tsx"),
  "utf8",
);
check(
  "s5.source_has_isShortAnswer_guard",
  histSrc.includes("!!attempt.review") &&
    histSrc.includes("attempt.freeText.trim().length > 0"),
  "chat-history.tsx",
);

const failed = rows.filter((r) => !r.ok);
console.log(`\n=== ${rows.length - failed.length}/${rows.length} PASS ===`);
if (failed.length) {
  console.log("FAILED:", failed.map((f) => f.id).join(", "));
  process.exit(1);
}
