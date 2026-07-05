"use client";

import { useQuery } from "@apollo/client";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  X,
} from "lucide-react";
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
import {
  ADMIN_GET_ALL_THREADS,
  ADMIN_GET_THREAD_MESSAGES,
} from "../apollo/admin";

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
};

export function AdminChatsTable() {
  const [page, setPage] = useState(1);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedThreadTitle, setSelectedThreadTitle] = useState<string>("");
  const limit = 10;

  const { data, loading, error, refetch } = useQuery(ADMIN_GET_ALL_THREADS, {
    variables: { pagination: { page, limit, orderBy: "desc" } },
    fetchPolicy: "cache-and-network",
  });

  const threads = data?.getAllThreads?.data ?? [];
  const meta = data?.getAllThreads?.meta;

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        <p className="font-medium">Could not load chats.</p>
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
              <TableHead>Title</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last activity</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && threads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-400" />
                </TableCell>
              </TableRow>
            ) : threads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-zinc-500"
                >
                  No chat threads yet.
                </TableCell>
              </TableRow>
            ) : (
              threads.map((t) => (
                <TableRow key={t._id}>
                  <TableCell className="font-medium">
                    <div className="line-clamp-1 max-w-[28ch]">{t.title}</div>
                    {t.description && (
                      <div className="line-clamp-1 max-w-[36ch] text-xs text-zinc-500">
                        {t.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className="font-mono text-xs text-zinc-600"
                      title={t.userId}
                    >
                      {t.userId.slice(0, 10)}…
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {formatDate(t.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {formatDate(t.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedThreadId(t._id);
                        setSelectedThreadTitle(t.title);
                      }}
                      aria-label={`View messages in ${t.title}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-600">
        <span>
          Showing page <span className="font-medium">{page}</span> of{" "}
          <span className="font-medium">{Math.max(1, meta?.lastPage ?? 1)}</span>{" "}
          · <span className="font-medium">{meta?.total ?? 0}</span> total
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((p) => Math.min(meta?.lastPage ?? p, p + 1))
            }
            disabled={page >= (meta?.lastPage ?? 1) || loading}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {selectedThreadId && (
        <ThreadMessagesDrawer
          threadId={selectedThreadId}
          title={selectedThreadTitle}
          onClose={() => setSelectedThreadId(null)}
        />
      )}
    </div>
  );
}

function ThreadMessagesDrawer({
  threadId,
  title,
  onClose,
}: {
  threadId: string;
  title: string;
  onClose: () => void;
}) {
  const { data, loading, error } = useQuery(ADMIN_GET_THREAD_MESSAGES, {
    variables: {
      threadId,
      pagination: { page: 1, limit: 200, orderBy: "asc" },
    },
    fetchPolicy: "cache-and-network",
  });

  const messages = data?.getThreadMessages?.data ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 border-b border-zinc-200 px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
            <p className="text-xs text-zinc-500">
              {messages.length} message{messages.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-400 hover:text-zinc-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && messages.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          ) : error ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {error.message}
            </div>
          ) : messages.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-500">
              No messages in this thread.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={
                    m.senderType === "USER"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className={
                      m.senderType === "USER"
                        ? "max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-sm text-white whitespace-pre-wrap"
                        : "max-w-[80%] rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 whitespace-pre-wrap"
                    }
                  >
                    {m.content || (
                      <span className="text-xs italic text-zinc-400">
                        ({m.messageType})
                      </span>
                    )}
                    <div
                      className={
                        m.senderType === "USER"
                          ? "mt-1 text-[10px] text-white/70"
                          : "mt-1 text-[10px] text-zinc-400"
                      }
                    >
                      {formatDate(m.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
