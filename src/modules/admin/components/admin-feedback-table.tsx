"use client";

import { useQuery } from "@apollo/client";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { cn } from "@/core/lib/utils";
import {
  FEEDBACK_CATEGORY_LABEL,
  FeedbackCategory,
} from "@/modules/feedback/types/api/feedback";
import {
  ADMIN_GET_ALL_FEEDBACK,
  ADMIN_GET_MY_FEEDBACK_FALLBACK,
} from "../apollo/admin";
import type { ProdFeedbackRow } from "../apollo/admin";

const CATEGORY_STYLES: Record<FeedbackCategory, string> = {
  [FeedbackCategory.GENERAL]: "bg-zinc-100 text-zinc-700",
  [FeedbackCategory.BUG]: "bg-rose-100 text-rose-700",
  [FeedbackCategory.FEATURE_REQUEST]: "bg-blue-100 text-blue-700",
  [FeedbackCategory.UX]: "bg-violet-100 text-violet-700",
  [FeedbackCategory.CONTENT]: "bg-amber-100 text-amber-700",
};

const RATING_STYLES: Record<number, string> = {
  5: "text-emerald-600",
  4: "text-emerald-500",
  3: "text-amber-500",
  2: "text-orange-500",
  1: "text-rose-500",
};

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
};

type CategoryFilter = "ALL" | FeedbackCategory;
type RatingFilter = "ALL" | "1" | "2" | "3" | "4" | "5";

export function AdminFeedbackTable() {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("ALL");
  const [usingFallback, setUsingFallback] = useState(false);
  const limit = 10;

  const primary = useQuery(ADMIN_GET_ALL_FEEDBACK, {
    variables: { pagination: { page, limit, orderBy: "desc" } },
    fetchPolicy: "cache-and-network",
    skip: usingFallback,
    // Any failure on the primary query flips us to the fallback. The
    // most common cause is the backend not yet knowing about
    // `getAllFeedback`, but a network hiccup would also just show the
    // admin their own feedback rather than a hard error — an acceptable
    // trade-off for the closed beta.
    onError: () => {
      setUsingFallback(true);
    },
  });

  const fallback = useQuery(ADMIN_GET_MY_FEEDBACK_FALLBACK, {
    variables: { pagination: { page, limit, orderBy: "desc" } },
    fetchPolicy: "cache-and-network",
    skip: !usingFallback,
  });

  const rawFeedback = usingFallback
    ? fallback.data?.getMyFeedback?.data ?? []
    : primary.data?.getAllFeedback?.data ?? [];
  const meta = usingFallback
    ? fallback.data?.getMyFeedback?.meta
    : primary.data?.getAllFeedback?.meta;
  // While the primary is failing but before we've flipped to fallback,
  // treat the tab as still loading — this prevents a flash of the raw
  // "getAllFeedback" error before the fallback kicks in.
  const loading = usingFallback
    ? fallback.loading
    : primary.loading || Boolean(primary.error);
  const error = usingFallback ? fallback.error : undefined;
  const refetch = usingFallback ? fallback.refetch : primary.refetch;

  // Client-side filtering on the currently loaded page. Filtering across
  // the whole dataset would require server-side filter args — not worth
  // it until the AdminModule endpoint ships.
  const feedback = useMemo(() => {
    return rawFeedback.filter((f) => {
      if (categoryFilter !== "ALL" && f.category !== categoryFilter) {
        return false;
      }
      if (ratingFilter !== "ALL" && String(f.rating) !== ratingFilter) {
        return false;
      }
      return true;
    });
  }, [rawFeedback, categoryFilter, ratingFilter]);

  // We only hard-fail if the fallback itself blows up — the primary
  // (getAllFeedback) errors are absorbed silently into the fallback flip.
  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        <p className="font-medium">Could not load feedback.</p>
        <p className="mt-1 text-xs">{error.message}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }

  const filtersActive = categoryFilter !== "ALL" || ratingFilter !== "ALL";

  return (
    <div className="space-y-3">
      {usingFallback && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">
              Showing your own feedback only — cross-user feedback needs a
              backend deploy.
            </p>
            <p className="mt-1 text-amber-800">
              The deployed backend doesn&apos;t know about{" "}
              <code className="rounded bg-amber-100 px-1">getAllFeedback</code>{" "}
              yet, so this tab has fallen back to the existing{" "}
              <code className="rounded bg-amber-100 px-1">getMyFeedback</code>{" "}
              query. Deploy{" "}
              <code className="rounded bg-amber-100 px-1">
                quizrx-backend-api
              </code>{" "}
              (the new resolver is already in{" "}
              <code className="rounded bg-amber-100 px-1">
                src/modules/feedback/feedback.resolver.ts
              </code>
              ) and this tab will automatically start showing feedback from
              every user.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {(Object.keys(FEEDBACK_CATEGORY_LABEL) as FeedbackCategory[]).map(
              (c) => (
                <SelectItem key={c} value={c}>
                  {FEEDBACK_CATEGORY_LABEL[c]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        <Select
          value={ratingFilter}
          onValueChange={(v) => setRatingFilter(v as RatingFilter)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any rating</SelectItem>
            {[5, 4, 3, 2, 1].map((r) => (
              <SelectItem key={r} value={String(r)}>
                {r} {r === 1 ? "star" : "stars"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filtersActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCategoryFilter("ALL");
              setRatingFilter("ALL");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rating</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Page</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && feedback.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-400" />
                </TableCell>
              </TableRow>
            ) : feedback.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-zinc-500"
                >
                  {filtersActive
                    ? "No feedback matches these filters on this page."
                    : "No feedback submitted yet."}
                </TableCell>
              </TableRow>
            ) : (
              feedback.map((f) => (
                <FeedbackRow key={f._id} feedback={f} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationBar
        page={page}
        lastPage={meta?.lastPage ?? 1}
        total={meta?.total ?? 0}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() =>
          setPage((p) => Math.min(meta?.lastPage ?? p, p + 1))
        }
        loading={loading}
      />
    </div>
  );
}

function FeedbackRow({ feedback: f }: { feedback: ProdFeedbackRow }) {
  return (
    <TableRow>
      <TableCell>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium",
            RATING_STYLES[f.rating] ?? "text-zinc-600"
          )}
          title={`${f.rating} / 5`}
        >
          <Star className="h-3.5 w-3.5 fill-current" />
          {f.rating}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
            CATEGORY_STYLES[f.category] ?? "bg-zinc-100 text-zinc-700"
          )}
        >
          {FEEDBACK_CATEGORY_LABEL[f.category] ?? f.category}
        </span>
      </TableCell>
      <TableCell className="max-w-[36ch]">
        {f.message ? (
          <div
            className="line-clamp-2 text-sm text-zinc-700"
            title={f.message}
          >
            {f.message}
          </div>
        ) : (
          <span className="text-xs text-zinc-400">—</span>
        )}
      </TableCell>
      <TableCell>
        {f.pagePath ? (
          <span className="font-mono text-xs text-zinc-600">
            {f.pagePath}
          </span>
        ) : (
          <span className="text-xs text-zinc-400">—</span>
        )}
      </TableCell>
      <TableCell>
        <span
          className="font-mono text-xs text-zinc-600"
          title={f.userId}
        >
          {f.userId.length > 10 ? `${f.userId.slice(0, 10)}…` : f.userId}
        </span>
      </TableCell>
      <TableCell className="text-xs text-zinc-500">
        {formatDate(f.createdAt)}
      </TableCell>
    </TableRow>
  );
}

function PaginationBar({
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
    <div className="flex items-center justify-between text-xs text-zinc-600">
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
