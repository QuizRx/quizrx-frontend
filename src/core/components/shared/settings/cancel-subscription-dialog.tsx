import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/core/components/ui/dialog";
import { Separator } from "@/core/components/ui/separator";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/core/components/ui/select";
import { Button } from "@/core/components/ui/button";
import React from "react";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  onCancel: () => void;
  nextInvoiceData?: {
    getNextInvoices?: {
      next_payment_attempt?: number;
    };
  };
}

const CancelSubscriptionDialog: React.FC<CancelSubscriptionDialogProps> = ({
  open,
  onOpenChange,
  cancelReason,
  setCancelReason,
  onCancel,
  nextInvoiceData,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-2xl bg-card">
      <DialogHeader>
        <DialogTitle>Cancel Your Subscription</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Are you sure you want to cancel your EBEDM Full Access subscription?<br />
          {nextInvoiceData?.getNextInvoices?.next_payment_attempt
            ? `You'll lose access to premium features after your current billing period ends on ${new Date(nextInvoiceData.getNextInvoices.next_payment_attempt * 1000).toLocaleDateString()}.`
            : "You'll lose access to premium features after your current billing period ends."}
        </DialogDescription>
      </DialogHeader>
      <div className="my-6">
        <Separator className="my-4" />
        <label className="block text-sm font-semibold mb-2">
          Help us improve - Why are you canceling? <span className="text-muted-foreground">(Optional)</span>
        </label>
        <Select value={cancelReason} onValueChange={setCancelReason}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select reason..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expensive">Too Expensive</SelectItem>
            <SelectItem value="not-using">Not using it enough</SelectItem>
            <SelectItem value="alternative">Found a better alternative</SelectItem>
            <SelectItem value="technical">Technical issues</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Keep Subscription
        </Button>
        <Button variant="destructive" onClick={onCancel}>
          Cancel Subscription
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default CancelSubscriptionDialog;
