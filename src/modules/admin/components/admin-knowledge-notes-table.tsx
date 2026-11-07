"use client";

import { useQuery } from "@apollo/client";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/core/components/ui/button";
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
import { cn } from "@/core/lib/utils";
import {
  CALCIUM_BONE_CHAINS,
  findChainById,
} from "@/modules/extraction-quiz";
import {
  ADMIN_KNOWLEDGE_NOTES_PUBLISH_STATE,
  ADMIN_LIST_KNOWLEDGE_NOTES,
} from "../apollo/admin";
import type { AdminKnowledgeNotesListInput } from "../types";
import { AdminKnowledgeNoteEditor } from "./admin-knowledge-note-editor";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  archived: "bg-zinc-200 text-zinc-700",
};

const PROCESSING_STYLES: Record<string, string> = {
  idle: "bg-zinc-100 text-zinc-700",
  processing: "bg-amber-100 text-amber-800",
  ready: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

function topicLabel(conceptId?: string | null, topicId?: string | null) {
  return (
    findChainById(conceptId ?? null)?.label ??
    findChainById(topicId ?? null)?.label ??
    conceptId ??
    topicId ??
    "—"
  );
}

export function AdminKnowledgeNotesTable() {
  const [page, setPage] = useState(1);
  const [topicId, setTopicId] = useState("all");
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorAnchorId, setEditorAnchorId] = useState<string | null>(null);
  const [processingOverride, setProcessingOverride] = useState<string | null>(
    null
  );
  const limit = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, topicId, status]);

  const listInput = useMemo<AdminKnowledgeNotesListInput>(() => {
    const input: AdminKnowledgeNotesListInput = { page, limit };
    if (topicId !== "all") input.topicId = topicId;
    if (status !== "all") input.status = status;
    if (search) input.search = search;
    return input;
  }, [page, limit, topicId, status, search]);

  const { data, loading, error, refetch } = useQuery(
    ADMIN_LIST_KNOWLEDGE_NOTES,
    {
      variables: { input: listInput },
      fetchPolicy: "cache-and-network",
    }
  );

  const list = data?.adminListKnowledgeNotes;
  const processingFromList = list?.processingState ?? "idle";
  const isProcessing =
    processingOverride === "processing" || processingFromList === "processing";

  const { data: publishStateData } = useQuery(
    ADMIN_KNOWLEDGE_NOTES_PUBLISH_STATE,
    {
      fetchPolicy: "cache-and-network",
      pollInterval: isProcessing ? 2000 : 0,
    }
  );

  const publishState =
    publishStateData?.adminKnowledgeNotesPublishState ?? list;
  const processingState =
    publishState?.processingState ?? processingFromList ?? "idle";
  const processingError = publishState?.processingError ?? list?.processingError;
  const activeNoteVersion =
    publishState?.activeNoteVersion ?? list?.activeNoteVersion ?? "";

  useEffect(() => {
    if (processingState && processingState !== "processing") {
      setProcessingOverride(null);
    }
  }, [processingState]);

  const rows = list?.data ?? [];
  const meta = list?.meta;
  const lastPage = meta?.lastPage ?? 1;
  const total = meta?.total ?? 0;
  const filtersActive = topicId !== "all" || status !== "all" || Boolean(search);

  const openCreate = () => {
    setEditorAnchorId(null);
    setEditorOpen(true);
  };

  const openEdit = (anchorId: string) => {
    setEditorAnchorId(anchorId);
    setEditorOpen(true);
  };

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        <p className="font-medium">Could not load knowledge notes.</p>
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
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
            PROCESSING_STYLES[processingState] ?? PROCESSING_STYLES.idle
          )}
        >
          {processingState === "processing" && (
            <Loader2 className="h-3 w-3 animate-spin" />
          )}
          {processingState}
        </span>
        {activeNoteVersion ? (
          <span className="text-xs text-zinc-500">
            Active version:{" "}
            <span className="font-medium text-zinc-700">{activeNoteVersion}</span>
          </span>
        ) : (
          <span className="text-xs text-zinc-500">No active version yet</span>
        )}
        {processingError && processingState === "failed" && (
          <span className="text-xs text-rose-700">{processingError}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={topicId}
          onValueChange={(value) => {
            setTopicId(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="All topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All topics</SelectItem>
            {CALCIUM_BONE_CHAINS.map((chain) => (
              <SelectItem key={chain.chainId} value={chain.chainId}>
                {chain.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search note text"
          className="w-full sm:max-w-xs"
        />

        {filtersActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTopicId("all");
              setStatus("all");
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        )}

        <Button size="sm" className="ml-auto gap-1" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add note
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic</TableHead>
              <TableHead className="hidden lg:table-cell">Type</TableHead>
              <TableHead>Text</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Version</TableHead>
              <TableHead className="hidden lg:table-cell">Edited by</TableHead>
              <TableHead className="hidden md:table-cell">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-400" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-zinc-500"
                >
                  No knowledge notes yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.anchorId}
                  className="cursor-pointer"
                  onClick={() => openEdit(row.anchorId)}
                >
                  <TableCell className="align-top">
                    <div className="font-medium text-zinc-900">
                      {topicLabel(row.conceptId, row.topicId)}
                    </div>
                    <div className="font-mono text-[11px] text-zinc-500">
                      {row.anchorId}
                    </div>
                  </TableCell>
                  <TableCell className="hidden align-top text-xs text-zinc-600 lg:table-cell">
                    {row.type}
                    {row.section ? (
                      <div className="text-[11px] text-zinc-400">{row.section}</div>
                    ) : null}
                  </TableCell>
                  <TableCell className="max-w-[280px] align-top text-xs text-zinc-700">
                    <span className="line-clamp-2">{row.text}</span>
                  </TableCell>
                  <TableCell className="align-top">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                        STATUS_STYLES[row.status] ?? "bg-zinc-100 text-zinc-700"
                      )}
                    >
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell className="hidden align-top text-xs text-zinc-600 md:table-cell">
                    {row.chainVersion || "—"}
                  </TableCell>
                  <TableCell className="hidden align-top text-xs text-zinc-600 lg:table-cell">
                    {row.lastEditedBy || "—"}
                  </TableCell>
                  <TableCell className="hidden align-top text-xs text-zinc-600 md:table-cell">
                    {formatDate(row.updatedAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationBar
        page={page}
        lastPage={lastPage}
        total={total}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        loading={loading}
      />

      <AdminKnowledgeNoteEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        anchorId={editorAnchorId}
        onAnchorChange={setEditorAnchorId}
        processingState={processingState}
        onProcessingState={setProcessingOverride}
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
