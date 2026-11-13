"use client";

import { useQuery } from "@apollo/client";
import { ChevronDown, Eye, Loader2, X } from "lucide-react";
import { Fragment, useState } from "react";
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
import {
  ADMIN_LIST_THREADS,
  ADMIN_THREAD_MESSAGES,
} from "../apollo/admin-analytics";
import { ErrorBox, PaginationBar, formatDateTime } from "./admin-shared";

/**
 * All chats (or one user's chats when `userId` is set). When embedded in the
 * user detail sheet, messages expand inline instead of opening a drawer.
 */
export function AdminChatsTable({
  userId,
  onSelectUser,
}: {
  userId?: string;
  onSelectUser?: (userId: string) => void;
}) {
  const embedded = Boolean(userId);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<{ id: string; title: string } | null>(null);
  const limit = 10;

  const { data, loading, error, refetch } = useQuery(ADMIN_LIST_THREADS, {
    variables: { pagination: { page, limit, orderBy: "desc" }, userId },
    fetchPolicy: "cache-and-network",
  });

  const threads = data?.adminGetAllThreads?.data ?? [];
  const meta = data?.adminGetAllThreads?.meta;

  if (error && !data) {
    return <ErrorBox title="Could not load chats." message={error.message} onRetry={() => refetch()} />;
  }

  const colSpan = embedded ? 4 : 6;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              {!embedded && <TableHead className="hidden md:table-cell">User</TableHead>}
              <TableHead className="w-24 text-right">Messages</TableHead>
              {!embedded && <TableHead className="hidden lg:table-cell">Created</TableHead>}
              <TableHead className="hidden lg:table-cell">Last activity</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && threads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-400" />
                </TableCell>
              </TableRow>
            ) : threads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center text-sm text-zinc-500">
                  No chat threads yet.
                </TableCell>
              </TableRow>
            ) : (
              threads.map((t) => {
                const open = selected?.id === t._id;
                return (
                  <Fragment key={t._id}>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="line-clamp-1 max-w-[28ch]">{t.title}</div>
                        {t.description && (
                          <div className="line-clamp-1 max-w-[36ch] text-xs text-zinc-500">
                            {t.description}
                          </div>
                        )}
                      </TableCell>
                      {!embedded && (
                        <TableCell className="hidden text-xs md:table-cell">
                          {onSelectUser ? (
                            <button
                              type="button"
                              onClick={() => onSelectUser(t.userId)}
                              className="text-left text-primary hover:underline"
                            >
                              {t.userEmail || t.userId}
                            </button>
                          ) : (
                            t.userEmail || t.userId
                          )}
                          {t.userName && <div className="text-zinc-500">{t.userName}</div>}
                        </TableCell>
                      )}
                      <TableCell className="text-right text-sm">{t.messageCount}</TableCell>
                      {!embedded && (
                        <TableCell className="hidden text-xs text-zinc-500 lg:table-cell">
                          {formatDateTime(t.createdAt)}
                        </TableCell>
                      )}
                      <TableCell className="hidden text-xs text-zinc-500 lg:table-cell">
                        {formatDateTime(t.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelected(open ? null : { id: t._id, title: t.title })}
                          aria-label={`View messages in ${t.title}`}
                        >
                          {embedded && open ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {embedded && open && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={colSpan} className="bg-zinc-50/60 p-3">
                          <div className="max-h-[28rem] overflow-y-auto">
                            <ThreadMessages threadId={t._id} />
                          </div>
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

      <PaginationBar
        page={page}
        lastPage={meta?.lastPage ?? 1}
        total={meta?.total ?? 0}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(meta?.lastPage ?? p, p + 1))}
        loading={loading}
      />

      {!embedded && selected && (
        <ThreadMessagesDrawer
          threadId={selected.id}
          title={selected.title}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export function ThreadMessages({ threadId }: { threadId: string }) {
  const { data, loading, error } = useQuery(ADMIN_THREAD_MESSAGES, {
    variables: { threadId, pagination: { page: 1, limit: 200, orderBy: "asc" } },
    fetchPolicy: "cache-and-network",
  });
  const messages = data?.adminGetThreadMessages?.data ?? [];

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
        {error.message}
      </div>
    );
  }
  if (messages.length === 0) {
    return <div className="py-10 text-center text-sm text-zinc-500">No messages in this thread.</div>;
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => {
        const mine = m.senderType === "USER";
        return (
          <div key={m._id} className={mine ? "flex justify-end" : "flex justify-start"}>
            <div
              className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm",
                mine ? "bg-primary text-white" : "border border-zinc-200 bg-white text-zinc-800"
              )}
            >
              {m.content || <span className="text-xs italic text-zinc-400">({m.messageType})</span>}
              <div className={cn("mt-1 text-[10px]", mine ? "text-white/70" : "text-zinc-400")}>
                {formatDateTime(m.createdAt)}
              </div>
            </div>
          </div>
        );
      })}
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
          <h3 className="min-w-0 text-sm font-semibold text-zinc-900">{title}</h3>
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
          <ThreadMessages threadId={threadId} />
        </div>
      </div>
    </div>
  );
}
