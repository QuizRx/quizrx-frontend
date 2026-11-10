"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";

export const formatDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
};

export const formatRelative = (iso?: string | null) => {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
};

export const fullName = (u: { firstName?: string | null; lastName?: string | null }) =>
  [u.firstName, u.lastName].filter(Boolean).join(" ").trim();

const OPERATION_LABELS: Record<string, string> = {
  login: "Signed in",
  logout: "Signed out",
  "chat.stream": "Sent chat message",
  "chat.formTopicStream": "Generated quiz from topics",
  learningAction: "Learning action",
  sendMessage: "Sent message",
  createThread: "Created chat",
  updateThread: "Renamed chat",
  deleteThread: "Deleted chat",
  getThreadMessages: "Opened chat",
  getExtractionQuestion: "Viewed question",
  GetPerformanceDashboard: "Viewed performance dashboard",
  getQuizById: "Opened quiz",
  createQuiz: "Created quiz",
  updateQuiz: "Updated quiz",
  generateQuiz: "Generated quiz",
  generateMockExam: "Generated mock exam",
  createMockExamHistory: "Finished mock exam",
  getUserMockExamHistory: "Viewed mock exam history",
  getMockExamHistoryByExam: "Viewed mock exam result",
  submitFeedback: "Submitted feedback",
  submitBetaFeedback: "Submitted beta feedback",
  submitQuestionFeedback: "Reported a question",
  reattemptQuestion: "Re-attempted question",
  updateUser: "Updated profile",
  subscribeToPlan: "Subscribed to plan",
  cancelSubscription: "Cancelled subscription",
};

export const operationLabel = (operation: string) =>
  OPERATION_LABELS[operation] ??
  operation.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

export const KIND_STYLES: Record<string, string> = {
  login: "bg-emerald-100 text-emerald-700",
  logout: "bg-zinc-100 text-zinc-600",
  chat: "bg-sky-100 text-sky-700",
  graphql: "bg-violet-100 text-violet-700",
  rest: "bg-amber-100 text-amber-700",
};

export function Pill({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        className ?? "bg-zinc-100 text-zinc-700"
      )}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

export function ErrorBox({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function PaginationBar({
  page,
  lastPage,
  total,
  onPrev,
  onNext,
  loading,
}: {
  page: number;
  lastPage: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing page <span className="font-medium">{page}</span> of{" "}
        <span className="font-medium">{Math.max(1, lastPage)}</span> ·{" "}
        <span className="font-medium">{total}</span> total
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1 || loading}
          className="gap-1"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= lastPage || loading}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
