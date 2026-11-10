"use client";

import { useQuery } from "@apollo/client";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/core/components/ui/input";
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
import {
  ADMIN_LIST_USERS_WITH_STATS,
  type AdminUserSort,
} from "../apollo/admin-analytics";
import {
  ErrorBox,
  PaginationBar,
  Pill,
  formatDateTime,
  formatRelative,
  fullName,
} from "./admin-shared";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-zinc-100 text-zinc-600",
  INVITED: "bg-amber-100 text-amber-700",
  PENDING_SUBSCRIPTION: "bg-sky-100 text-sky-700",
};

const SORTS: { value: AdminUserSort; label: string }[] = [
  { value: "createdAt", label: "Newest first" },
  { value: "lastSeenAt", label: "Recently active" },
  { value: "lastLoginAt", label: "Recent login" },
  { value: "loginCount", label: "Most logins" },
];

export function AdminUsersTable({ onSelectUser }: { onSelectUser: (userId: string) => void }) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<AdminUserSort>("createdAt");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const limit = 15;

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, loading, error, refetch } = useQuery(ADMIN_LIST_USERS_WITH_STATS, {
    variables: { input: { page, limit, sortBy, search: search || undefined } },
    fetchPolicy: "cache-and-network",
  });

  const users = data?.adminListUsersWithStats?.data ?? [];
  const meta = data?.adminListUsersWithStats?.meta;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search email or name…"
            className="pl-8"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(v) => {
            setSortBy(v as AdminUserSort);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && !data ? (
        <ErrorBox title="Could not load users." message={error.message} onRetry={() => refetch()} />
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Last login</TableHead>
                <TableHead className="hidden md:table-cell">Last active</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Logins</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Chats</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Answers</TableHead>
                <TableHead className="hidden xl:table-cell">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-400" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-zinc-500">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow
                    key={u._id}
                    className="cursor-pointer"
                    onClick={() => onSelectUser(u._id)}
                  >
                    <TableCell>
                      <div className="font-medium break-all text-zinc-900">{u.email}</div>
                      <div className="text-xs text-zinc-500">{fullName(u) || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <Pill className={STATUS_STYLES[u.status ?? ""]}>{u.status ?? "—"}</Pill>
                    </TableCell>
                    <TableCell
                      className="hidden text-xs text-zinc-600 md:table-cell"
                      title={formatDateTime(u.lastLoginAt)}
                    >
                      {formatRelative(u.lastLoginAt)}
                    </TableCell>
                    <TableCell
                      className="hidden text-xs text-zinc-600 md:table-cell"
                      title={formatDateTime(u.lastActivityAt)}
                    >
                      {formatRelative(u.lastActivityAt)}
                    </TableCell>
                    <TableCell className="hidden text-right text-sm lg:table-cell">{u.loginCount}</TableCell>
                    <TableCell className="hidden text-right text-sm lg:table-cell">{u.threadCount}</TableCell>
                    <TableCell className="hidden text-right text-sm lg:table-cell">{u.learningAnswers}</TableCell>
                    <TableCell className="hidden text-xs text-zinc-500 xl:table-cell">
                      {formatDateTime(u.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
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
