"use client";

import { ArrowUp, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/core/lib/utils";
import { MarkdownText } from "@/modules/extraction-quiz/components/markdown-text";
import { getModeMeta } from "@/modules/extraction-quiz/data/learning-modes";
import { TUTOR_STARTER_PROMPTS } from "@/modules/extraction-quiz/data/suggested-prompts";
import { useLearningAction } from "@/modules/extraction-quiz/hooks/use-learning-action";
import {
  type ExtractionEntry,
  useExtractionQuizStore,
} from "@/modules/extraction-quiz/store/extraction-quiz-store";
import type {
  LearningActionTextPayload,
  LearningTurn,
} from "@/modules/extraction-quiz/types";
import {
  GROUNDING_NOTE,
  splitGroundingNote,
} from "@/modules/extraction-quiz/utils/grounding";
import { ModeHero } from "./mode-hero";

const MAX_HISTORY = 8;
const TUTOR_ERROR = "Sorry, I couldn't respond just now. Please try again.";

const toHistory = (entries: ExtractionEntry[]): LearningTurn[] =>
  entries
    .flatMap((e): LearningTurn[] =>
      e.kind === "user-prompt"
        ? [{ role: "user", content: e.content }]
        : e.kind === "assistant"
          ? [{ role: "assistant", content: e.content }]
          : []
    )
    .slice(-MAX_HISTORY);

export function TutorView({ active }: { active: boolean }) {
  const entries = useExtractionQuizStore((s) => s.modeEntries.tutor);
  const pending = useExtractionQuizStore((s) => s.pending.tutor);
  const appendUserPrompt = useExtractionQuizStore((s) => s.appendUserPrompt);
  const appendAssistant = useExtractionQuizStore((s) => s.appendAssistant);
  const appendSystem = useExtractionQuizStore((s) => s.appendSystem);
  const setPending = useExtractionQuizStore((s) => s.setPending);
  const runLearningAction = useLearningAction();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const shownCount = useRef(0);

  // Follow new messages, including ones that arrived while another mode was
  // on screen, without jumping away from where the learner was reading.
  useEffect(() => {
    if (!active) return;
    const count = entries.length + (pending ? 1 : 0);
    if (count === shownCount.current) return;
    shownCount.current = count;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries.length, pending, active]);

  // Tutor covers the whole module: no topic is ever sent.
  const send = async (raw: string) => {
    const text = raw.trim();
    const state = useExtractionQuizStore.getState();
    if (!text || state.pending.tutor) return;
    const prior = state.modeEntries.tutor;
    setDraft("");
    appendUserPrompt(text);
    setPending("tutor", true);
    try {
      const response = await runLearningAction({
        message: text,
        experience: "tutor",
        topicId: null,
        topicDisplayName: null,
        sessionId: state.sessionId,
        isFirstTurn: prior.length === 0,
        history: toHistory(prior),
      });
      const reply = (response.payload as LearningActionTextPayload | null)?.text;
      if (response.responseType !== "friendly_error" && reply) {
        appendAssistant(reply);
      } else {
        appendSystem(TUTOR_ERROR, "tutor");
      }
    } finally {
      setPending("tutor", false);
    }
  };

  if (entries.length === 0 && !pending) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="flex min-h-full flex-col justify-center pb-[6vh] pt-6 sm:pt-8">
          <ModeHero
            title="Questions That Make You Think."
            subtitle={getModeMeta("tutor").description}
          >
            <TutorComposer
              size="lg"
              value={draft}
              onChange={setDraft}
              onSubmit={() => send(draft)}
              busy={pending}
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {TUTOR_STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => send(prompt.intent)}
                  className="flex items-start gap-2.5 rounded-2xl border border-[var(--border)] bg-white/80 p-4 text-left text-sm leading-snug text-zinc-700 shadow-sm transition-colors hover:border-[var(--primary)]/40 hover:bg-white hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30"
                >
                  <Sparkles
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]"
                    aria-hidden
                  />
                  <span>{prompt.label}</span>
                </button>
              ))}
            </div>
          </ModeHero>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-5 px-4 pb-6 pt-3 sm:px-6">
          {entries.map((entry) => (
            <TutorMessage key={entry.id} entry={entry} />
          ))}
          {pending && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-zinc-500 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
              Tutor is thinking...
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
      <div className="shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <TutorComposer
            value={draft}
            onChange={setDraft}
            onSubmit={() => send(draft)}
            busy={pending}
          />
        </div>
      </div>
    </div>
  );
}

function TutorMessage({ entry }: { entry: ExtractionEntry }) {
  if (entry.kind === "user-prompt") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[var(--primary)] px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-sm">
          {entry.content}
        </div>
      </div>
    );
  }
  if (entry.kind === "system") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          {entry.content}
        </div>
      </div>
    );
  }
  if (entry.kind === "assistant") {
    const { body, grounded } = splitGroundingNote(entry.content);
    return (
      <div className="flex justify-start">
        <div className="w-full max-w-[92%] sm:max-w-[85%]">
          <div className="rounded-2xl rounded-bl-md border border-[var(--border)] bg-white px-4 py-3 text-[15px] text-zinc-800 shadow-sm sm:px-5 sm:py-4">
            <MarkdownText>{body}</MarkdownText>
          </div>
          {grounded && (
            <p className="mt-1.5 flex items-center gap-1 pl-1 text-[11px] text-zinc-400">
              <ShieldCheck className="h-3 w-3" aria-hidden />
              {GROUNDING_NOTE}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
}

type TutorComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy: boolean;
  size?: "md" | "lg";
};

function TutorComposer({
  value,
  onChange,
  onSubmit,
  busy,
  size = "md",
}: TutorComposerProps) {
  const inputId = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const large = size === "lg";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={cn(
        "flex items-end gap-2 rounded-[1.75rem] border border-[var(--border)] bg-white shadow-sm transition focus-within:border-[var(--primary)]/50 focus-within:ring-4 focus-within:ring-[var(--primary)]/10",
        large ? "p-2.5 pl-5" : "p-2 pl-4"
      )}
    >
      <label htmlFor={inputId} className="sr-only">
        Ask Tutor a question
      </label>
      <textarea
        ref={ref}
        id={inputId}
        value={value}
        rows={1}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Ask a question..."
        className={cn(
          "max-h-[180px] min-w-0 flex-1 resize-none bg-transparent outline-none placeholder:text-zinc-400",
          large ? "py-2.5 text-base" : "py-2 text-[15px]"
        )}
      />
      <button
        type="submit"
        disabled={busy || !value.trim()}
        aria-label="Send to Tutor"
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-40",
          large ? "h-11 w-11" : "h-9 w-9"
        )}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowUp className={large ? "h-5 w-5" : "h-4 w-4"} />
        )}
      </button>
    </form>
  );
}
