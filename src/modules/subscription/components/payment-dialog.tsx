import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/dialog";
import { Card } from "@/core/components/ui/card";

import { motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";


const MotionCard = motion(Card);
const MotionDiv = motion.div;


interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
}
import PaymentComponent from "./payment";
const PaymentDialog: React.FC<PaymentDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-5 bg-card">
        <DialogTitle className="sr-only">Payment Information</DialogTitle>
        <PaymentComponent onCreateCard={async (paymentMethodId) => {}}/>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
