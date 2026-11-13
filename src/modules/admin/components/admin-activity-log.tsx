"use client";

import { useQuery } from "@apollo/client";
import { ChevronDown, ChevronRight, Loader2, Search } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Input } from "@/core/components/ui/input";
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
  ADMIN_LIST_ACTIVITY,
  type AdminActivityKind,
} from "../apollo/admin-analytics";
import {
  ErrorBox,
  KIND_STYLES,
  PaginationBar,
  Pill,
  formatDateTime,
  operationLabel,
} from "./admin-shared";

const KIND_FILTERS: { value: AdminActivityKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "login", label: "Logins" },
  { value: "logout", label: "Logouts" },
  { value: "chat", label: "Chat" },
  { value: "graphql", label: "App actions" },
  { value: "rest", label: "Uploads/API" },
];

export function AdminActivityLog({
  userId,
  onSelectUser,
  pageSize = 25,
}: {
  userId?: string;
  onSelectUser?: (userId: string) => void;
  pageSize?: number;
}) {
  const [kind, setKind] = useState<AdminActivityKind | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, loading, error, refetch } = useQuery(ADMIN_LIST_ACTIVITY, {
    variables: {
      input: {
        userId,
        kind: kind === "all" ? undefined : kind,
        search: search || undefined,
        page,
        limit: pageSize,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const rows = data?.adminListActivity?.data ?? [];
  const meta = data?.adminListActivity?.meta;
  const showUser = !userId;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {KIND_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setKind(f.value);
                setPage(1);
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                kind === f.value
                  ? "border-primary bg-primary text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={showUser ? "Search email, action, IP…" : "Search action or text…"}
            className="pl-8"
          />
        </div>
      </div>

      {error && !data ? (
        <ErrorBox title="Could not load activity." message={error.message} onRetry={() => refetch()} />
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead className="whitespace-nowrap">When</TableHead>
                {showUser && <TableHead>User</TableHead>}
                <TableHead>Action</TableHead>
                <TableHead className="hidden md:table-cell">Details</TableHead>
                <TableHead className="hidden lg:table-cell">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-400" />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                    No activity recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  const open = expanded === r._id;
                  return (
                    <Fragment key={r._id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setExpanded(open ? null : r._id)}
                      >
                        <TableCell className="text-zinc-400">
                          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-zinc-500">
                          {formatDateTime(r.at)}
                        </TableCell>
                        {showUser && (
                          <TableCell className="max-w-[22ch] truncate text-xs">
                            {onSelectUser ? (
                              <button
                                type="button"
                                className="text-primary hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectUser(r.userId);
                                }}
                              >
                                {r.email || r.userId}
                              </button>
                            ) : (
                              r.email || r.userId
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Pill className={KIND_STYLES[r.kind]}>{r.kind}</Pill>
                            <span className="text-sm font-medium text-zinc-800">
                              {operationLabel(r.operation)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden max-w-[40ch] truncate text-xs text-zinc-600 md:table-cell">
                          {r.summary || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {r.success ? (
                            <Pill className="bg-emerald-50 text-emerald-700">ok</Pill>
                          ) : (
                            <Pill className="bg-rose-100 text-rose-700">failed</Pill>
                          )}
                        </TableCell>
                      </TableRow>
                      {open && (
                        <TableRow className="bg-zinc-50/60 hover:bg-zinc-50/60">
                          <TableCell />
                          <TableCell colSpan={showUser ? 5 : 4} className="py-3">
                            <dl className="grid gap-x-6 gap-y-1 text-xs text-zinc-600 sm:grid-cols-2">
                              <Detail label="Operation" value={r.operation} mono />
                              <Detail label="Type" value={r.operationType} />
                              <Detail label="Duration" value={r.durationMs != null ? `${r.durationMs} ms` : undefined} />
                              <Detail label="IP" value={r.ip} mono />
                              <Detail label="Device" value={r.userAgent} />
                              {r.error && <Detail label="Error" value={r.error} />}
                            </dl>
                            {r.summary && (
                              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-800">{r.summary}</p>
                            )}
                            {r.details && Object.keys(r.details).length > 0 && (
                              <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-zinc-900 p-3 text-[11px] leading-relaxed text-zinc-100">
                                {JSON.stringify(r.details, null, 2)}
                              </pre>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
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

function Detail({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 font-medium text-zinc-500">{label}:</dt>
      <dd className={cn("break-all", mono && "font-mono")}>{value}</dd>
    </div>
  );
}
