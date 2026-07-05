"use client";

import { useQuery } from "@apollo/client";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { cn } from "@/core/lib/utils";
import { ADMIN_GET_ALL_USERS } from "../apollo/admin";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-zinc-100 text-zinc-600",
  INVITED: "bg-amber-100 text-amber-700",
  PENDING_SUBSCRIPTION: "bg-sky-100 text-sky-700",
};

const ROLE_STYLES: Record<string, string> = {
  OWNER: "bg-violet-100 text-violet-700",
  EDITOR: "bg-blue-100 text-blue-700",
  VIEWER: "bg-zinc-100 text-zinc-700",
};

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
};

export function AdminUsersTable() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, loading, error, refetch } = useQuery(ADMIN_GET_ALL_USERS, {
    variables: { pagination: { page, limit, orderBy: "desc" } },
    fetchPolicy: "cache-and-network",
  });

  const users = data?.getAllUsers?.data ?? [];
  const meta = data?.getAllUsers?.meta;

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        <p className="font-medium">Could not load users.</p>
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

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-400" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-zinc-500"
                >
                  No users yet.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>
                    {[u.firstName, u.lastName].filter(Boolean).join(" ") ||
                      "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        ROLE_STYLES[u.role] ?? "bg-zinc-100 text-zinc-700"
                      )}
                    >
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_STYLES[u.status] ?? "bg-zinc-100 text-zinc-700"
                      )}
                    >
                      {u.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {formatDate(u.createdAt)}
                  </TableCell>
                </TableRow>
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
