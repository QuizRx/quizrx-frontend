"use client";

import { useQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/core/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/tabs";
import { cn } from "@/core/lib/utils";
import {
  ADMIN_USER_DETAIL,
  ADMIN_USER_LEARNING_RECORDS,
} from "../apollo/admin-analytics";
import { AdminActivityLog } from "./admin-activity-log";
import { AdminChatsTable } from "./admin-chats-table";
import { CountList, ExperienceChart } from "./admin-overview";
import {
  ErrorBox,
  PaginationBar,
  Pill,
  StatCard,
  formatDateTime,
  formatRelative,
  fullName,
  operationLabel,
} from "./admin-shared";

export function AdminUserDetailSheet({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={Boolean(userId)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-4xl">
        {userId && <UserDetailBody key={userId} userId={userId} />}
      </SheetContent>
    </Sheet>
  );
}

function UserDetailBody({ userId }: { userId: string }) {
  const { data, loading, error, refetch } = useQuery(ADMIN_USER_DETAIL, {
    variables: { userId },
    fetchPolicy: "cache-and-network",
  });
  const detail = data?.adminUserDetail;
  const user = detail?.user;

  return (
    <>
      <SheetHeader className="border-b border-zinc-200 pr-10">
        <SheetTitle className="break-all">
          {user ? fullName(user) || user.email : "User activity"}
        </SheetTitle>
        <SheetDescription className="break-all">
          {user ? (
            <>
              {user.email} · joined {formatDateTime(user.createdAt)}
              {user.examPreparation ? ` · preparing for ${user.examPreparation}` : ""}
            </>
          ) : (
            userId
          )}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-5 p-4">
        {error && !detail ? (
          <ErrorBox title="Could not load this user." message={error.message} onRetry={() => refetch()} />
        ) : !detail || !user ? (
          loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                label="Last login"
                value={<span className="text-lg">{formatRelative(user.lastLoginAt)}</span>}
                hint={`${user.loginCount} logins tracked`}
              />
              <StatCard
                label="Last active"
                value={<span className="text-lg">{formatRelative(user.lastActivityAt)}</span>}
                hint={formatDateTime(user.lastActivityAt)}
              />
              <StatCard
                label="Chats"
                value={user.threadCount}
                hint={`${detail.userMessages} messages sent`}
              />
              <StatCard
                label="Learning answers"
                value={user.learningAnswers}
                hint={`${detail.feedbackCount} feedback · ${user.activityCount} events`}
              />
            </div>

            <section className="rounded-lg border border-zinc-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900">Last 30 days</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detail.daily} margin={{ left: -20, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                    <XAxis dataKey="date" tickFormatter={(d) => String(d).slice(5)} fontSize={10} minTickGap={12} />
                    <YAxis allowDecimals={false} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="userMessages" name="Chat messages" stackId="a" fill="#0284c7" />
                    <Bar dataKey="learningAnswers" name="Learning answers" stackId="a" fill="#d97706" />
                    <Bar dataKey="logins" name="Logins" stackId="a" fill="#059669" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-3">
              <ExperienceChart experiences={detail.experiences} />
              <CountList title="Topics" rows={detail.topTopics} empty="No topics yet." />
              <CountList
                title="Most used actions"
                rows={detail.topActions}
                format={operationLabel}
                empty="No tracked actions yet."
              />
            </div>
          </>
        )}

        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">Activity timeline</TabsTrigger>
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="learning">Learning answers</TabsTrigger>
          </TabsList>
          <TabsContent value="activity" className="pt-3">
            <AdminActivityLog userId={userId} pageSize={20} />
          </TabsContent>
          <TabsContent value="chats" className="pt-3">
            <AdminChatsTable userId={userId} />
          </TabsContent>
          <TabsContent value="learning" className="pt-3">
            <LearningRecords userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

const EXPERIENCE_FILTERS = [
  { value: "", label: "All" },
  { value: "reasoning", label: "Reasoning" },
  { value: "practice_studio", label: "Practice Studio" },
];

const RESULT_STYLES: Record<string, string> = {
  correct: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  incorrect: "bg-rose-100 text-rose-700",
};

function LearningRecords({ userId }: { userId: string }) {
  const [experience, setExperience] = useState("");
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useQuery(ADMIN_USER_LEARNING_RECORDS, {
    variables: { input: { userId, experience: experience || undefined, page, limit: 15 } },
    fetchPolicy: "cache-and-network",
  });
  const rows = data?.adminUserLearningRecords?.data ?? [];
  const meta = data?.adminUserLearningRecords?.meta;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {EXPERIENCE_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => {
              setExperience(f.value);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              experience === f.value
                ? "border-primary bg-primary text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && !data ? (
        <ErrorBox title="Could not load learning answers." message={error.message} onRetry={() => refetch()} />
      ) : loading && rows.length === 0 ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        </div>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">No learning records for this user.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => {
            const result =
              r.evaluation ??
              (r.isCorrect === true ? "correct" : r.isCorrect === false ? "incorrect" : undefined);
            return (
              <li key={r._id} className="rounded-lg border border-zinc-200 bg-white p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Pill className="bg-violet-100 text-violet-700">
                    {r.experience === "practice_studio" ? "Practice Studio" : r.experience}
                  </Pill>
                  <Pill>{r.kind.replace("_", " ")}</Pill>
                  {result && <Pill className={RESULT_STYLES[result]}>{result}</Pill>}
                  {r.topicId && <span className="text-zinc-500">{r.topicId}</span>}
                  <span className="ml-auto text-zinc-400">{formatDateTime(r.createdAt)}</span>
                </div>
                {r.generatedQuestion && (
                  <p className="mt-2 whitespace-pre-wrap text-zinc-800">
                    <span className="font-medium">Q: </span>
                    {r.generatedQuestion}
                  </p>
                )}
                {r.learnerResponse && (
                  <p className="mt-1 whitespace-pre-wrap text-zinc-700">
                    <span className="font-medium">Answer: </span>
                    {r.learnerResponse}
                  </p>
                )}
                {(r.selectedOption || r.correctOption) && (
                  <p className="mt-1 text-xs text-zinc-600">
                    Picked <span className="font-medium">{r.selectedOption ?? "—"}</span> · correct{" "}
                    <span className="font-medium">{r.correctOption ?? "—"}</span>
                    {r.itemId ? ` · item ${r.itemId}` : ""}
                  </p>
                )}
                {r.idealAnswerShown && (
                  <p className="mt-1 whitespace-pre-wrap text-xs text-zinc-500">
                    <span className="font-medium">Ideal answer: </span>
                    {r.idealAnswerShown}
                  </p>
                )}
                {(r.reportReason || r.optionalComment) && (
                  <p className="mt-1 text-xs text-rose-700">
                    Reported: {[r.reportReason, r.optionalComment].filter(Boolean).join(" — ")}
                  </p>
                )}
                {r.responseTimeMs != null && (
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Answered in {(r.responseTimeMs / 1000).toFixed(1)}s
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <PaginationBar
        page={page}
        lastPage={meta?.lastPage ?? 1}
        total={meta?.total ?? 0}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(meta?.lastPage ?? p, p + 1))}
        loading={loading}
      />
    </div>
  );
}
