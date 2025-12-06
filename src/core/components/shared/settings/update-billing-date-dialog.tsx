import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import React from "react";

interface UpdateBillingDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  loading?: boolean;
}

const UpdateBillingDateDialog: React.FC<UpdateBillingDateDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  loading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Update Billing Date</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            According to Stripe's policy, you can only update your billing date to today. When you update, Stripe will automatically create a proration for the days you have already paid for in your current billing cycle. This means your next invoice will be adjusted to reflect the change, and you will only be charged for the new period from today onward.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 flex flex-col items-center">
          <div className="text-center text-base text-muted-foreground">
            <p>Your billing date will be set to <b>today</b> ({new Date().toLocaleDateString()}).</p>
            <p className="mt-2">Stripe will handle proration and adjust your next invoice accordingly.</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Update Billing Date"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateBillingDateDialog;
