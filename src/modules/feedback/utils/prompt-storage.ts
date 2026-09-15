/**
 * Cooldown helpers for the in-app feedback prompt.
 *
 * The prompt should never be intrusive: we only re-show it after a configured
 * cooldown, and we honor an explicit "Maybe later" snooze for a longer window.
 * All state lives in localStorage so it is per-device, per-browser-profile.
 */

const STORAGE_KEY = "quizrx.feedback.prompt-state.v1";

export const FEEDBACK_PROMPT_INTERVAL_MS = 2 * 60 * 60 * 1000;

export const FEEDBACK_PROMPT_SNOOZE_MS = 24 * 60 * 60 * 1000;

// Beta: surface the prompt after a few minutes of in-product activity so we
// can collect feedback while the session is still fresh.
export const FEEDBACK_PROMPT_INITIAL_DELAY_MS = 5 * 60 * 1000;

type FeedbackPromptState = {
  firstSeenAt?: number;
  lastShownAt?: number;
  lastSnoozedAt?: number;
};

const isBrowser = () => typeof window !== "undefined";

function readState(): FeedbackPromptState {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as FeedbackPromptState;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeState(state: FeedbackPromptState) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota / privacy mode - silently ignore; the prompt will just keep
    // current behaviour for this session.
  }
}

export function ensureFeedbackPromptInitialized(now = Date.now()) {
  const state = readState();
  if (!state.firstSeenAt) {
    writeState({ ...state, firstSeenAt: now });
  }
}

export function shouldShowFeedbackPrompt(now = Date.now()): boolean {
  if (!isBrowser()) return false;
  const state = readState();

  if (!state.firstSeenAt) {
    // Caller will call ensureFeedbackPromptInitialized; until then, don't show.
    return false;
  }

  if (now - state.firstSeenAt < FEEDBACK_PROMPT_INITIAL_DELAY_MS) {
    return false;
  }

  if (
    state.lastSnoozedAt &&
    now - state.lastSnoozedAt < FEEDBACK_PROMPT_SNOOZE_MS
  ) {
    return false;
  }

  if (
    state.lastShownAt &&
    now - state.lastShownAt < FEEDBACK_PROMPT_INTERVAL_MS
  ) {
    return false;
  }

  return true;
}

export function markFeedbackPromptShown(now = Date.now()) {
  const state = readState();
  writeState({ ...state, lastShownAt: now });
}

export function markFeedbackPromptSnoozed(now = Date.now()) {
  const state = readState();
  writeState({ ...state, lastSnoozedAt: now, lastShownAt: now });
}

export function resetFeedbackPromptStateForTests() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
