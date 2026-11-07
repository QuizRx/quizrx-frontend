"use client";

import { useMutation, useQuery } from "@apollo/client";
import { Loader2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/components/ui/alert-dialog";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/core/components/ui/sheet";
import { Textarea } from "@/core/components/ui/textarea";
import { useToast } from "@/core/hooks/use-toast";
import { cn } from "@/core/lib/utils";
import { CALCIUM_BONE_CHAINS } from "@/modules/extraction-quiz";
import {
  ADMIN_ARCHIVE_KNOWLEDGE_NOTE,
  ADMIN_CREATE_KNOWLEDGE_NOTE,
  ADMIN_GET_KNOWLEDGE_NOTE,
  ADMIN_LIST_KNOWLEDGE_NOTE_VERSIONS,
  ADMIN_PUBLISH_KNOWLEDGE_NOTE,
  ADMIN_RESTORE_KNOWLEDGE_NOTE_VERSION,
  ADMIN_UPDATE_KNOWLEDGE_NOTE,
} from "../apollo/admin";
import type {
  AdminKnowledgeNoteRow,
  AdminUpdateKnowledgeNoteInput,
} from "../types";
import { extractKnowledgeNoteText } from "../utils/extract-knowledge-note-text";

const KN_REFETCH = [
  "AdminListKnowledgeNotes",
  "AdminGetKnowledgeNote",
  "AdminListKnowledgeNoteVersions",
  "AdminKnowledgeNotesPublishState",
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  archived: "bg-zinc-200 text-zinc-700",
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

function gqlErrorMessage(
  errors?: readonly { message: string }[] | null,
  fallback = "Something went wrong."
) {
  return errors?.[0]?.message ?? fallback;
}

type EditorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorId: string | null;
  onAnchorChange: (anchorId: string) => void;
  processingState: string;
  onProcessingState: (state: string) => void;
};

export function AdminKnowledgeNoteEditor({
  open,
  onOpenChange,
  anchorId,
  onAnchorChange,
  processingState,
  onProcessingState,
}: EditorProps) {
  const { toast } = useToast();
  const [workingId, setWorkingId] = useState<string | null>(anchorId);
  const [topicKey, setTopicKey] = useState("");
  const [type, setType] = useState("note");
  const [section, setSection] = useState("knowledge_notes");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("draft");
  const [original, setOriginal] = useState<{
    topicKey: string;
    type: string;
    section: string;
    text: string;
  } | null>(null);
  const [confirm, setConfirm] = useState<"publish" | "archive" | null>(null);
  const [busy, setBusy] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setWorkingId(null);
      setTopicKey("");
      setType("note");
      setSection("knowledge_notes");
      setText("");
      setStatus("draft");
      setOriginal(null);
      setConfirm(null);
      setExtracting(false);
      return;
    }
    setWorkingId(anchorId);
    if (!anchorId) {
      setTopicKey("");
      setType("note");
      setSection("knowledge_notes");
      setText("");
      setStatus("draft");
      setOriginal(null);
    }
  }, [open, anchorId]);

  const isCreate = !workingId;
  const isArchived = status === "archived";
  const isActive = status === "active";
  const isProcessing = processingState === "processing";
  const readOnly = isArchived;

  const { data, loading: loadingNote } = useQuery(ADMIN_GET_KNOWLEDGE_NOTE, {
    variables: { anchorId: workingId ?? "" },
    skip: !open || !workingId,
    fetchPolicy: "cache-and-network",
  });

  const { data: versionsData, loading: loadingVersions } = useQuery(
    ADMIN_LIST_KNOWLEDGE_NOTE_VERSIONS,
    {
      variables: { anchorId: workingId ?? "" },
      skip: !open || !workingId,
      fetchPolicy: "cache-and-network",
    }
  );

  const note = data?.adminGetKnowledgeNote?.note;

  useEffect(() => {
    if (!open || !note || note.anchorId !== workingId) return;
    const nextTopic = note.conceptId || note.topicId;
    setTopicKey(nextTopic);
    setType(note.type || "note");
    setSection(note.section || "");
    setText(note.text);
    setStatus(note.status);
    setOriginal({
      topicKey: nextTopic,
      type: note.type || "note",
      section: note.section || "",
      text: note.text,
    });
  }, [open, note, workingId]);

  const versions = versionsData?.adminListKnowledgeNoteVersions ?? [];

  const [createNote] = useMutation(ADMIN_CREATE_KNOWLEDGE_NOTE);
  const [updateNote] = useMutation(ADMIN_UPDATE_KNOWLEDGE_NOTE);
  const [publishNote] = useMutation(ADMIN_PUBLISH_KNOWLEDGE_NOTE);
  const [archiveNote] = useMutation(ADMIN_ARCHIVE_KNOWLEDGE_NOTE);
  const [restoreVersion] = useMutation(ADMIN_RESTORE_KNOWLEDGE_NOTE_VERSION);

  const applyRow = (row: AdminKnowledgeNoteRow) => {
    setWorkingId(row.anchorId);
    onAnchorChange(row.anchorId);
    const nextTopic = row.conceptId || row.topicId;
    setTopicKey(nextTopic);
    setType(row.type || "note");
    setSection(row.section || "");
    setText(row.text);
    setStatus(row.status);
    setOriginal({
      topicKey: nextTopic,
      type: row.type || "note",
      section: row.section || "",
      text: row.text,
    });
  };

  const persist = async (): Promise<string | null> => {
    if (readOnly) return workingId;
    if (!topicKey || !type.trim() || !text.trim()) {
      toast({
        title: "Missing fields",
        description: "Topic, type, and text are required.",
        variant: "destructive",
      });
      return null;
    }

    try {
      if (!workingId) {
        const result = await createNote({
          variables: {
            input: {
              topicKey,
              type: type.trim(),
              text: text.trim(),
              ...(section.trim() ? { section: section.trim() } : {}),
            },
          },
          refetchQueries: KN_REFETCH,
          awaitRefetchQueries: true,
        });
        if (result.errors?.length) {
          toast({
            title: "Could not create draft",
            description: gqlErrorMessage(result.errors),
            variant: "destructive",
          });
          return null;
        }
        const created = result.data?.adminCreateKnowledgeNote;
        if (!created) return null;
        applyRow(created);
        return created.anchorId;
      }

      const input: AdminUpdateKnowledgeNoteInput = {};
      if (!original || topicKey !== original.topicKey) input.topicKey = topicKey;
      if (!original || type.trim() !== original.type) input.type = type.trim();
      if (!original || section.trim() !== original.section) {
        input.section = section.trim();
      }
      if (!original || text.trim() !== original.text) input.text = text.trim();

      if (Object.keys(input).length === 0) return workingId;

      const result = await updateNote({
        variables: { anchorId: workingId, input },
        refetchQueries: KN_REFETCH,
        awaitRefetchQueries: true,
      });
      if (result.errors?.length) {
        toast({
          title: "Could not save",
          description: gqlErrorMessage(result.errors),
          variant: "destructive",
        });
        return null;
      }
      const updated = result.data?.adminUpdateKnowledgeNote;
      if (updated) applyRow(updated);
      return workingId;
    } catch (err) {
      toast({
        title: "Could not save",
        description: err instanceof Error ? err.message : "Network error",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      const id = await persist();
      if (id) {
        toast({
          title: isCreate ? "Draft created" : "Saved",
          description: isCreate
            ? "This note is a draft. Publish it to use it in Tutor and Practice Studio."
            : "Edits saved.",
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    setBusy(true);
    try {
      const id = await persist();
      if (!id) return;
      const result = await publishNote({
        variables: { anchorId: id },
        refetchQueries: KN_REFETCH,
        awaitRefetchQueries: true,
      });
      if (result.errors?.length) {
        toast({
          title: "Publish failed",
          description: gqlErrorMessage(result.errors),
          variant: "destructive",
        });
        return;
      }
      const payload = result.data?.adminPublishKnowledgeNote;
      if (payload?.processingState) onProcessingState(payload.processingState);
      if (payload?.note) applyRow(payload.note);
      toast({
        title: "Published",
        description: "Tutor and Practice Studio will use this note.",
      });
    } catch (err) {
      toast({
        title: "Publish failed",
        description: err instanceof Error ? err.message : "Network error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const handleArchive = async () => {
    if (!workingId) return;
    setBusy(true);
    try {
      const result = await archiveNote({
        variables: { anchorId: workingId },
        refetchQueries: KN_REFETCH,
        awaitRefetchQueries: true,
      });
      if (result.errors?.length) {
        toast({
          title: "Archive failed",
          description: gqlErrorMessage(result.errors),
          variant: "destructive",
        });
        return;
      }
      const payload = result.data?.adminArchiveKnowledgeNote;
      if (payload?.processingState) onProcessingState(payload.processingState);
      if (payload?.note) applyRow(payload.note);
      toast({
        title: "Archived",
        description: "Tutor and Practice Studio will stop using this note.",
      });
    } catch (err) {
      toast({
        title: "Archive failed",
        description: err instanceof Error ? err.message : "Network error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const handleRestore = async (versionId: string) => {
    setBusy(true);
    try {
      const result = await restoreVersion({
        variables: { versionId },
        refetchQueries: KN_REFETCH,
        awaitRefetchQueries: true,
      });
      if (result.errors?.length) {
        toast({
          title: "Restore failed",
          description: gqlErrorMessage(result.errors),
          variant: "destructive",
        });
        return;
      }
      const restored = result.data?.adminRestoreKnowledgeNoteVersion;
      if (!restored) return;
      applyRow(restored);
      toast({
        title: "Restored as a new draft",
        description: "Publish it to go live. It was not published automatically.",
      });
    } catch (err) {
      toast({
        title: "Restore failed",
        description: err instanceof Error ? err.message : "Network error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || readOnly) return;
    setExtracting(true);
    try {
      const extracted = await extractKnowledgeNoteText(file);
      setText((prev) => (prev.trim() ? `${prev.trim()}\n\n${extracted}` : extracted));
      toast({
        title: "Text extracted",
        description: `Added text from ${file.name}. You can edit it before saving.`,
      });
    } catch (err) {
      toast({
        title: "Could not extract text",
        description: err instanceof Error ? err.message : "Unsupported file.",
        variant: "destructive",
      });
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const canPublish = !readOnly && !isProcessing;
  const showArchive = isActive;
  const loading = Boolean(workingId && loadingNote && !note);

  const title = useMemo(() => {
    if (isCreate) return "New knowledge note";
    if (isArchived) return "Archived knowledge note";
    return "Edit knowledge note";
  }, [isCreate, isArchived]);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl">
          <SheetHeader className="border-b border-zinc-200">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription className="flex flex-wrap items-center gap-2">
              {workingId ? (
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                    STATUS_STYLES[status] ?? "bg-zinc-100 text-zinc-700"
                  )}
                >
                  {status}
                </span>
              ) : (
                <span className="text-xs">Saves as a draft. Publish separately to go live.</span>
              )}
              {workingId && (
                <span className="font-mono text-[11px] text-zinc-500">
                  {workingId}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>

          {loading ? (
            <div className="flex flex-1 items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-4 px-4 py-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="kn-topic">Topic</Label>
                  <Select
                    value={topicKey || undefined}
                    onValueChange={setTopicKey}
                    disabled={readOnly}
                  >
                    <SelectTrigger id="kn-topic">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {CALCIUM_BONE_CHAINS.map((chain) => (
                        <SelectItem key={chain.chainId} value={chain.chainId}>
                          {chain.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="kn-type">Type</Label>
                  <Input
                    id="kn-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="kn-section">Section</Label>
                  <Input
                    id="kn-section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    disabled={readOnly}
                    placeholder="knowledge_notes"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor="kn-text">Text</Label>
                  {!readOnly && (
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.pdf,text/plain,application/pdf"
                        className="sr-only"
                        disabled={extracting || busy}
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        disabled={extracting || busy}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {extracting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        {extracting ? "Extracting…" : "Upload .txt or .pdf"}
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500">
                  Paste text, or upload a .txt / .pdf. Extracted text is added
                  to this box so you can edit it before saving.
                </p>
                <Textarea
                  id="kn-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={readOnly || extracting}
                  className="min-h-[220px] pt-3"
                  onDragOver={(e) => {
                    if (readOnly) return;
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    if (readOnly) return;
                    e.preventDefault();
                    handleFile(e.dataTransfer.files?.[0]);
                  }}
                />
              </div>

              {workingId && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-zinc-900">History</h3>
                  {loadingVersions && versions.length === 0 ? (
                    <p className="text-xs text-zinc-500">Loading versions…</p>
                  ) : versions.length === 0 ? (
                    <p className="text-xs text-zinc-500">
                      No published versions yet. Publish to create history.
                    </p>
                  ) : (
                    <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-200">
                      {versions.map((version) => (
                        <li
                          key={version.versionId}
                          className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-start sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-zinc-800">
                              {version.chainVersion || "—"}
                              <span className="ml-2 font-normal text-zinc-500">
                                {formatDate(version.publishedAt)}
                              </span>
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {version.publishedBy || "Unknown"}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs text-zinc-600">
                              {version.text}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => handleRestore(version.versionId)}
                          >
                            Restore
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          <SheetFooter className="flex-row flex-wrap justify-end gap-2 border-t border-zinc-200">
            {showArchive && (
              <Button
                type="button"
                variant="outline"
                className="text-rose-700"
                disabled={busy || isProcessing}
                onClick={() => setConfirm("archive")}
              >
                Archive
              </Button>
            )}
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                disabled={busy || extracting}
                onClick={handleSave}
              >
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isCreate ? "Save draft" : "Save"}
              </Button>
            )}
            {canPublish && (
              <Button
                type="button"
                disabled={busy || extracting || isProcessing}
                onClick={() => setConfirm("publish")}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Publish
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={confirm === "publish"}
        onOpenChange={(next) => {
          if (!next) setConfirm(null);
        }}
      >
        <AlertDialogContent className="z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive ? "Re-publish this note?" : "Publish this note?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isActive
                ? "Re-publishing bumps the version and saves a history snapshot. Tutor and Practice Studio will use the new version."
                : "Tutor and Practice Studio will start using this note once it is active."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={handlePublish}>
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirm === "archive"}
        onOpenChange={(next) => {
          if (!next) setConfirm(null);
        }}
      >
        <AlertDialogContent className="z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this note?</AlertDialogTitle>
            <AlertDialogDescription>
              Tutor/PS will stop using this note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={handleArchive}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
