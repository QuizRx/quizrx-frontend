"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Textarea } from "@/core/components/ui/textarea";
import { REPORT_REASONS, type ReportReason } from "../data/report-reasons";

type ReportQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: ReportReason, comment: string) => Promise<boolean>;
};

type Status = "idle" | "submitting" | "success" | "error";

// Report this question dialog (spec A-14). Reason is required, comment
// optional. Question metadata is attached automatically by the caller.
export function ReportQuestionDialog({
  open,
  onOpenChange,
  onSubmit,
}: ReportQuestionDialogProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const reset = () => {
    setReason("");
    setComment("");
    setStatus("idle");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!reason || status === "submitting") return;
    setStatus("submitting");
    const ok = await onSubmit(reason, comment.trim());
    setStatus(ok ? "success" : "error");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {status === "success" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[var(--primary)]" />
                Report submitted
              </DialogTitle>
              <DialogDescription>
                Thank you. Your report has been submitted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => handleOpenChange(false)}
                className="bg-[var(--primary)] hover:bg-[var(--primary)]/90"
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Report this question</DialogTitle>
              <DialogDescription>
                Tell us what&apos;s wrong so we can improve it.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <div className="space-y-2">
                <Label htmlFor="report-reason">Reason</Label>
                <Select
                  value={reason}
                  onValueChange={(value) => setReason(value as ReportReason)}
                >
                  <SelectTrigger id="report-reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                      <SelectContent>
                        {REPORT_REASONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-comment">
                  Comment{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="report-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add any detail that would help us..."
                  rows={3}
                  maxLength={2000}
                />
              </div>

              {status === "error" && (
                <p className="flex items-center gap-2 text-sm text-rose-600">
                  <XCircle className="h-4 w-4" />
                  Sorry, your report couldn&apos;t be submitted. Please try
                  again.
                </p>
              )}
            </div>

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!reason}
                loading={status === "submitting"}
                className="bg-[var(--primary)] hover:bg-[var(--primary)]/90"
              >
                Submit
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
