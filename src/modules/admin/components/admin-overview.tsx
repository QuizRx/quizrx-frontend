"use client";

import { useQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/core/lib/utils";
import {
  ADMIN_ANALYTICS_OVERVIEW,
  type AdminAnalyticsDay,
  type AdminCountStat,
  type AdminExperienceStat,
} from "../apollo/admin-analytics";
import { ErrorBox, StatCard, operationLabel } from "./admin-shared";

const RANGES = [7, 30, 90] as const;

const SERIES: { key: keyof AdminAnalyticsDay; label: string; color: string }[] = [
  { key: "activeUsers", label: "Active users", color: "#7c3aed" },
  { key: "logins", label: "Logins", color: "#059669" },
  { key: "userMessages", label: "Chat messages", color: "#0284c7" },
  { key: "learningAnswers", label: "Learning answers", color: "#d97706" },
  { key: "newUsers", label: "New users", color: "#e11d48" },
];

const EXPERIENCE_LABELS: Record<string, string> = {
  reasoning: "Reasoning",
  practice_studio: "Practice Studio",
  tutor: "Tutor",
};

const shortDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const pct = (part: number, whole: number) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : "—";

export function AdminOverview() {
  const [days, setDays] = useState<number>(30);
  const { data, loading, error, refetch } = useQuery(ADMIN_ANALYTICS_OVERVIEW, {
    variables: { days },
    fetchPolicy: "cache-and-network",
  });
  const overview = data?.adminAnalyticsOverview;

  if (error && !overview) {
    return (
      <ErrorBox
        title="Could not load analytics."
        message={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  if (!overview) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const t = overview.totals;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-zinc-500">
          Activity for the last <span className="font-medium">{days} days</span>{" "}
          (UTC). Totals marked “all time” ignore the range.
        </p>
        <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white p-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDays(r)}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium",
                days === r ? "bg-primary text-white" : "text-zinc-600 hover:bg-zinc-100"
              )}
            >
              {r}d
            </button>
          ))}
          {loading && <Loader2 className="mx-1 h-3.5 w-3.5 animate-spin text-zinc-400" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total users" value={t.users} hint={`+${t.newUsers} new in range`} />
        <StatCard
          label="Active users"
          value={t.activeUsers}
          hint={`${t.activeToday} today · ${t.activeLast7Days} last 7d`}
        />
        <StatCard label="Logins" value={t.logins} hint="in range" />
        <StatCard
          label="Chat messages"
          value={t.userMessages}
          hint={`sent by users in range · ${t.messages} all time`}
        />
        <StatCard label="Learning answers" value={t.learningAnswers} hint="Reasoning + Practice Studio" />
        <StatCard label="Chats" value={t.threads} hint="all time" />
        <StatCard
          label="Feedback"
          value={t.feedbackCount}
          hint={t.averageRating != null ? `avg ${t.averageRating} ★ · all time` : "all time"}
        />
        <StatCard
          label="Stickiness"
          value={pct(t.activeToday, t.activeLast7Days)}
          hint="today ÷ last 7 days active"
        />
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">Daily activity</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={overview.daily} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="date" tickFormatter={shortDate} fontSize={11} minTickGap={16} />
              <YAxis allowDecimals={false} fontSize={11} />
              <Tooltip labelFormatter={(d) => shortDate(String(d))} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {SERIES.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ExperienceChart experiences={overview.experiences} />
        <CountList
          title="Top topics practised"
          rows={overview.topTopics}
          empty="No learning answers in this range."
        />
        <CountList
          title="Most frequent actions"
          rows={overview.topActions}
          format={operationLabel}
          empty="No tracked actions yet. Activity logging starts after the backend deploy."
        />
        <CountList
          title="Login methods"
          rows={overview.loginProviders}
          empty="No logins recorded in this range."
        />
      </div>
    </div>
  );
}

export function ExperienceChart({ experiences }: { experiences: AdminExperienceStat[] }) {
  const data = experiences.map((e) => ({
    ...e,
    name: EXPERIENCE_LABELS[e.experience] ?? e.experience,
  }));
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-900">Answers by learning mode</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No answers yet.</p>
      ) : (
        <>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="correct" name="Correct" stackId="a" fill="#059669" />
                <Bar dataKey="partial" name="Partial" stackId="a" fill="#d97706" />
                <Bar dataKey="incorrect" name="Incorrect" stackId="a" fill="#e11d48" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-zinc-600">
            {data.map((e) => (
              <li key={e.experience} className="flex justify-between">
                <span>{e.name}</span>
                <span>
                  {e.answers} answers · {pct(e.correct, e.answers)} correct
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export function CountList({
  title,
  rows,
  empty,
  format,
}: {
  title: string;
  rows: AdminCountStat[];
  empty: string;
  format?: (key: string) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-900">{title}</h3>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.key} className="text-xs">
              <div className="mb-1 flex justify-between gap-2 text-zinc-700">
                <span className="truncate" title={r.key}>
                  {format ? format(r.key) : r.key}
                </span>
                <span className="font-medium">{r.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-100">
                <div
                  className="h-1.5 rounded-full bg-primary"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
