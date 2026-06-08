export const RATE_LIMIT_MESSAGE =
  "You're going a bit fast. Please try again in a moment.";

const RATE_LIMIT_HINTS = [
  "429",
  "too many requests",
  "rate limit",
  "rate-limited",
];

export function isRateLimitError(error: unknown): boolean {
  if (!error) return false;

  if (typeof error === "string") {
    const normalized = error.toLowerCase();
    return RATE_LIMIT_HINTS.some((hint) => normalized.includes(hint));
  }

  if (typeof error === "object") {
    const maybeError = error as {
      status?: number;
      statusCode?: number;
      message?: string;
      error?: string;
      cause?: string;
    };

    if (maybeError.status === 429 || maybeError.statusCode === 429) {
      return true;
    }

    const combinedText = [maybeError.message, maybeError.error, maybeError.cause]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (combinedText) {
      return RATE_LIMIT_HINTS.some((hint) => combinedText.includes(hint));
    }
  }

  return false;
}
