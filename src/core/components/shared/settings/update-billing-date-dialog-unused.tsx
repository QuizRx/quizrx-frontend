import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import React, { useState } from "react";
import { Calendar } from "../../ui/calendar";

interface UpdateBillingDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date | null;
  onSave: (date: Date) => void;
  loading?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

const UpdateBillingDateDialog: React.FC<UpdateBillingDateDialogProps> = ({
  open,
  onOpenChange,
  initialDate,
  onSave,
  loading,
  fromDate,
  toDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);

  React.useEffect(() => {
    setSelectedDate(initialDate || null);
  }, [initialDate, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Update Billing Date</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select a new billing date for your subscription.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 flex flex-col items-center">
          <Calendar
            mode="single"
            selected={selectedDate ?? undefined}
            onSelect={(date) => setSelectedDate(date ?? null)}
            className="rounded-md border"
            fromDate={fromDate}
            toDate={toDate}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={() => selectedDate && onSave(selectedDate)}
            disabled={!selectedDate || loading}
          >
            {loading ? "Saving..." : "Save Date"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateBillingDateDialog;
