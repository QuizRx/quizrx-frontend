"use client";

import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { Checkbox } from "@/core/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Label } from "@/core/components/ui/label";

type TopicChangeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartNewSession: () => void;
  onContinueHere: () => void;
  // Optional "Don't ask again" preference (spec A-11 - optional).
  onDontAskAgainChange?: (value: boolean) => void;
};

// Shown when a user with an active session changes the selected topic
// (spec A-11). The new topic is not applied until one of the two actions is
// chosen. Copy is fixed and approved.
export function TopicChangeDialog({
  open,
  onOpenChange,
  onStartNewSession,
  onContinueHere,
  onDontAskAgainChange,
}: TopicChangeDialogProps) {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const commit = (action: () => void) => {
    onDontAskAgainChange?.(dontAskAgain);
    action();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>You&apos;ve selected a new topic.</DialogTitle>
          <DialogDescription>
            Would you like to continue this conversation or start a new study
            session?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id="dont-ask-again"
            checked={dontAskAgain}
            onCheckedChange={(checked) => setDontAskAgain(checked === true)}
          />
          <Label
            htmlFor="dont-ask-again"
            className="text-sm font-normal text-muted-foreground"
          >
            Don&apos;t ask again
          </Label>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => commit(onContinueHere)}
            className="border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10"
          >
            Continue Here
          </Button>
          <Button
            onClick={() => commit(onStartNewSession)}
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/90"
          >
            Start New Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
